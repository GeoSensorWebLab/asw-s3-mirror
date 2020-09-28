"use strict";

const ftp = require("basic-ftp")

/**
 * Download from an FTP/FTP-SSL source
 */
class FTPDownloader {
  /**
   * Create an FTP Downloader instance.
   * @param  {URL} url URL instance of the resource to download
   * @return {FTPDownloader}
   */
  constructor(url) {
    this.url = url
    this.client = new ftp.Client()

    // Fix spaces in URL that don't apply to FTP
    this.path = this.url.pathname
    this.path = this.path.replace(/%20/g, " ")
  }

  connect() {
    return this.client.access({
      host:     this.url.host,
      user:     this.url.username,
      password: this.url.password,
      secure:   (this.url.protocol === "ftps:")
    })
  }

  close() {
    return this.client.close()
  }

  lastModified() {
    return this.client.lastMod(this.path)
  }

  saveTo(localFile) {
    return this.client.downloadTo(localFile, this.path)
  }
}

module.exports = FTPDownloader
