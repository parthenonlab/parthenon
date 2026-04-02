import { v4 as uuidv4 } from 'uuid';

import { INITIAL_WORDLE } from '@/constants/stats';
import { MAX_ATTEMPTS, WORDLE_REWARDS } from '@/constants/wordle';

import { GameCode } from '@/enums/games';
import { ActiveGame, ActiveGameRequest, WordleGameData } from '@/interfaces/games';
import { decrypt } from '@/lib/utils';

import { ActiveGameModel } from '@/models/game';
import { StatsModel, UserModel } from '@parthenonlab/models';

export const updateWordleGame = async (
  game: ActiveGame,
  discordId: string,
  payload: ActiveGameRequest
): Promise<Partial<ActiveGame> | null> => {
  const updatedKey = uuidv4();
  const guess = decrypt(payload.data.sessionCode!);

  const { answer, guesses } = game.data as WordleGameData;
  const newGuesses = [...guesses, guess];

  const isWin = guess === answer;
  const isAttempt = newGuesses.length < MAX_ATTEMPTS;

  const userStats = await StatsModel.findOne({ discord_id: discordId });
  const stats = userStats?.[GameCode.Wordle] ?? INITIAL_WORDLE;

  if (isWin) {
    const newDistribution = [...stats.distribution];
    newDistribution[newGuesses.length - 1] += 1;

    await ActiveGameModel.findOneAndDelete({ discord_id: discordId, key: game.key });

    await Promise.all([
      StatsModel.findOneAndUpdate(
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
      ),
      UserModel.findOneAndUpdate(
        { discord_id: discordId },
        { $inc: { cash: WORDLE_REWARDS[newGuesses.length - 1] } }
      ),
    ]);
  } else if (isAttempt) {
    await ActiveGameModel.findOneAndUpdate(
      { discord_id: discordId, code: GameCode.Wordle },
      { key: updatedKey, data: { answer, guesses: newGuesses } }
    );
  } else {
    await StatsModel.findOneAndUpdate(
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

    await ActiveGameModel.findOneAndDelete({ discord_id: discordId, key: game.key });
  }

  return { key: updatedKey };
};
