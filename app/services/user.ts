import { User } from '@parthenonlab/types';
import { UserModel } from '@parthenonlab/models';

/**
 * Attempts to merge a Twitch user document into an existing Discord user account.
 * If the Discord user already has a linked Twitch ID, returns the existing record unchanged.
 * If both accounts exist separately, combines their balances, updates the Discord document, and deletes the Twitch document.
 *
 * @param payload.discord_id - The Discord user ID
 * @param payload.twitch_id - The Twitch user ID to merge into the Discord account
 * @returns The merged or existing user, or null if neither account was found
 */
export const attemptUserMerge = async (payload: {
  discord_id: string;
  twitch_id: string;
}): Promise<User | null> => {
  const { discord_id, twitch_id } = payload;

  const discordDoc = await UserModel.findOne({ discord_id });
  const discordData = discordDoc ? (discordDoc.toObject() as User) : null;

  if (discordData && discordData.twitch_id) return discordData;

  const twitchDoc = await UserModel.findOne({ twitch_id });
  const twitchData = twitchDoc ? (twitchDoc.toObject() as User) : null;

  if (discordData && twitchData) {
    const updatedUser: User = {
      ...discordData,
      twitch_id,
      twitch_username: twitchData.twitch_username,
      cash: discordData.cash + twitchData.cash,
    };

    await UserModel.findOneAndUpdate({ discord_id }, updatedUser);
    await UserModel.findOneAndDelete({ twitch_id });

    return updatedUser;
  }

  return discordData ?? twitchData ?? null;
};

/**
 * Fetches a user by their Discord or Twitch ID.
 *
 * @param id - The user ID to look up
 * @param method - Whether to query by "discord" or "twitch" ID
 * @returns The User object, or null if not found
 */
export const getUser = async (
  id: string,
  method: 'discord' | 'twitch'
): Promise<User | null> => {
  const user = await UserModel.findOne({ [`${method}_id`]: id });
  return user ? (user.toObject() as User) : null;
};
