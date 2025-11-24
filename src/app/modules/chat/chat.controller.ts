import { Request, Response, NextFunction } from 'express';
import { ChatServices } from './chat.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import { tryCatch } from 'bullmq';
import ApiError from '../../../errors/ApiError';

// create chat
const createChat = catchAsync(async (req: Request, res: Response) => {
  const payload = { ...req.body };
  const result = await ChatServices.createChatIntoDB(req.user.id, payload);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Chat created successfully',
    data: result,
  });
});

// delete chat
const deleteChat = catchAsync(async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const result = await ChatServices.deleteChatFromDB(req.params.id, { session });

    await session.commitTransaction();
    session.endSession();

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Chat deleted successfully',
      data: result,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to delete chat!');
  }
});

// get my chats
const getMyChats = catchAsync(async (req: Request, res: Response) => {
  const result = await ChatServices.getChatsByIdFromDB(req.user.id, req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Chats retrieved successfully',
    data: result,
  });
});

export const ChatController = { createChat, deleteChat, getMyChats };
