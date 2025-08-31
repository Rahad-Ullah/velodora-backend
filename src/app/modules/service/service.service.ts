import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import {unlinkFiles} from '../../../shared/unlinkFile';
import QueryBuilder from '../../builder/QueryBuilder';
import { IService } from './service.interface';
import { ServiceModel } from './service.model';


//create category
const createServiceToDB = async (payload: Partial<IService>): Promise<string> => {

  
  await ServiceModel.create(payload);

  return 'Service created successfully!';
};

//get Service
const getServiceFromDB = async (id: string): Promise<IService> => {
  const isExistService = await ServiceModel.findById(id);
  if (!isExistService) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Service doesn't exist!");
  }

  return isExistService;
};

//get categories
const getServicesFromDB = async (
  filterOptions: Record<string, unknown>,
): Promise<{ data: IService[] }> => {

  const query: Record<string, unknown> = {
    ...filterOptions,
  };

  const searchableFields = ['price'];

  const builder = new QueryBuilder<IService>(ServiceModel.find(), query);

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
const updateServiceToDB = async (
  payload: Partial<IService>, id: string, providerId: string
): Promise<string> => {

  const isExistService = await ServiceModel.findById(id);
  // console.log("Update Service : ", payload);
  // console.log("isExistService : ", isExistService);
  if (isExistService && isExistService?._id.toString() !==  providerId) {
    unlinkFiles(payload.serviceImages || []);
    throw new ApiError(StatusCodes.BAD_REQUEST, "You are not authorized to update this service!");
  }

  // unlink file here
  

  const res = await ServiceModel.findByIdAndUpdate(id, payload, { new: true });
  console.log("update result : ", res);
  if (!res?.serviceImages) {
    unlinkFiles(payload?.serviceImages || []);
    throw new ApiError(StatusCodes.BAD_REQUEST, "Service doesn't exist!");
  }else if (res && payload?.serviceImages && res?.serviceImages) {
    unlinkFiles(isExistService?.serviceImages || []);
  }

  return "Service updated successfully!";
};

//update category
const deleteServiceToDB = async (
  id: string
): Promise<string> => {

  const isExistService = await ServiceModel.findByIdAndDelete(id);

  //unlink file here
  // if (isExistService?.icon) {
  //   unlinkFile(isExistService.icon);
  // }

  return "Service deleted successfully!";
};

export const ServiceService = {
  createServiceToDB,
  getServiceFromDB,
  getServicesFromDB,
  updateServiceToDB,
  deleteServiceToDB
};
