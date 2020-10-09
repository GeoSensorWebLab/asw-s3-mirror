"use strict";

const SSM = require("aws-sdk/clients/ssm")

/**
 * Load contents of Environment Variables into an Object
 * @return {Object} keys and values for variables
 */
async function getInputFromEnvironment() {
  const ssmParameterName = process.env["SSM_PARAMETER"]

  if (ssmParameterName !== null && ssmParameterName !== "") {
    let ssm = new SSM()

    let results = await ssm.getParameter({
      Name:           ssmParameterName,
      WithDecryption: true
    }).promise()

    let config = JSON.parse(results.Parameter.Value)

    return {
      sourceUrl:  config["SOURCE_URL"],
      bucketID:   config["BUCKET_ID"],
      bucketPath: config["BUCKET_PATH"],
      s3Region:   config["S3_REGION"],
      tmpDir:     config["TMP_DIR"]
    } 
  } else {
    return {
      sourceUrl:  process.env["SOURCE_URL"],
      bucketID:   process.env["BUCKET_ID"],
      bucketPath: process.env["BUCKET_PATH"],
      s3Region:   process.env["S3_REGION"],
      tmpDir:     process.env["TMP_DIR"]
    }
  }
}

module.exports = getInputFromEnvironment
