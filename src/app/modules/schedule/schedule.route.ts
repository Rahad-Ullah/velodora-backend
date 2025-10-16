import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import { ScheduleController } from './schedule.controller';
const router = express.Router();

router
  .route('/')
  .get(
    auth(USER_ROLES.PROVIDER, USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    ScheduleController.getSchedules
  )
  .post(
    auth(USER_ROLES.PROVIDER),
    ScheduleController.createSchedule
  );

router
  .route('/provider-schedule/:id')
  .get(
    // auth(USER_ROLES.USER),
    ScheduleController.getProviderSchedules
  )
  .patch(
    auth(USER_ROLES.PROVIDER),
    ScheduleController.openCloseSchedule
  )

router
  .route('/:id')
  .get(
    auth(USER_ROLES.PROVIDER, USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    ScheduleController.getSchedule
  )
  .patch(
    auth(USER_ROLES.PROVIDER),
    ScheduleController.openCloseSchedule
  )



export const ScheduleRoutes = router;
