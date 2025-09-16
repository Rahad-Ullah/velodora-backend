import { Model, Types } from 'mongoose';

export type IChat = {
  _id: string;
  participants: Types.ObjectId[];
  isDeleted: boolean;
};

export type TChatModel = Model<IChat>;
