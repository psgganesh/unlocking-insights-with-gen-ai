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

if(!process.env.REGION || !process.env.ACCOUNT_ID){
  console.log("Missing Environment Varialbes for REGION ACCOUNT_ID!")
  //import-vpc-guide.md
  //or run below command
  //chmod +x run ../run.sh
  //../run.sh
  process.exit(1);
}else{
  console.log("Ready to Go!")
  REGION = process.env.REGION
  ACCOUNT_ID = process.env.ACCOUNT_ID
}

const app = new cdk.App();

// const environment = {
//     env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
// }

const rdsStack = new DatabaseInfraStack(app, 'mysqldatabase', {});
const defaultVpc = new ImportedDefaultVpcStack(app, 'default-vpc', {
    env: {
        region: REGION,
        account: ACCOUNT_ID
    }
})

// const cloud9VpcId = app.node.tryGetContext('cloud9Cidr') || '172.31.0.0/16';

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
})
new Cloud9RtbStack(app, 'cloud9-rds-rtb',{
    CLOUD9_VPC: defaultVpc.vpc,
    DEST_VPC_CIDR: rdsStack.vpc.vpcCidrBlock,
    PEERING_CONNECTION: peeringDefault.peering,
    VPC_DEFAULT: true
})