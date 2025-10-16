import { Request, Response } from 'express';
import stripe from '../app/config/stripe.config';
import config from '../config';
import Stripe from 'stripe';
import { BookingModel } from '../app/modules/booking/booking.model';
import { BOOKING_PAYMENT_STATUS } from '../enums/booking';



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

const handleStripeWebhook = async (req: Request, res: Response) => {
      console.log('req.body', req.body);
      const signature = req.headers['stripe-signature'];
      if (!signature) {
            return res.status(400).json({ error: 'Missing stripe-signature header' });
      }
      try {
            const event = stripe.webhooks.constructEvent(req.body, signature, config.stripe.webhook_secret as string);

            switch (event.type) {
                  case 'checkout.session.completed':
                        await handlePaymentSuccess(event.data.object as Stripe.Checkout.Session);
                        break;
                  default:
                        console.log(`Unhandled event type: ${event.type}`);
            }

            return res.status(200).json({ received: true });
      } catch (error) {
            console.error('Webhook error:', error);
            return res.status(400).json({ error: `Webhook error: ${(error as Error).message}` });
      }
};

export default handleStripeWebhook;


