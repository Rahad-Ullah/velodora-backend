import Stripe from 'stripe';
import config from '../../config';

const stripe = new Stripe(config.stripe.secret_key as string, {
      //Before............
      // apiVersion: '2025-07-30.basil',

      //Now.................
      apiVersion: "2025-09-30.clover",
});

export default stripe;
