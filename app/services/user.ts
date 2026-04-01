import { User } from '@parthenonlab/types';
import { UserModel } from '@parthenonlab/models';

type LeanUser = User & { _id: string };

const stripId = (doc: LeanUser | null) =>
  doc ? (({ _id, ...rest }) => rest)(doc) : null;

export const attemptUserMerge = async (payload: {
  discord_id: string;
  twitch_id: string;
}): Promise<User | null> => {
  const { discord_id, twitch_id } = payload;

  const discordDoc = await UserModel.findOne({
    discord_id,
  }).lean<LeanUser>();

  const discordData = stripId(discordDoc);

  if (discordData && discordData.twitch_id) return discordData;

  const twitchDoc = await UserModel.findOne({
    twitch_id,
  }).lean<LeanUser>();

  const twitchData = stripId(twitchDoc);

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
  const user = await UserModel.findOne({
    [`${method}_id`]: id,
  }).lean<LeanUser>();

  if (!user) return null;

  const { _id, ...rest } = user as LeanUser;
  return rest;
};
