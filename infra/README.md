# Welcome to Infra CDK TypeScript project

This is a CDK project for deploying necessarry infrastructure for the workshop.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template

## Deploying resources

* `cdk deploy --stack mysqldatabase`       Creates MySQL Database Instance on Amazon RDS