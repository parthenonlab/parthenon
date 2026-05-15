import { User } from '@parthenonlab/types';

interface EmbedAuthor {
  name: string;
  icon_url?: string;
}

interface EmbedOptions {
  description?: string;
  author: EmbedAuthor;
  footer: string;
}

const getUserName = (user: User) =>
  user.discord_name ??
  user.discord_username ??
  user.twitch_username ??
  'Unknown';

const getUserFooter = (user: User) =>
  user.discord_id
    ? `Discord ID: ${user.discord_id}`
    : `Twitch ID: ${user.twitch_id}`;

const getUserAuthor = (user: User, label: string, imageUrl?: string): EmbedAuthor => ({
  name: `${getUserName(user)} - ${label}`,
  ...(imageUrl && { icon_url: imageUrl }),
});

const sendDiscordEmbed = async (options: EmbedOptions): Promise<void> => {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [
          {
            ...(options.description && { description: options.description }),
            author: options.author,
            color: 9684991,
            footer: { text: options.footer },
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

const isDev = process.env.NODE_ENV === 'development';
const devSuffix = isDev ? ' (dev)' : '';

export const loginNotification = (user: User, imageUrl?: string, path?: string) =>
  sendDiscordEmbed({
    description: path ? `Path: ${path}` : undefined,
    author: getUserAuthor(user, `User Login${devSuffix}`, imageUrl),
    footer: getUserFooter(user),
  });

export const mergeNotification = (user: User, imageUrl?: string) =>
  sendDiscordEmbed({
    author: getUserAuthor(user, `Twitch Linked${devSuffix}`, imageUrl),
    footer: getUserFooter(user),
  });

export const unlinkNotification = (user: User, imageUrl?: string) =>
  sendDiscordEmbed({
    author: getUserAuthor(user, `Twitch Unlinked${devSuffix}`, imageUrl),
    footer: getUserFooter(user),
  });

export const upgradeNotification = (user: User, boxSpace: number, imageUrl?: string) =>
  sendDiscordEmbed({
    description: `Available Space: ${boxSpace}`,
    author: getUserAuthor(user, `PC Box Upgrade${devSuffix}`, imageUrl),
    footer: getUserFooter(user),
  });

export const blackjackNotification = (
  user: User,
  playerTotal: number,
  dealerTotal: number,
  result: string,
  cashDelta: number,
  imageUrl?: string,
) => {
  const rewardStr = cashDelta > 0 ? `+${cashDelta.toLocaleString()}` : cashDelta.toLocaleString();
  const newBalance = user.cash + cashDelta;

  return sendDiscordEmbed({
    description: [
      `User: ${playerTotal} | Dealer: ${dealerTotal}`,
      `Result: ${result}`,
      '',
      `Reward: ${rewardStr}`,
      `Balance: ${newBalance.toLocaleString()}`,
    ].join('\n'),
    author: getUserAuthor(user, `Blackjack Game${devSuffix}`, imageUrl),
    footer: getUserFooter(user),
  });
};

export const wordleNotification = (
  user: User,
  answer: string,
  guesses: string[],
  reward: number | null,
  imageUrl?: string,
) =>
  sendDiscordEmbed({
    description: [
      `Answer: ${answer}`,
      `Guesses: ${guesses.join(', ')}`,
      '',
      ...(reward != null ? [`Reward: +${reward}`] : []),
      `Balance: ${(user.cash + (reward ?? 0)).toLocaleString()}`,
    ].join('\n'),
    author: getUserAuthor(user, `Wordle Game${devSuffix}`, imageUrl),
    footer: getUserFooter(user),
  });
