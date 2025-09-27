import { Model, Types } from 'mongoose';

export type TProvider = {
  user: Types.ObjectId;
  ref: Types.ObjectId;
  aboutMe: string;
  services: [Types.ObjectId];
  schedules: [Types.ObjectId];
  serviceLanguage: [string];
  primaryLocation: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  serviceDistance: number;
  pricePerHour: number;
  serviceImages: [string];
  isRead: boolean;
  isActive: boolean;
  isOnline?: boolean;
};

export type IPartialServiceWithProviderId = Partial<Omit<TProvider, 'user'>> & Pick<TProvider, 'user'>;

export type TProviderModal = Model<TProvider>;