import mongoose, { Types } from 'mongoose';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { TProvider } from './provider.interface';
import { ProviderModel } from './provider.model';
import { ServiceModel } from '../service/service.model';
import { ProviderTempModel } from './providerTemp.model';
import { unlinkFile, unlinkFiles } from '../../../shared/unlinkFile';
import { SERVICE_STATUS } from '../../../enums/service';
import { UserModel } from '../user/user.model';
import { BookingModel } from '../booking/booking.model';
import { BOOKING_PAYMENT_STATUS, BOOKING_STATUS } from '../../../enums/booking';
import { IPaginationOptions } from '../../../types/pagination';

type TProviderFilters = {
  searchTerm?: string;
  categoryId?: string;
  subCategoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  date?: string | Date;
  time?: string;
  userLng?: number;
  userLat?: number;
  isOnline?: string;
  verified?: string;
  isActive?: string;
  page?: number;
  limit?: number;
};


//create provider
const createProviderToDB = async (
  providerInfo: Partial<TProvider>,
  servicesInfo: Partial<TProvider>
): Promise<any> => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // ✅ Check if provider already exists
    const isExistProvider = await ProviderModel.findOne({ user: providerInfo.user }).session(session);
    if (isExistProvider) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Provider already exists! Please check your profile.");
    }

    // ✅ Insert services
    const servicesResult = await ServiceModel.insertMany(servicesInfo, { session });
    const servicesId = servicesResult.map((service) => service._id);

    // ✅ Create provider with linked services
    const providerData = { ...providerInfo, isActive: false, services: servicesId };
    const provider = await ProviderModel.create([providerData], { session });

    // ✅ Commit transaction
    await session.commitTransaction();

    return { data: provider[0], message: "Provider created successfully" };
  } catch (error) {
    // ❌ Rollback if anything fails
    await session.abortTransaction();

    // cleanup any uploaded images
    providerInfo.serviceImages && unlinkFiles(providerInfo.serviceImages);

    throw error;
  } finally {
    // ✅ Always end session
    session.endSession();
  }
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
const getUserEditProviderFromDB = async (id: string): Promise<any> => {
  const isExistService = await ProviderTempModel.aggregate([
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
    // { $lookup: { from: 'schedules', localField: '_id', foreignField: 'provider', as: 'schedules' } },
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
        from: 'users', localField: 'user', foreignField: '_id', as: 'user',
        pipeline: [
          { $project: { name: 1, email: 1, contact: 1, image: 1 } }
        ]
      }
    },
    { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
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
): Promise<{ data: TProvider[], meta: IPaginationOptions }> => {
  const {
    searchTerm,
    categoryId,
    subCategoryId,
    minPrice,
    maxPrice,
    location,
    date,
    time,
    userLng,
    userLat,
  } = filterOptions;
  const page = Number(filterOptions.page) || 1;
  const limit = Number(filterOptions.limit) || 10;
  const skip = (page - 1) * limit;

  const isOnline: boolean = filterOptions?.isOnline === 'true' ? true : false;
  const verified: boolean = filterOptions?.verified === 'true' ? true : false;
  const isActive: boolean = filterOptions?.isActive === 'true' ? true : false;

  // Build service filter dynamically
  const serviceMatch: any = {};
  let searchTermMatch: any = {};
  let primaryLocation: any = {};
  let dateMatch: any = {};
  let timeMatch: any = {};



  // match date
  if (date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    dateMatch = { date: { $gte: startOfDay, $lte: endOfDay } };
  }

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

  // match primaryLocation
  if (location) {
    primaryLocation = { primaryLocation: { $regex: location, $options: "i" } };
  }

  // match category
  if (categoryId) {
    serviceMatch.category = new mongoose.Types.ObjectId(categoryId);
  }

  // match sub category
  if (subCategoryId) {
    serviceMatch.subCategory = new mongoose.Types.ObjectId(subCategoryId);
  }

  // match searchTerm work on category and subCategory name
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

  if (isOnline) {
    pipeline.push({
      $match: {
        isOnline: isOnline
      }
    });
  }

  if (isActive) {
    pipeline.push({
      $match: {
        isActive: isActive
      }
    });
  }

  if (verified) {
    pipeline.push({
      $match: {
        verified: verified
      }
    });
  }

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
    // { $unwind: "$services"},
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
        from: "reviews",
        let: { providerId: "$user" }, // <-- use current provider's userId
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$providerId", "$$providerId"] },
            },
          },
          {
            $group: {
              _id: "$providerId",
              averageRating: { $avg: "$rating" },
              totalReviews: { $sum: 1 },
            },
          },
        ],
        as: "reviews",
      },
    },
    { $unwind: { path: "$reviews", preserveNullAndEmptyArrays: true } },

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
        firstService: { $arrayElemAt: ["$services", 0] },
      },
    },
    {
      $addFields: {
        name: "$user.name",
        image: "$user.image",
        category: { $ifNull: ["$firstService.category.name", null] },
        subCategory: { $ifNull: ["$firstService.subCategory.name", null] },
        price: "$firstService.price",
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
        reviews: {
          $cond: {
            if: { $ne: ["$reviews", null] }, // if reviews field exists (not null)
            then: "$reviews",
            else: "$$REMOVE", // removes field entirely from result
          },
        },
      },
    },
    {
      $facet: {
        data: [{ $skip: skip }, { $limit: limit }],
        total: [{ $count: "count" }]
      }
    }
  );

  const providers = await ProviderModel.aggregate(pipeline);
  const total = Number(providers[0].total[0]?.count);
  const totalPage = Math.ceil(providers[0].total[0]?.count / limit);


  const meta = {
    total: total ?? 0,
    page: page,
    limit: limit,
    totalPage: totalPage ?? 0
  }

  return { data: providers[0].data, meta: meta };
};

//update provider
const updateProviderToDB = async (
  payload: any,
  providerId: string
): Promise<any> => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    // ✅ Check if provider exists
    const isExistProvider = await ProviderModel.findOne({ user: providerId }).session(session);
    if (!isExistProvider) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Provider(service) doesn't exist!");
    } else if (!isExistProvider?.isActive) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Right now your service is not active!");
    }

    // ✅ Check if provider has a pending edit request
    const isExistEditedProvider = await ProviderTempModel.findOne({ ref: isExistProvider._id }).session(session);
    if (isExistEditedProvider) {
      payload.newServiceImages && unlinkFiles(payload.newServiceImages);
      throw new ApiError(StatusCodes.BAD_REQUEST, "You have already approval request!");
    }

    // ✅ Authorization check
    if (isExistProvider?.user.toString() !== providerId) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "You are not authorized to update this service!");
    }

    // ✅ Prepare updated provider data
    let updatedProvider: any = {
      ...payload.data,
      user: isExistProvider?.user,
      ref: isExistProvider?._id,
    };

    if (payload.newServiceImages) {
      updatedProvider.serviceImages = payload.newServiceImages;
    }

    // ✅ Insert new services
    const servicesNew = payload.services?.new
      ? await ServiceModel.insertMany(
        payload.services.new.map((service: any) => ({
          ...service,
          status: SERVICE_STATUS.NEW,
        })),
        { session }
      )
      : [];

    // ✅ Insert updated services
    const servicesUpdate = payload.services?.update
      ? await ServiceModel.insertMany(
        payload.services.update.map((service: any) => ({
          ...service,
          status: SERVICE_STATUS.EDITED,
        })),
        { session }
      )
      : [];

    // ✅ Keep existing services (not updated)
    const servicesExist = isExistProvider.services.filter(
      (serviceId) =>
        !servicesUpdate
          .map((service: any) => service.ref?.toString?.())
          .includes(serviceId.toString())
    );

    updatedProvider.services = [
      ...servicesUpdate.map((service: any) => service._id),
      ...servicesNew.map((service: any) => service._id),
      ...servicesExist,
    ];

    // ✅ Create temp provider (pending approval)
    const res = await ProviderTempModel.create([updatedProvider], { session });

    // ✅ Mark user as modified
    await UserModel.findByIdAndUpdate(
      isExistProvider.user,
      { $set: { isModify: true } },
      { new: true, session }
    );

    // ✅ Commit transaction
    await session.commitTransaction();

    return {
      data: res[0],
      message: "Service update request sent successfully!",
    };
  } catch (error: any) {
    // ❌ Rollback transaction and cleanup
    await session.abortTransaction();
    payload.newServiceImages && unlinkFiles(payload.newServiceImages);
    throw new ApiError(StatusCodes.BAD_REQUEST, error.message);
  } finally {
    await session.endSession();
  }
};

//approve edited provider
const approveEditProviderToDB = async (id: string): Promise<any> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const isExistProviderTemp = await ProviderTempModel.findOne({ user: id }).session(session);
    if (!isExistProviderTemp) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Provider update request doesn't exist!");
    }

    const isExistProvider = await ProviderModel.findOne({ user: id }).session(session);
    if (!isExistProvider) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Old Provider doesn't exist!");
    }

    const newProvider = {
      location: isExistProviderTemp.location ?? isExistProvider.location,
      user: isExistProviderTemp.user ?? isExistProvider.user,
      aboutMe: isExistProviderTemp.aboutMe ?? isExistProvider.aboutMe,
      serviceLanguage: isExistProviderTemp.serviceLanguage ?? isExistProvider.serviceLanguage,
      primaryLocation: isExistProviderTemp.primaryLocation ?? isExistProvider.primaryLocation,
      serviceDistance: isExistProviderTemp.serviceDistance ?? isExistProvider.serviceDistance,
      pricePerHour: isExistProviderTemp.pricePerHour ?? isExistProvider.pricePerHour,
      serviceImages: isExistProviderTemp.serviceImages ?? isExistProvider.serviceImages,
      isRead: isExistProviderTemp.isRead ?? isExistProvider.isRead,
      isActive: true,
      verified: true,
    };

    let newServices: Types.ObjectId[] = [];

    for (const serviceId of isExistProviderTemp.services) {
      const service: any = await ServiceModel.findById(serviceId).session(session);

      if (service && (service.status === SERVICE_STATUS.NEW || service.status === SERVICE_STATUS.OLD)) {
        newServices.push(service._id);
      } else if (service && service.status === SERVICE_STATUS.EDITED) {
        await ServiceModel.findByIdAndUpdate(
          service.ref,
          {
            category: service.category,
            subCategory: service.subCategory,
            price: service.price,
            status: SERVICE_STATUS.OLD,
          },
          { new: true, session }
        );
        newServices.push(service.ref);
      }
    }

    await ProviderModel.findOneAndUpdate(
      { user: id },
      { ...newProvider, services: newServices },
      { new: true, session }
    );

    await UserModel.findByIdAndUpdate(
      id,
      { $set: { isModify: false } },
      { new: true, session }
    );

    await ProviderTempModel.findOneAndDelete({ user: id }).session(session);

    // Commit transaction before unlinking files
    await session.commitTransaction();
    session.endSession();

    // Clean up old images (outside transaction)
    try {
      isExistProvider.serviceImages.forEach((serviceImage) => {
        if (!isExistProviderTemp.serviceImages.includes(serviceImage)) {
          unlinkFile(serviceImage);
        }
      });
    } catch (cleanupErr) {
      console.error("File cleanup failed:", cleanupErr);
    }

    return { message: "Service edit request approved successfully!" };

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to approve edited provider!");
  }
};

//delete provider
const deleteEditProviderToDB = async (
  id: string
): Promise<any> => {
  const session = await mongoose.startSession();

  try {
    const isExistProviderTemp = await ProviderTempModel.findOneAndDelete({ user: id }).session(session);
    if (!isExistProviderTemp) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Edit Provider doesn't exist!");
    }

    // unlink files here
    if (isExistProviderTemp?.serviceImages) {
      unlinkFiles(isExistProviderTemp.serviceImages);
    }
    await UserModel.findByIdAndUpdate(id, { $set: { isModify: false } }, { new: true, session });

    // Commit transaction before unlinking files
    await session.commitTransaction();
    session.endSession();

    return { message: "Service deleted successfully!" };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to delete edited provider!");
  }
};

// Approve provider
const approveProviderToDB = async (id: string): Promise<{ message: string }> => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    // 1. Update provider
    const updatedProvider = await ProviderModel.findOneAndUpdate(
      { user: id },
      { $set: { isActive: true, verified: true } },
      { new: true, session }
    );


    if (!updatedProvider) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Provider doesn't exist!");
    }

    // 2. Update related user
    const updatedUser = await UserModel.findByIdAndUpdate(
      updatedProvider.user,
      { $set: { isActive: true, verifiedService: true, isService: true } },
      { new: true, session }
    );

    if (!updatedUser) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
    }

    // Commit transaction before unlinking files
    await session.commitTransaction();
    session.endSession();

    // 3. Return success message
    return { message: "Approved successfully!" };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to approve provider!");
  }
};

//delete provider
const deleteProviderToDB = async (
  id: string
): Promise<any> => {

  const isExistService = await ProviderModel.findOneAndDelete({ user: id });
  if (!isExistService) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Provider doesn't exist!");
  }

  const isUser = await UserModel.findByIdAndDelete(id);
  if (!isUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
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
  const session = await mongoose.startSession();

  const isExistService = await ProviderModel.findOne({ user: id });
  if (!isExistService) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Provider doesn't exist!");
  }

  const isUser = await UserModel.findById(id);
  if (!isUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  try {
    session.startTransaction();

    const res = await ProviderModel.findByIdAndUpdate(isExistService._id, { $set: { isActive: !isExistService?.isActive, verified: true } }, { new: true, session });
    await UserModel.findByIdAndUpdate(id, { $set: { verifiedService: !isExistService?.isActive } }, { new: true, session });

    await session.commitTransaction();
    session.endSession();

    return { message: `Provider ${isExistService?.isActive ? 'blocked' : 'unblocked'} successfully!`, data: res };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to Active/Block provider!");
  }


};

//Online/Offline Provider
const onlineOflineProviderToDB = async (
  id: string
): Promise<any> => {

  const isExistService = await ProviderModel.findOne({ user: id });
  if (!isExistService) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Provider doesn't exist!");
  }

  if (isExistService?.isOnline) {
    const isPendingBooking = await BookingModel.find({ provider: isExistService._id, status: BOOKING_STATUS.PENDING, paymentStatus: BOOKING_PAYMENT_STATUS.PAID }).lean();

    if (isPendingBooking.length > 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "You have pending booking!");
    }
  }

  const res = await ProviderModel.findByIdAndUpdate(isExistService._id, { $set: { isOnline: !isExistService?.isOnline } }, { new: true });


  return { message: `Provider is ${res?.isOnline ? 'Online' : 'Offline'} now`, data: res };
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
  activeBlockProviderToDB,
  getUserEditProviderFromDB,
  onlineOflineProviderToDB,
};