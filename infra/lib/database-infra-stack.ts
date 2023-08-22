import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';


export class DatabaseInfraStack extends cdk.Stack {
  public vpc : ec2.Vpc
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // You might want to fetch the default VPC in which Cloud9 is launched
    // Create the VPC with a 10.0.0.0/16 CIDR
    this.vpc = new ec2.Vpc(this, 'vpc', {
      vpcName: 'DataSources-Dedicated-VPC',
      ipAddresses: ec2.IpAddresses.cidr('10.0.0.0/16'),
      maxAzs: 3,
      natGateways: 2,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'Public',
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: 'Private1',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
        {
          cidrMask: 24,
          name: 'Private2',
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        },
      ],
    });

    // Cloud9 EC2 CIDR block - you would obtain this dynamically, 
    // but for the sake of this example, let's assume a placeholder CIDR
    // By default you can use the default CIDR VPC range
    // const cloud9Cidr = this.node.tryGetContext('cloud9Cidr') || '172.31.0.0/16';

    // Create a secret for RDS username and password
    const mysqlUsername = 'dbadmin';
    const mysqlSecret = new secretsmanager.Secret(this, 'DB Admin Credentials', {
      secretName: 'DB-Admin-Credential',
      description: 'Mysql Database Crendentials',
      generateSecretString: {
        excludeCharacters: "\"@/\\ '",
        generateStringKey: 'password',
        passwordLength: 30,
        secretStringTemplate: JSON.stringify({username: mysqlUsername}),
      },
    });

    const mysqlCredentials = rds.Credentials.fromSecret(
      mysqlSecret,
      mysqlUsername,
    );

    const database = new rds.DatabaseInstance(this, 'Database', {
      engine: rds.DatabaseInstanceEngine.mysql({
        version: rds.MysqlEngineVersion.VER_8_0_33,
      }),
      vpc: this.vpc,
      publiclyAccessible: false,
      credentials: mysqlCredentials,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Careful! This means the database is destroyed when the stack is deleted
      deleteAutomatedBackups: true,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED
      },
      storageType: rds.StorageType.GP3,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.M6I, ec2.InstanceSize.LARGE)
    });

    // Allow connection only from Cloud9 CIDR
    // database.connections.allowFrom(ec2.Peer.ipv4(cloud9Cidr), ec2.Port.udp(53));
    // database.connections.allowFrom(ec2.Peer.ipv4(cloud9Cidr), ec2.Port.tcp(53));
    database.connections.allowFrom(ec2.Peer.anyIpv4(), ec2.Port.tcp(3306));

    new cdk.CfnOutput(this, 'DatabaseEndpoint', {
      value: database.dbInstanceEndpointAddress,
      description: 'The RDS MySQL instance endpoint',
    });

    new cdk.CfnOutput(this, 'DatabaseSecurityGroupId', {
      value: database.connections.securityGroups[0].securityGroupId,
      description: 'The security group ID of the RDS MySQL instance',
    });
  }
 
}
