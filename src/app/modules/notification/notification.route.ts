import express from 'express';
import { NotificationController } from './notification.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

// get my notifications
router.get('/',
  auth(USER_ROLES.USER, USER_ROLES.PROVIDER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  NotificationController.getMyNotification
);

// read my notifications
router.patch('/read',
  auth(USER_ROLES.USER, USER_ROLES.PROVIDER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  NotificationController.readMyNotifications
);

// get my notifications amount
router.get('/amount',
  auth(USER_ROLES.USER, USER_ROLES.PROVIDER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  NotificationController.getUserNotificationAmount
);

export const NotificationRoutes = router;