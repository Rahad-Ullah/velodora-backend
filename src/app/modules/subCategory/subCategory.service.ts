import mongoose from 'mongoose';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { SubCategoryModel } from './subCategory.model';
import { ISubCategory } from './subCategory.interface';
import { CategoryModel } from '../Category/category.model';


//create sub category
const createSubCategoryToDB = async (payload: Partial<ISubCategory>): Promise<any> => {
  console.log("createSubCategoryToDB", payload)

  const isExistCategory = await CategoryModel.findById(payload.category);

  if (!isExistCategory) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Category doesn't exist!");
  }

  const res = await SubCategoryModel.create(payload);

  return res;
};

//get sub category
const getSubCategoryFromDB = async (id: string): Promise<ISubCategory> => {
  const isExistSubCategory = await SubCategoryModel.findById(id);
  if (!isExistSubCategory) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Sub Category doesn't exist!");
  }

  return isExistSubCategory;
};

//get sub categories
const getSubCategoriesFromDB = async (
  query: Record<string, unknown>,
): Promise<{ data: ISubCategory[] }> => {

  const queryObj: any = {
    name: query.searchTerm as string || '',
  };

  // Only add category filter if a category is provided in the query
  if (query.category) {
    queryObj.category = new mongoose.Types.ObjectId(query.category as string);
  }

  const data = await SubCategoryModel.aggregate([
    {
      $match: {
        ...queryObj,
        name: { $regex: queryObj.name, $options: 'i' },
      }
    },
    {
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id',
        as: 'category',
      },
    },
    {
      $unwind: '$category',
    },
    {
      $addFields: {
        categoryName: '$category.name',
        subCategoryName: '$name',
      },
    },
    {
      $project: {
        categoryName: 1,
        subCategoryName: 1,
      },
    },
  ])

  return { data };
};

//update sub category
const updateSubCategoryToDB = async (
  payload: Partial<ISubCategory>, id: string
): Promise<any> => {

  const isExistSubCategory = await SubCategoryModel.findById(id);
  if (!isExistSubCategory) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Sub Category doesn't exist!");
  }

  if (payload.category) {
    const isExistCategory = await CategoryModel.findById(payload.category);
    if (!isExistCategory) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Category doesn't exist!");
    }
  }


  const res = await SubCategoryModel.findOneAndUpdate({ _id: id }, payload, { new: true });

  return { res, message: "Sub Category updated successfully!" };
};

//delete sub category
const deleteSubCategoryToDB = async (
  id: string
): Promise<string> => {

  const isExistCategory = await SubCategoryModel.findByIdAndDelete(id);
  if (!isExistCategory) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Sub Category doesn't exist!");
  }

  return "Category deleted successfully!";
};

export const SubCategoryService = {
  createSubCategoryToDB,
  getSubCategoryFromDB,
  getSubCategoriesFromDB,
  updateSubCategoryToDB,
  deleteSubCategoryToDB
};
