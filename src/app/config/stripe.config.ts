import Stripe from 'stripe';
import config from '../../config';

const stripe = new Stripe(config.stripe.secret_key as string, {
  apiVersion: '2024-06-20' as any
});

export default stripe;
