/**
 * Arctic Sensor Web S3 Mirror Tool
 */
"use strict";
const ftp = require("basic-ftp")

async function main() {
  let outputDir = "tmp"
  let localFile = `${outputDir}/data_temp`

  let errors = []

  // Check for Environment Variables
  const sourceUrl  = process.env["SOURCE_URL"]
  const bucketID   = process.env["BUCKET_ID"]
  const bucketPath = process.env["BUCKET_PATH"]
  const s3Region   = process.env["S3_REGION"]

  if (sourceUrl === undefined) {
    errors.push("Missing SOURCE_URL")
  }

  if (bucketID === undefined) {
    errors.push("Missing BUCKET_ID")
  }

  if (bucketPath === undefined) {
    errors.push("Missing BUCKET_PATH")
  }

  if (s3Region === undefined) {
    errors.push("Missing S3_REGION")
  }

  // Force quit if any errors present
  if (errors.length > 0) {
    console.error("Error!")
    errors.forEach((err) => {
      console.error(err)
    })
    process.exit(1)
  }

  // Download from source
  let url = new URL(sourceUrl)
  if (url.protocol.match(/^ftp/i) !== null) {
    // Fix spaces in URL that don't apply to FTP
    let path = url.pathname
    path = path.replace(/%20/g, " ")
    
    // connect FTP
    let client = new ftp.Client()
    client.ftp.verbose = true
    try {
      await client.access({
        host:     url.host,
        user:     url.username,
        password: url.password,
        secure:   (url.protocol === "ftps:")
      })
      
      await client.downloadTo(localFile, path)
    } catch(err) {
      console.error(err)
    }
    client.close()

  } else {
    console.error("Error: Unsupported URL scheme")
    process.exit(2)
  }


  // TODO: Upload to S3
}

main()
