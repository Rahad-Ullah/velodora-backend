import { Model, Types } from 'mongoose';
import { SERVICE_STATUS } from '../../../enums/service';

export type IService = {
  ref: Types.ObjectId;
  category: Types.ObjectId;
  subCategory: Types.ObjectId;
  price: number;
  status: SERVICE_STATUS;
};

export type IServiceModal = Model<IService>;