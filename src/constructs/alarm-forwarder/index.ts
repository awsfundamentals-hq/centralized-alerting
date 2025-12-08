import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as cfn from 'aws-cdk-lib/aws-cloudformation';

export interface AlarmForwarderProps {
  organizationId: string;
  targetOUs: string[];
  observabilityAccountId: string;
  observabilityRegion: string;
  eventBusName: string;
}

export class AlarmForwarder extends Construct {
  public readonly stackSet: cfn.CfnStackSet;

  constructor(scope: Construct, id: string, props: AlarmForwarderProps) {
    super(scope, id);

    const eventBusArn = `arn:aws:events:${props.observabilityRegion}:${props.observabilityAccountId}:event-bus/${props.eventBusName}`;

    // CloudFormation template for member accounts
    const template = {
      AWSTemplateFormatVersion: '2010-09-09',
      Description: 'Forwards CloudWatch alarms to centralized observability account',
      Resources: {
        AlarmForwardingRole: {
          Type: 'AWS::IAM::Role',
          Properties: {
            AssumeRolePolicyDocument: {
              Version: '2012-10-17',
              Statement: [
                {
                  Effect: 'Allow',
                  Principal: { Service: 'events.amazonaws.com' },
                  Action: 'sts:AssumeRole',
                },
              ],
            },
            Policies: [
              {
                PolicyName: 'PutEventsToObservabilityAccount',
                PolicyDocument: {
                  Version: '2012-10-17',
                  Statement: [
                    {
                      Effect: 'Allow',
                      Action: 'events:PutEvents',
                      Resource: eventBusArn,
                    },
                  ],
                },
              },
            ],
          },
        },
        AlarmForwardingRule: {
          Type: 'AWS::Events::Rule',
          Properties: {
            Name: 'ForwardCloudWatchAlarms',
            Description: 'Forwards CloudWatch alarm state changes to observability account',
            EventPattern: {
              source: ['aws.cloudwatch'],
              'detail-type': ['CloudWatch Alarm State Change'],
              detail: {
                state: {
                  value: ['ALARM'],
                },
              },
            },
            State: 'ENABLED',
            Targets: [
              {
                Id: 'ObservabilityEventBus',
                Arn: eventBusArn,
                RoleArn: { 'Fn::GetAtt': ['AlarmForwardingRole', 'Arn'] },
              },
            ],
          },
        },
      },
    };

    // StackSet to deploy to member accounts
    this.stackSet = new cfn.CfnStackSet(this, 'StackSet', {
      stackSetName: 'CentralizedAlarmForwarding',
      description: 'Deploys CloudWatch alarm forwarding to observability account',
      permissionModel: 'SERVICE_MANAGED',
      autoDeployment: {
        enabled: true,
        retainStacksOnAccountRemoval: false,
      },
      stackInstancesGroup: [
        {
          regions: [props.observabilityRegion],
          deploymentTargets: {
            organizationalUnitIds: props.targetOUs,
          },
        },
      ],
      templateBody: JSON.stringify(template),
      capabilities: ['CAPABILITY_IAM'],
      operationPreferences: {
        failureToleranceCount: 0,
        maxConcurrentCount: 10,
      },
    });

    new cdk.CfnOutput(this, 'StackSetId', {
      value: this.stackSet.attrStackSetId,
      description: 'StackSet ID for alarm forwarding',
    });
  }
}
