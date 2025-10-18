import { Request, Response } from 'express';
import stripe from '../app/config/stripe.config';
import config from '../config';
import Stripe from 'stripe';
import { BookingModel } from '../app/modules/booking/booking.model';
import { BOOKING_PAYMENT_STATUS, BOOKING_STATUS } from '../enums/booking';
import ApiError from '../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import { ProviderModel } from '../app/modules/provider/provider.model';
import { ScheduleModel } from '../app/modules/schedule/schedule.model';



const handlePaymentSuccess = async (session: Stripe.Checkout.Session) => {
      const { metadata } = session;
      console.log('metadata', metadata);

      if (metadata?.paymentType === 'bookingPayment') {
            await BookingModel.findByIdAndUpdate(metadata?.bookingId, {
                  $set: { paymentStatus: BOOKING_PAYMENT_STATUS.PAID },
            });
      }

      return;
};

// Cancel Booking to db
const cancelBookingToDB = async (id: string) => {

      const booking = await BookingModel.findById(id);
      if (!booking) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'Auto Cancel - Booking not found');
      }

      if (booking.paymentStatus === BOOKING_PAYMENT_STATUS.PAID) {
            return;
      }

      const provider = await ProviderModel.findById(booking.provider);
      if (!provider) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'Auto Cancel - Provider not found');
      }

      const schedule = await ScheduleModel.findById(booking.schedule);
      if (!schedule) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'Auto Cancel - Schedule not found');
      }

      schedule.available_slots.push(...booking.slots);
      schedule.count = schedule.count - 1;
      await schedule.save();

      booking.status = BOOKING_STATUS.CANCELLED;
      await booking.save();
      throw new ApiError(StatusCodes.OK, 'Auto Cancel - Booking cancelled successfully');
}

const handleStripeWebhook = async (req: Request, res: Response) => {
      const payload = req.body;
      const signature = req.headers['stripe-signature'];
      // console.log('payload', payload);
      // console.log('signature', signature);

      if (!payload) {
            return res.status(400).json({ error: 'Missing payload' });
      }

      if (!signature) {
            return res.status(400).json({ error: 'Missing stripe-signature header' });
      }

      try {
            const event = stripe.webhooks.constructEvent(payload, signature, config.stripe.webhook_secret as string);
            console.log('event', event);

            switch (event.type) {
                  case 'checkout.session.completed':
                        await handlePaymentSuccess(event.data.object as Stripe.Checkout.Session);
                        break;
                  case 'payment_intent.succeeded':
                        const succeededIntent = event.data.object as Stripe.PaymentIntent;
                        console.log('✅ Payment succeeded:', succeededIntent.id);
                        console.log('Reason:', succeededIntent.last_payment_error?.message);
                        break;
                  case 'payment_intent.payment_failed':
                        const failedIntent = event.data.object as Stripe.PaymentIntent;
                        console.log('❌ Payment failed:', failedIntent.id);
                        console.log('Reason:', failedIntent.last_payment_error?.message);
                        // 👉 Update booking/payment status to "failed"
                        break;

                  case 'charge.failed':
                        const failedCharge = event.data.object as Stripe.Charge;
                        console.log('❌ Charge failed:', failedCharge.id);
                        console.log('Reason:', failedCharge.failure_message);
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