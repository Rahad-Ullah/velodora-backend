import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { ContactSupportController } from './contactSupport.controller';
import { ContactSupportValidation } from './contactSupport.validation';
const router = express.Router();

router
  .route('/')
  .get(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    ContactSupportController.getContactSupports
  )
  .post(
    auth(USER_ROLES.PROVIDER),
    validateRequest(ContactSupportValidation.createContactSupportZodSchema),
    ContactSupportController.createContactSupport
  );

router
.route('/:id')
  .get(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    ContactSupportController.getContactSupport
  )
  .patch(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    validateRequest(ContactSupportValidation.updateContactSupportZodSchema),
    ContactSupportController.updateContactSupport
  );


export const ContactSupportRoutes = router;