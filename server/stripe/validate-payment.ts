import type Stripe from "stripe";
import { requestIdSchema } from "../validation/identifiers.js";

export interface ExpectedPayment {
  productId: string;
  priceId: string;
  amountJpy: number;
  livemode: boolean;
}

export interface ValidatedPayment {
  reportRequestId: string;
  checkoutSessionId: string;
  paymentIntentId: string;
  productId: string;
  priceId: string;
  amount: number;
  currency: "jpy";
  livemode: boolean;
  paidAt: Date;
}

export class PaymentValidationError extends Error {
  constructor(readonly code: string) {
    super(code);
    this.name = "PaymentValidationError";
  }
}

function referenceId(value: string | { id: string } | null): string | null {
  return typeof value === "string" ? value : value?.id ?? null;
}

export function validatePaidCheckoutSession(
  session: Stripe.Checkout.Session,
  expected: ExpectedPayment,
): ValidatedPayment {
  if (session.livemode !== expected.livemode) {
    throw new PaymentValidationError("livemode_mismatch");
  }
  if (session.mode !== "payment") throw new PaymentValidationError("invalid_checkout_mode");
  if (session.payment_status !== "paid") throw new PaymentValidationError("session_unpaid");
  if (session.status !== "complete") throw new PaymentValidationError("session_incomplete");
  if (session.amount_total !== expected.amountJpy) {
    throw new PaymentValidationError("incorrect_amount");
  }
  if (session.currency?.toLowerCase() !== "jpy") {
    throw new PaymentValidationError("incorrect_currency");
  }

  const requestId = requestIdSchema.safeParse(session.metadata?.report_request_id);
  if (!requestId.success) throw new PaymentValidationError("invalid_report_request_id");
  if (session.client_reference_id && session.client_reference_id !== requestId.data) {
    throw new PaymentValidationError("report_request_mismatch");
  }

  const items = session.line_items?.data ?? [];
  if (items.length !== 1 || items[0].quantity !== 1 || !items[0].price) {
    throw new PaymentValidationError("invalid_line_items");
  }
  const price = items[0].price;
  if (price.id !== expected.priceId) throw new PaymentValidationError("incorrect_price");
  if (referenceId(price.product) !== expected.productId) {
    throw new PaymentValidationError("incorrect_product");
  }
  if (price.unit_amount !== expected.amountJpy) {
    throw new PaymentValidationError("incorrect_amount");
  }
  if (price.currency.toLowerCase() !== "jpy") {
    throw new PaymentValidationError("incorrect_currency");
  }

  const paymentIntentId = referenceId(session.payment_intent);
  if (!paymentIntentId) throw new PaymentValidationError("missing_payment_intent");
  return {
    reportRequestId: requestId.data,
    checkoutSessionId: session.id,
    paymentIntentId,
    productId: expected.productId,
    priceId: expected.priceId,
    amount: expected.amountJpy,
    currency: "jpy",
    livemode: session.livemode,
    paidAt: new Date((session.created || Math.floor(Date.now() / 1000)) * 1000),
  };
}
