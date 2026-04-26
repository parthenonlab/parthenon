import { GameCode } from '@/enums/games';

export type BlackjackGameData = { bet: number };
export type WordleGameData = { answer: string; guesses: string[] };
export type ActiveGameData = BlackjackGameData | WordleGameData;

export interface ActiveGame {
  discord_id: string;
  code: GameCode;
  key: string;
  data: ActiveGameData;
}

export interface ActiveGameRequest {
  code: GameCode;
  key?: string;
  data: { sessionKey?: string; sessionCode?: string };
}

export interface ActiveGameResult<TStats = unknown> {
  key: string;
  cashDelta?: number;
  stats?: TStats;
}
