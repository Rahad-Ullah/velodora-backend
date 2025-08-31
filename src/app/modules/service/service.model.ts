import { model, Schema } from 'mongoose';
import { IService, IServiceModal } from './service.interface';

const serviceSchema = new Schema<IService, IServiceModal>(
  {
    providerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      // required: true,
    },
    aboutMe: {
      type: String,
      // required: true,
    },
    serviceType: {
      type: Schema.Types.ObjectId,
      // required: true,
    },
    additionalServiceType: {
      type: String,
      // required: true,
    },
    serviceLocation: {
      type: String,
      // required: true,
    },
    serviceDistance: {
      type: Number,
      // required: true,
    },
    price: {
      type: Number,
      // required: true,
    },
    pricePerHour: {
      type: Number,
      // required: true,
    },
    serviceImages: {
      type: [String],
      maxlength: 4,
      // required: true,
    },
  },
  { timestamps: true }
);


export const ServiceModel = model<IService, IServiceModal>(
  'service',
  serviceSchema
);
