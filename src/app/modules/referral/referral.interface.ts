import { Model, Types } from 'mongoose';

export type TReferral = {
  code: string;
  createdBy: Types.ObjectId;
  usedBy: Types.ObjectId;
  isUsed: boolean;
};

export type TReferralModel = Model<TReferral>;
