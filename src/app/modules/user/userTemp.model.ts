import { model, Schema } from 'mongoose';
import { IUser, TUserModal } from './user.interface';

const userTempSchema = new Schema<IUser, TUserModal>(
  {
    ref: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    name: {
      type: String,
    },
    image: {
      type: String,
      default: null,
    },
    email: {
      type: String,
    },
    contact: {
      type: String,
    },
    countryCode: {
      type: String,
    },
    location: {
      type: String,
    },
    coordinates: {
      type: [Number],
    },
  },
  { timestamps: true }
);


export const UserTempModel = model<IUser, TUserModal>('UserTemp', userTempSchema);