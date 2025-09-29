import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { unlinkFile } from '../../../shared/unlinkFile';
import { ICategory } from './category.interface';
import QueryBuilder from '../../builder/QueryBuilder';
import { CategoryModel } from './category.model';


//create category
const createCategoryToDB = async (payload: Partial<ICategory>): Promise<any> => {

  const isExistCategory = await CategoryModel.findOne({ name: payload.name });

  if (isExistCategory?.icon) {
    unlinkFile(payload.icon!);
    return "Category already exist!";
  }

  const res = await CategoryModel.create(payload);


  return res;
};

//get category
const getCategoryFromDB = async (id: string): Promise<ICategory> => {
  const isExistCategory = await CategoryModel.findById(id);
  if (!isExistCategory) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Category doesn't exist!");
  }

  return isExistCategory;
};

//get categories
const getCategoriesFromDB = async (
  filterOptions: Record<string, unknown>,
): Promise<{ data: ICategory[] }> => {

  const query: Record<string, unknown> = {
    ...filterOptions,
  };

  const searchableFields = ['name'];

  const builder = new QueryBuilder<ICategory>(CategoryModel.find(), query);

  const usersQuery = builder
    .search(searchableFields)

  // const data = await usersQuery.modelQuery.lean();
  const data = (await usersQuery.modelQuery.lean()).map((category: any) => ({
    ...category,
    _id: category._id.toString(),
    __v: undefined,
  }));

  return { data };
};

//update category
const updateCategoryToDB = async (
  payload: Partial<ICategory>, id: string
): Promise<string> => {

  const isExistCategory = await CategoryModel.findById(id);

  if (!isExistCategory) {
    payload?.icon && unlinkFile(payload.icon!);
    throw new ApiError(StatusCodes.BAD_REQUEST, "Category doesn't exist!");
  }

  //unlink file here
  if (payload.icon && isExistCategory?.icon) {
    unlinkFile(isExistCategory.icon);
  }

  await CategoryModel.findOneAndUpdate({ _id: id }, payload);

  return "Category updated successfully!";
};

//update category
const deleteCategoryToDB = async (
  id: string
): Promise<string> => {

  const isExistCategory = await CategoryModel.findByIdAndDelete(id);
  if (!isExistCategory) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Category doesn't exist!");
  }

  //unlink file here
  if (isExistCategory?.icon) {
    unlinkFile(isExistCategory.icon);
  }

  return "Category deleted successfully!";
};

export const CategoryService = {
  createCategoryToDB,
  getCategoryFromDB,
  getCategoriesFromDB,
  updateCategoryToDB,
  deleteCategoryToDB
};
