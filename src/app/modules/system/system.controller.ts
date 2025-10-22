import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { SystemService } from './system.service';

//create system controller
const createSystem = catchAsync(async (req: Request, res: Response) => {

  // Call service
  const result = await SystemService.createSystemToDB();

  // Send response
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: result.message,
    data: result.data,
  });
});

//get system controller
const getSystem = catchAsync(async (req: Request, res: Response) => {

  // Call service
  const result = await SystemService.getSystemFromDB();

  // Send response
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: result.message,
    data: result.data,
  });
});

//update system controller
const updateSystem = catchAsync(async (req: Request, res: Response) => {

  // Call service
  const result = await SystemService.updateSystemToDB(req.body);

  // Send response
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: result.message,
    data: result.data,
  });
});

//on/off system controller
const onOffSystem = catchAsync(async (req: Request, res: Response) => {

  // Call service
  const result = await SystemService.onOffSystemToDB(req.params.type);

  // Send response
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: result.message,
    data: result.data,
  });
});

export const SystemController = { createSystem, getSystem, updateSystem, onOffSystem };
