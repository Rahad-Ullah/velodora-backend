import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { FavListService } from './favList.service';


//create sub category controller
const createFavList = catchAsync(
  async (req: Request, res: Response) => {

    const result = await FavListService.createFavListToDB(req.user.id, req.body.providerId);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      data: result,
    });
  }
);

//create sub category controller
const getFavList = catchAsync(
  async (req: Request, res: Response) => {

    const result = await FavListService.getFavListToDB(req.user.id);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      data: result,
    });
  }
);

//create sub category controller
const getFavListUser = catchAsync(
  async (req: Request, res: Response) => {

    const result = await FavListService.getFavListUserFromDB(req.user.id);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      data: result.data,
    });
  }
);

export const FavListController = { createFavList, getFavList, getFavListUser };