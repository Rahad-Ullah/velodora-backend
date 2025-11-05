import { Request, Response } from 'express';
import stripe from '../app/config/stripe.config';
import config from '../config';
import Stripe from 'stripe';
import { handleStripeConnectedAccount } from '../handlers/handleStripeConnectedAccount';


const handleWithdrawStripeWebhook = async (req: Request, res: Response) => {
      console.log("Withdraw ---- Webhook called ------------------------------------------------ It's working");
      const payload = req.body;
      const signature = req.headers['stripe-signature'];

      if (!payload) {
            return res.status(400).json({ error: 'Missing payload' });
      }

      if (!signature) {
            return res.status(400).json({ error: 'Missing stripe-signature header' });
      }

      try {
            const event = stripe.webhooks.constructEvent(payload, signature, config.stripe.webhook_secret_withdraw as string);

            switch (event.type) {
                  case 'charge.failed':
                        const failedCharge = event.data.object as Stripe.Charge;
                        console.log('❌ Charge failed:', failedCharge.id);
                        break;
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


export default handleWithdrawStripeWebhook;