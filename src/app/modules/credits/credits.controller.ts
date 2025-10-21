import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { CreditsService, } from './credits.service';

//get all categories controller
const getCredits = catchAsync(async (req: Request, res: Response) => {
  const year = Number(req.query.year) || new Date().getFullYear();

  // Call service
  const result = await CreditsService.getCreditsFromDB(year);

  // Send response
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Get credits successfully',
    data: result.data,
  });
});

export const CreditsController = { getCredits };