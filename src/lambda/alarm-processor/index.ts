import type { EventBridgeHandler } from 'aws-lambda';

interface CloudWatchAlarmDetail {
  alarmName: string;
  state: {
    value: string;
    reason: string;
    timestamp: string;
  };
  previousState?: {
    value: string;
  };
  configuration?: {
    description?: string;
  };
}

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

async function sendToDiscord(message: string) {
  if (!DISCORD_WEBHOOK_URL) {
    console.error('DISCORD_WEBHOOK_URL is not set');
    return;
  }

  const response = await fetch(DISCORD_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: message }),
  });

  if (!response.ok) {
    throw new Error(`Discord webhook failed: ${response.status} ${response.statusText}`);
  }
}

export const handler: EventBridgeHandler<
  'CloudWatch Alarm State Change',
  CloudWatchAlarmDetail,
  void
> = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  const { alarmName, state, configuration } = event.detail;
  const description = configuration?.description || 'No description';

  const message = [
    `**CloudWatch Alarm: ${alarmName}**`,
    `**Account**: ${event.account} | **Region**: ${event.region}`,
    `**State**: ${state.value}`,
    `**Reason**: ${state.reason}`,
    `**Description**: ${description}`,
    `**Time**: ${state.timestamp}`,
  ].join('\n');

  await sendToDiscord(message);
  console.log(`Sent alarm notification: ${alarmName}`);
};
