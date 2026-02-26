import { Schema, model } from 'mongoose';
import { TPromoCode, TPromoCodeModel } from './promoCode.interface';

const promoCodeSchema = new Schema<TPromoCode, TPromoCodeModel>(
  {
    code: { type: String, required: true, unique: true },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    limits: { type: Number, required: true },
    used: { type: Number, default: 0 },
    discount: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

export const PromoCodeModel = model<TPromoCode, TPromoCodeModel>(
  'PromoCode',
  promoCodeSchema
);