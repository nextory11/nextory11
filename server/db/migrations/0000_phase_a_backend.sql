CREATE TYPE "payment_status" AS ENUM ('awaiting_payment', 'paid', 'failed', 'refunded', 'disputed');
CREATE TYPE "generation_status" AS ENUM ('blocked', 'queued', 'generating', 'validating', 'completed', 'retryable_failed', 'permanently_failed');
CREATE TYPE "delivery_status" AS ENUM ('not_requested', 'pending', 'sent', 'delivered', 'bounced', 'failed');
CREATE TYPE "processing_status" AS ENUM ('received', 'processed', 'ignored', 'failed');
CREATE TYPE "entitlement_status" AS ENUM ('active', 'revoked');
CREATE TYPE "job_status" AS ENUM ('queued', 'running', 'retry_scheduled', 'completed', 'dead_letter');

CREATE TABLE "report_requests" (
  "id" uuid PRIMARY KEY NOT NULL,
  "answers_json" jsonb NOT NULL,
  "result_type" text NOT NULL,
  "result_name_ja" text NOT NULL,
  "result_name_en" text NOT NULL,
  "payment_status" "payment_status" DEFAULT 'awaiting_payment' NOT NULL,
  "generation_status" "generation_status" DEFAULT 'blocked' NOT NULL,
  "report_version" text,
  "retry_count" integer DEFAULT 0 NOT NULL,
  "delivery_status" "delivery_status" DEFAULT 'not_requested' NOT NULL,
  "expires_at" timestamptz,
  "retention_delete_at" timestamptz NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "report_requests_retry_count_nonnegative" CHECK ("retry_count" >= 0)
);

CREATE TABLE "stripe_events" (
  "event_id" text PRIMARY KEY NOT NULL,
  "event_type" text NOT NULL,
  "object_id" text,
  "livemode" boolean NOT NULL,
  "status" "processing_status" DEFAULT 'received' NOT NULL,
  "received_at" timestamptz DEFAULT now() NOT NULL,
  "processed_at" timestamptz
);

CREATE TABLE "payments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "report_request_id" uuid NOT NULL REFERENCES "report_requests"("id") ON DELETE RESTRICT,
  "checkout_session_id" text NOT NULL,
  "payment_intent_id" text,
  "product_id" text NOT NULL,
  "price_id" text NOT NULL,
  "amount" bigint NOT NULL,
  "currency" text NOT NULL,
  "livemode" boolean NOT NULL,
  "status" "payment_status" NOT NULL,
  "paid_at" timestamptz,
  "refunded_at" timestamptz,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "payments_amount_nonnegative" CHECK ("amount" >= 0)
);

CREATE TABLE "entitlements" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "report_request_id" uuid NOT NULL REFERENCES "report_requests"("id") ON DELETE RESTRICT,
  "payment_id" uuid NOT NULL REFERENCES "payments"("id") ON DELETE RESTRICT,
  "status" "entitlement_status" DEFAULT 'active' NOT NULL,
  "granted_at" timestamptz DEFAULT now() NOT NULL,
  "revoked_at" timestamptz
);

CREATE TABLE "generation_jobs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "report_request_id" uuid NOT NULL REFERENCES "report_requests"("id") ON DELETE CASCADE,
  "status" "job_status" DEFAULT 'queued' NOT NULL,
  "attempt" integer DEFAULT 0 NOT NULL,
  "available_at" timestamptz DEFAULT now() NOT NULL,
  "leased_at" timestamptz,
  "completed_at" timestamptz,
  "error_code" text,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "generation_jobs_attempt_nonnegative" CHECK ("attempt" >= 0)
);

CREATE TABLE "reports" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "report_request_id" uuid NOT NULL REFERENCES "report_requests"("id") ON DELETE CASCADE,
  "schema_version" text NOT NULL,
  "report_version" text NOT NULL,
  "prompt_version" text NOT NULL,
  "template_version" text NOT NULL,
  "provider" text NOT NULL,
  "model" text NOT NULL,
  "report_json" jsonb NOT NULL,
  "pdf_blob_path" text,
  "checksum" text NOT NULL,
  "retention_delete_at" timestamptz NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE "delivery_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "report_request_id" uuid NOT NULL REFERENCES "report_requests"("id") ON DELETE CASCADE,
  "report_id" uuid NOT NULL REFERENCES "reports"("id") ON DELETE CASCADE,
  "provider_message_id" text,
  "recipient_hash" text NOT NULL,
  "attempt" integer DEFAULT 0 NOT NULL,
  "status" "delivery_status" NOT NULL,
  "error_code" text,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "delivery_attempt_nonnegative" CHECK ("attempt" >= 0)
);

CREATE TABLE "report_access_tokens" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "report_request_id" uuid NOT NULL REFERENCES "report_requests"("id") ON DELETE CASCADE,
  "token_hash" text NOT NULL,
  "expires_at" timestamptz NOT NULL,
  "consumed_at" timestamptz,
  "revoked_at" timestamptz,
  "created_at" timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX "report_requests_status_idx" ON "report_requests" ("payment_status", "generation_status");
CREATE INDEX "report_requests_retention_idx" ON "report_requests" ("retention_delete_at");
CREATE INDEX "stripe_events_object_idx" ON "stripe_events" ("object_id", "event_type");
CREATE UNIQUE INDEX "payments_checkout_session_uidx" ON "payments" ("checkout_session_id");
CREATE UNIQUE INDEX "payments_payment_intent_uidx" ON "payments" ("payment_intent_id");
CREATE INDEX "payments_report_request_idx" ON "payments" ("report_request_id");
CREATE UNIQUE INDEX "entitlements_report_request_uidx" ON "entitlements" ("report_request_id");
CREATE UNIQUE INDEX "entitlements_payment_uidx" ON "entitlements" ("payment_id");
CREATE UNIQUE INDEX "generation_jobs_request_attempt_uidx" ON "generation_jobs" ("report_request_id", "attempt");
CREATE INDEX "generation_jobs_queue_idx" ON "generation_jobs" ("status", "available_at");
CREATE UNIQUE INDEX "reports_request_version_uidx" ON "reports" ("report_request_id", "report_version");
CREATE INDEX "reports_retention_idx" ON "reports" ("retention_delete_at");
CREATE UNIQUE INDEX "delivery_provider_message_uidx" ON "delivery_events" ("provider_message_id");
CREATE UNIQUE INDEX "delivery_request_attempt_uidx" ON "delivery_events" ("report_request_id", "attempt");
CREATE UNIQUE INDEX "report_access_tokens_hash_uidx" ON "report_access_tokens" ("token_hash");
CREATE INDEX "report_access_tokens_request_idx" ON "report_access_tokens" ("report_request_id");
CREATE INDEX "report_access_tokens_expiry_idx" ON "report_access_tokens" ("expires_at");
