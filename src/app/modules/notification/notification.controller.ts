import { Request, Response, NextFunction } from 'express';
import { NotificationServices } from './notification.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

// get my notifications
const getMyNotification = catchAsync(async (req: Request, res: Response) => {
  const result = await NotificationServices.getUserNotificationFromDB(
    req.user.id,
    req.query
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Notification fetched successfully',
    data: result,
  });
});

// read my notification
const readMyNotifications = catchAsync(async (req: Request, res: Response) => {
  const result = await NotificationServices.readUserNotificationToDB(req.user.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Notification read successfully',
    data: result,
  });
});

export const NotificationController = { getMyNotification, readMyNotifications };
