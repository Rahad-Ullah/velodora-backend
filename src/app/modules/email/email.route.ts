import express from 'express';
import { EmailController } from './email.controller';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
const router = express.Router();

router
  .route('/send-email')
  .post(
    // auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    EmailController.SendEmail
  )


export const EmailRoutes = router;