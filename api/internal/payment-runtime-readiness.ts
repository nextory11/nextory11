import { parseStripeServerEnv } from "../../server/config/env.js";
import { getStripeClient } from "../../server/stripe/client.js";
import type { VercelRequestLike, VercelResponseLike } from "../../server/http/vercel.js";

const CHECK_HEADER = "x-nextory-runtime-check";
const CHECK_VALUE = "payment-readiness-v1";

type RuntimeReadiness = {
  stripeMode: "LIVE" | "TEST" | "MISSING";
  productMode: "LIVE" | "TEST" | "MISSING";
  priceMode: "LIVE" | "TEST" | "MISSING";
  currency: "JPY" | "OTHER" | "MISSING";
  amount: 980 | "OTHER" | "MISSING";
  webhookConfigured: boolean;
  checkoutWiring: "PRODUCTION" | "TEST" | "INVALID";
  allSafetyGates: "PASS" | "FAIL";
};

const unavailable = (stripeMode: RuntimeReadiness["stripeMode"]): RuntimeReadiness => ({
  stripeMode,
  productMode: "MISSING",
  priceMode: "MISSING",
  currency: "MISSING",
  amount: "MISSING",
  webhookConfigured: false,
  checkoutWiring: "INVALID",
  allSafetyGates: "FAIL",
});

export default async function handler(request: VercelRequestLike, response: VercelResponseLike) {
  response.setHeader("Cache-Control", "no-store");
  if (
    process.env.VERCEL_ENV !== "production"
    || request.method !== "POST"
    || request.headers[CHECK_HEADER] !== CHECK_VALUE
  ) {
    return response.status(404).json({ error: "not_found" });
  }

  const rawMode = process.env.STRIPE_MODE;
  const rawKey = process.env.STRIPE_SECRET_KEY;
  const stripeMode: RuntimeReadiness["stripeMode"] = rawMode === "live" && rawKey?.startsWith("sk_live_")
    ? "LIVE"
    : rawMode === "test" && rawKey?.startsWith("sk_test_")
      ? "TEST"
      : "MISSING";

  try {
    const env = parseStripeServerEnv();
    const stripe = getStripeClient(env);
    const price = await stripe.prices.retrieve(env.STRIPE_EXPECTED_PRICE_ID, {
      expand: ["product"],
    });
    const product = typeof price.product === "string" || "deleted" in price.product
      ? null
      : price.product;
    const webhookEndpoints = await stripe.webhookEndpoints.list({ limit: 100 });
    const webhookSecretConfigured = env.STRIPE_WEBHOOK_SECRET.startsWith("whsec_");
    const productionWebhookExists = webhookEndpoints.data.some((endpoint) => {
      try {
        const url = new URL(endpoint.url);
        return endpoint.status === "enabled"
          && ["nextory11.com", "www.nextory11.com"].includes(url.hostname)
          && url.pathname === "/api/stripe/webhook";
      } catch {
        return false;
      }
    });

    const productMode: RuntimeReadiness["productMode"] = product
      ? product.livemode ? "LIVE" : "TEST"
      : "MISSING";
    const priceMode: RuntimeReadiness["priceMode"] = price.livemode ? "LIVE" : "TEST";
    const currency: RuntimeReadiness["currency"] = price.currency === "jpy" ? "JPY" : "OTHER";
    const amount: RuntimeReadiness["amount"] = price.unit_amount === 980
      && env.STRIPE_EXPECTED_AMOUNT_JPY === 980 ? 980 : "OTHER";
    const mappingMatches = price.id === env.STRIPE_EXPECTED_PRICE_ID
      && product?.id === env.STRIPE_EXPECTED_PRODUCT_ID;
    const webhookConfigured = webhookSecretConfigured && productionWebhookExists;
    const productionReady = stripeMode === "LIVE"
      && productMode === "LIVE"
      && priceMode === "LIVE"
      && currency === "JPY"
      && amount === 980
      && mappingMatches
      && webhookConfigured;
    const testWiring = stripeMode === "TEST" && productMode === "TEST" && priceMode === "TEST";

    return response.status(200).json({
      stripeMode,
      productMode,
      priceMode,
      currency,
      amount,
      webhookConfigured,
      checkoutWiring: productionReady ? "PRODUCTION" : testWiring ? "TEST" : "INVALID",
      allSafetyGates: productionReady ? "PASS" : "FAIL",
    } satisfies RuntimeReadiness);
  } catch {
    return response.status(200).json(unavailable(stripeMode));
  }
}
