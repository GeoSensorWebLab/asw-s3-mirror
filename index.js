/**
 * Arctic Sensor Web S3 Mirror Tool
 */
"use strict";
const FTPDownloader           = require("./lib/FTPDownloader.js")
const getInputFromEnvironment = require("./lib/EnvironmentVars.js")
const validateInput           = require("./lib/InputValidator.js")

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

  // Download from source
  let url = new URL(sourceUrl)
  if (url.protocol.match(/^ftp/i) !== null) {
    // connect FTP
    let downloader = new FTPDownloader(url)
    await downloader.connect()
    await downloader.saveTo(localFile)
    downloader.close()
  } else {
    console.error("Error: Unsupported URL scheme")
    process.exit(2)
  }


  // TODO: Upload to S3
}

main()
