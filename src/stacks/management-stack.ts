import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import { AlarmForwarder } from '../constructs/alarm-forwarder/index.js';

export interface ManagementStackProps extends cdk.StackProps {
  organizationId: string;
  targetOUs: string[];
  observabilityAccountId: string;
  observabilityRegion: string;
  eventBusName: string;
}

export class ManagementStack extends cdk.Stack {
  public readonly alarmForwarder: AlarmForwarder;

  constructor(scope: Construct, id: string, props: ManagementStackProps) {
    super(scope, id, props);

    // Deploy StackSet to forward alarms from member accounts
    this.alarmForwarder = new AlarmForwarder(this, 'AlarmForwarder', {
      organizationId: props.organizationId,
      targetOUs: props.targetOUs,
      observabilityAccountId: props.observabilityAccountId,
      observabilityRegion: props.observabilityRegion,
      eventBusName: props.eventBusName,
    });
  }
}
