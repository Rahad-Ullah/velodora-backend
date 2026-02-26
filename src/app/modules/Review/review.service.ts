import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { ReviewModel } from './review.model';
import { IReview } from './review.interface';
import { Types } from 'mongoose';
import { UserModel } from '../user/user.model';
import { sendNotifications } from '../../../helpers/notificationHelper';
import { NOTIFICATION_TYPE } from '../notification/notification.constants';
import { ProviderModel } from '../provider/provider.model';


//create contact support
const createReviewToDB = async (userId: string, payload: Partial<IReview>): Promise<any> => {

  const provider = await UserModel.findById(payload.providerId);
  if (!provider) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Provider doesn't exist!");
  }

  const isReviewExist = await ReviewModel.findOne({ userId: new Types.ObjectId(userId), providerId: new Types.ObjectId(payload.providerId) });

  const newReview = {
    userId: new Types.ObjectId(userId),
    providerId: new Types.ObjectId(payload.providerId),
    rating: payload.rating,
    comment: payload.comment,
  }

  let res;

  if (isReviewExist) {
    res = await ReviewModel.findByIdAndUpdate(isReviewExist._id, newReview, { new: true }).exec();
  } else {
    res = await ReviewModel.create(newReview);
  }

  if (!res) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Review to Provider failed!");
  }

  sendNotifications({
    type: NOTIFICATION_TYPE.REVIEW,
    title: 'You get a new review from ' + provider.name,
    receiver: provider._id,
    referenceId: new Types.ObjectId(userId),
  })

  return { data: res };
};



const getMyReviewsToDB = async (id: string): Promise<any> => {
  const res = await ReviewModel.aggregate([
    {
      $match: { providerId: new Types.ObjectId(id) },
    },
    {
      $sort: { createdAt: -1 }
    },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
        pipeline: [
          {
            $project: {
              name: 1,
              image: 1,
              email: 1,
              _id: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: {
        path: "$user",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $group: {
        _id: "$providerId",
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
        reviews: {
          $push: {
            _id: "$_id",
            rating: "$rating",
            comment: "$comment",
            createdAt: "$createdAt",
            user: "$user", // include populated user here
          },
        },
      },
    },
  ]);

  return { data: res[0] || null }; // since grouping by providerId, only one result
};


// get my ratings
const getMyRatingsToDB = async (id: string): Promise<any> => {
  const provider = await ProviderModel.aggregate([
    { $match: { user: new Types.ObjectId(id) } },
    {
      $lookup: {
        from: "services",
        localField: "services",
        foreignField: "_id",
        as: "services",
        pipeline: [
          {
            $lookup: {
              from: "categories",
              localField: "category",
              foreignField: "_id",
              as: "category",
            },
          },
          {
            $unwind: {
              path: "$category",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $addFields: {
              category: "$category.name",
            }
          },
          { $project: { category: 1 } }
        ],
      }
    },
    {
      $project: {
        services: 1
      }
    }
  ])

  const res = await ReviewModel.aggregate([
    {
      $match: { providerId: new Types.ObjectId(id) }
    },
    {
      $group: {
        _id: "$providerId",
        averageRating: { $avg: "$rating" },   // calculate average
        totalReviews: { $sum: 1 },            // count reviews       // keep all review docs
      }
    }
  ]);
  return { data: { ...provider[0]?.services[0], ...res[0] } };
};




export const ReviewService = {
  createReviewToDB,
  getMyReviewsToDB,
  getMyRatingsToDB
};