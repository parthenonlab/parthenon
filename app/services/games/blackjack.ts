import { v4 as uuidv4 } from 'uuid';

import { INITIAL_BLACKJACK } from '@/constants/stats';
import { BlackjackStatus, GameCode } from '@/enums/games';
import {
  ActiveGame,
  ActiveGameRequest,
  BlackjackGameData,
} from '@/interfaces/games';
import { decrypt } from '@/lib/utils';

import { ActiveGameModel } from '@/models/game';
import { StatsModel, UserModel } from '@parthenonlab/models';

export const updateBlackjackGame = async (
  game: ActiveGame,
  discordId: string,
  payload: ActiveGameRequest,
): Promise<Partial<ActiveGame> | null> => {
  const updatedKey = uuidv4();
  const statusString = decrypt(payload.data.sessionCode!);
  const status = statusString.split('-')[0];
  const isDouble = statusString.split('-')[1] === 'double';

  const { bet } = game.data as BlackjackGameData;

  const userStats = await StatsModel.findOne({ discord_id: discordId });
  const stats = userStats?.[GameCode.Blackjack] ?? INITIAL_BLACKJACK;

  let cashDelta = 0;

  if (status === BlackjackStatus.Blackjack) {
    cashDelta = isDouble ? bet + bet * 2 : bet + Math.round(bet * 1.5);

    await StatsModel.findOneAndUpdate(
      { discord_id: discordId },
      {
        $set: {
          [GameCode.Blackjack]: {
            ...stats,
            totalBlackjack: stats.totalBlackjack + 1,
            totalPlays: stats.totalPlays + 1,
            totalWon: stats.totalWon + 1,
          },
        },
      },
      { upsert: true },
    );
  } else if (
    status === BlackjackStatus.Win ||
    status === BlackjackStatus.DealerBust
  ) {
    cashDelta = isDouble ? bet + bet * 2 : bet * 2;

    await StatsModel.findOneAndUpdate(
      { discord_id: discordId },
      {
        $set: {
          [GameCode.Blackjack]: {
            ...stats,
            totalPlays: stats.totalPlays + 1,
            totalWon: stats.totalWon + 1,
          },
        },
      },
      { upsert: true },
    );
  } else if (status === BlackjackStatus.Push) {
    cashDelta = bet;
  } else {
    if (isDouble) cashDelta = -bet;
  }

  if (
    status === BlackjackStatus.Push ||
    status === BlackjackStatus.Lose ||
    status === BlackjackStatus.Bust
  ) {
    await StatsModel.findOneAndUpdate(
      { discord_id: discordId },
      {
        $set: {
          [GameCode.Blackjack]: {
            ...stats,
            totalPlays: stats.totalPlays + 1,
          },
        },
      },
      { upsert: true },
    );
  }

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

  return { key: updatedKey };
};
