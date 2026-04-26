import { StatsModel } from '@parthenonlab/models';
import { Stats, StatsFields } from '@parthenonlab/types';

import { GameCode } from '@/enums/games';

export const getStats = async (discordId: string): Promise<Stats | null> => {
  const stats = await StatsModel.findOne({ discord_id: discordId });
  if (!stats) return null;
  return stats.toObject() as Stats;
};

export const updateStats = async (
  code: GameCode,
  discordId: string,
  data: StatsFields[keyof StatsFields],
): Promise<void> => {
  await StatsModel.findOneAndUpdate(
    { discord_id: discordId },
    { $set: { [code]: data } },
    { upsert: true },
  );
};
