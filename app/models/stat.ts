import { model, models, Schema } from 'mongoose';
import { GameCode } from '@/enums/games';
import { StatDocument } from '@/interfaces/stat';
import { getCollectionENV } from '@/lib/database';

const { MONGODB_COLLECTION_STATS } = getCollectionENV();

const statSchema = new Schema<StatDocument>(
  {
    discord_id: { type: String, required: true, unique: true },
    [GameCode.Blackjack]: {
      totalBlackjack: Number,
      totalPlayed: Number,
      totalWon: Number,
    },
    [GameCode.Wordle]: {
      currentStreak: Number,
      distribution: [Number],
      maxStreak: Number,
      totalPlayed: Number,
      totalWon: Number,
    },
  },
  {
    collection: MONGODB_COLLECTION_STATS,
    versionKey: false,
    toObject: {
      transform: (_doc: unknown, ret: Record<string, unknown>) => {
        delete ret._id;
        return ret;
      },
    },
  }
);

export const StatModel = models.Stat || model<StatDocument>('Stat', statSchema);
