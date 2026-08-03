# Stripe Premium Checkout and Fulfillment Record

Status: Runtime implementation and authorized Stripe Test verification complete; Production Live configuration and controlled Live payment pending.

## Scope

The runtime continues an existing authorized report request through server-created Stripe Checkout and starts Premium fulfillment only after signed webhook verification and complete server-side payment validation.

## Explicit fail-closed mode handling

`STRIPE_MODE` is mandatory and supports only `test` or `live`. Missing, malformed, unsupported, or key-mismatched modes fail closed. Checkout Session recovery accepts `cs_test_` only in Test mode and `cs_live_` only in Live mode. The browser may expose the paid CTA only when `VITE_PAID_CTA_ENABLED` is exactly `true`; it remains disabled in the release candidate configuration.

## Existing-request continuation

`POST /api/checkout-sessions` accepts only a strict `reportRequestId` body and requires the existing report access token in the `Authorization: Bearer` header. Failed authorization is concealed as an unavailable report request.

The server re-reads the request and verifies its unpaid state, blocked generation state, and retention lifetime. Product, Price, ¥980 JPY amount, currency, quantity, mode, metadata, and redirect URLs remain server-controlled. A deterministic request-derived Stripe idempotency key makes repeated invocation safe. Paid, expired, missing, unauthorized, or otherwise ineligible requests are rejected.

No access token is placed in a URL, Stripe metadata, or log entry.

## Durable webhook fulfillment

After raw-body signature verification and Checkout retrieval, the payment transaction atomically:

1. Records the Stripe event once.
2. Records the verified payment once.
3. Creates the active entitlement.
4. Moves the request from `awaiting_payment / blocked` to `paid / queued`.
5. Inserts generation attempt zero in `generation_jobs`.

Database uniqueness prevents duplicate event, Checkout Session, Payment Intent, entitlement, initial-job, and report-version effects. Invalid, incomplete, unpaid, expired, wrong-mode, wrong-product, wrong-price, wrong-amount, or wrong-currency sessions fail before fulfillment.

After commit, the webhook invokes the durable generation processor. Successful generation completes the job. Retryable failures preserve retry state; stale generation claims may be reclaimed after five minutes. Permanent failures enter the terminal state.

## Recovery boundary

The success page remains an authenticated status and recovery client. It cannot mark payment paid or grant entitlement. Recovery retrieves the mode-matched Checkout Session, revalidates payment, and requires matching durable payment, report-request, and active-entitlement records before issuing a new hashed access token.

## Completed Test verification

- Authorized Stripe Test Checkout for ¥980 JPY: PASS
- Signed webhook processing: PASS
- Premium report generation: PASS
- Retry and idempotency verification: PASS
- Reload and browser-return recovery: PASS
- Database integration: PASS
- Synthetic cleanup: PASS with zero residual requests, events, payments, and reports

## Pending Production verification

Production still requires owner-controlled Stripe Live configuration, an active one-time ¥980 JPY Live Price attached to the approved Live Product, the exact Production webhook endpoint and signing secret, secure Vercel Production variables, deployment, smoke testing, CTA activation, and one controlled Live payment.

No Production deployment, Live configuration change, Production webhook operation, CTA activation, or Live payment is claimed by this record.
