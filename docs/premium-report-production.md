# Premium Report production guide

## Boundary

The free AI JUZA reading remains local. The external OpenAI Responses API is called only after the server has verified both a paid report request and an active Premium entitlement.

The provider request uses `store: false` and sends only:

- selected question IDs and answer IDs
- primary, secondary, and third personality slugs
- hidden traits
- category signals and question tags
- normalized behavioral profile
- answer signature
- question-set version

It never sends a user name, email address, payment data, IP address, answer prose, or other directly identifying data.

## Required server environment

```dotenv
OPENAI_API_KEY=sk-...
AI_REPORT_PROVIDER=openai
AI_REPORT_MODEL=gpt-5.6-terra
AI_REPORT_PROMPT_VERSION=ai-juza-premium.v1
AI_REPORT_TEMPLATE_VERSION=personal-star-report.v1
REPORT_TOKEN_PEPPER=<at-least-32-random-characters>
REPORT_LINK_TTL_SECONDS=2592000
```

Never prefix server secrets with `VITE_` and never place them in client code.

## Flow

1. Stripe creates and verifies a paid entitlement through the existing webhook flow.
2. The browser presents the one-time report access token to the status and generation endpoints.
3. The generation service rechecks the paid request and active entitlement before any provider call.
4. The server derives the allow-listed behavioral profile and calls `/v1/responses` with structured output and `store: false`.
5. The 12-section result is validated, checksummed, persisted, and then made available through the protected status endpoint.
6. Refreshing or retrying reuses the entitlement and existing report; it never creates a new Checkout Session or charge.

## Failure behavior

- A provider or validation failure never revokes entitlement.
- Retryable failures can be retried manually from the status screen.
- Automatic generation does not repeatedly consume retries after a retryable failure.
- End users receive calm Japanese messages without prompts, stack traces, model names, or provider details.
- A completed report is returned instead of generating a duplicate.

## Verification

Run:

```powershell
npm run typecheck
npm run lint
npm run build
npm test
npm run test:stripe
git diff --check
```

Then complete a Stripe test-mode browser journey: diagnosis, checkout, webhook, report generation, refresh, and return access. Do not enable live mode until `OPENAI_API_KEY`, webhook delivery, legal purchase copy, desktop QA, and 390 x 844 mobile QA have all passed.

## Rollback

Disable the paid CTA with `VITE_PAID_CTA_ENABLED=false`. This leaves the free diagnosis and local AI JUZA experience available without external report generation. Do not delete entitlements or reports during rollback.
