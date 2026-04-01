import { Document } from 'mongoose';
import { GameCode } from '@/enums/games';

export type GameData = Record<string, string | string[] | number>;

export interface GameDocument extends Document {
  discord_id: string;
  code: GameCode;
  key?: string;
  data: GameData;
}

export interface GameObject {
  discord_id: string;
  code: GameCode;
  key?: string;
  data: GameData;
}
