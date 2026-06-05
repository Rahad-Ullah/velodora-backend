import { Model, Types } from 'mongoose';
import { AuthProviderEnum } from './authProvider.constants';

export type IAuthProvider = {
  user: Types.ObjectId;
  provider: AuthProviderEnum;
  providerUserId: string;
};

export type AuthProviderModel = Model<IAuthProvider>;
