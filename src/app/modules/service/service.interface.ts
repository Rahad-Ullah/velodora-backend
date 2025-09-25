import { Model, Types } from 'mongoose';

export type IService = {
  ref: Types.ObjectId;
  category: Types.ObjectId;
  subCategory: Types.ObjectId;
  price: number;
};

export type IServiceModal = Model<IService>;