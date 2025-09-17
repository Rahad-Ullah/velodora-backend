import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import { getSingleFilePath } from '../../../shared/getFilePath';
import sendResponse from '../../../shared/sendResponse';
import { UserService } from './user.service';
import { IUser, PartialUserWithRequiredEmail } from './user.interface';
import { IPaginationMeta, IPaginationOptions } from '../../../types/pagination';
import pick from '../../../shared/pick';

const createUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { ...userData } = req.body;
    const result = await UserService.createUserToDB(userData);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: result,
      data: ""
    });
  }
);

const createUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await UserService.createUserToDB(req.body);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: result,
      data: ""
    });
  }
);

const getUser = catchAsync(async (req: Request, res: Response) => {
  
  const result = await UserService.getUserFromDB(req.params?.id as string);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Profile data retrieved successfully',
    data: result,
  });
});

const getUserProfile = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await UserService.getUserProfileFromDB(user);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Profile data retrieved successfully',
    data: result,
  });
});

const getUsers = catchAsync(async (req: Request, res: Response) => {
  // 1. Define which query fields are filters
  const filterableFields = ['searchTerm', 'verified', 'fields', 'sort', 'role', 'status'];

  // 2. Pick only allowed filters from req.query
  const filterOptions = pick(req.query, filterableFields);

  // 3. Build pagination options
  const paginationOptions: IPaginationOptions = {
    page: req.query.page ? Number(req.query.page) : 1,
    limit: req.query.limit ? Number(req.query.limit) : 10,
  };

  // 4. Call service
  const { meta, data } = await UserService.getUsersFromDB(filterOptions, paginationOptions);

  // 5. Send response
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Users retrieved successfully',
    data: data as Partial<IUser>[] || [],
    pagination: meta as IPaginationMeta,
  });
});

const getUsersAggregation = catchAsync(async (req: Request, res: Response) => {
  // 1. Define which query fields are filters
  const filterableFields = ['searchTerm', 'verified', 'fields', 'sort'];

  // 2. Pick only allowed filters from req.query
  const filterOptions = pick(req.query, filterableFields);

  // 3. Build pagination options
  const paginationOptions: IPaginationOptions = {
    page: req.query.page ? Number(req.query.page) : 1,
    limit: req.query.limit ? Number(req.query.limit) : 10,
  };

  // 4. Call service
  const { meta, data } = await UserService.getUsersAggregationFromDB(filterOptions, paginationOptions);

  // 5. Send response
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Users retrieved successfully',
    data: data as Partial<IUser>[] || [],
    pagination: meta as IPaginationMeta,
  });
});

//update profile
const updateProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    let image = getSingleFilePath(req.files, 'image');

    const data = {
      image,
      ...req.body,
    };
    const result = await UserService.updateProfileToDB(user, data);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Profile updated successfully',
      data: result,
    });
  }
);


//delete user
const updateUserStatus = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // console.log("controller - user: ", req.params?.id);

    const result = await UserService.updateUserStatusToDB(req.params?.id, req.body.status);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'User status updated successfully',
      data: result,
    });
  }
);

//delete profile
const deleteProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // console.log("controller- user: ", req.user);

    const result = await UserService.deleteUserFromDB(req.user.id  as string);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Profile deleted successfully',
      data: result,
    });
  }
);

//delete user
const deleteUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // console.log("controller - user: ", req.params?.id);

    const result = await UserService.deleteUserFromDB(req.params?.id  as string);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'User deleted successfully',
      data: result,
    });
  }
);

export const UserController = { createUser, createUsers, getUserProfile, getUser, getUsers, updateProfile, deleteProfile, updateUserStatus, deleteUser, getUsersAggregation };