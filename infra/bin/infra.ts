#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { DatabaseInfraStack } from '../lib/database-infra-stack';
import { PeeringInfraStack } from '../lib/peering-infra-stack';
import { ImportedDefaultVpcStack } from '../lib/imported-default-vpc-stack';
import { RdsRtbStack } from '../lib/rds-rtb-update-stack';
import { Cloud9RtbStack } from '../lib/cloud9-rtb-update-stack';


let REGION : string 
let ACCOUNT_ID : string

if(!process.env.REGION || !process.env.ACCOUNT_ID) {
  console.log("Missing environment variables for REGION and ACCOUNT_ID!")
  process.exit(1);
} else {
  console.log("Ready to Go!")
  REGION = process.env.REGION
  ACCOUNT_ID = process.env.ACCOUNT_ID
}

const app = new cdk.App();
const rdsStack = new DatabaseInfraStack(app, 'mysqldatabase', {});
const defaultVpc = new ImportedDefaultVpcStack(app, 'default-vpc', {
    env: {
        region: REGION,
        account: ACCOUNT_ID
    }
})

const peeringDefault = new PeeringInfraStack(app, 'dbnetwork', {
    PEER_OWNER_ID: ACCOUNT_ID,
    REGION: REGION,
    VPC_ID: defaultVpc.vpc.vpcId, //cloud9 VPC ID
    PEER_VPC_ID: rdsStack.vpc.vpcId,
    
});

new RdsRtbStack(app, 'rds-cloud9-rtb',{
    PEERING_CONNECTION: peeringDefault.peering,
    RDS_VPC: rdsStack.vpc,
    DEST_VPC_CIDR: defaultVpc.vpc.vpcCidrBlock
});

new Cloud9RtbStack(app, 'cloud9-rds-rtb',{
    CLOUD9_VPC: defaultVpc.vpc,
    DEST_VPC_CIDR: rdsStack.vpc.vpcCidrBlock,
    PEERING_CONNECTION: peeringDefault.peering,
    VPC_DEFAULT: true
});
