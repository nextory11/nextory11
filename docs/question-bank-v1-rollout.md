# Question Bank v1 rollout

## Configuration

`VITE_ENABLE_QUESTION_BANK_V1=false` preserves the legacy 11-question diagnosis. Set it to `true` only in a reviewed environment to select 11 questions from the official 220-question pack.

The production-owned pack is `src/data/questionBank/nextory11-question-pack-v1.json`. Production code never reads from a Codex output or temporary path.

## Verification

Run:

```powershell
npm run typecheck
npm run lint
npm run build
npm test
node scripts/simulate-question-bank-v1.mjs 10000 docs/question-bank-v1-simulation.json
```

In development, clear freshness history in the browser console with:

```js
window.__NEXTORY11_RESET_QUESTION_HISTORY__()
```

The browser history contains only stable question IDs, rotation/cooldown groups, the pack version, and timestamps. It does not contain answers or analysis.

## Activation

1. Keep Stripe in test mode.
2. Set `VITE_ENABLE_QUESTION_BANK_V1=true` in a preview environment.
3. Complete desktop and 390×844 browser diagnosis checks.
4. Verify a paid test checkout, webhook entitlement, report retry, and return access.
5. Confirm approved Terms, Privacy, refund/cancellation, and support content.
6. Enable the flag in production only after every launch gate passes.

## Rollback

Set `VITE_ENABLE_QUESTION_BANK_V1=false` and rebuild/redeploy the same reviewed revision. The legacy questions remain intact; Result Scene, Stripe, entitlement, and report routes do not change with this flag.

## Known release gates

The repository currently contains placeholder AI JUZA paid-report prompt/template files and marks generation as `blocked`. A real server-side report-generation worker/provider, quality validation, retry flow, and approved legal/trust copy are required before public launch. Never bypass payment verification or unlock a report from the success redirect alone.
