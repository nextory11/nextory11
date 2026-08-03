import { readFile } from "node:fs/promises";
import { Readable } from "node:stream";
import Stripe from "stripe";
import { describe, expect, it, vi } from "vitest";
import { checkoutRequestBodySchema } from "../../api/checkout-sessions.js";
import { toSafeReportStatus } from "../../api/reports/[requestId]/status.js";
import { readRawBody } from "../../api/stripe/webhook.js";
import {
  parseStripeServerEnv,
  type StripeServerEnv,
} from "../../server/config/env.js";
import {
  createCheckoutSession,
} from "../../server/stripe/create-checkout-session.js";
import { continueAuthorizedCheckout } from "../../server/stripe/continue-checkout.js";
import {
  EventProcessingError,
  processStripeEvent,
  type PaymentEventStore,
} from "../../server/stripe/process-event.js";
import {
  PaymentValidationError,
  validatePaidCheckoutSession,
  type ValidatedPayment,
} from "../../server/stripe/validate-payment.js";
import {
  verifyStripeWebhook,
  WebhookVerificationError,
} from "../../server/stripe/verify-webhook.js";

const requestId = "11111111-1111-4111-8111-111111111111";
const env = {
  DATABASE_URL: "postgresql://test:test@example.invalid/test",
  STRIPE_MODE: "test",
  STRIPE_SECRET_KEY: "sk_test_synthetic",
  STRIPE_WEBHOOK_SECRET: "whsec_synthetic",
  STRIPE_EXPECTED_PRODUCT_ID: "prod_expected",
  STRIPE_EXPECTED_PRICE_ID: "price_expected",
  STRIPE_EXPECTED_AMOUNT_JPY: 980,
  STRIPE_API_VERSION: "2026-06-30.basil",
  REPORT_BASE_URL: "http://localhost:5173",
} as StripeServerEnv;
const expected = {
  productId: "prod_expected",
  priceId: "price_expected",
  amountJpy: 980,
  livemode: false,
};

const stripeEnvInput = {
  DATABASE_URL: "postgresql://test:test@example.invalid/test",
  STRIPE_SECRET_KEY: "sk_test_synthetic",
  STRIPE_WEBHOOK_SECRET: "whsec_synthetic",
  STRIPE_EXPECTED_PRODUCT_ID: "prod_expected",
  STRIPE_EXPECTED_PRICE_ID: "price_expected",
  STRIPE_EXPECTED_AMOUNT_JPY: "980",
  STRIPE_API_VERSION: "2026-06-30.basil",
  REPORT_BASE_URL: "http://localhost:5173",
};

describe("Stripe environment safety", () => {
  it("fails closed when mode is absent or unsupported", () => {
    expect(() => parseStripeServerEnv(stripeEnvInput)).toThrow();
    expect(() => parseStripeServerEnv({ ...stripeEnvInput, STRIPE_MODE: "preview" })).toThrow();
  });

  it("accepts valid Test and Live configuration", () => {
    expect(parseStripeServerEnv({ ...stripeEnvInput, STRIPE_MODE: "test" }).STRIPE_MODE).toBe("test");
    expect(parseStripeServerEnv({
      ...stripeEnvInput,
      STRIPE_MODE: "live",
      STRIPE_SECRET_KEY: "sk_live_synthetic",
    }).STRIPE_MODE).toBe("live");
  });

  it("rejects a test key in live mode", () => {
    expect(() => parseStripeServerEnv({ ...stripeEnvInput, STRIPE_MODE: "live" })).toThrow();
  });

  it("rejects a live key in test mode", () => {
    expect(() => parseStripeServerEnv({
      ...stripeEnvInput,
      STRIPE_MODE: "test",
      STRIPE_SECRET_KEY: "sk_live_synthetic",
    })).toThrow();
  });
});

function checkoutRecord(overrides = {}) {
  return {
    id: requestId,
    paymentStatus: "awaiting_payment",
    generationStatus: "blocked",
    expiresAt: new Date("2030-01-01T00:00:00Z"),
    retentionDeleteAt: new Date("2030-02-01T00:00:00Z"),
    ...overrides,
  };
}

function session(overrides: Record<string, unknown> = {}): Stripe.Checkout.Session {
  return {
    id: "cs_test_synthetic",
    object: "checkout.session",
    livemode: false,
    mode: "payment",
    payment_status: "paid",
    status: "complete",
    amount_total: 980,
    currency: "jpy",
    created: 1_800_000_000,
    client_reference_id: requestId,
    metadata: { report_request_id: requestId },
    payment_intent: "pi_synthetic",
    line_items: {
      object: "list",
      data: [{
        id: "li_synthetic",
        object: "item",
        quantity: 1,
        price: {
          id: "price_expected",
          object: "price",
          active: true,
          billing_scheme: "per_unit",
          created: 1,
          currency: "jpy",
          custom_unit_amount: null,
          livemode: false,
          lookup_key: null,
          metadata: {},
          nickname: null,
          product: "prod_expected",
          recurring: null,
          tax_behavior: "unspecified",
          tiers_mode: null,
          transform_quantity: null,
          type: "one_time",
          unit_amount: 980,
          unit_amount_decimal: "980",
        },
      } as unknown as Stripe.LineItem],
      has_more: false,
      url: "/synthetic",
    },
    ...overrides,
  } as unknown as Stripe.Checkout.Session;
}

function event(sessionObject = session(), overrides: Record<string, unknown> = {}): Stripe.Event {
  return {
    id: "evt_synthetic",
    object: "event",
    api_version: env.STRIPE_API_VERSION,
    created: 1_800_000_000,
    data: { object: sessionObject },
    livemode: false,
    pending_webhooks: 1,
    request: null,
    type: "checkout.session.completed",
    ...overrides,
  } as Stripe.Event;
}

class SyntheticStore implements PaymentEventStore {
  events = new Set<string>();
  sessions = new Set<string>();
  intents = new Set<string>();
  entitlements = new Set<string>();

  async applyPaidEvent(input: {
    eventId: string;
    eventType: string;
    objectId: string;
    payment: ValidatedPayment;
  }): Promise<"processed" | "duplicate"> {
    if (this.events.has(input.eventId)) return "duplicate";
    if (this.sessions.has(input.payment.checkoutSessionId)) {
      throw new EventProcessingError("duplicate_checkout_session", 409);
    }
    if (this.intents.has(input.payment.paymentIntentId)) {
      throw new EventProcessingError("duplicate_payment_intent", 409);
    }
    if (this.entitlements.has(input.payment.reportRequestId)) {
      throw new EventProcessingError("report_request_not_payable", 409);
    }
    this.events.add(input.eventId);
    this.sessions.add(input.payment.checkoutSessionId);
    this.intents.add(input.payment.paymentIntentId);
    this.entitlements.add(input.payment.reportRequestId);
    return "processed";
  }
}

function stripeWithSession(value: Stripe.Checkout.Session) {
  return {
    checkout: { sessions: { retrieve: vi.fn().mockResolvedValue(value) } },
  } as unknown as Pick<Stripe, "checkout">;
}

describe("Phase B Checkout Session creation", () => {
  it("creates a test Checkout Session from server-owned configuration", async () => {
    const create = vi.fn().mockResolvedValue({
      id: "cs_test_created",
      url: "https://checkout.stripe.com/c/pay/cs_test_created",
      livemode: false,
    });
    const result = await createCheckoutSession(requestId, {
      env,
      now: new Date("2029-01-01T00:00:00Z"),
      repository: { findByIdForCheckout: vi.fn().mockResolvedValue(checkoutRecord()) },
      stripe: { checkout: { sessions: { create } } } as unknown as Pick<Stripe, "checkout">,
    });
    expect(result).toMatchObject({ requestId, checkoutSessionId: "cs_test_created" });
    expect(create.mock.calls[0][0]).toMatchObject({
      mode: "payment",
      branding_settings: { display_name: "NEXTORY11" },
      line_items: [{ price: "price_expected", quantity: 1 }],
      metadata: { report_request_id: requestId },
      success_url: "http://localhost:5173/payment-success?session_id={CHECKOUT_SESSION_ID}",
    });
    expect(create.mock.calls[0][1].idempotencyKey).toMatch(/^nextory11-checkout-[a-f0-9]{64}$/u);
  });

  it("rejects unknown and already-paid requests", async () => {
    await expect(createCheckoutSession(requestId, {
      env,
      repository: { findByIdForCheckout: vi.fn().mockResolvedValue(null) },
    })).rejects.toMatchObject({ code: "report_request_not_found" });
    await expect(createCheckoutSession(requestId, {
      env,
      repository: { findByIdForCheckout: vi.fn().mockResolvedValue(checkoutRecord({ paymentStatus: "paid" })) },
    })).rejects.toMatchObject({ code: "report_request_already_paid" });
  });

  it("rejects client amount, currency, product, or price fields", () => {
    expect(checkoutRequestBodySchema.safeParse({ reportRequestId: requestId, amount: 1 }).success).toBe(false);
    expect(checkoutRequestBodySchema.safeParse({ reportRequestId: requestId, currency: "usd" }).success).toBe(false);
    expect(checkoutRequestBodySchema.safeParse({ reportRequestId: requestId, product: "prod_evil" }).success).toBe(false);
    expect(checkoutRequestBodySchema.safeParse({ reportRequestId: requestId, price: "price_evil" }).success).toBe(false);
  });
});

describe("authorized existing-request Checkout continuation", () => {
  const request = { method: "POST", headers: {}, body: {}, query: {} };

  it("creates only an authorized Test Mode Session", async () => {
    const create = vi.fn().mockResolvedValue({
      id: "cs_test_existing",
      url: "https://checkout.stripe.com/c/pay/cs_test_existing",
      livemode: false,
    });
    const result = await continueAuthorizedCheckout(request, requestId, {
      env,
      authorize: vi.fn().mockResolvedValue(true),
      repository: { findByIdForCheckout: vi.fn().mockResolvedValue(checkoutRecord()) },
      stripe: { checkout: { sessions: { create } } } as unknown as Pick<Stripe, "checkout">,
    });
    expect(result.checkoutSessionId).toBe("cs_test_existing");
    expect(create.mock.calls[0][0]).toMatchObject({
      line_items: [{ price: "price_expected", quantity: 1 }],
      client_reference_id: requestId,
      metadata: { report_request_id: requestId },
    });
  });

  it("conceals invalid authorization and supports Live Mode", async () => {
    await expect(continueAuthorizedCheckout(request, requestId, {
      env,
      authorize: vi.fn().mockResolvedValue(false),
    })).rejects.toMatchObject({ code: "report_request_not_found", statusCode: 404 });
    const create = vi.fn().mockResolvedValue({
      id: "cs_live_existing",
      url: "https://checkout.stripe.com/c/pay/cs_live_existing",
      livemode: true,
    });
    await expect(continueAuthorizedCheckout(request, requestId, {
      env: { ...env, STRIPE_MODE: "live", STRIPE_SECRET_KEY: "sk_live_synthetic" },
      authorize: vi.fn().mockResolvedValue(true),
      repository: { findByIdForCheckout: vi.fn().mockResolvedValue(checkoutRecord()) },
      stripe: { checkout: { sessions: { create } } } as unknown as Pick<Stripe, "checkout">,
    })).resolves.toMatchObject({ checkoutSessionId: "cs_live_existing" });
  });

  it("rejects missing and paid authorized requests", async () => {
    await expect(continueAuthorizedCheckout(request, requestId, {
      env,
      authorize: vi.fn().mockResolvedValue(true),
      repository: { findByIdForCheckout: vi.fn().mockResolvedValue(null) },
    })).rejects.toMatchObject({ code: "report_request_not_found" });
    await expect(continueAuthorizedCheckout(request, requestId, {
      env,
      authorize: vi.fn().mockResolvedValue(true),
      repository: { findByIdForCheckout: vi.fn().mockResolvedValue(checkoutRecord({ paymentStatus: "paid" })) },
    })).rejects.toMatchObject({ code: "report_request_already_paid" });
  });

  it("uses the same deterministic idempotency key on repeated invocation", async () => {
    const create = vi.fn().mockResolvedValue({
      id: "cs_test_reused",
      url: "https://checkout.stripe.com/c/pay/cs_test_reused",
      livemode: false,
    });
    const options = {
      env,
      authorize: vi.fn().mockResolvedValue(true),
      repository: { findByIdForCheckout: vi.fn().mockResolvedValue(checkoutRecord()) },
      stripe: { checkout: { sessions: { create } } } as unknown as Pick<Stripe, "checkout">,
    };
    await continueAuthorizedCheckout(request, requestId, options);
    await continueAuthorizedCheckout(request, requestId, options);
    expect(create.mock.calls[0][1].idempotencyKey).toBe(create.mock.calls[1][1].idempotencyKey);
  });
});

describe("Phase B signed webhook verification", () => {
  const stripe = new Stripe("sk_test_synthetic");
  const payload = JSON.stringify(event());

  it("reads the untouched request stream without accessing the parsed body helper", async () => {
    const rawPayload = Buffer.from(`${payload}\n`, "utf8");
    const request = Readable.from([rawPayload.subarray(0, 17), rawPayload.subarray(17)]) as
      typeof Readable.prototype & { headers: {}; query: {} };
    request.headers = {};
    request.query = {};
    Object.defineProperty(request, "body", {
      get: () => {
        throw new Error("parsed_body_must_not_be_accessed");
      },
    });

    await expect(readRawBody(request)).resolves.toEqual(rawPayload);
  });

  it("accepts a valid synthetic signature", () => {
    const signature = stripe.webhooks.generateTestHeaderString({ payload, secret: "whsec_synthetic" });
    expect(verifyStripeWebhook(Buffer.from(payload), signature, {
      stripe,
      webhookSecret: "whsec_synthetic",
    }).id).toBe("evt_synthetic");
  });

  it("rejects an invalid signature and a stale timestamp", () => {
    expect(() => verifyStripeWebhook(Buffer.from(payload), "t=1,v1=invalid", {
      stripe,
      webhookSecret: "whsec_synthetic",
    })).toThrow(WebhookVerificationError);
    const stale = stripe.webhooks.generateTestHeaderString({
      payload,
      secret: "whsec_synthetic",
      timestamp: 1,
    });
    expect(() => verifyStripeWebhook(Buffer.from(payload), stale, {
      stripe,
      webhookSecret: "whsec_synthetic",
      toleranceSeconds: 300,
    })).toThrow(WebhookVerificationError);
  });

  it("rejects a body changed after signing", () => {
    const signature = stripe.webhooks.generateTestHeaderString({ payload, secret: "whsec_synthetic" });
    expect(() => verifyStripeWebhook(Buffer.from(`${payload}\n`), signature, {
      stripe,
      webhookSecret: "whsec_synthetic",
    })).toThrow(WebhookVerificationError);
  });
});

describe("Phase B payment validation", () => {
  it("validates the expected synthetic payment", () => {
    expect(validatePaidCheckoutSession(session(), expected)).toMatchObject({
      reportRequestId: requestId,
      amount: 980,
      currency: "jpy",
    });
  });

  it.each([
    ["livemode mismatch", { livemode: true }, "livemode_mismatch"],
    ["incorrect product", { line_items: { ...session().line_items, data: [{ ...session().line_items!.data[0], price: { ...session().line_items!.data[0].price!, product: "prod_wrong" } }] } }, "incorrect_product"],
    ["incorrect price", { line_items: { ...session().line_items, data: [{ ...session().line_items!.data[0], price: { ...session().line_items!.data[0].price!, id: "price_wrong" } }] } }, "incorrect_price"],
    ["incorrect amount", { amount_total: 979 }, "incorrect_amount"],
    ["incorrect currency", { currency: "usd" }, "incorrect_currency"],
    ["unpaid session", { payment_status: "unpaid" }, "session_unpaid"],
  ])("rejects %s", (_name, overrides, code) => {
    expect(() => validatePaidCheckoutSession(session(overrides), expected)).toThrowError(
      expect.objectContaining<Partial<PaymentValidationError>>({ code }),
    );
  });
});

describe("Phase B event idempotency and entitlement", () => {
  it("processes once and safely acknowledges the duplicate event", async () => {
    const store = new SyntheticStore();
    const options = { env, expected, stripe: stripeWithSession(session()), store };
    await expect(processStripeEvent(event(), options)).resolves.toEqual({ status: "processed", reportRequestId: requestId });
    await expect(processStripeEvent(event(), options)).resolves.toEqual({ status: "duplicate", reportRequestId: requestId });
    expect(store.entitlements.size).toBe(1);
  });

  it("rejects live events before retrieving payment data", async () => {
    await expect(processStripeEvent(event(session(), { livemode: true }), {
      env,
      expected,
      stripe: stripeWithSession(session()),
      store: new SyntheticStore(),
    })).rejects.toMatchObject({ code: "livemode_mismatch" });
  });

  it("rejects duplicate Checkout Session and Payment Intent references", async () => {
    const store = new SyntheticStore();
    await processStripeEvent(event(), { env, expected, stripe: stripeWithSession(session()), store });
    await expect(processStripeEvent(event(session(), { id: "evt_second" }), {
      env, expected, stripe: stripeWithSession(session()), store,
    })).rejects.toMatchObject({ code: "duplicate_checkout_session" });
    const secondSession = session({ id: "cs_test_second" });
    await expect(processStripeEvent(event(secondSession, { id: "evt_third" }), {
      env, expected, stripe: stripeWithSession(secondSession), store,
    })).rejects.toMatchObject({ code: "duplicate_payment_intent" });
    expect(store.entitlements.size).toBe(1);
  });

  it("does not reach durable storage for unpaid or invalid-metadata Sessions", async () => {
    const applyPaidEvent = vi.fn();
    const store = { applyPaidEvent };
    const unpaid = session({ payment_status: "unpaid" });
    await expect(processStripeEvent(event(unpaid), {
      env, expected, stripe: stripeWithSession(unpaid), store,
    })).rejects.toMatchObject({ code: "session_unpaid" });
    const invalidMetadata = session({ metadata: { report_request_id: "not-a-request-id" } });
    await expect(processStripeEvent(event(invalidMetadata), {
      env, expected, stripe: stripeWithSession(invalidMetadata), store,
    })).rejects.toMatchObject({ code: "invalid_report_request_id" });
    expect(applyPaidEvent).not.toHaveBeenCalled();
  });
});

describe("safe payment status boundary", () => {
  it("returns only safe status fields", () => {
    const safe = toSafeReportStatus({
      id: requestId,
      createdAt: new Date("2029-01-01T00:00:00Z"),
      updatedAt: new Date("2029-01-02T00:00:00Z"),
      resultType: "synthetic",
      resultNameJa: "secret-like fixture",
      resultNameEn: "fixture",
      paymentStatus: "paid",
      generationStatus: "blocked",
      deliveryStatus: "not_requested",
      reportVersion: null,
      expiresAt: null,
    }, {
      status: "active",
      grantedAt: new Date("2029-01-02T00:00:00Z"),
      revokedAt: null,
    });
    expect(Object.keys(safe).sort()).toEqual([
      "createdAt", "deliveryStatus", "entitlementGrantedAt", "entitlementRevokedAt",
      "entitlementStatus", "expiresAt", "generationStatus", "paymentStatus", "requestId", "updatedAt",
      "report",
    ].sort());
    expect(JSON.stringify(safe)).not.toContain("secret-like fixture");
  });

  it("never grants entitlement client-side and authenticates generation requests", async () => {
    const source = await readFile("src/components/PaymentStatus.jsx", "utf8");
    expect(source).toContain("/status");
    expect(source).toContain("/generate");
    expect(source).toContain("Authorization");
    expect(source).not.toContain("grantEntitlement");
  });
});
