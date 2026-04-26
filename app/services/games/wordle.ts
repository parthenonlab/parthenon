import { v4 as uuidv4 } from 'uuid';

import { UserModel } from '@parthenonlab/models';

import { INITIAL_WORDLE } from '@/constants/stats';
import { MAX_ATTEMPTS, WORDLE_REWARDS } from '@/constants/wordle';
import { GameCode } from '@/enums/games';

import { WordleStats } from '@parthenonlab/types';

import {
  ActiveGame,
  ActiveGameRequest,
  ActiveGameResult,
  WordleGameData,
} from '@/interfaces/games';

import { decrypt } from '@/lib/utils';
import { ActiveGameModel } from '@/models/game';
import { getStats, updateStats } from '@/services/stats';

export const updateWordleGame = async (
  game: ActiveGame,
  discordId: string,
  payload: ActiveGameRequest,
): Promise<ActiveGameResult<WordleStats>> => {
  const updatedKey = uuidv4();
  const guess = decrypt(payload.data.sessionCode!);

  const { answer, guesses } = game.data as WordleGameData;
  const newGuesses = [...guesses, guess];

  const isWin = guess === answer;
  const isAttempt = newGuesses.length < MAX_ATTEMPTS;

  const userStats = await getStats(discordId);
  const stats = userStats?.[GameCode.Wordle] ?? INITIAL_WORDLE;

  if (isWin) {
    const newDistribution = [...stats.distribution];
    newDistribution[newGuesses.length - 1] += 1;

    const updatedStats: WordleStats = {
      currentStreak: stats.currentStreak + 1,
      distribution: newDistribution,
      maxStreak: Math.max(stats.maxStreak, stats.currentStreak + 1),
      totalPlays: stats.totalPlays + 1,
      totalWon: stats.totalWon + 1,
    };

    await ActiveGameModel.findOneAndDelete({
      discord_id: discordId,
      key: game.key,
    });

    await Promise.all([
      updateStats(GameCode.Wordle, discordId, updatedStats),
      UserModel.findOneAndUpdate(
        { discord_id: discordId },
        { $inc: { cash: WORDLE_REWARDS[newGuesses.length - 1] } },
      ),
    ]);

    return { key: updatedKey, cashDelta: WORDLE_REWARDS[newGuesses.length - 1], stats: updatedStats };
  } else if (isAttempt) {
    await ActiveGameModel.findOneAndUpdate(
      { discord_id: discordId, code: GameCode.Wordle },
      { key: updatedKey, data: { answer, guesses: newGuesses } },
    );

    return { key: updatedKey };
  } else {
    const updatedStats: WordleStats = {
      currentStreak: 0,
      distribution: [...stats.distribution],
      maxStreak: stats.maxStreak,
      totalPlays: stats.totalPlays + 1,
      totalWon: stats.totalWon,
    };

    await Promise.all([
      updateStats(GameCode.Wordle, discordId, updatedStats),
      ActiveGameModel.findOneAndDelete({
        discord_id: discordId,
        key: game.key,
      }),
    ]);

    return { key: updatedKey, stats: updatedStats };
  }
};
