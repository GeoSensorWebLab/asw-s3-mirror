# Arctic Sensor Web S3 Mirror

This Node.js tool will automatically download a file from an HTTP/FTP source and upload it to Amazon S3. This allows us to share weather station data from private cloud platforms on the ArcticConnect platform, directly as raw data files.

## USAGE

This tool is meant to be ran using AWS Lambda, to provide a low-cost and reliable scheduled execution environment. For more details on using AWS Lambda, see the "Deployment" section.

For running manually on a development (or integrating into other workflows), the tool can be used directly. Input variables are set using Environment Variables *instead* of command line arguments for Lambda compatibility.

```terminal
$ SOURCE_URL="" \
  BUCKET_ID="" \
  BUCKET_PATH="" \
  S3_REGION="" \
  TMP_DIR="tmp" \
  node index.js
```

If there are errors downloading or uploading the file, a message will be printed to console and the tool will exit with a non-zero status.

**SOURCE_URL**: URL of file to download, including username and password if necessary.

**BUCKET_ID**: The S3 bucket for the destination resource.

**BUCKET_PATH**: The key for the resource to create in the S3 bucket.

**S3_REGION**: Region for the S3 bucket. (e.g. `us-east-1`)

**TMP_DIR**: Path to directory where downloaded files will be stored temporarily. Files should not be expected to persist after the tool is finished. On AWS Lambda, `/tmp` should be used; for local testing, `tmp` (directory in this repo) can be used.

## REQUIREMENTS

A Node.js v14+ is required. NPM dependencies can be installed using `yarn install`.

## DEPLOYMENT

For usage with AWS Lambda, the tool must be packaged in a ZIP archive along with any dependencies. A Node.js script has been bundled to generate this ZIP file.

The ZIP file must then be uploaded to an S3 bucket, and that bucket configured as the source for the AWS Lambda(s). A Terraform script (private currently) is used to set up these AWS resources.

## CAVEATS

The `last-modified` header will contain the date the file was uploaded to S3, **NOT** when the original file was last modified. When the file is uploaded to S3, AWS will set the `last-modified` header and there is 100% no way for me to change that. If you try to submit a custom `last-modified`, then it is stored in `x-amz-meta-last-modified` instead.

You may rely on `last-modified`, but it may present an older file as newer than it actually is, and you can check `x-amz-meta-last-modified` for the actual date. Unfortunately `x-amz-meta-last-modified` is not compatible with the other HTTP cache check headers.

The difference between the two headers may be as low as the CloudWatch interval running the Lambda (typically under an hour), or much larger if the source file has not been recently updated.

## LICENSE

MIT License

## AUTHORS

James Badger (GeoSensorWeb Lab, University of Calgary, Canada)
