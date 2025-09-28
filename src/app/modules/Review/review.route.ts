import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { ReviewController } from './review.controller';
import { ReviewValidation } from './review.validation';
const router = express.Router();

router
  .route('/')
  .post(
    auth(USER_ROLES.USER),
    validateRequest(ReviewValidation.reviewZodSchema),
    ReviewController.createReview
  )
  .get(
    auth(USER_ROLES.PROVIDER),
    ReviewController.getMyReviews
  );

router
  .route('/:id')
  .get(
    auth(USER_ROLES.USER, USER_ROLES.PROVIDER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    ReviewController.getProviderReviews
  );


export const ReviewRoutes = router;