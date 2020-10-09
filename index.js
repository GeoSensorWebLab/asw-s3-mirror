/**
 * Arctic Sensor Web S3 Mirror Tool
 */
"use strict";
const fs                      = require("fs")
const FTPDownloader           = require("./lib/FTPDownloader.js")
const HTTPDownloader          = require("./lib/HTTPDownloader.js")
const S3Sync                  = require("./lib/S3Sync.js")
const getInputFromEnvironment = require("./lib/EnvironmentVars.js")
const validateInput           = require("./lib/InputValidator.js")

// Wrap in an async function to allow usage of "await"
async function main() {
  let continueUpload = true

  let vars = await getInputFromEnvironment()
  validateInput(vars)

  // Check for Environment Variables
  const sourceUrl  = vars["sourceUrl"]
  const bucketID   = vars["bucketID"]
  const bucketPath = vars["bucketPath"]
  const s3Region   = vars["s3Region"]
  const tmpDir     = vars["tmpDir"]

  let localFile = `${tmpDir}/data_temp`

  // Get details of current S3 object for comparison to data source
  let s3sync                  = new S3Sync()
  let destinationLastModified = null

  try {
    destinationLastModified = await s3sync.lastModified({
      Bucket: bucketID,
      Key:    bucketPath,
    })
  } catch (err) {
    console.error(err)
    process.exit(1)
  }

  // If the file does not exist, `null` would be returned. In that case,
  // a destination date in the far past is used to ensure it is
  // overwritten.
  if (destinationLastModified === null) {
    destinationLastModified = new Date(-1000)
  }

  // Download from source.
  // Different clients are needed for different source protocols.
  let sourceLastModified = null
  let url = new URL(sourceUrl)
  if (continueUpload && url.protocol.match(/^ftp/i) !== null) {
    // connect FTP
    console.log("Connecting to FTP.")
    let downloader = new FTPDownloader(url)
    await downloader.connect()
    // Check the last modified date of the source file. If it is *older*
    // than the file in S3, then we do not need to download OR upload.
    sourceLastModified = await downloader.lastModified()

    if (sourceLastModified <= destinationLastModified) {
      console.log("Source last modified date:      ", sourceLastModified.toISOString())
      console.log("Destination last modified date: ", destinationLastModified.toISOString())
      console.log("Source file is older than destination, skipping.")
      continueUpload = false
    } else {
      await downloader.saveTo(localFile)
      downloader.close()
      console.log("File downloaded.")
    }
  } else if (continueUpload && url.protocol.match(/^http/i) !== null) {
    // Download from HTTP/HTTPS
    console.log("Connecting to HTTP.")
    let downloader = new HTTPDownloader(url)

    // Try using If-Modified-Since to save bandwidth by not downloading
    // a file we already have. Promise will reject (causing throw) if
    // source is older.
    try {
      await downloader.saveTo(localFile, {
        "If-Modified-Since": destinationLastModified.toUTCString()
      })

      sourceLastModified = await downloader.lastModified()
    } catch (err) {
      if (err === "Not Modified") {
        console.log("Source file is not newer than destination, exiting.")
        continueUpload = false
      } else {
        // Unknown error
        console.error(err)
        process.exit(3)
      }
    }
  } else if (continueUpload) {
    console.error("Error: Unsupported URL scheme")
    process.exit(2)
  }

  // Only upload if there is reason to replace with a newer version.
  if (continueUpload) {
    // Upload to S3.
    // File must be set as public read for public download via HTTP.
    // The Cache Control "no-store" will ensure compliant proxies/browsers
    // will not store older versions of this file, and the user *always*
    // retrieves the latest version from S3.
    // ('Expires' is not used as it is not known whether a new version
    // of the file will be available in the future; the next Lambda run
    // may not update anything.)
    try {
      let upload = await s3sync.putObject({
        ACL:          "public-read",
        Body:         fs.readFileSync(localFile),
        Bucket:       bucketID,
        CacheControl: "no-store",
        Key:          bucketPath,
        Metadata:     {
          // Setting 'Last-Modified' goes into `x-amz-meta-last-modified`,
          // so we are explicitly setting that property instead.
          "x-amz-meta-last-modified": sourceLastModified.toUTCString()
        },
        Tagging:      "arcticconnect=arcticsensorweb"
      })

      console.log("Upload succeeded.", upload)
    } catch (err) {
      console.error("Cannot upload to S3.", err)
      process.exit(1)
    }
  }

  return true
}

exports.handler = main