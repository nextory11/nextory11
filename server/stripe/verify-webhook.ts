import type Stripe from "stripe";
import { parseStripeServerEnv } from "../config/env.js";
import { getStripeClient } from "./client.js";

export const STRIPE_WEBHOOK_TOLERANCE_SECONDS = 300;

export class WebhookVerificationError extends Error {
  constructor() {
    super("invalid_webhook_signature");
    this.name = "WebhookVerificationError";
  }
}

export function verifyStripeWebhook(
  rawBody: Buffer,
  signature: string,
  options: {
    stripe?: Pick<Stripe, "webhooks">;
    webhookSecret?: string;
    toleranceSeconds?: number;
  } = {},
): Stripe.Event {
  try {
    const secret = options.webhookSecret ?? parseStripeServerEnv().STRIPE_WEBHOOK_SECRET;
    const stripe = options.stripe ?? getStripeClient();
    return stripe.webhooks.constructEvent(
      rawBody,
      signature,
      secret,
      options.toleranceSeconds ?? STRIPE_WEBHOOK_TOLERANCE_SECONDS,
    );
  } catch {
    throw new WebhookVerificationError();
  }
}
