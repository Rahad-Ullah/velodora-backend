import { Request, Response, NextFunction } from 'express';
import { MessageServices } from './message.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { getSingleFilePath } from '../../../shared/getFilePath';

// create message
const createMessage = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const image = getSingleFilePath(req.files, 'image');
    // console.log("message controller - image", image);
    const payload = { ...req.body, sender: req.user.id, image };
    const result = await MessageServices.createMessage(payload);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Message created successfully',
      data: result,
    });
  }
);

// get messages by chat id
const getChatMessages = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    
    const result = await MessageServices.getChatMessages(
      req.params.id,
      req.query,
      req.user
    );

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Messages retrieved successfully',
      data: result?.messages,
      pagination: result?.pagination,
    });
  }
);

export const MessageController = { createMessage, getChatMessages };
