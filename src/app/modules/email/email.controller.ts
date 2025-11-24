import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { EmailService } from './email.service';

//create system controller
const SendEmail = catchAsync(async (req: Request, res: Response) => {
  // const { to, subject, html } = req.body;

  // Call service
  const result = await EmailService.sendEmailFromDB({ to:"delwarccer@gmail.com", subject: "Test BullMD Queue", html: "<h1>Test BullMQ Queue Working</h1>" });

  // Send response
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: result.message,
    // data: result.data,
  });
});

export const EmailController = { SendEmail };
