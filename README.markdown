# Arctic Sensor Web S3 Mirror

This Node.js tool will automatically download a file from an HTTP/FTP source and upload it to Amazon S3. This allows us to share weather station data from private cloud platforms on the ArcticConnect platform, directly as raw data files.

## USAGE

This tool is meant to be ran using AWS Lambda, to provide a low-cost and reliable scheduled execution environment. For more details on using AWS Lambda, see the "Deployment" section.

For running manually on a development (or integrating into other workflows), the tool can be used directly. Input variables are set using Environment Variables *instead* of command line arguments for Lambda compatibility.

```terminal
$ SOURCE_URL="" \
  BUCKET_ID="" \
  BUCKET_PATH="" \
  node index.js
```

If there are errors downloading or uploading the file, a message will be printed to console and the tool will exit with a non-zero status.

## REQUIREMENTS

A Node.js v14+ is required. NPM dependencies can be installed using `npm install`.

## DEPLOYMENT

For usage with AWS Lambda, the tool must be packaged in a ZIP archive along with any dependencies. A Node.js script has been bundled to generate this ZIP file.

The ZIP file must then be uploaded to an S3 bucket, and that bucket configured as the source for the AWS Lambda(s). A Terraform script (private currently) is used to set up these AWS resources.

## LICENSE

MIT License

## AUTHORS

James Badger (GeoSensorWeb Lab, University of Calgary, Canada)
