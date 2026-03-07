import mongoose, { Model } from 'mongoose';

export type IRevenue = {
  booking:  mongoose.Types.ObjectId;
  des: string;
  revenue: number;
};

export type IRevenueModel = Model<IRevenue>;