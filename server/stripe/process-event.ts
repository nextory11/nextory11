import { eq } from "drizzle-orm";
import type Stripe from "stripe";
import { parseStripeServerEnv, type StripeServerEnv } from "../config/env.js";
import { getDatabase, type Database } from "../db/client.js";
import { entitlements, payments, reportRequests, stripeEvents } from "../db/schema.js";
import { getStripeClient } from "./client.js";
import {
  validatePaidCheckoutSession,
  type ExpectedPayment,
  type ValidatedPayment,
} from "./validate-payment.js";

const SUPPORTED_EVENTS = new Set([
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
]);

export class EventProcessingError extends Error {
  constructor(readonly code: string, readonly statusCode = 400) {
    super(code);
    this.name = "EventProcessingError";
  }
}

export interface PaymentEventStore {
  applyPaidEvent(input: {
    eventId: string;
    eventType: string;
    objectId: string;
    payment: ValidatedPayment;
  }): Promise<"processed" | "duplicate">;
}

export class DatabasePaymentEventStore implements PaymentEventStore {
  constructor(private readonly db: Database = getDatabase(), private readonly now = () => new Date()) {}

  async applyPaidEvent(input: {
    eventId: string;
    eventType: string;
    objectId: string;
    payment: ValidatedPayment;
  }): Promise<"processed" | "duplicate"> {
    return this.db.transaction(async (tx) => {
      const [event] = await tx
        .insert(stripeEvents)
        .values({
          eventId: input.eventId,
          eventType: input.eventType,
          objectId: input.objectId,
          livemode: false,
        })
        .onConflictDoNothing({ target: stripeEvents.eventId })
        .returning();
      if (!event) return "duplicate";

      const [request] = await tx
        .select({
          id: reportRequests.id,
          paymentStatus: reportRequests.paymentStatus,
          generationStatus: reportRequests.generationStatus,
          expiresAt: reportRequests.expiresAt,
          retentionDeleteAt: reportRequests.retentionDeleteAt,
        })
        .from(reportRequests)
        .where(eq(reportRequests.id, input.payment.reportRequestId))
        .limit(1);
      if (!request) throw new EventProcessingError("report_request_not_found", 404);
      const now = this.now();
      if ((request.expiresAt && request.expiresAt <= now) || request.retentionDeleteAt <= now) {
        throw new EventProcessingError("report_request_expired", 410);
      }
      if (request.paymentStatus !== "awaiting_payment" || request.generationStatus !== "blocked") {
        throw new EventProcessingError("report_request_not_payable", 409);
      }

      const [checkoutDuplicate] = await tx
        .select({ id: payments.id })
        .from(payments)
        .where(eq(payments.checkoutSessionId, input.payment.checkoutSessionId))
        .limit(1);
      if (checkoutDuplicate) throw new EventProcessingError("duplicate_checkout_session", 409);
      const [intentDuplicate] = await tx
        .select({ id: payments.id })
        .from(payments)
        .where(eq(payments.paymentIntentId, input.payment.paymentIntentId))
        .limit(1);
      if (intentDuplicate) throw new EventProcessingError("duplicate_payment_intent", 409);

      const [payment] = await tx
        .insert(payments)
        .values({
          reportRequestId: input.payment.reportRequestId,
          checkoutSessionId: input.payment.checkoutSessionId,
          paymentIntentId: input.payment.paymentIntentId,
          productId: input.payment.productId,
          priceId: input.payment.priceId,
          amount: input.payment.amount,
          currency: input.payment.currency,
          livemode: false,
          status: "paid",
          paidAt: input.payment.paidAt,
        })
        .returning();
      await tx.insert(entitlements).values({
        reportRequestId: input.payment.reportRequestId,
        paymentId: payment.id,
        status: "active",
      });
      await tx
        .update(reportRequests)
        .set({ paymentStatus: "paid", generationStatus: "queued", updatedAt: now })
        .where(eq(reportRequests.id, input.payment.reportRequestId));
      await tx
        .update(stripeEvents)
        .set({ status: "processed", processedAt: now })
        .where(eq(stripeEvents.eventId, input.eventId));
      return "processed";
    });
  }
}

export async function processStripeEvent(
  event: Stripe.Event,
  options: {
    stripe?: Pick<Stripe, "checkout">;
    store?: PaymentEventStore;
    env?: StripeServerEnv;
    expected?: ExpectedPayment;
  } = {},
) {
  if (event.livemode) throw new EventProcessingError("livemode_mismatch");
  if (!SUPPORTED_EVENTS.has(event.type)) return { status: "ignored" as const };
  if (event.data.object.object !== "checkout.session") {
    throw new EventProcessingError("invalid_event_object");
  }

  const env = options.env ?? parseStripeServerEnv();
  const stripe = options.stripe ?? getStripeClient(env);
  const session = await stripe.checkout.sessions.retrieve(event.data.object.id, {
    expand: ["line_items.data.price.product"],
  });
  const validatedPayment = validatePaidCheckoutSession(
    session,
    options.expected ?? {
      productId: env.STRIPE_EXPECTED_PRODUCT_ID,
      priceId: env.STRIPE_EXPECTED_PRICE_ID,
      amountJpy: env.STRIPE_EXPECTED_AMOUNT_JPY,
    },
  );
  const payment = { ...validatedPayment, paidAt: new Date(event.created * 1000) };
  const result = await (options.store ?? new DatabasePaymentEventStore()).applyPaidEvent({
    eventId: event.id,
    eventType: event.type,
    objectId: session.id,
    payment,
  });
  return { status: result };
}
