import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { IService } from './service.interface';
import { ServiceModel } from './service.model';
import { CategoryModel } from '../Category/category.model';
import { SubCategoryModel } from '../subCategory/subCategory.model';


//create category
const createServiceToDB = async (payload: Partial<IService>): Promise<any> => {
  console.log("Create Service payload:", payload);

  const isCategoryExist = await CategoryModel.findOne({ _id: payload.category });
  if (!isCategoryExist) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Service category doesn't exist!");
  }

  const isSubCategoryExist = await SubCategoryModel.findOne({ _id: payload.subCategory });
  if (!isSubCategoryExist) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Service Sub-Category doesn't exist!");
  }
  if (!payload.price) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Service price is required!");
  }

  const newServiceData = {
    category: payload.category,
    subCategory: payload.subCategory,
    price: payload.price
  }

  const res = await ServiceModel.create(newServiceData);

  return {data: res};
};

//get Service
const getServiceFromDB = async (id: string): Promise<any> => {
  const isExistService = await ServiceModel.findById(id);
  if (!isExistService) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Service doesn't exist!");
  }

  return {data: isExistService};
};

//get categories
const getServicesFromDB = async ( ): Promise<{ data: IService[] }> => {
  
  const services = await ServiceModel.find({});
  return { data: services };
};

//update category
const updateServiceToDB = async (
  payload: Partial<IService>, id: string,
): Promise<any> => {
  const newServiceData: Partial<IService> = {}

  if (payload.category) {
    const isCategoryExist = await CategoryModel.findOne({ _id: payload.category });
    if (!isCategoryExist) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Service category doesn't exist!");
    }
    newServiceData.category = payload.category
  }

  if (payload.subCategory) {
    const isSubCategoryExist = await SubCategoryModel.findOne({ _id: payload.subCategory });
    if (!isSubCategoryExist) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "SubCategory doesn't exist!");
    }
    newServiceData.subCategory = payload.subCategory
  }

  if (payload.price) {
    newServiceData.price = payload.price
  }

  const res = await ServiceModel.findByIdAndUpdate(id, newServiceData, { new: true });
  if (!res) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Service doesn't exist!");
  }

  return {data:res};
};

// delete service
const deleteServiceToDB = async (
  id: string
): Promise<any> => {

  const isExistService = await ServiceModel.findByIdAndDelete(id);
  if (!isExistService) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Service doesn't exist!");
  }

  return {message: "Service deleted successfully!"};
};

export const ServiceService = {
  createServiceToDB,
  getServiceFromDB,
  getServicesFromDB,
  updateServiceToDB,
  deleteServiceToDB
};
