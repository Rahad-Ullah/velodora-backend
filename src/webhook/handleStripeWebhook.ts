import { Request, Response } from 'express';
import stripe from '../app/config/stripe.config';
import config from '../config';
import Stripe from 'stripe';
import { BookingModel } from '../app/modules/booking/booking.model';
import { BOOKING_PAYMENT_STATUS, BOOKING_STATUS } from '../enums/booking';
import ApiError from '../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import { UserModel } from '../app/modules/user/user.model';
import { USER_ROLES } from '../enums/user';
import { sendNotifications } from '../helpers/notificationHelper';
import { NOTIFICATION_TYPE } from '../app/modules/notification/notification.constants';
import { handleStripeConnectedAccount } from '../handlers/handleStripeConnectedAccount';



const handlePaymentSuccess = async (session: Stripe.Checkout.Session) => {

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

const handleStripeWebhook = async (req: Request, res: Response) => {
      console.log("Webhook called------------------------------------------------It's working");
      const payload = req.body;
      const signature = req.headers['stripe-signature'];

      if (!payload) {
            return res.status(400).json({ error: 'Missing payload' });
      }

      if (!signature) {
            return res.status(400).json({ error: 'Missing stripe-signature header' });
      }

      try {
            const event = stripe.webhooks.constructEvent(payload, signature, config.stripe.webhook_secret as string);

            switch (event.type) {
                  case 'checkout.session.completed':
                        await handlePaymentSuccess(event.data.object as Stripe.Checkout.Session);
                        break;
                  case 'payment_intent.succeeded':
                        const succeededIntent = event.data.object as Stripe.PaymentIntent;
                        console.log('✅ Payment succeeded:', succeededIntent.id);
                        break;
                  case 'payment_intent.payment_failed':
                        const failedIntent = event.data.object as Stripe.PaymentIntent;
                        console.log('❌ Payment failed:', failedIntent.id);
                        break;
                  case 'charge.failed':
                        const failedCharge = event.data.object as Stripe.Charge;
                        console.log('❌ Charge failed:', failedCharge.id);
                        break;
                  case 'account.updated':
                        const updatedAccount = event.data.object as Stripe.Account;
                        await handleStripeConnectedAccount(updatedAccount);
                        break;
                  case 'checkout.session.async_payment_failed':
                        console.log('❌ Async Payment Failed:', event.data.object.id);
                        break;
                  default:
                        console.log(`⚠️ Unhandled event type: ${event.type}`);
            }

            return res.status(200).json({ received: true });
      } catch (error) {
            console.error('Webhook error:', error);
            return res.status(400).json({ error: `Webhook error: ${(error as Error).message}` });
      }
};


export default handleStripeWebhook;