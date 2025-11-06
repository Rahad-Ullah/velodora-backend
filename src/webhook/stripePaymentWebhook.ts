import { Request, Response } from 'express';
import stripe from '../app/config/stripe.config';
import config from '../config';
import Stripe from 'stripe';
import { handleStripeConnectedAccount } from '../handlers/handleStripeConnectedAccount';
import { handlePaymentSuccess } from '../handlers/handlePaymentSuccess';


const stripePaymentWebhook = async (req: Request, res: Response) => {
      console.log("Stripe Payment Webhook called------------------------------------------------It's working");
      const payload = req.body;
      const signature = req.headers['stripe-signature'];

      if (!payload) {
            return res.status(400).json({ error: 'Missing stripe payment payload' });
      }

      if (!signature) {
            return res.status(400).json({ error: 'Missing payment stripe-signature header' });
      }

      try {
            const event = stripe.webhooks.constructEvent(payload, signature, config.stripe.webhook_secret_payment as string);

            switch (event.type) {
                  case 'checkout.session.completed':
                        await handlePaymentSuccess(event.data.object as Stripe.Checkout.Session);
                        break;
                  case 'checkout.session.expired':
                        const expiredSession = event.data.object as Stripe.Checkout.Session;
                        console.log('⚠️ Expired session:', expiredSession.id);
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


export default stripePaymentWebhook;