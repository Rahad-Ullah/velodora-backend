import { Request, Response } from 'express';
import stripe from '../app/config/stripe.config';
import config from '../config';
import Stripe from 'stripe';
import { handleStripeConnectedAccount } from '../handlers/handleStripeConnectedAccount';
import { handlePaymentSuccess } from '../handlers/handlePaymentSuccess';


const handlePaymentStripeWebhook = async (req: Request, res: Response) => {
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
            const event = stripe.webhooks.constructEvent(payload, signature, config.stripe.webhook_secret_payment as string);

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


export default handlePaymentStripeWebhook;