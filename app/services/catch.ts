import { Catch } from '@parthenonlab/types';
import { CatchModel } from '@parthenonlab/models';

/**
 * Fetches all catches for a given Discord user.
 *
 * @param discordId - The Discord user ID
 * @returns An array of Catch documents
 */
export const getCatches = async (discordId: string): Promise<Catch[]> => {
  const catches = await CatchModel.find({ discord_id: discordId });
  return catches.map(c => c.toObject() as Catch);
};
