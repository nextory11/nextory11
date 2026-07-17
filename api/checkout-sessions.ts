import { z } from "zod";
import { ServerConfigurationError } from "../server/config/env.js";
import type { VercelRequestLike, VercelResponseLike } from "../server/http/vercel.js";
import { logger } from "../server/logging/logger.js";
import {
  CheckoutRequestError,
  createCheckoutSession,
} from "../server/stripe/create-checkout-session.js";

export const checkoutRequestBodySchema = z.object({ reportRequestId: z.string().uuid() }).strict();

export default async function handler(request: VercelRequestLike, response: VercelResponseLike) {
  response.setHeader("Cache-Control", "no-store");
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "method_not_allowed" });
  }
  const body = checkoutRequestBodySchema.safeParse(request.body);
  if (!body.success) return response.status(400).json({ error: "invalid_checkout_request" });

  try {
    const result = await createCheckoutSession(body.data.reportRequestId);
    return response.status(201).json(result);
  } catch (error) {
    if (error instanceof CheckoutRequestError) {
      return response.status(error.statusCode).json({ error: error.code });
    }
    if (error instanceof ServerConfigurationError) {
      logger.error("stripe_configuration_unavailable", { issueCount: error.issues.length });
      return response.status(503).json({ error: "payment_backend_unavailable" });
    }
    logger.error("checkout_session_create_failed", { errorCode: "stripe_error" });
    return response.status(502).json({ error: "checkout_unavailable" });
  }
}
