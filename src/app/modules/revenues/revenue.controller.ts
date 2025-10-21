import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { RevenueService } from './revenue.service';

//get all categories controller
const getRevenues = catchAsync(async (req: Request, res: Response) => {
  const year = Number(req.query.year) || new Date().getFullYear();

  // Call service
  const result = await RevenueService.getRevenuesFromDB(year);

  // Send response
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Get revenues successfully',
    data: result.data,
  });
});

//get all categories controller
const generalState = catchAsync(async (req: Request, res: Response) => {
  const year = Number(req.query.year) || new Date().getFullYear();

  // Call service
  const result = await RevenueService.generalStateFromDB();

  // Send response
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Get General State successfully',
    data: result.data,
  });
});

export const RevenueController = { getRevenues, generalState };
