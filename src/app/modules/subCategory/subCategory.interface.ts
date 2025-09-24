import mongoose, { Model } from 'mongoose';

export type ISubCategory = {
  category:  mongoose.Types.ObjectId;
  name: string;
};

export type IPartialSubCategoryWithId = Partial<ISubCategory> & { id: string };

export type ISubCategoryModal = Model<ISubCategory>;