import { User } from '@parthenonlab/types';
import { UserModel } from '@parthenonlab/models';

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

    await Promise.all([
      UserModel.findOneAndUpdate({ discord_id }, updatedUser),
      UserModel.findOneAndDelete({ twitch_id }),
    ]);

    return updatedUser;
  }

  return discordData ?? twitchData ?? null;
};

export const getUser = async (
  id: string,
  method: 'discord' | 'twitch'
): Promise<User | null> => {
  const user = await UserModel.findOne({ [`${method}_id`]: id });
  return user ? (user.toObject() as User) : null;
};
