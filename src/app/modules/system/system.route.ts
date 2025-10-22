import express from 'express';
import { SystemController } from './system.controller';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
const router = express.Router();

router
  .route('/')
  .get(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.USER, USER_ROLES.PROVIDER),
    SystemController.getSystem
  )
  .post(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    SystemController.createSystem
  )
  .patch(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    SystemController.updateSystem
  )

router
  .route('/:type')
  .patch(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    SystemController.onOffSystem
  )


export const SystemRoutes = router;