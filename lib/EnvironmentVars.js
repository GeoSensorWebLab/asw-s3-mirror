"use strict";

/**
 * Load contents of Environment Variables into an Object
 * @return {Object} keys and values for variables
 */
function getInputFromEnvironment() {
  return {
    sourceUrl:  process.env["SOURCE_URL"],
    bucketID:   process.env["BUCKET_ID"],
    bucketPath: process.env["BUCKET_PATH"],
    s3Region:   process.env["S3_REGION"],
    tmpDir:     process.env["TMP_DIR"]
  }
}

module.exports = getInputFromEnvironment
