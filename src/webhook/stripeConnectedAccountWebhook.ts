import { Request, Response } from 'express';
import stripe from '../app/config/stripe.config';
import config from '../config';
import Stripe from 'stripe';
import { handleStripeConnectedAccount } from '../handlers/handleStripeConnectedAccount';


const stripeConnectedAccountWebhook = async (req: Request, res: Response) => {
      console.log("Stripe connected account webhook called ------------------------------------------------ It's working");
      const payload = req.body;
      const signature = req.headers['stripe-signature'];

      if (!payload) {
            return res.status(400).json({ error: 'Missing connected account payload' });
      }

      if (!signature) {
            return res.status(400).json({ error: 'Missing connected account stripe signature header' });
      }

      try {
            const event = stripe.webhooks.constructEvent(payload, signature, config.stripe.webhook_secret_withdraw as string);
            const eventType: string = event.type;

            switch (eventType) {
                  case 'account.updated':
                        const updatedAccount = event.data.object as Stripe.Account;
                        await handleStripeConnectedAccount(updatedAccount);
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


export default stripeConnectedAccountWebhook;