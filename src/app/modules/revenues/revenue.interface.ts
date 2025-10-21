import mongoose, { Model } from 'mongoose';

export type IRevenue = {
  user:  mongoose.Types.ObjectId;
  revenue: number;
};

export type IRevenueModel = Model<IRevenue>;