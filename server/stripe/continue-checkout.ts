import type Stripe from "stripe";
import { parseStripeServerEnv, type StripeServerEnv } from "../config/env.js";
import type { VercelRequestLike } from "../http/vercel.js";
import { authorizeReportAccess } from "../security/authorize-report-access.js";
import {
  CheckoutRequestError,
  createCheckoutSession,
  type CheckoutRequestReader,
} from "./create-checkout-session.js";

type ContinuationOptions = {
  authorize?: (request: VercelRequestLike, reportRequestId: string) => Promise<boolean>;
  env?: StripeServerEnv;
  repository?: CheckoutRequestReader;
  stripe?: Pick<Stripe, "checkout">;
  now?: Date;
};

export async function continueAuthorizedCheckout(
  request: VercelRequestLike,
  reportRequestId: string,
  options: ContinuationOptions = {},
) {
  const env = options.env ?? parseStripeServerEnv();
  if (env.STRIPE_MODE !== "test" && env.STRIPE_MODE !== "live") {
    throw new CheckoutRequestError("stripe_mode_unsupported", 503);
  }

  const authorize = options.authorize ?? authorizeReportAccess;
  if (!await authorize(request, reportRequestId)) {
    // Conceal whether the supplied request identifier exists.
    throw new CheckoutRequestError("report_request_not_found", 404);
  }

  return createCheckoutSession(reportRequestId, {
    env,
    repository: options.repository,
    stripe: options.stripe,
    now: options.now,
  });
}
