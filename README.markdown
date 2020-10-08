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

### Special Case: Configuration via AWS Parameter Store

Using Environment Variables to configure the Lambda is not a great idea when some of those values contain sensitive information such as usernames and passwords. The environment variables may be leaked into execution logs, increasing the likelihood of being accidentally made public. To solve this, the ASW S3 Mirror Tool can read the configuration from AWS Parameter Store (which supports encrypting values).

To use Parameter Store *instead* of configuration through environment variables, only set the following Environment Variable:

**SSM_PARAMETER**: The key containing the configuration as a JSON object

When this value is not empty, all other environment variables in the previous section will be ignored. Instead all those values must be encoded as a JSON object, stored in the Parameter Store like so:

```json
{
    "SOURCE_URL": "",
    "BUCKET_ID": "",
    "BUCKET_PATH": "",
    "S3_REGION": "",
    "TMP_DIR": ""
}
```

The value is limited to 4096 characters. Non-significant whitespace can optionally be removed from the JSON to reduce its size if necessary. I found that the configuration for this tool easily fits in under 300 characters.

(If 4096 is too small, the configuration could be separated into a separate Parameter Store value for each configuration value.)

#### Additional Requirements for Parameter Store

To use Parameter Store, an IAM role for the Lambda must be configured to have access to that Parameter Store key.

The naming for the Parameter Store key should follow conventions for your organization. I adopted one that tries to scope the parameter by its key string:

```
/$env/$application/$instance/configuration
/staging/asw-s3-mirror/klrs-ftp/configuration
/prod/asw-s3-mirror/klrs-ftp/configuration
```

In this example, different environments are the first variable, allowing for testing without affecting existing production instances. The second part is the application, meaning the parameter points back to this tool. The third part scopes it to a single lambda application name, and the last part is what is stored in this parameter.

## REQUIREMENTS

A Node.js v14+ is required. NPM dependencies can be installed using `yarn install`.

## DEPLOYMENT

For usage with AWS Lambda, the tool must be packaged in a ZIP archive along with any dependencies. A Node.js script has been bundled to generate this ZIP file: use the `build/lambda.sh` Bash script to generate a ZIP file of the necessary code from this repository.

The ZIP file must then be uploaded to an S3 bucket, and that bucket configured as the source for the AWS Lambda(s). A Terraform script (private currently) is used to set up these AWS resources.

## CAVEATS

The `last-modified` header will contain the date the file was uploaded to S3, **NOT** when the original file was last modified. When the file is uploaded to S3, AWS will set the `last-modified` header and there is 100% no way for me to change that. If you try to submit a custom `last-modified`, then it is stored in `x-amz-meta-last-modified` instead.

You may rely on `last-modified`, but it may present an older file as newer than it actually is, and you can check `x-amz-meta-last-modified` for the actual date. Unfortunately `x-amz-meta-last-modified` is not compatible with the other HTTP cache check headers.

The difference between the two headers may be as low as the CloudWatch interval running the Lambda (typically under an hour), or much larger if the source file has not been recently updated.

## LICENSE

MIT License

## AUTHORS

James Badger (GeoSensorWeb Lab, University of Calgary, Canada)
