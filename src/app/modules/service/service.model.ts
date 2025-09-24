import { model, Schema } from 'mongoose';
import { IService, IServiceModal } from './service.interface';

const serviceSchema = new Schema<IService, IServiceModal>(
  {
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    subCategory: {
      type: Schema.Types.ObjectId,
      ref: 'SubCategory',
      required: true,
    },
    price: {
      type: Number,
      required: true,
    }
  },
  { timestamps: true }
);


export const ServiceModel = model<IService, IServiceModal>(
  'service',
  serviceSchema
);
