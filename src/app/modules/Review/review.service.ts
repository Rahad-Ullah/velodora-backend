import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { ReviewModel } from './review.model';
import { IReview } from './review.interface';
import { Types } from 'mongoose';
import { UserModel } from '../user/user.model';


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

  let res = null;

  if (isReviewExist) {
    res = await ReviewModel.findByIdAndUpdate(isReviewExist._id, newReview, { new: true }).exec();
  } else {
    res = await ReviewModel.create(newReview);
  }

  if (!res) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Review to Provider failed!");
  }

  return { data: res };
};


// get my reviews
const getMyReviewsToDB = async (id: string): Promise<any> => {
  const res = await ReviewModel.aggregate([
    {
      $match: { providerId: new Types.ObjectId(id) }
    },
    {
      $group: {
        _id: "$providerId",
        averageRating: { $avg: "$rating" },   // calculate average
        totalReviews: { $sum: 1 },            // count reviews
        reviews: { $push: "$$ROOT" }          // keep all review docs
      }
    }
  ]);

  if (!res || res.length === 0) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Review doesn't exist!");
  }
  return { data: res[0] }; // since grouping by providerId, only one result
};

// get my ratings
const getMyRatingsToDB = async (id: string): Promise<any> => {
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

  if (!res || res.length === 0) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Review doesn't exist!");
  }
  return { data: res[0] }; // since grouping by providerId, only one result
};




export const ReviewService = {
  createReviewToDB,
  getMyReviewsToDB,
  getMyRatingsToDB
};