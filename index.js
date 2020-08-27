/**
 * Arctic Sensor Web S3 Mirror Tool
 */

outputDir = "tmp"

errors = []

// Check for Environment Variables
sourceUrl  = process.env["SOURCE_URL"]
bucketID   = process.env["BUCKET_ID"]
bucketPath = process.env["BUCKET_PATH"]
s3Region   = process.env["S3_REGION"]

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
if (sourceUrl.match(/^ftp/i) !== null) {
  // TODO: FTP Download
} else {
  console.error("Error: Unsupported URL scheme")
  process.exit(2)
}


// TODO: Upload to S3
