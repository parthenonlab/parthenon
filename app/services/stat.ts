import { GameCode } from '@/enums/games';
import { StatObject } from '@/interfaces/stat';
import { StatModel } from '@/models/stat';

/**
 * Creates a new stats document for a user.
 *
 * @param payload - The stats data to persist
 * @returns The created StatObject
 */
export const createStats = async (payload: StatObject): Promise<StatObject> => {
  const stats = await StatModel.create(payload);
  return stats.toObject() as StatObject;
};

/**
 * Fetches the stats document for a given Discord user.
 *
 * @param id - The Discord user ID
 * @returns The StatObject, or null if not found
 */
export const getStats = async (id: string): Promise<StatObject | null> => {
  const stats = await StatModel.findOne({ discord_id: id });

  if (!stats) return null;
  return stats.toObject() as StatObject;
};

/**
 * Updates the stats document for a given Discord user and game.
 *
 * @param code - The game code identifying which game's stats to update
 * @param payload - The updated stats data; must include discord_id
 * @returns The updated StatObject, or null if no document was found
 */
export const updateStats = async (
  code: GameCode,
  payload: StatObject
): Promise<StatObject | null> => {
  const stats = await StatModel.findOneAndUpdate(
    { discord_id: payload.discord_id, code: code },
    { ...payload },
    { new: true }
  );

  if (!stats) return null;
  return stats.toObject() as StatObject;
};
