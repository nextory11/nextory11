import { createHash } from "node:crypto";
import type Stripe from "stripe";
import { parseStripeServerEnv, type StripeServerEnv } from "../config/env.js";
import { ReportRequestsRepository } from "../db/repositories/report-requests.js";
import { requestIdSchema } from "../validation/identifiers.js";
import { getStripeClient } from "./client.js";

export class CheckoutRequestError extends Error {
  constructor(readonly code: string, readonly statusCode: number) {
    super(code);
    this.name = "CheckoutRequestError";
  }
}

export interface CheckoutRequestReader {
  findByIdForCheckout(id: string): Promise<{
    id: string;
    paymentStatus: string;
    generationStatus: string;
    expiresAt: Date | null;
    retentionDeleteAt: Date;
  } | null>;
}

export async function createCheckoutSession(
  reportRequestId: string,
  options: {
    repository?: CheckoutRequestReader;
    stripe?: Pick<Stripe, "checkout">;
    env?: StripeServerEnv;
    now?: Date;
  } = {},
) {
  const parsedId = requestIdSchema.safeParse(reportRequestId);
  if (!parsedId.success) throw new CheckoutRequestError("invalid_request_id", 400);

  const env = options.env ?? parseStripeServerEnv();
  const repository = options.repository ?? new ReportRequestsRepository();
  const record = await repository.findByIdForCheckout(parsedId.data);
  if (!record) throw new CheckoutRequestError("report_request_not_found", 404);

  const now = options.now ?? new Date();
  if (
    (record.expiresAt && record.expiresAt <= now) ||
    record.retentionDeleteAt <= now
  ) {
    throw new CheckoutRequestError("report_request_expired", 410);
  }
  if (record.paymentStatus === "paid") {
    throw new CheckoutRequestError("report_request_already_paid", 409);
  }
  if (record.paymentStatus !== "awaiting_payment" || record.generationStatus !== "blocked") {
    throw new CheckoutRequestError("report_request_not_payable", 409);
  }

  const stripe = options.stripe ?? getStripeClient(env);
  const baseUrl = new URL(env.REPORT_BASE_URL);
  const idempotencyKey = `nextory11-checkout-${createHash("sha256")
    .update(record.id)
    .digest("hex")}`;
  const session = await stripe.checkout.sessions.create(
    {
      mode: "payment",
      line_items: [{ price: env.STRIPE_EXPECTED_PRICE_ID, quantity: 1 }],
      metadata: { report_request_id: record.id },
      payment_intent_data: { metadata: { report_request_id: record.id } },
      success_url: new URL("/payment-success", baseUrl).toString(),
      cancel_url: new URL("/payment-cancel", baseUrl).toString(),
      client_reference_id: record.id,
    },
    { idempotencyKey },
  );

  if (!session.url || session.livemode) {
    throw new CheckoutRequestError("stripe_test_session_unavailable", 502);
  }
  return { checkoutUrl: session.url, checkoutSessionId: session.id, requestId: record.id };
}
