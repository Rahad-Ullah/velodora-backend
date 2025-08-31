import { Model, Types } from 'mongoose';
import { SERVICE_STATUS } from '../../../enums/service';

export type IService = {
  providerId:  Types.ObjectId;
  aboutMe: string;
  serviceType: Types.ObjectId;
  additionalServiceType: string;
  serviceLocation: string;
  serviceDistance: number;
  price: number;
  pricePerHour: number;
  serviceImages: [string];
  read: boolean;
  status: SERVICE_STATUS;
  isOnline?: boolean;
};

export type IPartialServiceWithProviderId = Partial<Omit<IService, 'providerId'>> & Pick<IService, 'providerId'>;


export type IServiceModal = Model<IService>;
