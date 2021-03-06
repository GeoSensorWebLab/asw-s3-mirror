#!/bin/bash
# Creates a ZIP file of the app for deployment on AWS Lambda.
set -e

rm -rf "dist"
rm -rf "lambda.zip"
mkdir "dist"
cp "index.js" "dist/index.js"
cp -r "lib" "dist/lib"
yarn install --production=true --no-bin-links --modules-folder "dist/node_modules"
cd "dist"
zip -r ../lambda.zip *
cd ..