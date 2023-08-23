import { Stack, StackProps } from "aws-cdk-lib";
import {
  CfnRoute,
  CfnVPCPeeringConnection,
  IVpc,
  Vpc,
} from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";

export interface Cloud9RtbProps extends StackProps {
  PEERING_CONNECTION: CfnVPCPeeringConnection;
  CLOUD9_VPC: Vpc | IVpc;
  DEST_VPC_CIDR: string;
  VPC_DEFAULT?: boolean;
}

export class Cloud9RtbStack extends Stack {
  constructor(scope: Construct, id: string, props: Cloud9RtbProps) {
    super(scope, id, props);
    //add rtb

    if (props.VPC_DEFAULT == true) {
      //update only 1 rtb
      const { routeTableId } = props.CLOUD9_VPC.publicSubnets[0].routeTable;
      console.log("rtbId single: ", routeTableId);
      new CfnRoute(this, "private-peering-rtb3", {
        destinationCidrBlock: props.DEST_VPC_CIDR,
        routeTableId,
        vpcPeeringConnectionId: props.PEERING_CONNECTION.ref,
      });
    } else {
      props.CLOUD9_VPC.publicSubnets.forEach(
        ({ routeTable: { routeTableId } }, index) => {
          console.log("rtb cloud9 default: ", routeTableId, index);
          new CfnRoute(this, "private-peering-rtb" + index + id, {
            destinationCidrBlock: props.DEST_VPC_CIDR,
            routeTableId,
            vpcPeeringConnectionId: props.PEERING_CONNECTION.ref,
          });
        }
      );
    }
  }
}
