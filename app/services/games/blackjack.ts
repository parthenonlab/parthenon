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

  if (status === BlackjackStatus.Blackjack) {
    const reward = isDouble ? bet + bet * 2 : bet + Math.round(bet * 1.5);

    await UserModel.findOneAndUpdate(
      { discord_id: discordId },
      { $inc: { cash: reward } }
    );

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
    const reward = isDouble ? bet + bet * 2 : bet * 2;

    await UserModel.findOneAndUpdate(
      { discord_id: discordId },
      { $inc: { cash: reward } }
    );

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
    await UserModel.findOneAndUpdate(
      { discord_id: discordId },
      { $inc: { cash: bet } }
    );

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
  } else {
    if (isDouble) {
      await UserModel.findOneAndUpdate(
        { discord_id: discordId },
        { $inc: { cash: -bet } }
      );
    }

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

  await GameModel.findOneAndDelete({
    discord_id: discordId,
    key: game.key,
  });

  return { key: updatedKey };
};
