
import { Request, Response } from 'express';
import { settingsService } from './settings.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

const addSetting = catchAsync(async (req, res) => {

  const result = await settingsService.addSettings();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Setting added successfully',
    data: result,
  });
});

const getSettings = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { title } = req.params;
  const result = await settingsService.getSettings(title)
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Setting update successfully',
    data: result,
  });
},
);


const updateSetting = catchAsync(async (req, res) => {
  
  const result = await settingsService.updateSettings(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message:  result,
  });
});

export const settingsController = {
  addSetting,
  getSettings,
  updateSetting,
};
