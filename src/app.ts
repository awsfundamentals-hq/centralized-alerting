#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { config } from '../config/environments.js';
import { ObservabilityStack } from './stacks/observability-stack.js';
import { ManagementStack } from './stacks/management-stack.js';

const app = new cdk.App();

// Deploy to observability account - receives and processes all alarms
new ObservabilityStack(app, 'CentralizedAlertingObservability', {
  env: {
    account: config.observabilityAccount.id,
    region: config.observabilityAccount.region,
  },
  organizationId: config.organizationId,
  eventBusName: config.eventBusName,
  discordWebhookUrl: config.discordWebhookUrl,
  description: 'Centralized alerting - receives and processes CloudWatch alarms',
});

// Deploy to management account - creates StackSet for member accounts
new ManagementStack(app, 'CentralizedAlertingManagement', {
  env: {
    account: config.managementAccount.id,
    region: config.managementAccount.region,
  },
  organizationId: config.organizationId,
  targetOUs: config.targetOUs,
  observabilityAccountId: config.observabilityAccount.id,
  observabilityRegion: config.observabilityAccount.region,
  eventBusName: config.eventBusName,
  description: 'Centralized alerting - deploys alarm forwarding to member accounts',
});

app.synth();
