import { model, models, Schema } from 'mongoose';

import { GameDocument } from '@/interfaces/games';
import { GameCode } from '@/enums/games';
import { getCollectionENV } from '@/lib/database';

const { MONGODB_COLLECTION_GAMES } = getCollectionENV();

const gameSchema = new Schema<GameDocument>(
  {
    discord_id: { type: String, required: true },
    key: { type: String },
    code: { type: String, enum: Object.values(GameCode), required: true },
    data: {
      type: String,
      default: () => JSON.stringify({}),
      set: (val: Record<string, string | string[]>) => JSON.stringify(val),
      get: (val: string) => {
        try {
          return JSON.parse(val);
        } catch {
          return {};
        }
      },
    },
  },
  { collection: MONGODB_COLLECTION_GAMES, versionKey: false },
);

gameSchema.index({ discord_id: 1, code: 1 });
gameSchema.index({ discord_id: 1, key: 1 });

export const GameModel = models.Game || model<GameDocument>('Game', gameSchema);
