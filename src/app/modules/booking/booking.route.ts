import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import { BookingController } from './booking.controller';
import { BookingValidation } from './booking.validation';
import validateRequest from '../../middlewares/validateRequest';
const router = express.Router();

router
  .route('/')
  .post(
    auth(USER_ROLES.PROVIDER),
    validateRequest(BookingValidation.createBookingZodSchema),
    BookingController.createBooking
  );


export const BookingRoutes = router;
