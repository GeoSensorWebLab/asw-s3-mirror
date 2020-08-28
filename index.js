/**
 * Arctic Sensor Web S3 Mirror Tool
 */
"use strict";
const ftp                     = require("basic-ftp")
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
