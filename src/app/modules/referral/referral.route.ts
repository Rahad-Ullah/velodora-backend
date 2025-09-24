import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import {  ReferralController } from './referral.controller';
const router = express.Router();

router.get(
  '/referralCode',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  ReferralController.getReferralCode
);


export const ReferralRoutes = router;
