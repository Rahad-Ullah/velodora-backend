import mongoose, { Model } from 'mongoose';

export type IContactSupport = {
  user:  mongoose.Types.ObjectId;
  sub: string;
  msg: string;
  reply: string;
  isReply: boolean;
};

export type IContactSupportModal = Model<IContactSupport>;