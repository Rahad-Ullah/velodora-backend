
import { model, Schema } from 'mongoose';
import { IRevenue, IRevenueModel } from './revenue.interface';

const revenueSchema = new Schema<IRevenue, IRevenueModel>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    revenue: {
      type: Number,
      required: true,
    }
  },
  { timestamps: true }
);


export const RevenueModel = model<IRevenue, IRevenueModel>('Revenue', revenueSchema);
