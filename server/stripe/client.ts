import Stripe from "stripe";
import { parseStripeServerEnv, type StripeServerEnv } from "../config/env.js";

let stripeClient: Stripe | undefined;

export function getStripeClient(env: StripeServerEnv = parseStripeServerEnv()): Stripe {
  stripeClient ??= new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: env.STRIPE_API_VERSION as Stripe.LatestApiVersion,
    typescript: true,
  });
  return stripeClient;
}
