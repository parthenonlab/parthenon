import { User } from '@parthenonlab/types';

const getUserName = (user: User) =>
  user.discord_name ??
  user.discord_username ??
  user.twitch_username ??
  'Unknown';

const getUserFooter = (user: User) =>
  user.discord_id
    ? `Discord ID: ${user.discord_id}`
    : `Twitch ID: ${user.twitch_id}`;

const sendDiscordEmbed = async (
  description: string,
  footer: string,
): Promise<void> => {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [{ description, color: 9684991, footer: { text: footer } }],
      }),
    });

    if (!res.ok) {
      console.error(`Discord webhook failed: ${res.status} ${res.statusText}`);
    }
  } catch (error) {
    console.error('Discord webhook error:', error);
  }
};

export const loginNotification = (user: User) =>
  sendDiscordEmbed(`${getUserName(user)} logged in.`, getUserFooter(user));

export const mergeNotification = (user: User) =>
  sendDiscordEmbed(
    `${getUserName(user)} linked their Twitch account.`,
    getUserFooter(user),
  );

export const unlinkNotification = (user: User) =>
  sendDiscordEmbed(
    `${getUserName(user)} unlinked their Twitch account.`,
    getUserFooter(user),
  );

export const upgradeNotification = (user: User) =>
  sendDiscordEmbed(
    `${getUserName(user)} upgraded their PC box space.`,
    getUserFooter(user),
  );
