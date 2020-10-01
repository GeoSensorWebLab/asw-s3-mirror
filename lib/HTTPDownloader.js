"use strict";

const util = require("util")

const fetch          = require("node-fetch")
const fs             = require("fs")
const streamPipeline = util.promisify(require("stream").pipeline)

/**
 * Download from an HTTP/HTTPS source
 */
class HTTPDownloader {
  /**
   * Create an HTTP Downloader instance.
   * @param  {URL} url URL instance of the resource to download
   * @return {HTTPDownloader}
   */
  constructor(url) {
    this.url      = url
    this.response = null
  }

  /**
   * Download the resource at the URL (from initialization) and store
   * the response in this class.
   * @param  {Object} headers Keys and values for HTTP request headers
   * @return {void}
   */
  async get(headers) {
    this.response = await fetch(this.url, {
      headers: headers
    })
  }

  async lastModified() {
    if (this.response === null) {
      await this.get({})
    }
      
    return new Date(this.response.headers.get('Last-Modified'))
  }

  /**
   * Save the resource to destinationPath, supporting custom HTTP
   * request headers. Will use cached response if available.
   * 
   * @param  {String} destinationPath Path to output file
   * @param  {Object} headers         Keys and values for HTTP request
   *                                  headers
   * @return {void}
   */
  async saveTo(destinationPath, headers) {
    if (this.response === null) {
      await this.get(headers)
    }

    if (!this.response.ok) {
      throw(this.response.statusText)
    }

    await streamPipeline(this.response.body,
      fs.createWriteStream(destinationPath))
  }
}

module.exports = HTTPDownloader
