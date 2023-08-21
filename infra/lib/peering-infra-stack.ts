import * as cdk from 'aws-cdk-lib';
import { CfnVPCPeeringConnection } from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

export interface VpcPeeringProps extends cdk.StackProps {
    VPC_ID : string,
    PEER_VPC_ID : string,
    PEER_OWNER_ID: string,
    REGION: string,
    PEER_ROLE_ARN ?: string
}

export class PeeringInfraStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: VpcPeeringProps) {
        super(scope, id, props);
        this.createPeering(id, props)
    }
    private createPeering(id : string, props : VpcPeeringProps){
        const peering = new CfnVPCPeeringConnection(this, id, {
            vpcId: props.VPC_ID,
            peerVpcId: props.PEER_VPC_ID,
            peerOwnerId: props.PEER_OWNER_ID,
            peerRegion: props.REGION,
            // peerRoleArn: props.PEER_ROLE_ARN,
            tags: [
                {
                    key: "project",
                    value: "Gen AI"
                },
                {
                    key:  "Name",
                    value: "Peering CDK Demo"
                }
            ]
        })
    }
}