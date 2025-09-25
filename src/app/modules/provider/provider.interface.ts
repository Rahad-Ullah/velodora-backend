import { Model, Types } from 'mongoose';

export type TProvider = {
  user:  Types.ObjectId;
  ref: Types.ObjectId;
  aboutMe: string;
  services: [Types.ObjectId];
  schedules: [Types.ObjectId];
  serviceLanguage: [string];
  primaryLocation: string;
  serviceDistance: number;
  pricePerHour: number;
  serviceImages: [string];
  isRead: boolean;
  isActive: boolean;
  isOnline?: boolean;
};

export type IPartialServiceWithProviderId = Partial<Omit<TProvider, 'user'>> & Pick<TProvider, 'user'>;

export type TProviderModal = Model<TProvider>;