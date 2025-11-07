import { Model } from 'mongoose';
import { USER_ROLES } from '../../../enums/user';

export type IUser = {
  ref?: string;
  role: USER_ROLES;
  name?: string;
  image?: string;
  email: string;
  contact?: string;
  countryCode?: string;
  location?: string;
  password: string;
  credits?: number;
  isActive?: Boolean;
  verified?: boolean;
  verifiedService?: boolean;
  isService?: boolean;
  isDeleted?: boolean;
  isModified?: boolean;
  authentication?: {
    isSendOtp: boolean;
    oneTimeCode: number;
    expireAt: Date;
  };
  stripeAccountInfo?:{
    stripeAccountId: string;
    stripeLoginUrl: string;
    isAccountReady: boolean;
  }
};

export type PartialUserWithRequiredEmail = Partial<Omit<IUser, 'email'>> & Pick<IUser, 'email'>;


export type TUserModal = {
  isExistUserById(id: string): any;
  isExistUserByEmail(email: string): any;
  isMatchPassword(password: string, hashPassword: string): boolean;
} & Model<IUser>;
