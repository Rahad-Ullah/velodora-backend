import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { ReviewService } from './review.service';


// create Contact Support
const createReview = catchAsync(
  async (req: Request, res: Response) => {

    const result = await ReviewService.createReviewToDB(req.user.id, req.body);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: result,
    });
  }
);

const getMyReviews = catchAsync(
  async (req: Request, res: Response) => {

    const result = await ReviewService.getMyReviewsToDB(req.user.id);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: result,
    });
  }
);

const getProviderReviews = catchAsync(
  async (req: Request, res: Response) => {

    const result = await ReviewService.getMyReviewsToDB(req.params.id);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: result,
    });
  }
);


export const ReviewController = { createReview, getMyReviews, getProviderReviews };