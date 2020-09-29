/**
 * Arctic Sensor Web S3 Mirror Tool
 */
"use strict";
const AWS                     = require("aws-sdk")
const fs                      = require('fs')
const FTPDownloader           = require("./lib/FTPDownloader.js")
const getInputFromEnvironment = require("./lib/EnvironmentVars.js")
const validateInput           = require("./lib/InputValidator.js")

// Wrap in an async function to allow usage of "await"
async function main() {
  let vars = getInputFromEnvironment()
  validateInput(vars)

  // Check for Environment Variables
  const sourceUrl  = vars["sourceUrl"]
  const bucketID   = vars["bucketID"]
  const bucketPath = vars["bucketPath"]
  const s3Region   = vars["s3Region"]
  const tmpDir     = vars["tmpDir"]

  let localFile = `${tmpDir}/data_temp`

  // Get details of current S3 version for comparison to data source
  let s3 = new AWS.S3()
  let checkResults = null

  try {
    checkResults = await s3.headObject({
      Bucket: bucketID,
      Key:    bucketPath,
    }).promise()
    console.log("Destination checked.")
  } catch (err) {
    // If the file is not found, that is okay. Other errors may
    // indicate a different problem.
    if (err.code !== "NotFound") {
      console.error(err)
      process.exit(1)
    } else {
      console.log("No file in destination.")
    }
  }

  // If checkResults is null, then the file does not exist.
  // Otherwise, it exists and we check the last modified date.
  // By default the last modified will be in the far past, to guarantee
  // an update with a newer file. "-1000" will even catch files that
  // have incorrect last modified of the default UNIX epoch.
  let destinationLastModified = new Date(-1000)
  if (checkResults !== null) {
    let destinationLastModified = checkResults.LastModified
  }

  // Download from source.
  // Different clients are needed for different source protocols, and
  // only FTP is supported at the moment.
  let sourceLastModified = null
  let url = new URL(sourceUrl)
  if (url.protocol.match(/^ftp/i) !== null) {
    // connect FTP
    let downloader = new FTPDownloader(url)
    await downloader.connect()
    // Check the last modified date of the source file. If it is *older*
    // than the file in S3, then we do not need to download OR upload.
    sourceLastModified = await downloader.lastModified()

    if (sourceLastModified <= destinationLastModified) {
      console.log("Source last modified date:      ", sourceLastModified.toISOString())
      console.log("Destination last modified date: ", destinationLastModified.toISOString())
      console.log("Source file is older than destination, skipping.")
      process.exit(0)
    } else {
      await downloader.saveTo(localFile)
      downloader.close()
      console.log("File downloaded.")
    }
  } else {
    console.error("Error: Unsupported URL scheme")
    process.exit(2)
  }

  // Upload to S3.
  // File must be set as public read for public download via HTTP.
  // The Cache Control "no-store" will ensure compliant proxies/browsers
  // will not store older versions of this file, and the user *always*
  // retrieves the latest version from S3.
  // ('Expires' is not used as it is not known whether a new version
  // of the file will be available in the future; the next Lambda run
  // may not update anything.)
  try {
    let upload = await s3.putObject({
      ACL:          "public-read",
      Body:         fs.readFileSync(localFile),
      Bucket:       bucketID,
      CacheControl: "no-store",
      Key:          bucketPath,
      Metadata:     {
        // this actually goes into `x-amz-meta-last-modified`
        "Last-Modified": sourceLastModified.toUTCString()
      },
      Tagging:      "arcticconnect=arcticsensorweb"
    }).promise()

    console.log("Upload succeeded.", upload)
  } catch (err) {
    console.error("Cannot upload to S3.", err)
    process.exit(3)
  }
}

main()
