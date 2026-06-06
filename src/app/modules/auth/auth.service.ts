import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import { JwtPayload, Secret } from 'jsonwebtoken';
import config from '../../../config';
import ApiError from '../../../errors/ApiError';
import { emailHelper } from '../../../helpers/emailHelper';
import { jwtHelper } from '../../../helpers/jwtHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import {
  IAuthResetPassword,
  IChangePassword,
  ILoginData,
  IVerifyEmail,
} from '../../../types/auth';
import generateOTP from '../../../util/generateOTP';
import { ResetTokenModel } from '../resetToken/resetToken.model';
import { UserModel } from '../user/user.model';
import cryptoToken from '../../../util/cryptoToken';
import e from 'cors';
import { ProviderModel } from '../provider/provider.model';
import { USER_ROLES, USER_STATUS } from '../../../enums/user';
import { AuthProvider } from '../authProvider/authProvider.model';

//login
const loginUserFromDB = async (payload: ILoginData) => {
  const { email, password, role } = payload;

  const isExistUser = await UserModel.findOne({ email }).select('+password');

  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  } else if (isExistUser?.role !== role) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Role doesn't match!");
  } else if (!isExistUser?.isActive) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User is blocked by admin!");
  } else if (!isExistUser?.verified) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User is not verified!");
  }
  //check match password
  if (
    password && !(await UserModel.isMatchPassword(password, isExistUser.password))
  ) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Password is incorrect!');
  }

  if (isExistUser?.isDeleted) {
    const now = new Date();
    const expireAt = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    if ((isExistUser as any).updatedAt < expireAt) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "User is deleted, Please contact admin!");
    } else {
      await UserModel.findByIdAndUpdate(isExistUser._id, { $set: { isDeleted: false } }, { new: true });
    }
  }

  if (isExistUser.role === USER_ROLES.PROVIDER) {
    await ProviderModel.findOneAndUpdate(
      { user: isExistUser._id },
      { $set: { isActive: true } }
    );
  }

  const jwtPayload = { id: isExistUser._id, role: isExistUser.role, email: isExistUser.email };

  //create token
  const createToken = jwtHelper.createToken(
    jwtPayload,
    config.jwt.jwt_secret as Secret,
    config.jwt.jwt_expire_in as string
  );

  const refreshToken = jwtHelper.createToken(
    jwtPayload,
    config.jwt.jwt_refresh_secret as Secret,
    config.jwt.jwt_refresh_expire_in as string
  );

  return { createToken, refreshToken, id: isExistUser._id, name: isExistUser.name };
};

//send otp
const sendOtpToDB = async (email: string) => {
  const isExistUser = await UserModel.findOne({ email }).select('+authentication');

  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  // if (isExistUser?.authentication?.oneTimeCode) {
  //   const date = new Date();
  //   if (date < isExistUser.authentication?.expireAt) {
  //     throw new ApiError(
  //       StatusCodes.BAD_REQUEST,
  //       'Otp already sent, Please try after 3 minutes later'
  //     );
  //   }
  // }

  //send mail
  const otp = generateOTP();
  const value = {
    otp,
    email,
  };
  const otpEmailTemplate = emailTemplate.sendOtp(value);
  emailHelper.sendEmail(otpEmailTemplate);

  //save to DB
  const authentication = {
    isSendOtp: true,
    oneTimeCode: otp,
    expireAt: new Date(Date.now() + 3 * 60 * 1000),
  };

  await UserModel.updateOne(
    { email },
    { $set: { authentication } }
  );
};

//verify otp
const verifyOtpToDB = async (payload: IVerifyEmail) => {
  let message;
  let data = {};

  const email = payload?.email;
  const oneTimeCode = Number(payload?.oneTimeCode);

  const isExistUser = await UserModel.findOne({ email }).select('+authentication');

  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  if (!oneTimeCode) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Please check your email we send a code then  give the otp,'
    );
  }

  if (isExistUser?.authentication?.oneTimeCode !== oneTimeCode) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Otp is incorrect, Please try again');
  }

  const date = new Date();
  if (date > isExistUser.authentication?.expireAt) {
    throw new ApiError(
      StatusCodes.OK,
      'Otp already expired, Please try again'
    );
  }

  await UserModel.findOneAndUpdate(
    { _id: isExistUser._id },
    {
      authentication: {
        isSendOtp: true,
        oneTimeCode: null,
        expireAt: null,
      },
    }
  );

  //create token ;
  const createToken = cryptoToken();
  await ResetTokenModel.create({
    user: isExistUser._id,
    token: createToken,
    expireAt: new Date(Date.now() + 5 * 60000),
  });
  message =
    'Verification Successful: Please securely store and utilize this code for reset password';
  data = { resetPasswordToken: createToken };
  return { data, message };
};

//verify account
const verifyAccountToDB = async (payload: IVerifyEmail) => {
  let message;
  let data;

  const email = payload?.email;
  const oneTimeCode = Number(payload?.oneTimeCode);

  const isExistUser = await UserModel.findOne({ email }).select('+authentication');
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  if (!oneTimeCode) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Please give the otp, check your email we send a code'
    );
  }

  if (isExistUser.authentication?.oneTimeCode !== oneTimeCode) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'You provided wrong otp');
  }

  const date = new Date();
  if (date > isExistUser.authentication?.expireAt) {
    throw new ApiError(
      StatusCodes.OK,
      'Otp already expired, Please try again'
    );
  }


  if (!isExistUser.verified) {
    await UserModel.findOneAndUpdate(
      { _id: isExistUser._id },
      { verified: true, authentication: { oneTimeCode: null, expireAt: null } }
    );
  } else {
    await UserModel.findOneAndUpdate(
      { _id: isExistUser._id },
      {
        authentication: {
          isSendOtp: false,
          oneTimeCode: null,
          expireAt: null,
        },
      }
    );
  }


  const createToken = jwtHelper.createToken(
    { id: isExistUser._id, role: isExistUser.role, email: isExistUser.email },
    config.jwt.jwt_secret as Secret,
    config.jwt.jwt_expire_in as string
  );

  data = { accessToken: createToken };
  message = 'Account verified successfully';

  return { data, message };
};

//reset password
const resetPasswordToDB = async (
  token: string,
  payload: IAuthResetPassword
) => {
  const { newPassword, confirmPassword } = payload;
  //isExist token
  const isExistToken = await ResetTokenModel.isExistToken(token);
  if (!isExistToken) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'You are not authorized');
  }

  //user permission check
  const isExistUser = await UserModel.findById(isExistToken.user).select(
    '+authentication'
  );

  if (!isExistUser?.authentication?.isSendOtp) {
    throw new ApiError(
      StatusCodes.UNAUTHORIZED,
      "You don't have permission to change password. Please click again to 'Forgot Password'"
    );
  }

  //validity check
  const isValid = await ResetTokenModel.isExpireToken(token);
  if (!isValid) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Token expired, Please click again to the forget password'
    );
  }

  //check password
  if (newPassword !== confirmPassword) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "New password and Confirm password doesn't match!"
    );
  }

  const hashPassword = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_rounds)
  );

  const updateData = {
    password: hashPassword,
    authentication: {
      isSendOtp: false,
    },
  };

  const updatedUser = await UserModel.findOneAndUpdate({ _id: isExistToken.user }, updateData);
  if (!updatedUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to Reset Password!');
  }

  const deleteToken = await ResetTokenModel.findByIdAndDelete(isExistToken._id);
  if (!deleteToken) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to delete token!');
  }
};

//change password
const changePasswordToDB = async (
  user: JwtPayload,
  payload: IChangePassword
) => {
  const { currentPassword, newPassword, confirmPassword } = payload;
  const isExistUser = await UserModel.findById(user.id).select('+password');
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  //current password match
  if (
    currentPassword &&
    !(await UserModel.isMatchPassword(currentPassword, isExistUser.password))
  ) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Old password is incorrect');
  }

  //newPassword and current password
  if (currentPassword === newPassword) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Please give different password from current password'
    );
  }
  //new password and confirm password check
  if (newPassword !== confirmPassword) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Password and Confirm password doesn't matched"
    );
  }

  //hash password
  const hashPassword = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_rounds)
  );

  const updateData = {
    password: hashPassword,
  };
  await UserModel.findOneAndUpdate({ _id: user.id }, updateData, { new: true });
};

// Refresh token
const refreshTokenToDB = async (token: string) => {
  if (!token) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Token not found');
  }

  const decoded = jwtHelper.verifyToken(
    token,
    config.jwt.jwt_refresh_secret as string,
  );

  const { email } = decoded;

  const activeUser = await UserModel.findOne({ email, isActive: true });


  if (!activeUser) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }

  const jwtPayload = { id: activeUser._id, role: activeUser.role, email: activeUser.email };

  const accessToken = jwtHelper.createToken(
    jwtPayload,
    config.jwt.jwt_secret as Secret,
    config.jwt.jwt_expire_in as string
  );

  return {
    accessToken,
    refreshToken: token,
  };
};

// -------------- social login --------------
const socialLogin = async ({
  provider,
  providerUserId,
  email,
  name,
}: {
  provider: 'google' | 'apple';
  providerUserId: string;
  email?: string;
  name?: string;
}) => {
  // 1️⃣ Check social identity
  const providerDoc = await AuthProvider.findOne({
    provider,
    providerUserId,
  }).populate('user');

  if (providerDoc) {
    const user = providerDoc.user as any;

    // update missing info
    if (!user.email && email) user.email = email;
    if (!user.name && name) user.name = name;

    await user.save();

    // check user status
    if (user && (user.isDeleted || !user.isActive)) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'It looks like your account has been deleted or deactivated.'
      );
    }

    // create access token
    const accessToken = jwtHelper.createToken(
      {
        id: user._id,
        role: user.role,
      },
      config.jwt.jwt_secret as Secret,
      config.jwt.jwt_expire_in as string
    );

    // create refresh token
    const refreshToken = jwtHelper.createToken(
      {
        id: user._id,
        role: user.role,
      },
      config.jwt.jwt_refresh_secret as Secret,
      config.jwt.jwt_refresh_expire_in as string
    );

    return { accessToken, refreshToken, role: user.role, id: user._id, name: user.name };
  }

  // 2️⃣ Check email
  let user = null;
  if (email) {
    user = await UserModel.findOne({ email });
  }

  // check user status
  if (user && (user.isDeleted || !user.isActive)) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'It looks like your account has been deleted or deactivated.'
    );
  }

  // 3️⃣ if user not found
  if (!user) {
    // user = await UserModel.create({
    //   name: name || 'User',
    //   email: email || '',
    //   role: USER_ROLES.USER,
    //   isVerified: Boolean(email),
    // });
    throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found. Please sign up first.');
  }

  // 4️⃣ Link provider
  await AuthProvider.create({
    user: user._id,
    provider,
    providerUserId,
  });

  // 5️⃣ create access token
  const accessToken = jwtHelper.createToken(
    {
      id: user._id,
      role: user.role,
    },
    config.jwt.jwt_secret as Secret,
    config.jwt.jwt_expire_in as string
  );

  // 6️⃣ create refresh token
  const refreshToken = jwtHelper.createToken(
    {
      id: user._id,
      role: user.role,
    },
    config.jwt.jwt_refresh_secret as Secret,
    config.jwt.jwt_refresh_expire_in as string
  );

  return { accessToken, refreshToken, role: user.role, id: user._id, name: user.name };
};

export const AuthService = {
  verifyAccountToDB,
  verifyOtpToDB,
  loginUserFromDB,
  sendOtpToDB,
  resetPasswordToDB,
  changePasswordToDB,
  refreshTokenToDB,
  socialLogin,
};
