import { v4 as uuidv4 } from 'uuid';

import { BlackjackStats } from '@parthenonlab/types';

import { INITIAL_BLACKJACK } from '@/constants/stats';
import { BlackjackStatus, GameCode } from '@/enums/games';
import {
  ActiveGame,
  ActiveGameRequest,
  ActiveGameResult,
  BlackjackGameData,
} from '@/interfaces/games';
import { decrypt } from '@/lib/utils';

import { UserModel } from '@parthenonlab/models';

import { ActiveGameModel } from '@/models/game';
import { getStats, updateStats } from '@/services/stats';

export const updateBlackjackGame = async (
  game: ActiveGame,
  discordId: string,
  payload: ActiveGameRequest,
): Promise<ActiveGameResult<BlackjackStats>> => {
  const updatedKey = uuidv4();
  const statusString = decrypt(payload.data.sessionCode!);
  const status = statusString.split('-')[0];
  const isDouble = statusString.split('-')[1] === 'double';

  const { bet } = game.data as BlackjackGameData;

  const userStats = await getStats(discordId);
  const stats = userStats?.[GameCode.Blackjack] ?? INITIAL_BLACKJACK;

  let cashDelta = 0;

  const updatedStats = { ...stats, totalPlays: stats.totalPlays + 1 };

  if (status === BlackjackStatus.Blackjack) {
    cashDelta = isDouble ? bet + bet * 2 : bet + Math.round(bet * 1.5);
    updatedStats.totalBlackjack = stats.totalBlackjack + 1;
    updatedStats.totalWon = stats.totalWon + 1;
  } else if (
    status === BlackjackStatus.Win ||
    status === BlackjackStatus.DealerBust
  ) {
    cashDelta = isDouble ? bet + bet * 2 : bet * 2;
    updatedStats.totalWon = stats.totalWon + 1;
  } else if (status === BlackjackStatus.Push) {
    cashDelta = bet;
  } else {
    if (isDouble) cashDelta = -bet;
  }

  await updateStats(GameCode.Blackjack, discordId, updatedStats);

  await ActiveGameModel.findOneAndDelete({
    discord_id: discordId,
    key: game.key,
  });

  if (cashDelta !== 0) {
    await UserModel.findOneAndUpdate(
      { discord_id: discordId },
      { $inc: { cash: cashDelta } },
    );
  }

  return { key: updatedKey, cashDelta, stats: updatedStats };
};
