import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import { ServiceController } from './service.controller';
const router = express.Router();

router
  .route('/')
  .get(ServiceController.getServices)
  .post(
    ServiceController.createService,
  );


router
  .route('/:id')
  .get(ServiceController.getService)
  .delete(
    ServiceController.deleteService
  )
  .patch(
    ServiceController.updateService
  );


export const ServiceRoutes = router;
