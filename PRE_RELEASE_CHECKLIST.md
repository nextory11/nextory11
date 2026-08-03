# NEXTORY11 Final Owner Checklist

Do not publish until every required item below is complete.

## Business and legal

- [x] Legal operator/seller: TATSUMI DINING INC. / NEXTORY11.
- [x] Responsible person: HIROKI WATANABE.
- [x] Business address and public telephone are displayed.
- [x] Public support address is consistently `support@nextory11.com`.
- [x] Privacy Policy, Terms, refund/cancellation policy, operator information, contact page, and 特定商取引法に基づく表記 are implemented.
- [x] Legal pages visually verified at 1440, 1024, 768, 430, 390, and 360px with no horizontal overflow or broken images.
- [x] Result purchase summary shows product, 980 JPY price, Stripe/card payment, delivery timing, one-time purchase status, and legal links before checkout.
- [x] Purchase CTA remains disabled until the customer explicitly confirms the purchase summary.
- [x] Product name, 980円（JPY）, Stripe card payment, payment timing, and verified digital delivery are displayed before purchase.
- [x] A printable purchase record is displayed after verified payment.
- [ ] Owner/counsel final review and approval of customer-facing legal wording.
- [ ] Verify real inbound and outbound delivery for `support@nextory11.com`.

## Stripe test-mode acceptance

- [x] Keep `STRIPE_MODE=test` and use test keys only.
- [x] Complete one successful 980円 Stripe test Checkout.
- [x] Confirm failed/unpaid checkout does not unlock content.
- [x] Confirm NEXTORY11 verifies the purchase after success.
- [x] Confirm the correct type-specific Premium Report opens.
- [x] Reload the page and confirm access remains.
- [x] Close/restart the browser and confirm valid access returns.
- [x] Confirm an existing valid purchase is not charged again.
- [ ] Reconfirm the full Stripe return flow on a real mobile browser.

## Production configuration

- [ ] Create or confirm the Stripe live product.
- [ ] Create or confirm the exact 980円 live price.
- [ ] Add `STRIPE_MODE=live` only during the controlled launch step.
- [ ] Add the live Stripe secret key only to the secure server environment.
- [ ] Add the live webhook secret only to the secure server environment.
- [ ] Add the approved live product ID and live price ID.
- [ ] Keep `STRIPE_EXPECTED_AMOUNT_JPY=980`.
- [ ] Set the production `REPORT_BASE_URL` and success/cancel origin.
- [ ] Add all required database, OpenAI, report-token, and internal-job secrets.
- [x] Customer-facing support address is fixed to `support@nextory11.com`.
- [ ] Confirm the production domain and HTTPS.

Note: the current hosted-Checkout implementation uses the server-created `session.url` and does not use a frontend publishable key. Add a publishable key only if the implementation is intentionally changed to Stripe.js.

## Final launch gate

- [x] Run typecheck.
- [x] Run lint.
- [x] Run the complete automated test suite.
- [x] Run the existing Stripe test suite.
- [x] Run the production build.
- [x] Run `git diff --check`.
- [x] Complete the tracked-secret and configuration audit.
- [x] Confirm synthetic database cleanup with zero residual requests, events, payments, and reports.
- [ ] Confirm no placeholder legal/operator values are visible.
- [ ] Smoke-test Hero, name input, questions, all 11 results, legal pages, and navigation.
- [ ] Confirm no debug/dev controls appear in the production build.
- [ ] Confirm the paid CTA remains disabled until the launch window.
- [ ] Enable the live paid CTA only after all previous checks pass.
- [ ] Run one controlled live 980円 payment.
- [ ] Confirm paid report access, reload persistence, and browser-return access.
- [ ] Publish.

Until owner legal approval, live configuration, one controlled live payment, and deployment approval are complete, the current status is:

**READY FOR FINAL OWNER ACTIONS**
