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
  .patch(
    // auth(USER_ROLES.PROVIDER),
    BookingController.acceptBooking
  )
  .delete(
    auth(USER_ROLES.USER, USER_ROLES.PROVIDER),
    BookingController.cancelBooking
  )

// router
//   .route('/provider/:id')
//   .patch(
//     // auth(USER_ROLES.PROVIDER),
//     BookingController.acceptBooking
//   )
//   .delete(
//     auth(USER_ROLES.USER, USER_ROLES.PROVIDER),
//     BookingController.cancelBooking
//   )


export const BookingRoutes = router;
