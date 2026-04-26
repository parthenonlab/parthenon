import { User } from '@parthenonlab/types';

export const loginNotification = async (user: User): Promise<void> => {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return;

  const name =
    user.discord_name ??
    user.discord_username ??
    user.twitch_username ??
    'Unknown';

  const footer = user.discord_id
    ? `Discord ID: ${user.discord_id}`
    : `Twitch ID: ${user.twitch_id}`;

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [
          {
            description: `${name} logged in.`,
            color: 9684991,
            footer: { text: footer },
          },
        ],
      }),
    });

    if (!res.ok) {
      console.error(`Discord webhook failed: ${res.status} ${res.statusText}`);
    }
  } catch (error) {
    console.error('Discord webhook error:', error);
  }
};
