import { Model, Types } from 'mongoose';

export type IResetToken = {
  user: Types.ObjectId;
  token: string;
  expireAt: Date;
};

export type IResetTokenModel = {
  isExistToken(token: string): any;
  isExpireToken(token: string): boolean;
} & Model<IResetToken>;
