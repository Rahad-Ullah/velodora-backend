import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import { getMultipleFilesPath, getSingleFilePath } from '../../../shared/getFilePath';
import sendResponse from '../../../shared/sendResponse';
import pick from '../../../shared/pick';
import { ProviderService} from './provider.service';
import { TProvider } from './provider.interface';


//create service controller
const createProvider = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const providerId = req.user.id;
    // const filePaths = getMultipleFilesPath(req.files, 'serviceImages');
    // console.log("filePaths", filePaths);

    const newService = {
      ...req.body.data,
      providerId,
      serviceImages: req.body.serviceImages,
    }
    const result = await ProviderService.createProviderToDB(newService);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: result,
    });
  }
);


//get single service controller
const getProvider = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const result = await ProviderService.getProviderFromDB(id!);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Service data retrieved successfully',
    data: result,
  });
});

//get all categories controller
const getProviders = catchAsync(async (req: Request, res: Response) => {
  // Define which query fields are filters
  const filterableFields = ['searchTerm', 'categoryId', 'minPrice', 'maxPrice', 'date', 'time'];

  // Pick only allowed filters from req.query
  const filterOptions = pick(req.query, filterableFields);

  // Call service
  const { data } = await ProviderService.getProvidersFromDB(filterOptions);

  // Send response
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Users retrieved successfully',
    data: data as Partial<TProvider>[] || [],
  });
});

//update service
const updateProvider = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params?.id;
    const providerId = req.user.id;

    const newData = {
      ...req.body.data,
      serviceImages: req.body.serviceImages,
    }
    const result = await ProviderService.updateProviderToDB(newData, id!, providerId!);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: result
    });
  }
);

//delete service
const deleteProvider = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {

    const id = req.params?.id;
    const result = await ProviderService.deleteProviderToDB(id!);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Profile updated successfully',
      data: result,
    });
  }
);

export const ProviderController = { createProvider, getProvider, getProviders, updateProvider, deleteProvider };
