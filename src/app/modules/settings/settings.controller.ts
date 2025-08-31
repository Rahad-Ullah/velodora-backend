
import { Request, Response } from 'express';
import { settingsService } from './settings.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

const addSetting = catchAsync(async (req, res) => {
  const settingData = {
    privacyPolicy: '',
    aboutUs: '',
    support: '',
    termsOfService: '',
  };

  const result = await settingsService.addSettings(settingData);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Setting added successfully',
    data: result,
  });
});

// const getSettings = catchAsync(
//   async (req: Request, res: Response): Promise<void> => {
//     const result = await settingsService.getSettings();
//     sendResponse(res, {
//       statusCode: StatusCodes.OK,
//       success: true,
//       message: 'Settings get successfully',
//       data: result,
//     });
//   },
// );

const getSpecipicSetting = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { title } = req.params;
    res.send(settingsService.getSettings(title));
  },
);


const updateSetting = catchAsync(async (req, res) => {
  //   const { id } = req.params;
  const settingData = { ...req.body };
  const result = await settingsService.updateSettings(settingData);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Setting update successfully',
    data: result,
  });
});

export const settingsController = {
  addSetting,
  // getSettings,
  getSpecipicSetting,
  updateSetting,
};
