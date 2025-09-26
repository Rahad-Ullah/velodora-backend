import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import { ScheduleController } from './schedule.controller';
const router = express.Router();

router
  .route('/')
  .get(
    auth(USER_ROLES.PROVIDER),
    ScheduleController.getSchedules
  )
  .post(
    auth(USER_ROLES.PROVIDER),
    ScheduleController.createSchedule
  );

router
  .route('/:id')
  .get(
    auth(USER_ROLES.PROVIDER),
    ScheduleController.getSchedule
  )
  .patch(
    auth(USER_ROLES.PROVIDER),
    ScheduleController.openCloseSchedule
  )



export const ScheduleRoutes = router;
