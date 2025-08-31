import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import { getMultipleFilesPath, getSingleFilePath } from '../../../shared/getFilePath';
import sendResponse from '../../../shared/sendResponse';
import pick from '../../../shared/pick';
import { ServiceService } from './service.service';
import { IService } from './service.interface';


//create service controller
const createService = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const providerId = req.user.id;
    // const filePaths = getMultipleFilesPath(req.files, 'serviceImages');
    // console.log("filePaths", filePaths);

    const newService = {
      ...req.body.data,
      providerId,
      serviceImages: req.body.serviceImages,
    }
    const result = await ServiceService.createServiceToDB(newService);

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
  // Define which query fields are filters
  const filterableFields = ['searchTerm'];

  // Pick only allowed filters from req.query
  const filterOptions = pick(req.query, filterableFields);

  // Call service
  const { data } = await ServiceService.getServicesFromDB(filterOptions);

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
    const providerId = req.user.id;
    
     const newData = {
      ...req.body.data,
      serviceImages: req.body.serviceImages,
    }
    const result = await ServiceService.updateServiceToDB(newData, id!, providerId!);

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
      message: 'Profile updated successfully',
      data: result,
    });
  }
);

export const ServiceController = { createService, getService, getServices, updateService, deleteService };
