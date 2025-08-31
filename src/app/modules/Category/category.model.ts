
import { model, Schema } from 'mongoose';
import { ICategory, ICategoryModal } from './category.interface';

const categorySchema = new Schema<ICategory, ICategoryModal>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    icon: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);


export const CategoryModel = model<ICategory, ICategoryModal>('Category', categorySchema);
