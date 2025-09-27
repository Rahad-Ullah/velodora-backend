import mongoose, { Types } from 'mongoose';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { unlinkFiles } from '../../../shared/unlinkFile';
import { TProvider } from './provider.interface';
import { ProviderModel } from './provider.model';
import { ServiceModel } from '../service/service.model';
import { pipeline } from 'zod';

type TProviderFilters = {
  searchTerm?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  date?: string | Date;
  time?: string;
  userLng?: number;
  userLat?: number;
};

//create provider
const createProviderToDB = async (providerInfo: Partial<TProvider>, servicesInfo: Partial<TProvider>): Promise<any> => {

  // const user = req.user;

  const servicesResult = await ServiceModel.insertMany(servicesInfo);
  const servicesId = servicesResult.map((service) => service._id);

  const provider = { ...providerInfo, services: servicesId }
  const res = await ProviderModel.create(provider);

  return { data: res, message: "Provider created successfully" };
};

//get provider
const getProviderFromDB = async (id: string): Promise<any> => {
  const isExistService = await ProviderModel.aggregate([
    { $match: { _id: new Types.ObjectId(id) } },
    { $lookup: { from: 'services', localField: 'services', foreignField: '_id', as: 'services' } },
    { $lookup: { from: 'schedules', localField: '_id', foreignField: 'provider', as: 'schedules' } },
  ]);

  if (!isExistService) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Service doesn't exist!");
  }

  return isExistService;
};

// get providers
const getProvidersFromDB = async (
  filterOptions: TProviderFilters
): Promise<{ data: TProvider[] }> => {
  const {
    searchTerm,
    categoryId,
    minPrice,
    maxPrice,
    location,
    date,
    time,
    userLng,
    userLat
  } = filterOptions;

  // Build service filter dynamically
  const serviceMatch: any = {};
  let searchTermMatch: any = {};
  let primaryLocation: any = {};
  let dateMatch: any = {};
  let timeMatch: any = {};

  if (time) {
    const timeDate = new Date(time);
    timeMatch = {
      "schedules.available_slots": {
        $elemMatch: {
          start: { $lte: timeDate },
          end: { $gte: timeDate },
        },
      },
    };
  }

  if (date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    dateMatch = { date: { $gte: startOfDay, $lte: endOfDay } };
  }

  if (location) {
    primaryLocation = { primaryLocation: { $regex: location, $options: "i" } };
  }

  if (categoryId) {
    serviceMatch.category = new mongoose.Types.ObjectId(categoryId);
  }

  if (searchTerm) {
    searchTermMatch["$or"] = [
      { "category.name": { $regex: searchTerm, $options: "i" } },
      { "subCategory.name": { $regex: searchTerm, $options: "i" } },
    ];
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    serviceMatch.price = {};
    if (minPrice !== undefined) {
      serviceMatch.price.$gte = Number(minPrice);
    }
    if (maxPrice !== undefined) {
      serviceMatch.price.$lte = Number(maxPrice);
    }
  }

  // Aggregation pipeline
  const pipeline: any[] = [];

  // ✅ Add geoNear first only if userLat & userLng exist
  if (userLat !== undefined && userLng !== undefined) {
    pipeline.push({
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [Number(userLng), Number(userLat)], // [lng, lat]
        },
        distanceField: "distance", // will store distance in km now
        spherical: true,
        distanceMultiplier: 0.001, // ✅ convert meters → km
      },
    });
  }


  pipeline.push(
    { $match: primaryLocation },
    {
      $lookup: {
        from: "services",
        localField: "services",
        foreignField: "_id",
        as: "services",
        pipeline: [
          { $match: serviceMatch },
          { $project: { category: 1, subCategory: 1, price: 1 } },
          {
            $lookup: {
              from: "categories",
              localField: "category",
              foreignField: "_id",
              as: "category",
              pipeline: [{ $project: { name: 1 } }],
            },
          },
          { $unwind: "$category" },
          {
            $lookup: {
              from: "subcategories",
              localField: "subCategory",
              foreignField: "_id",
              as: "subCategory",
              pipeline: [{ $project: { name: 1 } }],
            },
          },
          { $unwind: "$subCategory" },
          { $match: searchTermMatch },
        ],
      },
    },
    { $match: { "services.0": { $exists: true } } },
    { $unwind: "$services" },
    {
      $lookup: {
        from: "schedules",
        localField: "_id",
        foreignField: "provider",
        as: "schedules",
        pipeline: [{ $match: dateMatch }],
      },
    },
    { $match: { "schedules.0": { $exists: true } } },
    { $match: timeMatch },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
        pipeline: [{ $project: { name: 1, email: 1, image: 1 } }],
      },
    },
    { $unwind: "$user" },
    {
      $addFields: {
        name: "$user.name",
        image: "$user.image",
        category: "$services.category.name",
        subCategory: "$services.subCategory.name",
        price: "$services.price",
      },
    },
    {
      $project: {
        isOnline: 1,
        name: 1,
        image: 1,
        category: 1,
        subCategory: 1,
        price: 1,
        location: 1,
        pricePerHour: 1,
        primaryLocation: 1,
        distance: 1, // only exists if geoNear was applied
        serviceDistance: 1
      },
    }
  );

  const providers = await ProviderModel.aggregate(pipeline);

  return { data: providers };
};


//update provider
const updateProviderToDB = async (
  payload: any, id: string, providerId: string
): Promise<any> => {

  const isExistProvider = await ProviderModel.findById(id);
  // console.log("Update Service : ", payload);
  // console.log("isExistService : ", isExistService);
  if (!isExistProvider) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Provider(service) doesn't exist!");
  }

  if (isExistProvider?.user.toString() !== providerId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "You are not authorized to update this service!");
  }

  let updatedProvider = {
    ...payload.data,
    user: isExistProvider?.user,
    ref: isExistProvider?._id,
    serviceImages: payload.serviceImages
  }

  console.log("Exist Services : ", isExistProvider.services.toString());

  const servicesNew = payload.services?.new && await ServiceModel.insertMany(payload.services.new) || [];
  const servicesUpdate = payload.services?.update && await ServiceModel.insertMany(payload.services.update) || [];
  const servicesExist = isExistProvider.services.filter((serviceId) => !servicesUpdate.map((service: any) => service.ref.toString()).includes(serviceId.toString()));
  updatedProvider.services = [...servicesUpdate.map((service: any) => service?._id), ...servicesNew.map((service: any) => service?._id), ...servicesExist];


  const res = await ProviderModel.create(updatedProvider);

  return { data: res, message: "Service updated successfully!" };
};

//delete provider
const deleteProviderToDB = async (
  id: string
): Promise<string> => {

  const isExistService = await ProviderModel.findByIdAndDelete(id);

  //unlink file here
  // if (isExistService?.icon) {
  //   unlinkFile(isExistService.icon);
  // }

  return "Service deleted successfully!";
};

export const ProviderService = {
  createProviderToDB,
  getProviderFromDB,
  getProvidersFromDB,
  updateProviderToDB,
  deleteProviderToDB
};
