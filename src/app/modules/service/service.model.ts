import { model, Schema } from 'mongoose';
import { IService, IServiceModal } from './service.interface';
import { SERVICE_STATUS } from '../../../enums/service';

const serviceSchema = new Schema<IService, IServiceModal>(
  {
    ref: {
      type: Schema.Types.ObjectId,
      ref: 'service',
    },
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
    },
    status: {
      type: String,
      enum: Object.values(SERVICE_STATUS),
      default: SERVICE_STATUS.OLD
    }
  },
  { timestamps: true }
);


export const ServiceModel = model<IService, IServiceModal>(
  'service',
  serviceSchema
);