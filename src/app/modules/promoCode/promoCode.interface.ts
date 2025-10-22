import { Model } from 'mongoose';

export type TPromoCode = {
  code: string;
  start: Date;
  end: Date;
  limits: number;
  discount: number;
};

export type TPromoCodeModel = Model<TPromoCode>;