import mongoose, { Model } from 'mongoose';

export type IFavList = {
  userId:  mongoose.Types.ObjectId;
  providerIds:  [mongoose.Types.ObjectId];
};

export type IFavListModal = Model<IFavList>;