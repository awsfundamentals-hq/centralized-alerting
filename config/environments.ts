export interface Config {
  managementAccount: { id: string; region: string };
  observabilityAccount: { id: string; region: string };
  organizationId: string;
  targetOUs: string[];
  discordWebhookUrl: string;
}

export const config: Config = {
  managementAccount: {
    id: 'XXXXXXXXXXXX', // Replace with your management account ID
    region: 'eu-central-1',
  },
  observabilityAccount: {
    id: 'XXXXXXXXXXXX', // Replace with your observability account ID
    region: 'eu-central-1',
  },
  organizationId: 'o-xxxxxxxxxx', // Replace with your organization ID
  targetOUs: ['ou-xxxx-xxxxxxxx'], // Replace with your OU IDs
  discordWebhookUrl: 'https://discord.com/api/webhooks/xxx/xxx', // Replace with your Discord webhook
};
