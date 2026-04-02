import { GameCode } from '@/enums/games';
import { Stats } from '@parthenonlab/types';
import { StatsModel } from '@parthenonlab/models';

/**
 * Creates a new stats document for a user.
 *
 * @param payload - The stats data to persist
 * @returns The created Stats
 */
export const createStats = async (payload: Stats): Promise<Stats> => {
  const stats = await StatsModel.create(payload);
  return stats.toObject() as Stats;
};

/**
 * Fetches the stats document for a given Discord user.
 *
 * @param id - The Discord user ID
 * @returns The Stats, or null if not found
 */
export const getStats = async (id: string): Promise<Stats | null> => {
  const stats = await StatsModel.findOne({ discord_id: id });

  if (!stats) return null;
  return stats.toObject() as Stats;
};

/**
 * Updates the stats document for a given Discord user and game.
 *
 * @param code - The game code identifying which game's stats to update
 * @param payload - The updated stats data; must include discord_id
 * @returns The updated Stats, or null if no document was found
 */
export const updateStats = async (
  code: GameCode,
  payload: Stats
): Promise<Stats | null> => {
  const stats = await StatsModel.findOneAndUpdate(
    { discord_id: payload.discord_id, code: code },
    { ...payload },
    { new: true }
  );

  if (!stats) return null;
  return stats.toObject() as Stats;
};
