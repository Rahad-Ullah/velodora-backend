import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { BookingService } from './booking.service';


//create service controller
const createBooking = catchAsync(
  async (req: Request, res: Response) => {
 
    const result = await BookingService.createBookingToDB();

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: result,
    });
  }
);


export const BookingController = { createBooking };
