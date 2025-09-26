import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { ScheduleService } from './schedule.service';


//create service controller
const createSchedule = catchAsync(
  async (req: Request, res: Response) => {
 
    const result = await ScheduleService.createScheduleToDB({
      provider: req.body.provider,
      date: req.body.date,
      startTime: req.body.startTime,
      endTime: req.body.endTime,
      duration: req.body.duration,
    });

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: result,
    });
  }
);

//create service controller
const openCloseSchedule = catchAsync(
  async (req: Request, res: Response) => {
 
    const result = await ScheduleService.openCloseScheduleToDB(req.params.id);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: result,
    });
  }
);

//create service controller
const getSchedule = catchAsync(
  async (req: Request, res: Response) => {
 
    const result = await ScheduleService.getScheduleToDB(req.params.id);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: result,
    });
  }
);

//create service controller
const getSchedules = catchAsync(
  async (req: Request, res: Response) => {
    // const providerId = req.user.id;
 
    const result = await ScheduleService.getSchedulesToDB(req.user.id);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: result,
    });
  }
);


export const ScheduleController = { createSchedule, getSchedule, getSchedules, openCloseSchedule };
