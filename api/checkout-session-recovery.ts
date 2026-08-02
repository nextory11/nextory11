import { ZodError, z } from "zod";
import { parseReportAccessEnv, parseStripeServerEnv, ServerConfigurationError } from "../server/config/env.js";
import { AccessTokensRepository } from "../server/db/repositories/access-tokens.js";
import { EntitlementsRepository } from "../server/db/repositories/entitlements.js";
import { PaymentsRepository } from "../server/db/repositories/payments.js";
import { ReportRequestsRepository } from "../server/db/repositories/report-requests.js";
import type { VercelRequestLike, VercelResponseLike } from "../server/http/vercel.js";
import { getStripeClient } from "../server/stripe/client.js";
import { validatePaidCheckoutSession } from "../server/stripe/validate-payment.js";
import { generateAccessToken, hashAccessToken } from "../server/security/tokens.js";

const recoverySchema = z.object({ checkoutSessionId: z.string().regex(/^cs_(?:test|live)_[A-Za-z0-9]+$/u) });

export function validateCheckoutSessionIdForMode(checkoutSessionId: string, mode: "test" | "live") {
  const expectedPrefix = mode === "live" ? "cs_live_" : "cs_test_";
  return z.string().startsWith(expectedPrefix).parse(checkoutSessionId);
}

export function isIncompleteCheckoutSession(session: {
  payment_status: string;
  status: string | null;
}) {
  return session.payment_status !== "paid" || session.status !== "complete";
}

export default async function handler(request: VercelRequestLike, response: VercelResponseLike) {
  response.setHeader("Cache-Control", "no-store");
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "method_not_allowed" });
  }

  try {
    const { checkoutSessionId } = recoverySchema.parse(request.body);
    const stripeEnv = parseStripeServerEnv();
    validateCheckoutSessionIdForMode(checkoutSessionId, stripeEnv.STRIPE_MODE);

    const session = await getStripeClient(stripeEnv).checkout.sessions.retrieve(checkoutSessionId, {
      expand: ["line_items.data.price.product"],
    });
    if (isIncompleteCheckoutSession(session)) {
      return response.status(409).json({ error: "checkout_not_paid" });
    }
    const validated = validatePaidCheckoutSession(session, {
      productId: stripeEnv.STRIPE_EXPECTED_PRODUCT_ID,
      priceId: stripeEnv.STRIPE_EXPECTED_PRICE_ID,
      amountJpy: stripeEnv.STRIPE_EXPECTED_AMOUNT_JPY,
      livemode: stripeEnv.STRIPE_MODE === "live",
    });
    const payment = await new PaymentsRepository().findByCheckoutSessionId(checkoutSessionId);
    const reportRequest = await new ReportRequestsRepository().findStatusById(validated.reportRequestId);
    const entitlement = await new EntitlementsRepository().findActiveByRequestId(validated.reportRequestId);
    if (
      !payment ||
      payment.status !== "paid" ||
      payment.reportRequestId !== validated.reportRequestId ||
      payment.paymentIntentId !== validated.paymentIntentId ||
      !reportRequest ||
      reportRequest.paymentStatus !== "paid" ||
      !entitlement
    ) {
      return response.status(409).json({ error: "verified_entitlement_not_found" });
    }

    const accessEnv = parseReportAccessEnv();
    const accessToken = generateAccessToken();
    await new AccessTokensRepository().create({
      reportRequestId: reportRequest.id,
      tokenHash: hashAccessToken(accessToken, accessEnv.REPORT_TOKEN_PEPPER),
      expiresAt: new Date(Date.now() + accessEnv.REPORT_LINK_TTL_SECONDS * 1_000),
    });
    return response.status(200).json({
      requestId: reportRequest.id,
      accessToken,
      createdAt: reportRequest.createdAt.toISOString(),
      result: {
        type: reportRequest.resultType,
        ja: reportRequest.resultNameJa,
        en: reportRequest.resultNameEn,
      },
    });
  } catch (error) {
    if (error instanceof ZodError) return response.status(400).json({ error: "invalid_recovery_request" });
    if (error instanceof ServerConfigurationError) return response.status(503).json({ error: "backend_unavailable" });
    return response.status(502).json({ error: "recovery_failed" });
  }
}
