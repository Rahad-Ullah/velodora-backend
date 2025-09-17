import { UserModel } from '../app/modules/user/user.model';
import config from '../config';
import { USER_ROLES } from '../enums/user';
import { logger } from '../shared/logger';
import colors from 'colors';

const payload = {
  name: 'Administrator',
  email: config.super_admin.email,
  role: USER_ROLES.SUPER_ADMIN,
  password: config.super_admin.password,
  location: 'Dhaka, Bangladesh',
  contact: '+8801821686470',
  verified: true,
};

export const createSuperAdmin = async () => {
  const isExistSuperAdmin = await UserModel.findOne({
    email: config.super_admin.email,
    role: USER_ROLES.SUPER_ADMIN,
  });
  if (!isExistSuperAdmin) {
    await UserModel.create(payload);
    logger.info(colors.green('🚀 Super Admin account created successfully'));
  }
};