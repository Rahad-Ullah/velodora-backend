import { model, Schema } from 'mongoose';
import { IUser, TUserModal } from './user.interface';

const userTempSchema = new Schema<IUser, TUserModal>(
  {
    ref: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: null,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    contact: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);


export const UserTempModel = model<IUser, TUserModal>('UserTemp', userTempSchema);