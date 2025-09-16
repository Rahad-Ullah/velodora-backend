import express from 'express';
import { MessageController } from './message.controller';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { MessageValidations } from './message.validation';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

// create message
router.post(
  '/create',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.USER, USER_ROLES.PROVIDER),
  fileUploadHandler(),
  validateRequest(MessageValidations.createMessageZodSchema),
  MessageController.createMessage
); 

// get chat messages
router.get(
  '/:id',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.USER, USER_ROLES.PROVIDER),
  MessageController.getChatMessages
);

export const MessageRoutes = router;
