import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { unlinkFiles } from '../../../shared/unlinkFile';
import QueryBuilder from '../../builder/QueryBuilder';
import { IService } from './service.interface';
import { ServiceModel } from './service.model';


//create category
const createServiceToDB = async (payload: Partial<IService>): Promise<string> => {

  // const user = req.user;


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
import { Types } from 'mongoose';

type ServiceFilters = {
  searchTerm?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  date?: string | Date;
  time?: string;
};

const getServicesFromDB = async (
  filterOptions: ServiceFilters
): Promise<{ data: IService[] }> => {
  const {
    searchTerm,
    categoryId,
    minPrice,
    maxPrice,
    date,
    time,
  } = filterOptions;

  // -------- Root-level $match (fields on the Service collection) --------
  const rootMatch: any = {};

  // Category: match on the FK field BEFORE lookup to categories
  if (categoryId) {
      rootMatch.serviceType = new Types.ObjectId(categoryId);
  }

  // Price range
  if (minPrice != null || maxPrice != null) {
    rootMatch.price = {};
    if (minPrice != null) rootMatch.price.$gte = Number(minPrice);
    if (maxPrice != null) rootMatch.price.$lte = Number(maxPrice);
  }

  // Date range (createdAt)
  if (date) {
    rootMatch.createdAt = {};
    if (date) rootMatch.createdAt.$gte = new Date(date);
  }

  // Service time (only if your schema actually has this field)
  if (time) {
    rootMatch.serviceTime = time;
  }

  // -------- Build aggregation --------
  const pipeline: any[] = [
    { $match: rootMatch }, // ✅ early, efficient
    {
      $lookup: {
        from: 'categories',
        localField: 'serviceType',
        foreignField: '_id',
        as: 'serviceType'
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'providerId',
        foreignField: '_id',
        as: 'provider'
      }
    },
    { $unwind: '$serviceType' },
    { $unwind: '$provider' },

    // Coalesce provider name (support either provider.fullName or provider.name)
    {
      $addFields: {
        providerName: { $ifNull: ['$provider.fullName', '$provider.name'] }
      }
    },
  ];

  // Text search across joined fields (only if searchTerm provided)
  if (searchTerm && String(searchTerm).trim() !== '') {
    pipeline.push({
      $match: {
        $or: [
          { 'serviceType.name': { $regex: searchTerm, $options: 'i' } },
          { additionalServiceType: { $regex: searchTerm, $options: 'i' } },
          { aboutMe: { $regex: searchTerm, $options: 'i' } },
          { providerName: { $regex: searchTerm, $options: 'i' } }
        ]
      }
    });
  }

  pipeline.push({
    $project: {
      'serviceType._id': 1,
      'serviceType.name': 1,
      'provider._id': 1,
      // you now have a stable providerName; keep the original fields too if you want
      providerName: 1,
      'provider.name': 1,
      'provider.fullName': 1,
      'provider.email': 1,
      'provider.contact': 1,
      aboutMe: 1,
      additionalServiceType: 1,
      serviceLocation: 1,
      serviceDistance: 1,
      price: 1,
      pricePerHour: 1,
      serviceImages: 1,
      read: 1,
      createdAt: 1,
      updatedAt: 1
    }
  });

  const services = await ServiceModel.aggregate(pipeline);
  return { data: services };
};


//update category
const updateServiceToDB = async (
  payload: Partial<IService>, id: string, providerId: string
): Promise<string> => {

  const isExistService = await ServiceModel.findById(id);
  // console.log("Update Service : ", payload);
  // console.log("isExistService : ", isExistService);
  if (isExistService && isExistService?._id.toString() !== providerId) {
    unlinkFiles(payload.serviceImages || []);
    throw new ApiError(StatusCodes.BAD_REQUEST, "You are not authorized to update this service!");
  }

  // unlink file here


  const res = await ServiceModel.findByIdAndUpdate(id, payload, { new: true });
  // console.log("update result : ", res);
  if (!res?.serviceImages) {
    unlinkFiles(payload?.serviceImages || []);
    throw new ApiError(StatusCodes.BAD_REQUEST, "Service doesn't exist!");
  } else if (res && payload?.serviceImages && res?.serviceImages) {
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
