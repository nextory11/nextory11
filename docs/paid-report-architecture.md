# Paid Report Production Architecture

The current mock generator is intentionally frontend-only and must never be treated as proof of payment or as the final paid report.

## Trust boundaries

- Browser data, return URLs, local storage, request IDs, and result types are untrusted.
- Stripe webhook events become trusted only after server-side signature verification.
- OpenAI keys, Stripe secret keys, webhook secrets, private prompts, report templates, email credentials, and storage credentials exist only in server environment variables.
- No secret uses a `VITE_` prefix.

## Recommended flow

1. The browser submits the diagnosis to `POST /api/report-requests`.
2. The server validates all 11 answers, recalculates the result, stores an immutable request, and returns an opaque request ID.
3. Prefer a server-created Stripe Checkout Session with the request ID in metadata. If the existing Payment Link remains, use a supported correlation mechanism and never trust query parameters alone.
4. Stripe calls `POST /api/stripe/webhook`.
5. The server verifies the raw-body signature, event livemode, product/price, currency, paid status, and idempotency before granting entitlement.
6. A durable job queue starts report generation exactly once.
7. The worker loads the private AI Juza system prompt and versioned templates, calls OpenAI with a server-only key, validates structured output, and stores the report.
8. A server-side PDF renderer creates the customer document.
9. An email provider sends a short-lived, single-customer delivery link. Do not attach sensitive reports unless required.
10. Every report download checks entitlement and expiry server-side.

## Storage model

- `report_requests`: opaque ID, normalized answers, server-calculated result, timestamps, status.
- `payments`: Stripe event/session identifiers, amount, currency, verification timestamp, request relation.
- `reports`: prompt/template version, generation status, encrypted content location, checksum, retention deadline.
- `delivery_events`: redacted delivery status and retry metadata.

Encrypt sensitive fields at rest, restrict operator access, and retain only the minimum data needed to deliver and support the purchase.

## Retry and failure handling

- Make webhook processing and generation jobs idempotent.
- Acknowledge valid webhooks quickly, then enqueue work.
- Use bounded exponential backoff and a dead-letter queue.
- Separate payment state from generation state so a generation failure never loses proof of purchase.
- Provide an operator-visible retry path and a customer-safe “preparing / delayed / ready / failed” status.
- Never charge again during retries.
- Redact answers, email addresses, prompts, and generated content from routine logs.

## Rate limits and abuse controls

- Rate-limit request creation, status polling, generation, and downloads by account/request/IP as appropriate.
- Use schema validation, request-size limits, CSRF protections where cookies are used, and short-lived signed download URLs.
- Verify that the paid Stripe price/product matches the expected production configuration.

## Development mock

`src/lib/mockReportGenerator.js` is a deterministic UX fixture. It calls no external AI service, verifies no payment, grants no entitlement, and must remain labeled as a development preview.
