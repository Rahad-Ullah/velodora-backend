import mongoose from 'mongoose';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { FavListModel } from './favList.model';
import { ProviderModel } from '../provider/provider.model';
import { TProvider } from '../provider/provider.interface';


// add or remove provider to my fav list
const createFavListToDB = async (userId: string, providerId: string): Promise<any> => {
  let res = null;

  const isExistFavList = await FavListModel.findOne({ userId: new mongoose.Types.ObjectId(userId) });

  if (isExistFavList) {
    if (isExistFavList.providerIds.includes(new mongoose.Types.ObjectId(providerId))) {
      res = await FavListModel.findOneAndUpdate(
        { userId: new mongoose.Types.ObjectId(userId) },
        { $pull: { providerIds: new mongoose.Types.ObjectId(providerId) } },
        { new: true } // ✅ works here
      );
    } else {
      res = await FavListModel.findOneAndUpdate(
        { userId: new mongoose.Types.ObjectId(userId) },
        { $push: { providerIds: new mongoose.Types.ObjectId(providerId) } },
        { new: true } // ✅ works here
      );
    }
  } else {
    const payload = {
      userId: new mongoose.Types.ObjectId(userId),
      providerIds: [new mongoose.Types.ObjectId(providerId)],
    };
    res = await FavListModel.create(payload);
  }



  return res;
};
// get my fav lists
const getFavListToDB = async (userId: string): Promise<any> => {

  const isExistFavList = await FavListModel.findOne({ userId: new mongoose.Types.ObjectId(userId) });

  if (!isExistFavList) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "FavList doesn't exist!");
  }

  return isExistFavList;
};


// get all providers from DB
const getFavListUserFromDB = async (
  userId: string
): Promise<{ data: TProvider[] }> => {

  // Aggregation pipeline definition //
  const pipeline: any[] = [];


  pipeline.push(
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $lookup: {
        from: "providers",
        localField: "providerIds",
        foreignField: "_id",
        as: "providers",
        pipeline: [
          {
            $lookup: {
              from: "services",
              localField: "services",
              foreignField: "_id",
              as: "services",
              pipeline: [
                // { $match: serviceMatch },
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
              // pipeline: [{ $match: dateMatch }],
            },
          },
          { $match: { "schedules.0": { $exists: true } } },
          // { $match: timeMatch },
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
            },
          }
        ]
      }
    },
    {
      $project: {
        providers: 1,
      },
    }
  );

  const providers = await FavListModel.aggregate(pipeline);

  return { data: providers[0].providers };
};

export const FavListService = {
  createFavListToDB,
  getFavListToDB,
  getFavListUserFromDB
};
