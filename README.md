# Centralized Alerting for AWS Organizations

Centralized CloudWatch alarm forwarding and notification system for AWS Organizations using EventBridge, Lambda, and CDK.

## Architecture

- **Management Account**: Deploys StackSets to member accounts for alarm forwarding
- **Observability Account**: Receives alarms via EventBridge and sends notifications to Discord

## Resources

- [Blog Post: Build Centralized Alerting Across Your Organization](https://awsfundamentals.com/blog/build-centralized-alerting-across-your-organization-with-cloudwatch-eventbridge-lambda-and-cdk)

[![YouTube Video](https://img.youtube.com/vi/95bIBoIHer8/0.jpg)](https://youtu.be/95bIBoIHer8)

## Prerequisites

- AWS CDK installed
- Node.js 20+
- AWS Organizations with management account access
- Discord webhook URL

## Setup

```bash
pnpm install
```

Configure `config/environments.ts` with your:
- Organization ID
- Target OUs
- Observability account ID
- Discord webhook URL

## Deployment

```bash
pnpm deploy
```

## License

MIT
