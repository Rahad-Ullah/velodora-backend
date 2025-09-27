import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import pick from '../../../shared/pick';
import { ProviderService} from './provider.service';
import { TProvider } from './provider.interface';


//create service controller
const createProvider = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    
    // const filePaths = getMultipleFilesPath(req.files, 'serviceImages');
    // console.log("filePaths", filePaths);

    const provider = {
      ...req.body.data,
      user: req.user.id,
      serviceImages: req.body.serviceImages,
    }
    const services = req.body.services;

    const result = await ProviderService.createProviderToDB(provider, services);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: result.message,
      data: result.data,
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
  const filterableFields = ['searchTerm', 'categoryId', 'minPrice', 'maxPrice', 'date', 'time', 'location','userLng', 'userLat'];

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
      data:req.body.data,
      services: req.body.services && req.body.services,
      serviceImages: [] as string[]
    }

    if(req.body?.serviceImages?.length > 0){
      newData.serviceImages = [...req.body.serviceImages];
    }

    if(req.body?.previousServiceImages?.length > 0){
      newData.serviceImages = [...newData.serviceImages, ...req.body.previousServiceImages];
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
