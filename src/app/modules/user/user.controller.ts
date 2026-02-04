import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import { getSingleFilePath } from '../../../shared/getFilePath';
import sendResponse from '../../../shared/sendResponse';
import { UserService } from './user.service';
import { IUser } from './user.interface';
import { IPaginationMeta, IPaginationOptions } from '../../../types/pagination';
import pick from '../../../shared/pick';
import config from '../../../config';


// create single user
const createUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { referralCode = "", ...userData } = req.body;
    const result = await UserService.createUserToDB(userData, referralCode);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: result,
      data: ""
    });
  }
);

// create sub admin
const createSubAdmin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {

    const result = await UserService.createSubAdminToDB(req.body);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: result,
      data: ""
    });
  }
);

// delete sub admin
const deleteSubAdmin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {

    const result = await UserService.deleteSubAdminFromDB(req.params.id as string);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: result,
      data: ""
    });
  }
);

// delete sub admin
const deleteUserByAdmin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {

    const result = await UserService.deleteUserByAdminFromDB(req.params.id as string);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "User deleted successfully",
      data: result
    });
  }
);

// get sub admins
const getSubAdmins = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {

    const result = await UserService.getSubAdminsFromDB();

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Sub admins retrieved successfully',
      data: result.data
    });
  }
);

// create multiple users
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

// get single user by admin
const getUser = catchAsync(async (req: Request, res: Response) => {

  const result = await UserService.getUserFromDB(req.params?.id as string);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Profile data retrieved successfully',
    data: result,
  });
});

// get single user by admin
const getEditedUser = catchAsync(async (req: Request, res: Response) => {

  const result = await UserService.getEditedUserFromDB(req.params?.id as string);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Profile data retrieved successfully',
    data: result,
  });
});

// get user profile
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

// get all users
const getUsers = catchAsync(async (req: Request, res: Response) => {
  // 1. Define which query fields are filters
  const filterableFields = ['searchTerm', 'verified', 'isActive', 'verifiedService', 'isService', 'isModify', 'isDeleted', 'fields', 'sort', 'role', 'status'];

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

// get all users (aggregation)
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
const updateProfileImage = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    let image = getSingleFilePath(req.files, 'image');

    const data = {
      image,
      ...req.body,
    };
    const result = await UserService.updateProfileImageToDB(user, data);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Profile updated successfully',
      data: result,
    });
  }
);

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

    const result = await UserService.updateUserStatusToDB(req.params?.id);

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

    const result = await UserService.deleteUserFromDB(req.user.id as string);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Profile deleted successfully',
      data: result,
    });
  }
);

//delete user
const giveCredits = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {

    const result = await UserService.giveCreditFromDB(req.params?.id as string, req.body.credits);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: result.message,
      data: result.data,
    });
  }
);

//delete user
const activeBlockUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {

    const result = await UserService.activeBlockUserFromDB(req.params?.id as string);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: result.message,
      data: result.data,
    });
  }
);

//delete user
const deleteUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {

    const result = await UserService.deleteUserFromDB(req.params?.id as string);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'User deleted successfully',
      data: result,
    });
  }
);

//approve user
const approveUpdateProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {

    const result = await UserService.approveUpdateProfileToDB(req.params.id);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'User Updated successfully',
      data: result,
    });
  }
);

// download users
const downloadUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const role = req.query.role as string;

    const result = await UserService.downloadUsersFromDB({role});
    
    const downloadUrl = `${config.download_path}/public/exports/${result.fileName}`;

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'User downloaded successfully',
      data: downloadUrl,
    });
  }
);
//approve user
const deleteUpdateProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {

    const result = await UserService.deleteUpdateProfileToDB(req.params.id);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'User Updated successfully',
      data: result,
    });
  }
);

//approve user
const totalUsersProvider = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const year = Number(req.query.year) || Number(new Date().getFullYear());

    const result = await UserService.totalUsersProviderFromDB(year);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'User Updated successfully',
      data: result,
    });
  }
);

// Get RSD info
const getRsd = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {

    const result = await UserService.getRsdFromDB(req?.user?.id as string);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'User RSD get successfully',
      data: result,
    });
  }
);

// Get RSD info
const withdraw= catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {

    const result = await UserService.withdrawFromDB(req?.user);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: result?.message,
      data: result?.url ?? "",
    });
  }
);

export const UserController = { createUser, deleteUserByAdmin, createUsers, getUserProfile, getUser, getEditedUser, getUsers, updateProfile, updateProfileImage, deleteProfile, updateUserStatus, deleteUser, getUsersAggregation, approveUpdateProfile, deleteUpdateProfile, activeBlockUser, giveCredits, totalUsersProvider, createSubAdmin, deleteSubAdmin, getSubAdmins, getRsd,withdraw, downloadUsers };