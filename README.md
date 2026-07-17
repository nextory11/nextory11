# NEXTORY11

## Question Bank v1 rollout

The official 220-question pack lives at `src/data/questionBank/nextory11-question-pack-v1.json`.
Set `VITE_ENABLE_QUESTION_BANK_V1=true` to use dynamic 11-question sessions. The default is `false`, which preserves the legacy diagnosis for one-setting rollback.

In local development, reset anonymous question history from the browser console with:

```js
window.__NEXTORY11_RESET_QUESTION_HISTORY__()
```

NEXTORY11 is a Japanese, cinematic 11-question self-discovery experience. It includes the public diagnosis, result experience, and a Development/Test-only server-created Stripe Checkout foundation for the future Personal Star Report.

## Current delivery status

- The diagnosis and result experience are functional.
- Stripe Checkout Sessions are created server-side from an approved test Price ID.
- Checkout preserves a local development report request with a unique request ID.
- `/payment-success` polls only the safe server payment status and cannot grant entitlement.
- Public paid production remains blocked until the server-side webhook and report pipeline are implemented.

## Local development

```bash
npm install
npm run dev
```

`npm run dev` serves both the Vite application and the existing `/api` handlers on the same local origin. Stripe CLI webhook forwarding should target the same port.

Quality checks:

```bash
npm run lint
npm run build
npm run typecheck
npm test
npm audit
```

The Phase A APIs require a Neon-compatible `DATABASE_URL`. If it is absent or
invalid, backend requests fail closed with `503 backend_unavailable`; the SPA
and disabled private-preview CTA remain unchanged.

## Directory structure

```text
docs/                    Production architecture and operational notes
api/                     Vercel Node API entry points
public/images/hero/      Web-ready Hero layers used by the application
public/images/logo/      Web-ready NEXTORY11 logo
server/                  Server-only validation, data, security, and AI contracts
server/db/migrations/    Drizzle SQL migrations for Neon Postgres
src/components/          Hero, quiz, result, payment, and report screens
src/data/                Questions and public diagnosis result content
src/lib/                 Checkout snapshot and development mock generator
src/styles/              Application and responsive styles
vercel.json              SPA routes and production security headers
tests/unit/              Phase A backend unit and schema-constraint tests
```

## Environment configuration

Copy `.env.example` to `.env.local` for local server configuration. Never commit `.env`, secret keys, webhook secrets, OpenAI keys, customer report data, or private prompts.

Only values prefixed with `VITE_` are available to the browser. Therefore, `VITE_` variables must never contain secrets.

Server configuration is validated by `server/config/env.ts`. `.env.example`
contains names and nonfunctional placeholders only. Phase A requires only the
database connection; Stripe, OpenAI, email, storage, and rate-limit variables
remain reserved for later approved phases.

The paid CTA is enabled only for the approved Development/Test Checkout exercise. `getPaidCtaEnabled` and the checkout redirect remain fail-closed outside Vite Development mode.

## Payment and report security

The browser-side checkout snapshot is for development continuity only. It is user-controlled and cannot prove payment. Entitlement is created only after a signed Stripe test webhook passes server-side payment validation.

See [docs/paid-report-architecture.md](docs/paid-report-architecture.md) for the required production architecture.

## Phase A backend status

- `POST /api/report-requests` accepts exactly one recognized answer for each of
  the 11 questions, normalizes the payload, recalculates the result server-side,
  and creates an `awaiting_payment` / `blocked` record.
- `GET /api/reports/:requestId/status` returns sanitized lifecycle status only.
- The initial Neon/Drizzle migration defines payment, entitlement, job, report,
  delivery, and token tables. It has not been applied to an owner database.
- AI Juza prompt and paid-template files are structural placeholders only.
- No Phase A endpoint grants payment entitlement or generates a report.

## Deployment

`vercel.json` provides SPA rewrites for `/payment-success` and `/payment-cancel` plus baseline security headers. Production, Preview, and Development secrets must be configured separately in Vercel.

Do not commit local screenshots, customer answers, generated reports, PDFs, `.env` files, API keys, Stripe secrets, webhook secrets, private prompts, or original master artwork.

Original artwork masters and local QA archives belong outside the deployment repository. Only the web-ready derivatives referenced by the application should be placed under `public/images/`.

## Intellectual property

The repository should remain private. Browser-delivered JavaScript and assets remain downloadable by visitors, so private AI prompts, report templates, master artwork, and business-sensitive generation rules must stay outside the public frontend.

© 2026 NEXTORY11 / Super Hiros. All rights reserved.
