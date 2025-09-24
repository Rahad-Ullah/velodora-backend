
import { model, Schema } from 'mongoose';
import { ISubCategory, ISubCategoryModal } from './subCategory.interface';

const subCategorySchema = new Schema<ISubCategory, ISubCategoryModal>(
  {
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    name: {
      type: String,
      required: true,
    }
  },
  { timestamps: true }
);


export const SubCategoryModel = model<ISubCategory, ISubCategoryModal>('Subcategory', subCategorySchema);
