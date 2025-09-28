import mongoose, { Model } from 'mongoose';

export type IReview = {
  userId:  mongoose.Types.ObjectId;
  providerId:  mongoose.Types.ObjectId;
  rating: number;
  comment: string;
};

export type IReviewModal = Model<IReview>;