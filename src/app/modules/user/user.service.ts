import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import { USER_ROLES } from '../../../enums/user';
import ApiError from '../../../errors/ApiError';
import { emailHelper } from '../../../helpers/emailHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import { unlinkFile } from '../../../shared/unlinkFile';
import generateOTP from '../../../util/generateOTP';
import { IUser, PartialUserWithRequiredEmail } from './user.interface';
import { UserModel } from './user.model';
import { IPaginationOptions } from '../../../types/pagination';
import QueryBuilder from '../../builder/QueryBuilder';
import { ReferralModel } from '../referral/referral.model';
import { logger } from '../../../shared/logger';
import { UserTempModel } from './userTemp.model';


//create single user
const createUserToDB = async (payload: PartialUserWithRequiredEmail, referralCode?: string): Promise<string> => {
  let message = '';
  let createUser: IUser = {} as IUser;

  const now = new Date();

  if (payload.role === USER_ROLES.PROVIDER && !referralCode) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Referral code is required for provider');

  } if (payload.role === USER_ROLES.PROVIDER && referralCode) {
    const isExistReferral = await ReferralModel.findOne({
      code: referralCode,
      isUsed: false,
      createdAt: { $gte: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000) },
    });
    if (!isExistReferral) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Referral code is invalid');
    }
  }

  const isExistUser = await UserModel.isExistUserByEmail(payload?.email);

  if (isExistUser?.verified) {
    throw new ApiError(StatusCodes.CONFLICT, 'User already exist! Please Login');
  }

  if (isExistUser && !isExistUser?.verified) {
    createUser = isExistUser;
    message = "User already exist! Please verify your account";

  } else if (!isExistUser) {
    const res = await UserModel.create(payload);
    if (res) {
      createUser = res;
      message = 'User created successfully! Please verify your account';
      if (createUser?.role === USER_ROLES.PROVIDER) {
        await ReferralModel.findOneAndUpdate(
          { code: referralCode },
          { $set: { isUsed: true, usedBy: res._id } }
        );
      }
    } else {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create user');
    }
  }

  //send email
  const otp = generateOTP();
  const values = {
    name: createUser.name,
    otp: otp,
    email: createUser.email!,
  };
  const createAccountTemplate = emailTemplate.createAccount(values);
  emailHelper.sendEmail(createAccountTemplate);

  //save to DB
  const authentication = {
    isSendOtp: true,
    oneTimeCode: otp,
    expireAt: new Date(Date.now() + 3 * 60 * 1000),
  };
  await UserModel.findOneAndUpdate(
    { email: createUser.email },
    { $set: { authentication } }
  );

  return message;
};

//create seed users
const createUsersToDB = async (
  payloads: PartialUserWithRequiredEmail[]
): Promise<string[]> => {

  const messages: string[] = [];

  for (const payload of payloads) {
    if (!payload.email) {
      messages.push('Missing email in payload.');
      continue;
    }

    // payload.role = USER_ROLES.USER;

    const isExistUser = await UserModel.isExistUserByEmail(payload.email);

    if (isExistUser) {
      messages.push(`User with ${payload.email} already exists!`);
    } else {
      try {
        const res = await UserModel.create(payload);
        if (res) {
          messages.push(`User with ${payload.email} created successfully!`);
        } else {
          messages.push(`Failed to create user with ${payload.email}`);
        }
      } catch (error: any) {
        messages.push(`Error creating user ${payload.email}: ${error.message}`);
      }
    }
  }

  return messages;
};

//get user profile
const getUserProfileFromDB = async (
  user: JwtPayload
): Promise<Partial<IUser>> => {
  const { id } = user;
  const isExistUser = await UserModel.isExistUserById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  } else if (isExistUser?.isDeleted === true) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User is deleted!");
  }


  return isExistUser;
};

//get user profile by admin
const getUserFromDB = async (
  id: string
): Promise<Partial<IUser>> => {

  const isExistUser = await UserModel.isExistUserById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  return isExistUser;
};

//get all users by admin
const getUsersFromDB = async (
  filterOptions: Record<string, unknown>,
  paginationOptions: IPaginationOptions
): Promise<{ meta: IPaginationOptions; data: Partial<IUser>[] }> => {
  const { page = 1, limit = 10 } = paginationOptions;

  const query: Record<string, unknown> = {
    ...filterOptions,
    role: { $eq: USER_ROLES.USER },
    page,
    limit,
  };
  // console.log("All Queries: ", query);

  const searchableFields = ['name', 'email', 'location', 'contact'];

  const builder = new QueryBuilder<IUser>(UserModel.find(), query);

  const usersQuery = builder
    .search(searchableFields)
    .filter()
    .sort(['-createdAt'])
    .paginate()
    .fields();

  // const data = await usersQuery.modelQuery.lean();
  const meta = await builder.getPaginationInfo();
  const data = (await usersQuery.modelQuery.lean()).map((user: any) => ({
    ...user,
    _id: user._id.toString(),
    __v: undefined,
  }));

  return { meta, data };
};

//get all users through aggregation by admin
const getUsersAggregationFromDB = async (
  filterOptions: Record<string, unknown>,
  paginationOptions: IPaginationOptions
): Promise<{ meta: IPaginationOptions; data: Partial<IUser>[] }> => {
  const { searchTerm = "", ...otherFilters } = filterOptions;
  const { page = 1, limit = 10 } = paginationOptions;
  const skip = (page - 1) * limit;

  const searchableFields = ['name', 'email', 'location', 'contact'];
  const matchConditions: any = {};

  // Add `$or` condition if `searchTerm` is provided
  if (searchTerm) {
    matchConditions.$or = searchableFields.map((field) => ({
      [field]: { $regex: searchTerm, $options: 'i' },
    }));
  }

  const [result] = await UserModel.aggregate([
    {
      $match: {
        // status: "active",
      }, // Don’t forget to apply your matchConditions here!
    },
    {
      $group: {
        _id: "$role",
        count: { $sum: 1 },
        users: { $push: "$_id" }
      }
    },
    {
      $facet: {
        data: [
          { $skip: skip },
          { $limit: limit },
          {
            $project: {
              __v: 0,
            },
          },
        ],
        countData: [
          { $count: "total" }
        ],
      },
    },
    {
      $addFields: {
        total: { $ifNull: [{ $arrayElemAt: ["$countData.total", 0] }, 0] },
        limit: limit,
        page: page,
        totalPage: {
          $ceil: { $divide: [{ $ifNull: [{ $arrayElemAt: ["$countData.total", 0] }, 0] }, limit] }
        }
      }
    },
    {
      $project: {
        data: 1,
        pagination: {
          total: "$total",
          limit: "$limit",
          page: "$page",
          totalPage: "$totalPage",
        }
      }
    }
  ]);

  const meta = result?.pagination || {
    total: 0,
    limit,
    page,
    totalPage: 0,
  };

  return {
    meta,
    data: result?.data || [],
  };
};

// update profile
const updateProfileToDB = async (
  user: JwtPayload,
  payload: Partial<IUser>
): Promise<any> => {
  const { id } = user;
  const isExistUser = await UserModel.isExistUserById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  if (isExistUser.role === USER_ROLES.PROVIDER) {
    console.log("update provider", payload);
    const isExistTempUser = await UserTempModel.findOne({ ref: id });
    if (isExistTempUser) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "You have already approval request!");
    }
    const { name, email, contact, location, image } = payload; //email, role, password can't be updated here.
    const testUser = await UserTempModel.create({ ref: id, name, email, contact, location, image });
    return testUser;

  } else {
    //unlink file here
    if (payload?.image && isExistUser?.image) {
      unlinkFile(isExistUser.image);
    }
    const { email, password, role, ...newPayload } = payload; //email, role, password can't be updated here.
    const updateDoc = await UserModel.findOneAndUpdate({ _id: id }, newPayload, {
      new: true,
    });

    return updateDoc;
  }
};

// update profile
const approveUpdateProfileToDB = async (
  id: string,
): Promise<any> => {
  // console.log("Temp User Id :", id);
  const isExistUser = await UserTempModel.findById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  const isOriginalUser = await UserModel.findOne({ _id: isExistUser.ref });
  if (!isOriginalUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Original User doesn't exist!");
  }

  isExistUser.image && isOriginalUser.image && unlinkFile(isOriginalUser.image);

  const { name, email, contact, location, image } = isExistUser;
  const updateUser = await UserModel.findOneAndUpdate({ _id: isExistUser.ref }, { name, email, contact, location, image }, {
    new: true,
  });

  await UserTempModel.findByIdAndDelete(id);

  return updateUser;
};

// update profile
const deleteUpdateProfileToDB = async (
  id: string,
): Promise<any> => {

  const isExistUser = await UserTempModel.findByIdAndDelete(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }
  isExistUser.image && unlinkFile(isExistUser.image);

  return isExistUser;
};

// update user status to db by admin
const updateUserStatusToDB = async (
  id: string,
): Promise<Partial<IUser | null>> => {
  // Check if user exists
  const isExistUser = await UserModel.isExistUserById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  // Update user status
  const result = await UserModel.findByIdAndUpdate(
    id,
    { isActive: !isExistUser?.isActive },
    { new: true }
  );

  return result;
};

// delete user from db
const deleteUserFromDB = async (id: string): Promise<Partial<IUser | null>> => {
  // console.log("user id: ", id);
  const isExistUser = await UserModel.isExistUserById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  try {
    const result = await UserModel.findByIdAndUpdate(id, { $set: { isDeleted: true } }, { new: true });
    return result;
  } catch (error) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Oops! Failed to delete user.");
  }
};

// delete user from db
const activeBlockUserFromDB = async (id: string): Promise<any> => {
  // console.log("user id: ", id);
  const isExistUser = await UserModel.isExistUserById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  try {
    const result = await UserModel.findByIdAndUpdate(id, { $set: { isActive: !isExistUser?.isActive } }, { new: true });
    return { message: `${isExistUser?.isActive ? "Blocked" : "Active"} User Successfully`, data: result };
  } catch (error) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Oops! Failed to Active/Block user.");
  }
};

//hard delete users from db after 30 days by Scheduler
const hardDeleteUsersFromDB = async () => {
  const now = new Date();
  const cutoff = new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000);
  // console.log("Hard Delete Users Cutoff Time: ", cutoff);

  try {
    // Find users soft-deleted more than 45 days ago
    const users = await UserModel.find({
      isDeleted: true,
      updatedAt: { $lt: cutoff }
    });

    for (const user of users) {
      // Delete related services first
      // await ServiceModel.deleteMany({ userId: user._id });

      // Delete user image if exists
      if (user?.image) {
        unlinkFile(user.image);
      }

      // Delete the user
      await UserModel.deleteOne({ _id: user._id });

      logger.info(`✅ Deleted user ${user._id} and their services`);
    }
  } catch (error) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Oops! Failed to delete user.");
  }
};

export const UserService = {
  createUserToDB,
  createUsersToDB,
  getUserProfileFromDB,
  getUserFromDB,
  getUsersFromDB,
  updateProfileToDB,
  updateUserStatusToDB,
  deleteUserFromDB,
  hardDeleteUsersFromDB,
  getUsersAggregationFromDB,
  approveUpdateProfileToDB,
  deleteUpdateProfileToDB,
  activeBlockUserFromDB
};