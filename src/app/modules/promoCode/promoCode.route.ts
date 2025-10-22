import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import { PromoCodeController } from './promoCode.controller';
const router = express.Router();

router
  .route('/')
  .post(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    PromoCodeController.createPromoCode
  )
  .get(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    PromoCodeController.getPromoCodes
  );

router
  .route('/:code')
  .get(
    // auth(USER_ROLES.USER),
    PromoCodeController.getPromoCode
  );


export const PromoCodeRoutes = router;