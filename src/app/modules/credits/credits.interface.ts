import mongoose, { Model } from 'mongoose';

export type ICredits = {
  user:  mongoose.Types.ObjectId;
  credits: number;
};

export type ICreditsModal = Model<ICredits>;