import { Schema, model } from 'mongoose';
import { IAuthProvider, AuthProviderModel } from './authProvider.interface';
import { AuthProviderEnum } from './authProvider.constants';

const authProviderSchema = new Schema<IAuthProvider, AuthProviderModel>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    provider: {
      type: String,
      enum: Object.values(AuthProviderEnum),
      required: true,
    },
    providerUserId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

authProviderSchema.index({ provider: 1, providerUserId: 1 }, { unique: true });

export const AuthProvider = model<IAuthProvider, AuthProviderModel>(
  'AuthProvider',
  authProviderSchema
);
