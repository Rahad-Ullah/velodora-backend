import Stripe from "stripe";
import { UserModel } from "../app/modules/user/user.model";
import { USER_ROLES } from "../enums/user";
import { BookingModel } from "../app/modules/booking/booking.model";
import ApiError from "../errors/ApiError";
import { BOOKING_PAYMENT_STATUS, BOOKING_STATUS } from "../enums/booking";
import { StatusCodes } from "http-status-codes";
import { sendNotifications } from "../helpers/notificationHelper";
import { NOTIFICATION_TYPE } from "../app/modules/notification/notification.constants";



export const handlePaymentSuccess = async (session: Stripe.Checkout.Session) => {
  console.log("Payment Successful...........handlePaymentSuccess")

  const superAdmin = await UserModel.findOne({ role: USER_ROLES.SUPER_ADMIN });

  const { metadata } = session;
  const bookingId = metadata?.bookingId;
  const isExistBooking = await BookingModel.findById(bookingId);
  if (!isExistBooking) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'After payment - Booking not found');
  } else if (isExistBooking.status === BOOKING_STATUS.AUTO_CANCELLED) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'After payment - You take more than 5 minutes to complete the payment. Please contact with support team.');
  } else if (isExistBooking.status !== BOOKING_STATUS.PENDING) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'After payment - Booking status is not pending');
  }

  if (metadata?.paymentType === 'bookingPayment') {
    const booking = await BookingModel.findByIdAndUpdate(metadata?.bookingId, {
      $set: { paymentStatus: BOOKING_PAYMENT_STATUS.PAID },
    });
    sendNotifications({
      type: NOTIFICATION_TYPE.PAYMENT,
      title: 'Booking Payment Successful',
      receiver: superAdmin!._id,
      referenceId: booking!.user,
    })
  }

  return;
};