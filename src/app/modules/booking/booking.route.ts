import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import { BookingController } from './booking.controller';
import { BookingValidation } from './booking.validation';
import validateRequest from '../../middlewares/validateRequest';
const router = express.Router();

router
  .route('/')
  .get(
    auth(USER_ROLES.USER, USER_ROLES.PROVIDER),
    BookingController.getBookings
  )
  .post(
    auth(USER_ROLES.USER),
    validateRequest(BookingValidation.createBookingZodSchema),
    BookingController.createBooking
  );

router
  .route('/:id')
  .get(
    auth(USER_ROLES.USER, USER_ROLES.PROVIDER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    BookingController.getBooking
  )
  .patch(
    auth(USER_ROLES.PROVIDER),
    BookingController.acceptBooking
  )
  .delete(
    auth(USER_ROLES.USER, USER_ROLES.PROVIDER),
    BookingController.cancelBooking
  );

router.patch('/complete-booking/:id',
  auth(USER_ROLES.USER),
  BookingController.completeBooking
)


export const BookingRoutes = router;
