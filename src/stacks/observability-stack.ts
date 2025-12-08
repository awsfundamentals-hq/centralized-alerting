import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as events from 'aws-cdk-lib/aws-events';
import * as iam from 'aws-cdk-lib/aws-iam';
import { AlarmProcessor } from '../constructs/alarm-processor/index.js';

export interface ObservabilityStackProps extends cdk.StackProps {
  organizationId: string;
  eventBusName: string;
  discordWebhookUrl: string;
}

export class ObservabilityStack extends cdk.Stack {
  public readonly eventBus: events.EventBus;
  public readonly alarmProcessor: AlarmProcessor;

  constructor(scope: Construct, id: string, props: ObservabilityStackProps) {
    super(scope, id, props);

    // Create custom EventBus for receiving cross-account events
    this.eventBus = new events.EventBus(this, 'CentralizedAlertingBus', {
      eventBusName: props.eventBusName,
    });

    // Allow any account in the organization to put events
    this.eventBus.addToResourcePolicy(
      new iam.PolicyStatement({
        sid: 'AllowOrganizationPutEvents',
        effect: iam.Effect.ALLOW,
        principals: [new iam.StarPrincipal()],
        actions: ['events:PutEvents'],
        resources: [this.eventBus.eventBusArn],
        conditions: {
          StringEquals: {
            'aws:PrincipalOrgID': props.organizationId,
          },
        },
      }),
    );

    this.alarmProcessor = new AlarmProcessor(this, 'AlarmProcessor', {
      eventBus: this.eventBus,
      discordWebhookUrl: props.discordWebhookUrl,
    });

    // Outputs
    new cdk.CfnOutput(this, 'EventBusArn', {
      value: this.eventBus.eventBusArn,
      description: 'ARN of the centralized alerting EventBus',
      exportName: 'CentralizedAlertingEventBusArn',
    });

    new cdk.CfnOutput(this, 'EventBusName', {
      value: this.eventBus.eventBusName,
      description: 'Name of the centralized alerting EventBus',
      exportName: 'CentralizedAlertingEventBusName',
    });
  }
}
