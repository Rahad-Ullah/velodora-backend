
import { model, Schema } from 'mongoose';
import { IReview, IReviewModal } from './review.interface';

const reviewSchema = new Schema<IReview, IReviewModal>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    providerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);


export const ReviewModel = model<IReview, IReviewModal>('Review', reviewSchema);
