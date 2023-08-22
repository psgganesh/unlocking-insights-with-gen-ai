import { Stack, StackProps } from "aws-cdk-lib";
import { IVpc, Vpc } from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";


export class ImportedDefaultVpcStack extends Stack{
    public vpc : IVpc
    constructor(scope : Construct, id: string, props: StackProps){
        super(scope, id, props)
        this.vpc = Vpc.fromLookup(this, 'imported-vpc', {
            isDefault: true ,
            // region: props.env?.region,
            // ownerAccountId: props.env?.account
        })
        console.log('VPC Imported ID: ', this.vpc.vpcId)
        console.log('VPC Imported CIDR: ', this.vpc.vpcCidrBlock)
    }
}