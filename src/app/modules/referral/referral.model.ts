import { Schema, model } from 'mongoose';
import { TReferral, TReferralModel } from './referral.interface';

const referralSchema = new Schema<TReferral, TReferralModel>(
  {
    code: { type: String, required: true, unique: true },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    usedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    isUsed: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export const ReferralModel = model<TReferral, TReferralModel>(
  'Referral',
  referralSchema
);
