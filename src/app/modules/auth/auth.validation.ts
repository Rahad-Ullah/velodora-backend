import { z } from 'zod';
import { AuthProviderEnum } from '../authProvider/authProvider.constants';
import { USER_ROLES } from '../../../enums/user';

const createVerifyEmailZodSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }),
    oneTimeCode: z.string({ required_error: 'One time code is required' }),
  }),
});

const createLoginZodSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }),
    password: z.string({ required_error: 'Password is required' }),
  }),
});

const createForgetPasswordZodSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }),
  }),
});

const createResetPasswordZodSchema = z.object({
  body: z.object({
    newPassword: z.string({ required_error: 'Password is required' }),
    confirmPassword: z.string({
      required_error: 'Confirm Password is required',
    }),
  }),
});

const createChangePasswordZodSchema = z.object({
  body: z.object({
    currentPassword: z.string({
      required_error: 'Current Password is required',
    }),
    newPassword: z.string({ required_error: 'New Password is required' }),
    confirmPassword: z.string({
      required_error: 'Confirm Password is required',
    }),
  }),
});

// social login schema
const socialLoginZodSchema = z.object({
  body: z.object({
    provider: z.nativeEnum(AuthProviderEnum),
    providerUserId: z.string().nonempty('Provider User ID is required'),
    role: z.enum([USER_ROLES.USER, USER_ROLES.PROVIDER]),
    name: z.string().optional(),
    email: z.string().email('Invalid email!').optional(),
  }),
});

export const AuthValidation = {
  createVerifyEmailZodSchema,
  createForgetPasswordZodSchema,
  createLoginZodSchema,
  createResetPasswordZodSchema,
  createChangePasswordZodSchema,
  socialLoginZodSchema,
};
