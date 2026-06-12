import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { AuthService } from './auth.service';
import { AuthProviderEnum } from '../authProvider/authProvider.constants';
import { AuthHelper } from '../../../helpers/authHelper';

// Login user controller
const loginUser = catchAsync(async (req: Request, res: Response) => {
  const { ...loginData } = req.body;
  const result = await AuthService.loginUserFromDB(loginData);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'User logged in successfully.',
    data: {
      accessToken: result?.createToken,
      // refreshToken: result?.refreshToken,
      id: result?.id,
      name: result?.name,
    },
  });
});

// Verify account controller
const verifyAccount = catchAsync(async (req: Request, res: Response) => {
  const { ...verifyData } = req.body;
  const result = await AuthService.verifyAccountToDB(verifyData);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: result.message,
    data: result.data,
  });
});

// Verify OTP controller
const verifyOtp = catchAsync(async (req: Request, res: Response) => {
  const { ...verifyData } = req.body;
  const result = await AuthService.verifyOtpToDB(verifyData);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: result.message,
    data: result.data,
  });
});

// Send OTP controller
const sendOtp = catchAsync(async (req: Request, res: Response) => {
  const email = req.body.email;
  const result = await AuthService.sendOtpToDB(email);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message:
      'Please check your email. We have sent an OTP.',
    data: result,
  });
});

// Reset password controller
const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const token = req.headers.authorization;
  const { ...resetData } = req.body;
  const result = await AuthService.resetPasswordToDB(token!, resetData);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Your password has been successfully reset.',
    data: result,
  });
});

// Change password controller
const changePassword = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const { ...passwordData } = req.body;
  await AuthService.changePasswordToDB(user, passwordData);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Your password has been successfully changed',
  });
});

// Refresh token controller
const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const token = req.get('refreshtoken');
  
  const result = await AuthService.refreshTokenToDB(token as string);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Token refreshed successfully',
    data: {
      accessToken: result?.accessToken,
      refreshToken: result?.refreshToken || '',
    },
  });
});

// social login
const socialLogin = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  let providerVerifiedData: any;
  if (payload.provider === AuthProviderEnum.GOOGLE) {
    providerVerifiedData = await AuthHelper.verifyGoogleToken(
      payload.providerUserId,
    );
  } else if (payload.provider === AuthProviderEnum.APPLE) {
    providerVerifiedData = await AuthHelper.verifyFirebaseToken(payload.providerUserId);
  }

  const result = await AuthService.socialLogin({
    provider: payload.provider,
    providerUserId: providerVerifiedData.providerUserId,
    role: payload.role,
    email: providerVerifiedData.email || '',
    name: providerVerifiedData.name || '',
  });

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'User logged in successfully.',
    data: result,
  });
});


export const AuthController = {
  verifyAccount,
  verifyOtp,
  loginUser,
  sendOtp,
  resetPassword,
  changePassword,
  refreshToken,
  socialLogin
};