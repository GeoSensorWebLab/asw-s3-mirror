"use strict";

const AWS = require("aws-sdk")

/**
 * Class to wrap calls to headObject and putObject, with some validation
 * and error handling.
 */
class S3Sync {
  /**
   * Create an S3Sync instance.
   * @return {S3Sync}
   */
  constructor() {
    this.S3 = new AWS.S3()
  }

  /**
   * Retreive the details of an S3 Object with a HEAD request.
   * If the S3 Object does not exist, `null` will be returned.
   * This function *may* throw errors from `S3.headObject`.
   * 
   * @param  {Object} options Properties compatible with AWS.S3 API
   * @return {Object}         Properties of the target object, or `null`
   */
  async headObject(options) {
    let checkResults = null

    try {
      checkResults = await this.S3.headObject(options).promise()
      console.log("Destination checked.")
    } catch (err) {
      // If the file is not found, that is okay. Other errors may
      // indicate a different problem.
      if (err.code !== "NotFound") {
        throw(err)
      } else {
        console.log("No file in destination.")
      }
    }

    return checkResults
  }

  /**
   * Return the modification date for an S3 Object. In this case,
   * Modification Date is when the file was modified in S3, not the last
   * modified of the original source file. See README caveats for more
   * details.
   * 
   * If the S3 Object does not exist, `null` will be returned.
   * This function *may* throw errors from `S3Sync.headObject`.
   * 
   * @param  {Object} options Properties compatible with AWS.S3 API
   * @return {Date}           Date object with Modification Date, or 
   *                          `null`
   */
  async lastModified(options) {
    let checkResults = await this.headObject(options)

    if (checkResults !== null) {
      return checkResults.LastModified
    } else {
      return null
    }
  }

  /**
   * Asynchronously put an object in S3, returning a resolvable promise.
   * @param  {Object} options Properties compatible with AWS.S3 API
   * @return {Promise}        Promise that resolves/rejects when S3
   *                          operation is complete
   */
  async putObject(options) {
    return await this.S3.putObject(options).promise()
  }
  
}

module.exports = S3Sync
