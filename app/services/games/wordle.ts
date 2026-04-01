import { v4 as uuidv4 } from 'uuid';

import { INITIAL_WORDLE } from '@/constants/stats';
import { MAX_ATTEMPTS, WORDLE_REWARDS } from '@/constants/wordle';

import { GameCode } from '@/enums/games';
import { GameObject } from '@/interfaces/games';
import { decrypt } from '@/lib/utils';

import { GameModel } from '@/models/game';
import { StatModel } from '@/models/stat';
import { UserModel } from '@parthenonlab/models';

export const updateWordleGame = async (
  game: GameObject,
  discordId: string,
  payload: GameObject
): Promise<Partial<GameObject> | null> => {
  const updatedKey = uuidv4();
  const sessionCode = payload.data!.sessionCode as string;
  const guess = decrypt(sessionCode);

  const gameData =
    typeof game.data === 'string' ? JSON.parse(game.data) : game.data;

  const newGuesses: string[] = [...(gameData.guesses as string[]), guess];

  const isWin = guess === gameData.answer;
  const isAttempt = newGuesses.length < MAX_ATTEMPTS;

  const userStats = await StatModel.findOne({
    discord_id: discordId,
  });

  const stats = userStats?.[GameCode.Wordle] ?? INITIAL_WORDLE;

  if (isWin) {
    const newDistribution = [...stats.distribution];
    newDistribution[newGuesses.length - 1] += 1;

    await StatModel.findOneAndUpdate(
      { discord_id: discordId },
      {
        $set: {
          [GameCode.Wordle]: {
            currentStreak: stats.currentStreak + 1,
            distribution: newDistribution,
            maxStreak: Math.max(stats.maxStreak, stats.currentStreak + 1),
            totalPlayed: stats.totalPlayed + 1,
            totalWon: stats.totalWon + 1,
          },
        },
      },
      { upsert: true }
    );

    await GameModel.findOneAndDelete({
      discord_id: discordId,
      key: game.key,
    });

    await UserModel.findOneAndUpdate(
      { discord_id: discordId },
      { $inc: { cash: WORDLE_REWARDS[newGuesses.length - 1] } }
    );
  } else if (isAttempt) {
    await GameModel.findOneAndUpdate(
      { discord_id: discordId, code: GameCode.Wordle },
      {
        ...payload,
        key: updatedKey,
        data: {
          ...gameData,
          guesses: newGuesses,
        },
      }
    );
  } else {
    await StatModel.findOneAndUpdate(
      { discord_id: discordId },
      {
        $set: {
          [GameCode.Wordle]: {
            ...stats,
            currentStreak: 0,
            totalPlayed: stats.totalPlayed + 1,
          },
        },
      },
      { upsert: true }
    );

    await GameModel.findOneAndDelete({
      discord_id: discordId,
      key: game.key,
    });
  }

  return { key: updatedKey };
};
