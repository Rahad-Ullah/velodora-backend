
import { model, Schema } from 'mongoose';
import { ICredits, ICreditsModal } from './credits.interface';

const creditsSchema = new Schema<ICredits, ICreditsModal>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    credits: {
      type: Number,
      required: true,
    }
  },
  { timestamps: true }
);


export const CreditsModel = model<ICredits, ICreditsModal>('Credits', creditsSchema);
