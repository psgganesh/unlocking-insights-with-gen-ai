import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';

export class DatabaseInfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // You might want to fetch the default VPC in which Cloud9 is launched
    const vpc = ec2.Vpc.fromLookup(this, 'DefaultVpc', {
      isDefault: true
    });

    // Cloud9 EC2 CIDR block - you would obtain this dynamically, 
    // but for the sake of this example, let's assume a placeholder CIDR
    const cloud9Cidr = this.node.tryGetContext('cloud9Cidr') || '0.0.0.0/0';

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
        version: rds.MysqlEngineVersion.VER_8_0_21,
      }),
      vpc: vpc,
      publiclyAccessible: true,
      credentials: mysqlCredentials,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Careful! This means the database is destroyed when the stack is deleted
      deleteAutomatedBackups: true,
    });

    // Allow connection only from Cloud9 CIDR
    database.connections.allowFrom(ec2.Peer.ipv4(cloud9Cidr), ec2.Port.tcp(3306));

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
