import { v4 as uuidv4 } from 'uuid';

import { INITIAL_BLACKJACK } from '@/constants/stats';
import { BlackjackStatus, GameCode } from '@/enums/games';
import { GameObject } from '@/interfaces/games';
import { decrypt } from '@/lib/utils';

import { GameModel } from '@/models/game';
import { StatModel } from '@/models/stat';
import { UserModel } from '@parthenonlab/models';

export const updateBlackjackGame = async (
  game: GameObject,
  discordId: string,
  payload: GameObject
): Promise<Partial<GameObject> | null> => {
  const updatedKey = uuidv4();
  const sessionCode = payload.data!.sessionCode as string;

  const statusString = decrypt(sessionCode);
  const status = statusString.split('-')[0];
  const isDouble = statusString.split('-')[1] === 'double';

  const gameData =
    typeof game.data === 'string' ? JSON.parse(game.data) : game.data;

  const bet = parseInt(gameData.bet as string, 10);

  const userStats = await StatModel.findOne({
    discord_id: discordId,
  });

  const stats = userStats?.[GameCode.Blackjack] ?? INITIAL_BLACKJACK;

  let cashDelta = 0;

  if (status === BlackjackStatus.Blackjack) {
    cashDelta = isDouble ? bet + bet * 2 : bet + Math.round(bet * 1.5);

    await StatModel.findOneAndUpdate(
      { discord_id: discordId },
      {
        $set: {
          [GameCode.Blackjack]: {
            ...stats,
            totalBlackjack: stats.totalBlackjack + 1,
            totalPlayed: stats.totalPlayed + 1,
            totalWon: stats.totalWon + 1,
          },
        },
      },
      { upsert: true }
    );
  } else if (
    status === BlackjackStatus.Win ||
    status === BlackjackStatus.DealerBust
  ) {
    cashDelta = isDouble ? bet + bet * 2 : bet * 2;

    await StatModel.findOneAndUpdate(
      { discord_id: discordId },
      {
        $set: {
          [GameCode.Blackjack]: {
            ...stats,
            totalPlayed: stats.totalPlayed + 1,
            totalWon: stats.totalWon + 1,
          },
        },
      },
      { upsert: true }
    );
  } else if (status === BlackjackStatus.Push) {
    cashDelta = bet;
  } else {
    if (isDouble) cashDelta = -bet;
  }

  if (status === BlackjackStatus.Push || status === BlackjackStatus.Lose || status === BlackjackStatus.Bust) {
    await StatModel.findOneAndUpdate(
      { discord_id: discordId },
      {
        $set: {
          [GameCode.Blackjack]: {
            ...stats,
            totalPlayed: stats.totalPlayed + 1,
          },
        },
      },
      { upsert: true }
    );
  }

  await GameModel.findOneAndDelete({ discord_id: discordId, key: game.key });

  if (cashDelta !== 0) {
    await UserModel.findOneAndUpdate({ discord_id: discordId }, { $inc: { cash: cashDelta } });
  }

  return { key: updatedKey };
};
