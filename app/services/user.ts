import { User } from '@parthenonlab/types';
import { UserModel } from '@parthenonlab/models';

const BOX_UPGRADE_COST = 10000;
const BOX_UPGRADE_SLOTS = 10;

export const attemptUserMerge = async (payload: {
  discord_id: string;
  twitch_id: string;
  twitch_username?: string | null;
}): Promise<{ user: User | null; merged: boolean }> => {
  const { discord_id, twitch_id, twitch_username } = payload;

  const discordDoc = await UserModel.findOne({ discord_id });
  const discordData = discordDoc ? (discordDoc.toObject() as User) : null;

  if (discordData?.twitch_id) return { user: discordData, merged: false };

  const twitchDoc = await UserModel.findOne({ twitch_id });
  const twitchData = twitchDoc ? (twitchDoc.toObject() as User) : null;

  if (discordData && twitchData) {
    const updatedUser: User = {
      ...discordData,
      twitch_id,
      twitch_username: twitchData.twitch_username,
      cash: discordData.cash + twitchData.cash,
    };

    await UserModel.findOneAndUpdate(
      { discord_id },
      { $set: { twitch_id, twitch_username: twitchData.twitch_username, cash: updatedUser.cash } },
    );
    await UserModel.findOneAndDelete({ twitch_id });

    return { user: updatedUser, merged: true };
  }

  if (discordData) {
    const updatedUser: User = {
      ...discordData,
      twitch_id,
      twitch_username: twitch_username ?? null,
    };

    await UserModel.findOneAndUpdate(
      { discord_id },
      { $set: { twitch_id, twitch_username: twitch_username ?? null } },
    );

    return { user: updatedUser, merged: true };
  }

  return { user: twitchData ?? null, merged: false };
};

export const upgradeBoxSpace = async (
  discord_id: string,
): Promise<Pick<User, 'cash' | 'box_space'> | null> => {
  const updated = await UserModel.findOneAndUpdate(
    { discord_id, cash: { $gte: BOX_UPGRADE_COST } },
    { $inc: { cash: -BOX_UPGRADE_COST, box_space: BOX_UPGRADE_SLOTS } },
    { new: true },
  );

  if (!updated) return null;
  return { cash: updated.cash, box_space: updated.box_space };
};

export const getUser = async (
  id: string,
  method: 'discord' | 'twitch'
): Promise<User | null> => {
  const user = await UserModel.findOne({ [`${method}_id`]: id });
  return user ? (user.toObject() as User) : null;
};

export const deductCash = async (
  discordId: string,
  amount: number,
): Promise<boolean> => {
  const user = await UserModel.findOneAndUpdate(
    { discord_id: discordId, cash: { $gte: amount } },
    { $inc: { cash: -amount } },
  );
  return !!user;
};

export const unlinkTwitch = async (discordId: string): Promise<void> => {
  await UserModel.findOneAndUpdate(
    { discord_id: discordId },
    { $set: { twitch_id: null, twitch_username: null } },
  );
};

export const addCash = async (
  discordId: string,
  amount: number,
): Promise<void> => {
  await UserModel.findOneAndUpdate(
    { discord_id: discordId },
    { $inc: { cash: amount } },
  );
};
