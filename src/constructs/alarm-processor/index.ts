import * as path from 'path';
import { fileURLToPath } from 'url';
import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNodejs from 'aws-cdk-lib/aws-lambda-nodejs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface AlarmProcessorProps {
  eventBus: events.IEventBus;
  discordWebhookUrl: string;
}

export class AlarmProcessor extends Construct {
  public readonly lambdaFunction: lambdaNodejs.NodejsFunction;

  constructor(scope: Construct, id: string, props: AlarmProcessorProps) {
    super(scope, id);

    // Lambda function to process alarms and send to Discord
    this.lambdaFunction = new lambdaNodejs.NodejsFunction(this, 'ProcessorFunction', {
      entry: path.join(__dirname, '../../lambda/alarm-processor/index.ts'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_20_X,
      timeout: cdk.Duration.seconds(30),
      environment: {
        DISCORD_WEBHOOK_URL: props.discordWebhookUrl,
      },
      bundling: {
        format: lambdaNodejs.OutputFormat.ESM,
      },
    });

    // EventBridge rule to capture CloudWatch alarm state changes -> invoke Lambda directly
    new events.Rule(this, 'AlarmRule', {
      eventBus: props.eventBus,
      eventPattern: {
        source: ['aws.cloudwatch'],
        detailType: ['CloudWatch Alarm State Change'],
        detail: {
          state: {
            value: ['ALARM'],
          },
        },
      },
      targets: [new targets.LambdaFunction(this.lambdaFunction, { retryAttempts: 2 })],
    });
  }
}
