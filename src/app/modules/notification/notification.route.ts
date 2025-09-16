import express from 'express';
import { NotificationController } from './notification.controller';
import auth from '../../middlewares/auth';

const router = express.Router();

// get my notifications
router.get('/', auth(), NotificationController.getMyNotification); 

// read my notifications
router.patch('/read', auth(), NotificationController.readMyNotifications);

export const NotificationRoutes = router;
