#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { DatabaseInfraStack } from '../lib/database-infra-stack';
import { PeeringInfraStack } from '../lib/peering-infra-stack';

const app = new cdk.App();

const environment = {
    env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
}

new DatabaseInfraStack(app, 'mysqldatabase', environment);

new PeeringInfraStack(app, 'dbnetwork', environment);