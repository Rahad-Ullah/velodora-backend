import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { BookingService } from './booking.service';


//create service controller
const stripePayment = catchAsync(
  async (req: Request, res: Response) => {

    const result = await BookingService.stripePaymentToDB();

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Payment success",
      data: result
    });
  }
);

//create service controller
const createBooking = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user.id;
    // console.log("Create Booking : ", req.body)



    const result = await BookingService.createBookingToDB({ ...req.body, user });

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: result.message,
      data: result.data,
    });
  }
);


//Accept Booking controller
const completeBooking = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.params.id;
    const providerId = req.user.id;

    const result = await BookingService.completeBookingToDB(userId, providerId);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      data: result,
    });
  }
);

//Accept Booking controller
const acceptBooking = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user.id;
    const id = req.params.id;

    const result = await BookingService.acceptBookingToDB(id, userId);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      data: result,
    });
  }
);


//Cancel Booking controller
const cancelBooking = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user.id;
    const id = req.params.id;

    const result = await BookingService.cancelBookingToDB(id, userId);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      data: result,
    });
  }
);


//Get Bookings controller
const getOverview = catchAsync(
  async (req: Request, res: Response) => {
    const filter = { year: Number(req.query.year), month: Number(req.query.month), day: Number(req.query.day) }

    const result = await BookingService.getOverviewFromDB(req.user.id, filter);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      data: result,
    });
  }
);

//Get Bookings controller
const getBooking = catchAsync(
  async (req: Request, res: Response) => {


    const result = await BookingService.getBookingToDB(req.params.id);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      data: result,
    });
  }
);


//Get Bookings controller
const getBookings = catchAsync(
  async (req: Request, res: Response) => {
    const id = req.user.id;



    const result = await BookingService.getBookingsToDB(id, req.query);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      data: result?.data,
      pagination: result?.meta,
    });
  }
);

//Get Bookings controller
const getBookingsAllByAdmin = catchAsync(
  async (req: Request, res: Response) => {
    const id = req.user.id;

    const result = await BookingService.getBookingsForAdminFromDB(id, req.query);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      data: result?.data,
      pagination: result?.meta,
    });
  }
);

//Get Bookings download controller
const getBookingsDownload = catchAsync(
  async (req: Request, res: Response) => {
    const id = req.user.id;

    const result = await BookingService.getBookingsDownloadDB(id, req.query);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      data: result?.data,
    });
  }
);

//Get Bookings controller
const getBookingsByAdmin = catchAsync(
  async (req: Request, res: Response) => {
    const id = req.params.id;

    const result = await BookingService.getBookingsToDB(id, req.query);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      data: result.data,
      pagination: result.meta,
    });
  }
);


export const BookingController = { createBooking, getBookings, cancelBooking, acceptBooking, getBooking, completeBooking, getBookingsByAdmin, stripePayment, getOverview, getBookingsAllByAdmin, getBookingsDownload };