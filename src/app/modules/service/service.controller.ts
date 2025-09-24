import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { ServiceService } from './service.service';
import { IService } from './service.interface';


//create service controller
const createService = catchAsync(
  async (req: Request, res: Response) => {
    const result = await ServiceService.createServiceToDB(req.body);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: result,
    });
  }
);

//get single service controller
const getService = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const result = await ServiceService.getServiceFromDB(id!);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Service data retrieved successfully',
    data: result,
  });
});

//get all categories controller
const getServices = catchAsync(async (req: Request, res: Response) => {

  // Call service
  const { data } = await ServiceService.getServicesFromDB();

  // Send response
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Users retrieved successfully',
    data: data as Partial<IService>[] || [],
  });
});

//update service
const updateService = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params?.id;
    const result = await ServiceService.updateServiceToDB(req.body, id!);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: result
    });
  }
);

//delete service
const deleteService = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {

    const id = req.params?.id;
    const result = await ServiceService.deleteServiceToDB(id!);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: result,
      // data: result,
    });
  }
);

export const ServiceController = { createService, getService, getServices, updateService, deleteService };
