import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export class DatabaseInfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create a new VPC (or use an existing one)
    const vpc = new ec2.Vpc(this, 'MyVpc', { maxAzs: 3 });

    // Define the MySQL database
    const database = new rds.DatabaseInstance(this, 'MySQLDatabase', {
      engine: rds.DatabaseInstanceEngine.mysql({
        version: rds.MysqlEngineVersion.VER_8_0_33,
      }),
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE2, ec2.InstanceSize.MICRO),
      vpc,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // ONLY FOR DEV/TEST
      deletionProtection: false, // ONLY FOR DEV/TEST
    });

    new cdk.CfnOutput(this, 'DatabaseEndpoint', {
        value: database.dbInstanceEndpointAddress,
        description: 'The endpoint address of the RDS instance',
        exportName: 'RDSInstanceEndpoint'
    });
  }
}
