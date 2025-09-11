import express from 'express';
import { settingsController } from './settings.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

router
  .post(
    '/',
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    settingsController.addSetting,
  )
  .get('/:title', settingsController.getSettings)
  .patch('/',
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    settingsController.updateSetting
  );

export const settingsRouter = router;
