import express, { Request, Response } from 'express';
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
  // .get('/', settingsController.getSettings)
  .get('/:title', settingsController.getSpecipicSetting)
  .patch('/', settingsController.updateSetting);

export const settingsRouter = router;
