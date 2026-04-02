import { HydratedDocument, model, models, Schema } from 'mongoose';

import { ActiveGame } from '@/interfaces/games';
import { GameCode } from '@/enums/games';

export type ActiveGameDocument = HydratedDocument<ActiveGame>;

const activeGameSchema = new Schema<ActiveGame>(
  {
    discord_id: { type: String, required: true },
    code: { type: String, enum: Object.values(GameCode), required: true },
    key: { type: String, required: true },
    data: { type: Schema.Types.Mixed, required: true, default: {} },
  },
  {
    collection: 'games',
    versionKey: false,
    toObject: {
      transform: (_doc: unknown, ret: Record<string, unknown>) => {
        delete ret._id;
        return ret;
      },
    },
  },
);

activeGameSchema.index({ discord_id: 1, code: 1 });
activeGameSchema.index({ discord_id: 1, key: 1 });

export const ActiveGameModel =
  models.ActiveGame || model<ActiveGame>('ActiveGame', activeGameSchema);
