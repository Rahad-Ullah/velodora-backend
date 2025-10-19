import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { AuthService } from './auth.service';

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
    },
  });
});

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

const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const token = req.get('refreshtoken');
  console.log("refresh token : ", token);
  
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

export const AuthController = {
  verifyAccount,
  verifyOtp,
  loginUser,
  sendOtp,
  resetPassword,
  changePassword,
  refreshToken,
};