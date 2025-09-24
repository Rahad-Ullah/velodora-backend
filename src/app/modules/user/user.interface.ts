import { Model } from 'mongoose';
import { USER_ROLES } from '../../../enums/user';

export type IUser = {
  role: USER_ROLES;
  name: string;
  image?: string;
  email: string;
  contact: string;
  location: string;
  password: string;
  credit?: number;
  isActive?: Boolean;
  verified?: boolean;
  isDeleted?: boolean;
  authentication?: {
    isSendOtp: boolean;
    oneTimeCode: number;
    expireAt: Date;
  };
};

export type PartialUserWithRequiredEmail = Partial<Omit<IUser, 'email'>> & Pick<IUser, 'email'>;


export type TUserModal = {
  isExistUserById(id: string): any;
  isExistUserByEmail(email: string): any;
  isMatchPassword(password: string, hashPassword: string): boolean;
} & Model<IUser>;
