import mongoose from 'mongoose';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { FavListModel } from './favList.model';
import { ProviderModel } from '../provider/provider.model';
import { TProvider } from '../provider/provider.interface';
import { UserModel } from '../user/user.model';


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


// get all favorite providers by user
// const getFavListUserFromDB = async (
//   userId: string
// ): Promise<{ data: TProvider[] }> => {
//   // const isExistUser: any = await ProviderModel.findOne({ user: new mongoose.Types.ObjectId(userId) });
//   const userLng = 90.2526382;
//   const userLat = 23.9456166;

//   const pipeline: any[] = [
//     {
//       $match: {
//         userId: new mongoose.Types.ObjectId(userId),
//       },
//     },
//     {
//       $lookup: {
//         from: "providers",
//         localField: "providerIds",
//         foreignField: "_id",
//         as: "providers",
//         pipeline: [
//           // --------------------- include related services --------------------- //
//           {
//             $lookup: {
//               from: "services",
//               localField: "services",
//               foreignField: "_id",
//               as: "services",
//               pipeline: [
//                 { $project: { category: 1, subCategory: 1, price: 1 } },
//                 {
//                   $lookup: {
//                     from: "categories",
//                     localField: "category",
//                     foreignField: "_id",
//                     as: "category",
//                     pipeline: [{ $project: { name: 1 } }],
//                   },
//                 },
//                 { $unwind: "$category" },
//                 {
//                   $lookup: {
//                     from: "subcategories",
//                     localField: "subCategory",
//                     foreignField: "_id",
//                     as: "subCategory",
//                     pipeline: [{ $project: { name: 1 } }],
//                   },
//                 },
//                 { $unwind: "$subCategory" },
//               ],
//             },
//           },
//           { $match: { "services.0": { $exists: true } } },

//           // --------------------- user info --------------------- //
//           {
//             $lookup: {
//               from: "users",
//               localField: "user",
//               foreignField: "_id",
//               as: "user",
//               pipeline: [{ $project: { name: 1, email: 1, image: 1 } }],
//             },
//           },
//           { $unwind: "$user" },

//           // --------------------- reviews (rating + total) --------------------- //
//           {
//             $lookup: {
//               from: "reviews",
//               let: { providerId: "$user._id" },
//               pipeline: [
//                 {
//                   $match: {
//                     $expr: { $eq: ["$providerId", "$$providerId"] },
//                   },
//                 },
//                 {
//                   $group: {
//                     _id: "$providerId",
//                     averageRating: { $avg: "$rating" },
//                     totalReviews: { $sum: 1 },
//                   },
//                 },
//               ],
//               as: "reviews",
//             },
//           },
//           { $unwind: { path: "$reviews", preserveNullAndEmptyArrays: true } },

//           // --------------------- flatten service fields --------------------- //
//           {
//             $addFields: {
//               firstService: { $arrayElemAt: ["$services", 0] },
//             },
//           },
//           {
//             $addFields: {
//               name: "$user.name",
//               image: "$user.image",
//               category: { $ifNull: ["$firstService.category.name", null] },
//               subCategory: { $ifNull: ["$firstService.subCategory.name", null] },
//               price: "$firstService.price",
//             },
//           },

//           // --------------------- final projection --------------------- //
//           {
//             $project: {
//               isOnline: 1,
//               name: 1,
//               image: 1,
//               category: 1,
//               subCategory: 1,
//               price: 1,
//               location: 1,
//               pricePerHour: 1,
//               primaryLocation: 1,
//               distance: 1,
//               serviceDistance: 1,
//               isActive: 1,
//               reviews: 1,
//             },
//           },
//         ],
//       },
//     },
//     {
//       $project: {
//         providers: 1,
//       },
//     },
//   ];

//   const result = await FavListModel.aggregate(pipeline);

//   // if no favorites found, handle gracefully
//   if (!result.length || !result[0].providers) {
//     return { data: [] };
//   }

//   return { data: result[0].providers };
// };

export const getFavListUserFromDB = async (
  userId: string
): Promise<{ data: TProvider[] }> => {
  const isExistUser: any = await UserModel.findById(userId);
  const userLng = isExistUser?.coordinates[0];
  const userLat = isExistUser?.coordinates[1];
  console.log("Exist User : ", isExistUser, userLng, userLat);

  const pipeline: any[] = [
    // ================= GEO FIRST =================
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [Number(userLng), Number(userLat)],
        },
        distanceField: "distance",
        spherical: true,
        distanceMultiplier: 0.001,
        key: "location", // MUST match your provider schema
      },
    },

    // ================= MATCH FAVORITES =================
    {
      $lookup: {
        from: "favlists",
        let: { providerId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $eq: [
                      "$userId",
                      new mongoose.Types.ObjectId(userId),
                    ],
                  },
                  {
                    $in: ["$$providerId", "$providerIds"],
                  },
                ],
              },
            },
          },
        ],
        as: "fav",
      },
    },

    { $match: { "fav.0": { $exists: true } } },

    // ================= SERVICES =================
    {
      $lookup: {
        from: "services",
        localField: "services",
        foreignField: "_id",
        as: "services",
        pipeline: [
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

    // ================= USER INFO =================
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
        pipeline: [
          { $project: { name: 1, email: 1, image: 1 } },
        ],
      },
    },
    { $unwind: "$user" },

    // ================= REVIEWS =================
    {
      $lookup: {
        from: "reviews",
        let: { providerId: "$user._id" },
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

    {
      $unwind: {
        path: "$reviews",
        preserveNullAndEmptyArrays: true,
      },
    },

    // ================= FLATTEN =================
    {
      $addFields: {
        name: "$user.name",
        image: "$user.image",
      },
    },

    // ================= FIRST SERVICE =================
    {
      $addFields: {
        firstService: { $arrayElemAt: ["$services", 0] },
      },
    },

    {
      $addFields: {
        category: {
          $ifNull: ["$firstService.category.name", null],
        },
        subCategory: {
          $ifNull: ["$firstService.subCategory.name", null],
        },
        price: "$firstService.price",
      },
    },


    // ================= FINAL OUTPUT =================
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
        reviews: 1,
      },
    },
  ];

  const data = await ProviderModel.aggregate(pipeline);

  return { data };
};



export const FavListService = {
  createFavListToDB,
  getFavListToDB,
  getFavListUserFromDB
};
