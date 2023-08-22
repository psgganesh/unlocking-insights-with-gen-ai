#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { DatabaseInfraStack } from '../lib/database-infra-stack';
import { PeeringInfraStack } from '../lib/peering-infra-stack';

const app = new cdk.App();

const environment = {
    env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
}

const rdsStack = new DatabaseInfraStack(app, 'mysqldatabase', {});

const cloud9VpcId = app.node.tryGetContext('cloud9Cidr') || '172.31.0.0/16';

new PeeringInfraStack(app, 'dbnetwork', {
    REGION: rdsStack.region,
    PEER_OWNER_ID: rdsStack.accountId,
    PEER_VPC_ID: rdsStack.vpcId,
    VPC_ID: cloud9VpcId //cloud9 VPC ID
});