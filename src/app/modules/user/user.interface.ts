import { Model, Types } from 'mongoose';
import { USER_ROLES, USER_STATUS } from '../../../enums/user';

export type IUser = {
  role: USER_ROLES;
  name: string;
  email: string;
  contact: string;
  password: string;
  location: string;
  image?: string;
  status: USER_STATUS;
  service: boolean;
  verified: boolean;
  authentication?: {
    isSendOtp: boolean;
    oneTimeCode: number;
    expireAt: Date;
  };
};

export type PartialUserWithRequiredEmail = Partial<Omit<IUser, 'email'>> & Pick<IUser, 'email'>;


export type UserModal = {
  isExistUserById(id: string): any;
  isExistUserByEmail(email: string): any;
  isMatchPassword(password: string, hashPassword: string): boolean;
} & Model<IUser>;
