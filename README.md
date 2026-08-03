# NEXTORY11

NEXTORY11 is a Japanese, cinematic 11-question self-discovery experience with an official 220-question Question Bank V2, 11 result experiences, and a paid Personal Star Report generated after verified Stripe payment.

## Current delivery status

- The public diagnosis, results, legal navigation, Premium preview, and purchase disclosures are implemented.
- The durable Stripe Premium runtime is implemented and validated: server-created Checkout, signed webhook processing, strict payment validation, durable entitlement and generation jobs, Premium report generation, retry handling, recovery, and idempotency.
- Database integration tests verify atomic payment, entitlement, job, report, and access-token behavior and remove all synthetic rows.
- Stripe Test mode completed an authorized ¥980 Checkout, webhook delivery, Premium generation, reload/browser recovery, retry, and duplicate-processing verification.
- Stripe Test and Live modes are supported only through explicit fail-closed server configuration. Missing, malformed, mismatched, or unsupported modes are rejected.
- Production Stripe Live configuration, paid CTA activation, deployment, and one controlled Live ¥980 payment remain pending.

## Question Bank V2

The approved 220-question pack lives at `src/data/questionBank/nextory11-question-pack-v1.json` and identifies itself as `question-pack-v2`. It preserves stable IDs, categories, targeting, weights, scoring metadata, and 11-question session behavior.

Set `VITE_ENABLE_QUESTION_BANK_V1=true` to use official dynamic sessions. In local development, anonymous question history can be reset from the browser console:

```js
window.__NEXTORY11_RESET_QUESTION_HISTORY__()
```

## Local development

```bash
npm install
npm run dev
```

`npm run dev` serves the Vite application and local `/api` handlers on the same origin.

Quality checks:

```bash
npm run typecheck
npm run lint
npm test
npm run test:stripe
npm run build
node scripts/validate-question-bank-v2.mjs
node scripts/audit-question-bank-semantics.mjs
```

Database integration tests require a Neon-compatible Development `DATABASE_URL_UNPOOLED`. Missing or invalid server configuration fails closed.

## Environment configuration

Copy `.env.example` to `.env.local` for local development. Never commit environment files, API keys, webhook secrets, database credentials, report-token secrets, customer data, or generated reports.

Only `VITE_` variables are browser-visible. They must never contain secrets. The paid CTA is disabled unless `VITE_PAID_CTA_ENABLED` is exactly `true`; it remains disabled in the release candidate configuration.

Server configuration is validated in `server/config/env.ts`. Stripe mode must be exactly `test` or `live`, and the configured Stripe key and Checkout Session mode must match it. Product, Price, ¥980 JPY amount, currency, quantity, payment status, and redirect origins remain server-controlled.

## Payment and report security

Browser state cannot prove payment or grant entitlement. A signed Stripe webhook retrieves and validates the completed Checkout Session before atomically recording payment, granting entitlement, and queueing Premium generation. Existing-request checkout requires a valid report access token. Duplicate events, Checkout Sessions, Payment Intents, jobs, and report versions are constrained by idempotency and database uniqueness.

See `docs/paid-report-architecture.md` for the production architecture.

## Directory structure

```text
docs/                    Architecture, release, and governance records
api/                     Vercel Node API entry points
public/images/           Web-ready application assets
server/                  Server-only validation, payment, database, and AI runtime
server/db/migrations/    Drizzle migrations for Neon Postgres
src/components/          Diagnosis, result, payment, and report screens
src/data/                Question Bank and public result content
src/lib/                 Session, checkout, and recovery clients
src/styles/              Application and responsive styles
tests/                   Unit and database integration verification
```

## Release status

NEXTORY11 Version 1.0 is reconciled locally and awaiting human review and push authorization. No Production deployment, Stripe Live configuration change, paid CTA activation, Live webhook operation, or Live payment has occurred.

## Repository safety

Do not commit local screenshots, customer answers, generated reports, PDFs, `.env` files, credentials, private prompts, original artwork masters, or QA archives. Only web-ready derivatives referenced by the application belong under `public/images/`.

The repository should remain private. Browser-delivered JavaScript and assets are downloadable by visitors, so secrets and business-sensitive generation material must remain server-side.

© 2026 NEXTORY11. All rights reserved.
