import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import pick from '../../../shared/pick';
import { ProviderService} from './provider.service';
import { TProvider } from './provider.interface';


//create provider
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

//get single provider
const getProvider = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const result = await ProviderService.getProviderFromDB(id!);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Service data retrieved successfully',
    data: result.data,
  });
});

//get my provider
const getMyProvider = catchAsync(async (req: Request, res: Response) => {
  const id = req.user.id;
  console.log("my provider id", id);
  const result = await ProviderService.getMyProviderFromDB(id!);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Service data retrieved successfully',
    data: result.data,
  });
});

//get all providers
const getProviders = catchAsync(async (req: Request, res: Response) => {
  // Define which query fields are filters
  const filterableFields = ['searchTerm', 'categoryId', 'minPrice', 'maxPrice', 'date', 'time', 'location','userLng', 'userLat'];

  // Pick only allowed filters from req.query
  const filterOptions = pick(req.query, filterableFields);

  // Call service
  const result = await ProviderService.getProvidersFromDB(filterOptions);

  // Send response
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Providers retrieved successfully',
    data: result.data
  });
});

//update service
const updateProvider = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const providerId = req.user.id;

    const newData = {
      data:req.body.data,
      services: req.body.services && req.body.services,
      newServiceImages: req.body.serviceImages,
      serviceImages: [] as string[]
    }

    if(req.body?.serviceImages?.length > 0){
      newData.serviceImages = [...req.body.serviceImages];
    }

    if(req.body?.previousServiceImages?.length > 0){
      newData.serviceImages = [...newData.serviceImages, ...req.body.previousServiceImages];
    }
    

    const result = await ProviderService.updateProviderToDB(newData, providerId!);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: result.message,
      data: result.data,
    });
  }
);

//delete edited provider
const deleteEditProvider = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {

    const id = req.params?.id;
    const result = await ProviderService.deleteEditProviderToDB(id!);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: result.message,
    });
  }
);

//approve provider
const approveProvider = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {

    const id = req.params?.id;
    const result = await ProviderService.approveProviderToDB(id!);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: result.message,
    });
  }
);

//delete provider
const deleteProvider = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {

    const id = req.params?.id;
    const result = await ProviderService.deleteProviderToDB(id!);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: result.message,
    });
  }
);

//active block provider
const activeBlockProvider = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {

    const id = req.params?.id;
    const result = await ProviderService.activeBlockProviderToDB(id!);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: result.message,
      data: result.data,
    });
  }
);

//delete edited provider
const approveEditProvider = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {

    const id = req.params?.id;
    const result = await ProviderService.approveEditProviderToDB(id!);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: result.message,
    });
  }
);

export const ProviderController = { createProvider, getMyProvider, getProvider, getProviders, updateProvider, deleteProvider, approveProvider, approveEditProvider, deleteEditProvider, activeBlockProvider };