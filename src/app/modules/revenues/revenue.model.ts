
import { model, Schema } from 'mongoose';
import { IRevenue, IRevenueModel } from './revenue.interface';

const revenueSchema = new Schema<IRevenue, IRevenueModel>(
  {
    booking: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    des: {
      type: String,
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
