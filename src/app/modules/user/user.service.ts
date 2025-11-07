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
import { CreditsModel } from '../credits/credits.model';
import { RsdCreditsTransformation } from '../../../helpers/rsdCreditsConver';
import stripe from '../../config/stripe.config';
import mongoose from 'mongoose';


//create single user to db
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
    name: createUser.name!,
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

//create sub admin to db
const createSubAdminToDB = async (payload: PartialUserWithRequiredEmail): Promise<string> => {

  const isExistUser = await UserModel.isExistUserByEmail(payload?.email);

  if (isExistUser?.verified) {
    throw new ApiError(StatusCodes.CONFLICT, 'User already exist! Please Login');
  }
  const newPayload = {
    role: USER_ROLES.ADMIN,
    email: payload.email,
    password: "123456",
    verified: true,
    isActive: true,
  }

  const res = await UserModel.create(newPayload);
  let message = '';
  if (res) {
    message = 'User created successfully';
  } else {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create user');
  }

  return message;
};

// delete sub admin from db
const deleteSubAdminFromDB = async (id: string): Promise<string> => {

  const isExistUser = await UserModel.findByIdAndDelete(id);

  if (!isExistUser) {
    throw new ApiError(StatusCodes.CONFLICT, 'Sub Admin does not exist!');
  }

  return 'Sub Admin deleted successfully';
};

//create multiple users to db
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

//get user profile from db
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

  return isExistUser
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

//get edited user(provider) profile by admin
const getEditedUserFromDB = async (
  id: string
): Promise<any> => {

  const isExistUser = await UserTempModel.findOne({ ref: id });
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  return isExistUser;
};

//get all users by admin
const getUsersFromDB = async (
  filterOptions: Record<string, unknown>,
  paginationOptions: IPaginationOptions
): Promise<{ meta: IPaginationOptions; data: any[] }> => {
  const { page = 1, limit = 10 } = paginationOptions;

  const query: Record<string, unknown> = {
    ...filterOptions,
    page,
    limit,
  };

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
  const data = await usersQuery.modelQuery.lean()

  return { meta, data };
};

//get all users by admin
const getSubAdminsFromDB = async (): Promise<any> => {

  const data = await UserModel.find({ role: USER_ROLES.ADMIN }).lean();
  if (!data) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "No Sub Admin found!");
  }

  return { data };
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

// update profile to db
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
    const isExistTempUser = await UserTempModel.findOne({ ref: id });
    if (isExistTempUser) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "You have already approval request!");
    }
    const { name, contact, countryCode, location, image } = payload; //email, role, password can't be updated here.
    const data = {
      ref: id,
      name: name ?? isExistUser.name,
      email: isExistUser.email,
      contact: contact ?? isExistUser.contact,
      countryCode: countryCode ?? isExistUser.countryCode,
      location: location ?? isExistUser.location,
      image: image ?? isExistUser.image
    }
    const testUser = await UserTempModel.create(data);
    await UserModel.findByIdAndUpdate(isExistUser._id, { $set: { isModified: true } }, { new: true });
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

// update profile to db
const updateProfileImageToDB = async (
  user: JwtPayload,
  payload: Partial<IUser>
): Promise<any> => {
  const { id } = user;
  const isExistUser = await UserModel.isExistUserById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  if (payload?.image && isExistUser?.image) {
    unlinkFile(isExistUser.image);
  }

  const { email, password, role, ...newPayload } = payload;
  const updateDoc = await UserModel.findOneAndUpdate({ _id: id }, newPayload, {
    new: true,
  });

  return updateDoc;
};

// approve update profile to db
const approveUpdateProfileToDB = async (
  id: string,
): Promise<any> => {
  const isExistUser = await UserTempModel.findOne({ ref: id });
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  const isOriginalUser = await UserModel.findOne({ _id: isExistUser.ref });
  if (!isOriginalUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Original User doesn't exist!");
  }

  isExistUser.image && isOriginalUser.image && unlinkFile(isOriginalUser.image);

  const { name, email, contact, countryCode, location, image } = isExistUser;
  const updateUser = await UserModel.findOneAndUpdate({ _id: isExistUser.ref }, { name, email, contact, countryCode, location, image }, {
    new: true,
  });

  await UserModel.findByIdAndUpdate(id, { $set: { isModified: false } }, { new: true });
  await UserTempModel.findOneAndDelete({ ref: id });

  return updateUser;
};

// delete update profile
const deleteUpdateProfileToDB = async (
  id: string,
): Promise<any> => {

  const isExistUser = await UserTempModel.findOneAndDelete({ ref: id });
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }
  isExistUser.image && unlinkFile(isExistUser.image);
  await UserModel.findByIdAndUpdate(id, { $set: { isModified: false } }, { new: true });

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
  const isExistUser = await UserModel.isExistUserById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  try {
    const result = await UserModel.findByIdAndUpdate(id, { $set: { isDeleted: !isExistUser?.isDeleted } }, { new: true });
    return result;
  } catch (error) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Oops! Failed to delete user.");
  }
};

// active block user from db
const activeBlockUserFromDB = async (id: string): Promise<any> => {
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

// give credit to user by admin
const giveCreditFromDB = async (id: string, credits: number): Promise<any> => {
  const isExistUser = await UserModel.isExistUserById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  try {
    const result = await UserModel.findByIdAndUpdate(id, { $set: { credits: isExistUser?.credits + Number(credits) } }, { new: true });

    const payload = { user: isExistUser._id, credits: Number(credits) };
    const resCredits = await CreditsModel.create(payload);
    if (!resCredits) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to calculate credits!");
    }

    return { message: `${credits} send to ${isExistUser?.name} Successfully`, data: result };
  } catch (error) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Oops! Failed to send credits.");
  }
};

// give credit to user by admin
const getRsdFromDB = async (id: string): Promise<any> => {
  const isExistUser = await UserModel.isExistUserById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  return { rsd: await RsdCreditsTransformation.creditsToRsd(isExistUser?.credits) };
};

//hard delete users from db after 30 days by Scheduler
const hardDeleteUsersFromDB = async () => {
  const now = new Date();
  const cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

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

//get total users & providers from db
const totalUsersProviderFromDB = async (year: number): Promise<any> => {
  const data = await UserModel.aggregate([
    {
      $match: {
        $expr: {
          $eq: [{ $year: "$createdAt" }, year],
        },
      },
    },
    {
      $group: {
        _id: null,
        totalUsers: {
          $sum: {
            $cond: [{ $eq: ["$role", "USER"] }, 1, 0],
          },
        },
        totalProviders: {
          $sum: {
            $cond: [{ $eq: ["$role", "PROVIDER"] }, 1, 0],
          },
        },
      },
    },
    {
      $addFields: {
        total: { $add: ["$totalUsers", "$totalProviders"] },
      },
    },
    {
      $project: {
        _id: 0,
        total: 1,
        totalUsers: 1,
        totalProviders: 1,
      },
    },
  ]);

  return data[0] || { total: 0, totalUsers: 0, totalProviders: 0 };
};

//withdraw amount to provider account from admin account
const withdrawFromDB = async (user: JwtPayload) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const User = await UserModel.findById(user.id)
      .select("+stripeAccountInfo")
      .session(session)
      .lean();

    if (!User) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Withdraw - User not found");
    }

    // ✅ CASE 1: Account ready to withdraw
    if (
      User?.stripeAccountInfo?.stripeAccountId &&
      User?.stripeAccountInfo?.stripeLoginUrl &&
      User?.stripeAccountInfo?.isAccountReady
    ) {
      const userBalance = await RsdCreditsTransformation.creditsToRsd(User?.credits as number);

      const balance = await stripe.balance.retrieve();
      const availableBalance = balance.available?.[0]?.amount || 0;

      if (availableBalance < userBalance * 100) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Insufficient platform funds to make transfer.");
      }

      const transfer = await stripe.transfers.create({
        amount: userBalance * 100,
        currency: "usd",
        destination: User?.stripeAccountInfo?.stripeAccountId,
      });

      if (!transfer) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          "Failed to transfer funds to connected account."
        );
      }

      await UserModel.updateOne(
        { _id: user.id },
        { $set: { credits: 0 } },
        { session }
      );

      await session.commitTransaction();
      session.endSession();

      return {
        message: `${userBalance} transferred to Stripe account successfully!`,
      };
    }

    // ✅ CASE 2: Account exists but not ready
    if (
      User?.stripeAccountInfo?.stripeAccountId &&
      User?.stripeAccountInfo?.stripeLoginUrl &&
      !User?.stripeAccountInfo?.isAccountReady
    ) {

      const accountLink = await stripe.accountLinks.create({
        account: User.stripeAccountInfo.stripeAccountId!,
        refresh_url: "https://nk6567-dashboard.vercel.app/account-create-failed",
        return_url: "https://nk6567-dashboard.vercel.app/account-create-successful",
        type: "account_onboarding",
        // collect: 'eventually_due', // optional
      });

      if (!accountLink.url) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          "Failed to create Stripe onboarding link."
        );
      }

      await UserModel.findByIdAndUpdate(
        user.id,
        {
          $set: {
            "stripeAccountInfo.stripeLoginUrl": accountLink.url,
          },
        },
        { session }
      );

      await session.commitTransaction();
      session.endSession();

      return {
        message: "Created Stripe connected account onboarding link!",
        url: accountLink.url,
      };
    }

    // ✅ CASE 3: No Stripe account yet → create one
    const createAccount = await stripe.accounts.create({
      type: "express",
      country: "US",
      email: User?.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_profile: {
        name: User?.name!,
        support_email: User?.email!,
        support_phone: User?.contact!,
        url: "https://nk6567-dashboard.vercel.app",
      },
      business_type: "individual",
      individual: {
        first_name: User?.name,
        email: User?.email!,
      },
    });

    const accountLink = await stripe.accountLinks.create({
      account: createAccount.id,
      refresh_url: "https://nk6567-dashboard.vercel.app/account-create-failed",
      return_url:
        "https://nk6567-dashboard.vercel.app/account-create-successful",
      type: "account_onboarding",
    });

    if (!accountLink.url) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Failed to create Stripe onboarding link."
      );
    }

    await UserModel.findByIdAndUpdate(
      user.id,
      {
        $set: {
          "stripeAccountInfo.stripeAccountId": createAccount.id,
          "stripeAccountInfo.stripeLoginUrl": accountLink.url,
          "stripeAccountInfo.isAccountReady": false,
        },
      },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return {
      message: "Created new Stripe connected account!",
      url: accountLink.url,
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("withdrawFromDB error:", error);
    throw error;
  }
};



export const UserService = {
  createUserToDB,
  createUsersToDB,
  getUserProfileFromDB,
  getUserFromDB,
  getEditedUserFromDB,
  getUsersFromDB,
  updateProfileToDB,
  updateProfileImageToDB,
  updateUserStatusToDB,
  deleteUserFromDB,
  hardDeleteUsersFromDB,
  getUsersAggregationFromDB,
  approveUpdateProfileToDB,
  deleteUpdateProfileToDB,
  activeBlockUserFromDB,
  giveCreditFromDB,
  totalUsersProviderFromDB,
  createSubAdminToDB,
  deleteSubAdminFromDB,
  getSubAdminsFromDB,
  getRsdFromDB,
  withdrawFromDB
};