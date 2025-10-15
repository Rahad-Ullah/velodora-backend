import { Request, Response } from 'express';
import stripe from '../app/config/stripe.config';
import config from '../config';
import Stripe from 'stripe';
import { Payment } from '../app/modules/payment/payment.model';
import { randomUUID } from 'crypto';
import { GiftCard } from '../app/modules/giftcard/gift-card.model';



const handlePaymentSuccess = async (session: Stripe.Checkout.Session) => {
      const { metadata } = session;

      if (metadata?.paymentType === 'giftCard') {
            const claimToken = randomUUID();
            await Payment.create({
                  // userId: metadata?.userId,
                  giftCardId: metadata?.giftCardId,
                  paymentIntentId: session.payment_intent as string,
                  amount: (session.amount_total! / 100) as number,
                  transactionId: session.id,
                  status: 'paid',
                  claimToken,
            });

            await GiftCard.findByIdAndUpdate(metadata?.giftCardId, {
                  $set: {
                        paymentStatus: 'paid',
                  },
            });
      }

      if (metadata?.paymentType === 'contribution') {
            const addedContributionAmount = await Payment.findOneAndUpdate(
                  {
                        giftCardId: metadata?.giftCardId,
                  },
                  {
                        $inc: {
                              totalContribution: metadata?.amount,
                        },
                        $push: {
                              contributors: {
                                    email: metadata?.contributorEmail,
                                    amount: metadata?.amount,
                              },
                        },
                  },
                  {
                        new: true,
                        upsert: true,
                  }
            );
      }

      return;
};
const handleStripeWebhook = async (req: Request, res: Response) => {
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


