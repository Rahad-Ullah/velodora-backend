import Stripe from 'stripe';
import config from '../../config';

const stripe = new Stripe(config.stripe.secret_key as string, {
  apiVersion: "2022-11-15" as any
});

export default stripe;
