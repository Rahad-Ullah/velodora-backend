import express, { NextFunction, Request, Response } from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import { BookingController } from './booking.controller';
import { BookingValidation } from './booking.validation';
import validateRequest from '../../middlewares/validateRequest';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import { getSingleFilePath } from '../../../shared/getFilePath';
const router = express.Router();

router
  .route('/')
  .get(
    auth(USER_ROLES.USER, USER_ROLES.PROVIDER),
    BookingController.getBookings
  )
  .post(
    auth(USER_ROLES.USER),
    fileUploadHandler(),
    (req: Request, res: Response, next: NextFunction) => {
      const filePath = getSingleFilePath(req.files, 'image');

      const validatedResponse = BookingValidation.createBookingZodSchema.parse({
        data: JSON.parse(req.body.data),
        image: filePath,
      });

      req.body = { ...validatedResponse?.data, image: validatedResponse?.image };
      // console.log("After Parse Data : ", req.body);

      return BookingController.createBooking(req, res, next);
    }
  );



router.get('/delete-bookings',
  BookingController.autoDeletePendingBookings
)

router.get('/send-notification-for-pending-bookings',
  BookingController.sendNotificationsForPendingBookings
)

router.patch('/complete-booking/:id',
  auth(USER_ROLES.PROVIDER),
  BookingController.completeBooking
)

router.get('/overview',
  auth(USER_ROLES.PROVIDER),
  BookingController.getOverview
)

router.get('/order-history/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  BookingController.getBookingsByAdmin
)

router.get('/order-history-all',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  BookingController.getBookingsAllByAdmin
)

router.get('/order-history-all-download',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  BookingController.getBookingsDownload
)

router.post('/stripe-payment',
  BookingController.stripePayment
)

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



export const BookingRoutes = router;
