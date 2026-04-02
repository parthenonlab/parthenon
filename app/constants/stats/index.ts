import { BlackjackStats, WordleStats } from '@parthenonlab/types';

export const INITIAL_BLACKJACK: BlackjackStats = {
  totalBlackjack: 0,
  totalPlayed: 0,
  totalWon: 0,
};

export const INITIAL_WORDLE: WordleStats = {
  currentStreak: 0,
  distribution: new Array(6).fill(0),
  maxStreak: 0,
  totalPlayed: 0,
  totalWon: 0,
};
