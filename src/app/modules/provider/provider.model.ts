import { model, Schema } from 'mongoose';
import { TProvider, TProviderModal } from './provider.interface';

const providerSchema = new Schema<TProvider, TProviderModal>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    aboutMe: {
      type: String,
      required: true,
    },
    services: {
      type: [Schema.Types.ObjectId],
      required: true,
    },
    schedules: {
      type: [Schema.Types.ObjectId]
    },
    serviceLanguage: {
      type: [String],
      required: true,
    },
    primaryLocation: {
      type: String,
      required: true,
    },
    serviceDistance: {
      type: Number,
      // required: true,
    },
    pricePerHour: {
      type: Number,
      required: true,
    },
    serviceImages: {
      type: [String],
      maxlength: 10,
      // required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    isOnline: {
      type: Boolean,
      default: false,
    }
  },
  { timestamps: true }
);


export const ProviderModel = model<TProvider, TProviderModal>(
  'Provider',
  providerSchema
);
