import mongoose, { Types } from 'mongoose';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { TProvider } from './provider.interface';
import { ProviderModel } from './provider.model';
import { ServiceModel } from '../service/service.model';
import { ProviderTempModel } from './providerTemp.model';
import { unlinkFile, unlinkFiles } from '../../../shared/unlinkFile';
import { SERVICE_STATUS } from '../../../enums/service';

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

  const isExistProvider = await ProviderModel.findOne({ user: providerInfo.user });
  if (isExistProvider) {
    providerInfo.serviceImages && unlinkFiles(providerInfo.serviceImages);
    throw new ApiError(StatusCodes.BAD_REQUEST, "Provider already exist! Please Check your profile.");
  }

  // const user = req.user;

  const servicesResult = await ServiceModel.insertMany(servicesInfo);
  const servicesId = servicesResult.map((service) => service._id);

  const provider = { ...providerInfo, isActive: false, services: servicesId }
  const res = await ProviderModel.create(provider);

  return { data: res, message: "Provider created successfully" };
};

//get single provider from DB
const getMyProviderFromDB = async (id: string): Promise<any> => {
  const isExistService = await ProviderModel.aggregate([
    { $match: { user: new Types.ObjectId(id) } },
    {
      $lookup: {
        from: 'services', localField: 'services', foreignField: '_id', as: 'services',
        pipeline: [
          {
            $lookup: {
              from: 'categories',
              localField: 'category',
              foreignField: '_id',
              as: 'category',
            },
          },
          {
            $unwind: {
              path: '$category',
              preserveNullAndEmptyArrays: true,
            }
          },
          {
            $lookup: {
              from: 'subcategories',
              localField: 'subCategory',
              foreignField: '_id',
              as: 'subCategory',
            },
          },
          {
            $unwind: {
              path: '$subCategory',
              preserveNullAndEmptyArrays: true,
            }
          },
        ]
      }
    },
    { $lookup: { from: 'schedules', localField: '_id', foreignField: 'provider', as: 'schedules' } },
    { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'user' } },
    { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
  ]);

  if (!isExistService) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Service doesn't exist!");
  }

  return { data: isExistService[0] };
};
//get single provider from DB
const getProviderFromDB = async (id: string): Promise<any> => {
  const isExistService = await ProviderModel.aggregate([
    { $match: { _id: new Types.ObjectId(id) } },
    {
      $lookup: {
        from: 'services', localField: 'services', foreignField: '_id', as: 'services',
        pipeline: [
          {
            $lookup: {
              from: 'categories',
              localField: 'category',
              foreignField: '_id',
              as: 'category',
            },
          },
          {
            $unwind: {
              path: '$category',
              preserveNullAndEmptyArrays: true,
            }
          },
          {
            $lookup: {
              from: 'subcategories',
              localField: 'subCategory',
              foreignField: '_id',
              as: 'subCategory',
            },
          },
          {
            $unwind: {
              path: '$subCategory',
              preserveNullAndEmptyArrays: true,
            }
          },
        ]
      }
    },
    // { $lookup: { from: 'schedules', localField: '_id', foreignField: 'provider', as: 'schedules' } },
  ]);

  if (!isExistService) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Service doesn't exist!");
  }

  return { data: isExistService };
};

// get all providers from DB
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

  // match time
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

  // match date
  if (date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    dateMatch = { date: { $gte: startOfDay, $lte: endOfDay } };
  }

  // match primaryLocation
  if (location) {
    primaryLocation = { primaryLocation: { $regex: location, $options: "i" } };
  }

  // match category
  if (categoryId) {
    serviceMatch.category = new mongoose.Types.ObjectId(categoryId);
  }

  // match searchTerm
  if (searchTerm) {
    searchTermMatch["$or"] = [
      { "category.name": { $regex: searchTerm, $options: "i" } },
      { "subCategory.name": { $regex: searchTerm, $options: "i" } },
    ];
  }

  // match price
  if (minPrice !== undefined || maxPrice !== undefined) {
    serviceMatch.price = {};
    if (minPrice !== undefined) {
      serviceMatch.price.$gte = Number(minPrice);
    }
    if (maxPrice !== undefined) {
      serviceMatch.price.$lte = Number(maxPrice);
    }
  }

  // Aggregation pipeline definition //
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
        distance: 1,
        serviceDistance: 1,
        isActive: 1,
      },
    }
  );

  const providers = await ProviderModel.aggregate(pipeline);
  console.log("all providers", providers);

  return { data: providers };
};

//update provider
const updateProviderToDB = async (
  payload: any, providerId: string
): Promise<any> => {

  // console.log("Update Service : ", payload);

  const isExistProvider = await ProviderModel.findOne({ user: providerId });
  if (!isExistProvider) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Provider(service) doesn't exist!");
  } else if (!isExistProvider?.isActive) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Right now your service is not active!");
  }

  const isExistEditedProvider = await ProviderModel.findOne({ ref: isExistProvider._id });
  if (isExistEditedProvider) {
    payload.newServiceImages && unlinkFiles(payload.newServiceImages);
    throw new ApiError(StatusCodes.BAD_REQUEST, "You have already approval request!");
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

  const servicesNew = payload.services?.new
    ? await ServiceModel.insertMany(
      payload.services.new.map((service: any) => ({
        ...service,
        status: SERVICE_STATUS.NEW,
      }))
    ) : [];

  const servicesUpdate = payload.services?.update ? await ServiceModel.insertMany(
    payload.services.update.map((service: any) => ({
      ...service,
      status: SERVICE_STATUS.EDITED,
    }))
  ) : [];

  const servicesExist = isExistProvider.services.filter((serviceId) => !servicesUpdate.map((service: any) => service.ref.toString()).includes(serviceId.toString()));

  updatedProvider.services = [...servicesUpdate.map((service: any) => service?._id), ...servicesNew.map((service: any) => service?._id), ...servicesExist];

  console.log("Updated Provider : ", updatedProvider)

  const res = await ProviderTempModel.create(updatedProvider);


  return { data: res, message: "Service updated request sent successfully!" };
};

//delete provider
const approveEditProviderToDB = async (
  id: string
): Promise<any> => {

  const isExistProviderTemp = await ProviderTempModel.findById(id);
  if (!isExistProviderTemp) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Provider doesn't exist!");
  }

  const isExistProvider = await ProviderModel.findById(isExistProviderTemp.ref);
  if (!isExistProvider) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Provider doesn't exist!");
  }

  const newProvider = {
    location: isExistProviderTemp.location,
    user: isExistProviderTemp.user,
    aboutMe: isExistProviderTemp.aboutMe,
    serviceLanguage: isExistProviderTemp.serviceLanguage,
    primaryLocation: isExistProviderTemp.primaryLocation,
    serviceDistance: isExistProviderTemp.serviceDistance,
    pricePerHour: isExistProviderTemp.pricePerHour,
    serviceImages: isExistProviderTemp.serviceImages,
    isRead: isExistProviderTemp.isRead,
    isActive: true,
  }

  let newServices: Types.ObjectId[] = [];

  for (const serviceId of isExistProviderTemp.services) {
    const service: any = await ServiceModel.findById(serviceId);

    if (service && (service.status === SERVICE_STATUS.NEW || service.status === SERVICE_STATUS.OLD)) {
      newServices.push(service._id);
    } else if (service.status === SERVICE_STATUS.EDITED) {
      await ServiceModel.findByIdAndUpdate(
        service.ref,
        {
          category: service.category,
          subCategory: service.subCategory,
          price: service.price,
          status: SERVICE_STATUS.OLD,
        },
        { new: true }
      );
      newServices.push(service.ref);
    }
  }

  // console.log("New Services : ", newServices);


  await ProviderModel.findOneAndUpdate({ user: isExistProviderTemp.user }, { ...newProvider, services: newServices }, { new: true });
  await ProviderTempModel.findByIdAndDelete(isExistProviderTemp._id);


  // unlink files here
  isExistProvider.serviceImages.forEach((serviceImage) => {
    !isExistProviderTemp.serviceImages.includes(serviceImage) && unlinkFile(serviceImage);
  })


  return { message: "Service approved successfully!" };
};

//delete provider
const deleteEditProviderToDB = async (
  id: string
): Promise<any> => {

  const isExistProviderTemp = await ProviderTempModel.findByIdAndDelete(id);
  if (!isExistProviderTemp) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Edit Provider doesn't exist!");
  }

  // unlink files here
  if (isExistProviderTemp?.serviceImages) {
    unlinkFiles(isExistProviderTemp.serviceImages);
  }

  return { message: "Service deleted successfully!" };
};

//delete provider
const approveProviderToDB = async (
  id: string
): Promise<any> => {

  const isExistService = await ProviderModel.findByIdAndUpdate(id, { isActive: true }, { new: true });
  if (!isExistService) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Provider doesn't exist!");
  }

  return { message: "Service deleted successfully!" };
};

//delete provider
const deleteProviderToDB = async (
  id: string
): Promise<any> => {

  const isExistService = await ProviderModel.findByIdAndDelete(id);
  if (!isExistService) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Provider doesn't exist!");
  }

  // unlink files here
  if (isExistService?.serviceImages) {
    unlinkFiles(isExistService.serviceImages);
  }

  return { message: "Service deleted successfully!" };
};

//delete provider
const activeBlockProviderToDB = async (
  id: string
): Promise<any> => {

  const isExistService = await ProviderModel.findById(id);
  if (!isExistService) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Provider doesn't exist!");
  }

  const res = await ProviderModel.findByIdAndUpdate(id, { $set: { isActive: !isExistService?.isActive } }, { new: true });

  return { message: `Provider ${isExistService?.isActive ? 'blocked' : 'unblocked'} successfully!`, data: res };
};

export const ProviderService = {
  createProviderToDB,
  getMyProviderFromDB,
  getProviderFromDB,
  getProvidersFromDB,
  updateProviderToDB,
  deleteProviderToDB,
  approveEditProviderToDB,
  deleteEditProviderToDB,
  approveProviderToDB,
  activeBlockProviderToDB
};