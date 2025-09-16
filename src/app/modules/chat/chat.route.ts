import express from 'express';
import { ChatController } from './chat.controller';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { ChatValidations } from './chat.validation';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

// create chat
router.post(
  '/create',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.USER, USER_ROLES.PROVIDER),
  validateRequest(ChatValidations.createChatZodSchema),
  ChatController.createChat
);

// delete chat
router.delete(
  '/:id',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.USER, USER_ROLES.PROVIDER),
  ChatController.deleteChat
);

// get my chats
router.get(
  '/my-chats',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.USER, USER_ROLES.PROVIDER),
  ChatController.getMyChats
);

export const ChatRoutes = router;
