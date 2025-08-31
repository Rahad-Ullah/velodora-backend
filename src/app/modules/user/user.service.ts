import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import { USER_ROLES, USER_STATUS } from '../../../enums/user';
import ApiError from '../../../errors/ApiError';
import { emailHelper } from '../../../helpers/emailHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import {unlinkFile} from '../../../shared/unlinkFile';
import generateOTP from '../../../util/generateOTP';
import { IUser, PartialUserWithRequiredEmail } from './user.interface';
import { User } from './user.model';
import { IPaginationOptions } from '../../../types/pagination';
import QueryBuilder from '../../builder/QueryBuilder';


//create single user
const createUserToDB = async (payload: PartialUserWithRequiredEmail): Promise<string> => {
  let message = '';
  let createUser: IUser = {} as IUser;

  const isExistUser = await User.isExistUserByEmail(payload?.email);

  if (isExistUser?.verified) {
    return "User already exist! Please Login";
  }

  if (isExistUser && !isExistUser?.verified) {
    createUser = isExistUser;
    message = "User already exist! Please verify your account";

  } else if (!isExistUser) {
    const res = await User.create(payload);
    if (res) {
      createUser = res;
      message = 'User created successfully! Please verify your account';
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
  await User.findOneAndUpdate(
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

    payload.role = USER_ROLES.USER;

    const isExistUser = await User.isExistUserByEmail(payload.email);

    if (isExistUser) {
      messages.push(`User with ${payload.email} already exists!`);
    } else {
      try {
        const res = await User.create(payload);
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
  const isExistUser = await User.isExistUserById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  return isExistUser;
};

//get all users
const getUsersFromDB = async (
  filterOptions: Record<string, unknown>,
  paginationOptions: IPaginationOptions
): Promise<{ meta: IPaginationOptions; data: Partial<IUser>[] }> => {
  const { page = 1, limit = 10 } = paginationOptions;

  const query: Record<string, unknown> = {
    ...filterOptions,
    page,
    limit,
  };
  // console.log("All Queries: ", query);

  const searchableFields = ['name', 'email', 'location', 'contact'];

  const builder = new QueryBuilder<IUser>(User.find(), query);

  const usersQuery = builder
    .search(searchableFields)
    .filter()
    .sort()
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

//get all users by aggregation
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

  const [result] = await User.aggregate([
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


const updateProfileToDB = async (
  user: JwtPayload,
  payload: Partial<IUser>
): Promise<Partial<IUser | null>> => {
  const { id } = user;
  const isExistUser = await User.isExistUserById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  //unlink file here
  if (payload?.image && isExistUser?.image) {
    unlinkFile(isExistUser.image);
  }

  console.log("Update Profile : ", payload);

  const { email, password, role, ...newPayload } = payload; //email, role, password can't be updated here.

  const updateDoc = await User.findOneAndUpdate({ _id: id }, newPayload, {
    new: true,
  });

  return updateDoc;
};

export const UserService = {
  createUserToDB,
  createUsersToDB,
  getUserProfileFromDB,
  getUsersFromDB,
  updateProfileToDB,
  getUsersAggregationFromDB
};
