import { Model } from 'mongoose';

export type ICategory = {
  name: string;
  icon: string;
};

export type IPartialCategoryWithId = Partial<ICategory> & { id: string };

export type ICategoryModal = Model<ICategory>;
