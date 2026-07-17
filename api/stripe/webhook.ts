import { ServerConfigurationError } from "../../server/config/env.js";
import type { VercelRequestLike, VercelResponseLike } from "../../server/http/vercel.js";
import { logger } from "../../server/logging/logger.js";
import { EventProcessingError, processStripeEvent } from "../../server/stripe/process-event.js";
import { PaymentValidationError } from "../../server/stripe/validate-payment.js";
import {
  verifyStripeWebhook,
  WebhookVerificationError,
} from "../../server/stripe/verify-webhook.js";

export const config = { api: { bodyParser: false } };
const MAX_WEBHOOK_BYTES = 256 * 1024;

class WebhookBodyError extends Error {}

async function readRawBody(request: VercelRequestLike): Promise<Buffer> {
  const supplied = (request as VercelRequestLike & { rawBody?: Buffer }).rawBody;
  if (Buffer.isBuffer(supplied)) {
    if (supplied.byteLength > MAX_WEBHOOK_BYTES) throw new WebhookBodyError();
    return supplied;
  }
  if (Buffer.isBuffer(request.body)) {
    if (request.body.byteLength > MAX_WEBHOOK_BYTES) throw new WebhookBodyError();
    return request.body;
  }
  const stream = request as unknown as AsyncIterable<Uint8Array>;
  const chunks: Buffer[] = [];
  let total = 0;
  for await (const chunk of stream) {
    total += chunk.byteLength;
    if (total > MAX_WEBHOOK_BYTES) throw new WebhookBodyError();
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

export default async function handler(request: VercelRequestLike, response: VercelResponseLike) {
  response.setHeader("Cache-Control", "no-store");
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "method_not_allowed" });
  }
  const header = request.headers["stripe-signature"];
  const signature = Array.isArray(header) ? header[0] : header;
  if (!signature) return response.status(400).json({ error: "missing_stripe_signature" });

  try {
    const event = verifyStripeWebhook(await readRawBody(request), signature);
    const result = await processStripeEvent(event);
    return response.status(200).json({ received: true, status: result.status });
  } catch (error) {
    if (error instanceof WebhookBodyError) {
      return response.status(413).json({ error: "webhook_too_large" });
    }
    if (error instanceof WebhookVerificationError) {
      return response.status(400).json({ error: "invalid_webhook_signature" });
    }
    if (error instanceof PaymentValidationError || error instanceof EventProcessingError) {
      const status = error instanceof EventProcessingError ? error.statusCode : 400;
      logger.warn("stripe_payment_rejected", { reason: error.code });
      return response.status(status).json({ error: error.code });
    }
    if (error instanceof ServerConfigurationError) {
      logger.error("stripe_configuration_unavailable", { issueCount: error.issues.length });
      return response.status(503).json({ error: "payment_backend_unavailable" });
    }
    logger.error("stripe_webhook_failed", { errorCode: "internal_error" });
    return response.status(500).json({ error: "internal_error" });
  }
}
