# Stripe TEST setup for Phase B

This integration is intentionally Development/Test-only. Do not use live-mode resources, do not add these values to a `VITE_` variable, and never paste a key or webhook signing secret into chat, tickets, logs, or source control.

## 1. Locate the TEST secret key

1. Sign in to the Stripe Dashboard and select the NEXTORY test sandbox / Test mode.
2. Open **Developers > API keys** (or **Workbench > API keys** in the newer Dashboard).
3. Reveal the **Secret key** that begins with `sk_test_`.
4. Store it only as `STRIPE_SECRET_KEY` in the ignored local `.env.local` file.

Stripe documents the test/live prefixes and key location at [API keys](https://docs.stripe.com/keys).

## 2. Confirm the approved TEST product and price

1. While still in the test sandbox, open **More > Product catalogue** and select the approved Personal Star Report product.
2. Copy its identifier beginning with `prod_` into `STRIPE_EXPECTED_PRODUCT_ID`.
3. In the product's **Pricing** section, select the approved one-time JPY price for **¥980** and copy its identifier beginning with `price_` into `STRIPE_EXPECTED_PRICE_ID`.
4. Confirm that the price is active, one-time, `JPY`, and `980`; do not substitute another Price ID even if it has the same display amount.

Stripe explains the Dashboard catalogue and immutable price amount at [Manage products and prices](https://docs.stripe.com/products-prices/manage-prices).

## 3. Create the TEST webhook endpoint

For a reachable Development URL, open **Workbench > Webhooks**, add a destination, select the account's own events, and set the endpoint URL to:

```text
https://YOUR-DEVELOPMENT-HOST/api/stripe/webhook
```

Subscribe to only these snapshot event types:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`

After creating the endpoint, reveal its signing secret (beginning with `whsec_`) and store it only as `STRIPE_WEBHOOK_SECRET` in `.env.local`. A Dashboard endpoint secret and a Stripe CLI listener secret are different values. Stripe's endpoint and signature guidance is at [Receive Stripe events](https://docs.stripe.com/webhooks?lang=node).

## 4. Configure `.env.local` securely

Copy the variable names from `.env.example` into the already ignored `.env.local`, then replace placeholders locally:

```dotenv
STRIPE_SECRET_KEY=sk_test_LOCAL_VALUE
STRIPE_WEBHOOK_SECRET=whsec_LOCAL_VALUE
STRIPE_EXPECTED_PRODUCT_ID=prod_TEST_VALUE
STRIPE_EXPECTED_PRICE_ID=price_TEST_VALUE
STRIPE_EXPECTED_AMOUNT_JPY=980
STRIPE_API_VERSION=YOUR_ACCOUNT_PINNED_VERSION
REPORT_BASE_URL=http://localhost:5173
VITE_PAID_CTA_ENABLED=false
```

The approved Development/Test Checkout exercise uses the tracked runtime flag; no `VITE_` override is required. Before starting the app, confirm that `.env.local` remains ignored with `git check-ignore .env.local`. Never run a command that prints the file.

## 5. Optional local webhook forwarding with Stripe CLI

Start both the Vite app and its local API-function adapter from the repository root, and keep that terminal open:

```powershell
npm run dev
```

Authenticate the Stripe CLI to the test sandbox, then run this in a second terminal:

```powershell
stripe listen --events checkout.session.completed,checkout.session.async_payment_succeeded --forward-to http://localhost:5173/api/stripe/webhook
```

Put the temporary `whsec_...` value printed by `stripe listen` into the local `STRIPE_WEBHOOK_SECRET` for that CLI session only. Keep the listener running while testing. Stripe documents `--events`, `--forward-to`, and the listener-specific signing secret at [Use the Stripe CLI](https://docs.stripe.com/stripe-cli/use-cli).

The repository test suite uses synthetic fixtures and does not require any Stripe credential. The paid CTA and Checkout remain restricted to the approved Development/Test flow; do not deploy or switch to live mode without separate approval.
