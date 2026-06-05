import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { AuthController } from './auth.controller';
import { AuthValidation } from './auth.validation';
const router = express.Router();

router.post(
  '/login',
  validateRequest(AuthValidation.createLoginZodSchema),
  AuthController.loginUser
);

router.post(
  '/forget-password',
  validateRequest(AuthValidation.createForgetPasswordZodSchema),
  AuthController.sendOtp
);
router.post(
  '/resend-otp',
  validateRequest(AuthValidation.createForgetPasswordZodSchema),
  AuthController.sendOtp
);

router.post(
  '/send-otp',
  validateRequest(AuthValidation.createForgetPasswordZodSchema),
  AuthController.sendOtp
);

router.post(
  '/verify-account',
  validateRequest(AuthValidation.createVerifyEmailZodSchema),
  AuthController.verifyAccount
);

router.post(
  '/verify-otp',
  validateRequest(AuthValidation.createVerifyEmailZodSchema),
  AuthController.verifyOtp
);

router.post(
  '/reset-password',
  validateRequest(AuthValidation.createResetPasswordZodSchema),
  AuthController.resetPassword
);

router.patch(
  '/change-password',
  auth(USER_ROLES.ADMIN, USER_ROLES.USER, USER_ROLES.SUPER_ADMIN, USER_ROLES.PROVIDER),
  validateRequest(AuthValidation.createChangePasswordZodSchema),
  AuthController.changePassword
);

router.get(
  '/refresh-token',
  AuthController.refreshToken
);

// social login
router.post(
  '/social-login',
  validateRequest(AuthValidation.socialLoginZodSchema),
  AuthController.socialLogin
);

export const AuthRoutes = router;
