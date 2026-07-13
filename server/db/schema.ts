import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const paymentStatusEnum = pgEnum("payment_status", [
  "awaiting_payment",
  "paid",
  "failed",
  "refunded",
  "disputed",
]);
export const generationStatusEnum = pgEnum("generation_status", [
  "blocked",
  "queued",
  "generating",
  "validating",
  "completed",
  "retryable_failed",
  "permanently_failed",
]);
export const deliveryStatusEnum = pgEnum("delivery_status", [
  "not_requested",
  "pending",
  "sent",
  "delivered",
  "bounced",
  "failed",
]);
export const processingStatusEnum = pgEnum("processing_status", [
  "received",
  "processed",
  "ignored",
  "failed",
]);
export const entitlementStatusEnum = pgEnum("entitlement_status", ["active", "revoked"]);
export const jobStatusEnum = pgEnum("job_status", [
  "queued",
  "running",
  "retry_scheduled",
  "completed",
  "dead_letter",
]);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
};

export const reportRequests = pgTable(
  "report_requests",
  {
    id: uuid("id").primaryKey(),
    answersJson: jsonb("answers_json").notNull(),
    resultType: text("result_type").notNull(),
    resultNameJa: text("result_name_ja").notNull(),
    resultNameEn: text("result_name_en").notNull(),
    paymentStatus: paymentStatusEnum("payment_status").default("awaiting_payment").notNull(),
    generationStatus: generationStatusEnum("generation_status").default("blocked").notNull(),
    reportVersion: text("report_version"),
    retryCount: integer("retry_count").default(0).notNull(),
    deliveryStatus: deliveryStatusEnum("delivery_status").default("not_requested").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    retentionDeleteAt: timestamp("retention_delete_at", { withTimezone: true }).notNull(),
    ...timestamps,
  },
  (table) => [
    check("report_requests_retry_count_nonnegative", sql`${table.retryCount} >= 0`),
    index("report_requests_status_idx").on(table.paymentStatus, table.generationStatus),
    index("report_requests_retention_idx").on(table.retentionDeleteAt),
  ],
);

export const stripeEvents = pgTable(
  "stripe_events",
  {
    eventId: text("event_id").primaryKey(),
    eventType: text("event_type").notNull(),
    objectId: text("object_id"),
    livemode: boolean("livemode").notNull(),
    status: processingStatusEnum("status").default("received").notNull(),
    receivedAt: timestamp("received_at", { withTimezone: true }).defaultNow().notNull(),
    processedAt: timestamp("processed_at", { withTimezone: true }),
  },
  (table) => [index("stripe_events_object_idx").on(table.objectId, table.eventType)],
);

export const payments = pgTable(
  "payments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    reportRequestId: uuid("report_request_id")
      .notNull()
      .references(() => reportRequests.id, { onDelete: "restrict" }),
    checkoutSessionId: text("checkout_session_id").notNull(),
    paymentIntentId: text("payment_intent_id"),
    productId: text("product_id").notNull(),
    priceId: text("price_id").notNull(),
    amount: bigint("amount", { mode: "number" }).notNull(),
    currency: text("currency").notNull(),
    livemode: boolean("livemode").notNull(),
    status: paymentStatusEnum("status").notNull(),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    refundedAt: timestamp("refunded_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("payments_checkout_session_uidx").on(table.checkoutSessionId),
    uniqueIndex("payments_payment_intent_uidx").on(table.paymentIntentId),
    check("payments_amount_nonnegative", sql`${table.amount} >= 0`),
    index("payments_report_request_idx").on(table.reportRequestId),
  ],
);

export const entitlements = pgTable(
  "entitlements",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    reportRequestId: uuid("report_request_id")
      .notNull()
      .references(() => reportRequests.id, { onDelete: "restrict" }),
    paymentId: uuid("payment_id")
      .notNull()
      .references(() => payments.id, { onDelete: "restrict" }),
    status: entitlementStatusEnum("status").default("active").notNull(),
    grantedAt: timestamp("granted_at", { withTimezone: true }).defaultNow().notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("entitlements_report_request_uidx").on(table.reportRequestId),
    uniqueIndex("entitlements_payment_uidx").on(table.paymentId),
  ],
);

export const generationJobs = pgTable(
  "generation_jobs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    reportRequestId: uuid("report_request_id")
      .notNull()
      .references(() => reportRequests.id, { onDelete: "cascade" }),
    status: jobStatusEnum("status").default("queued").notNull(),
    attempt: integer("attempt").default(0).notNull(),
    availableAt: timestamp("available_at", { withTimezone: true }).defaultNow().notNull(),
    leasedAt: timestamp("leased_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    errorCode: text("error_code"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("generation_jobs_request_attempt_uidx").on(table.reportRequestId, table.attempt),
    check("generation_jobs_attempt_nonnegative", sql`${table.attempt} >= 0`),
    index("generation_jobs_queue_idx").on(table.status, table.availableAt),
  ],
);

export const reports = pgTable(
  "reports",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    reportRequestId: uuid("report_request_id")
      .notNull()
      .references(() => reportRequests.id, { onDelete: "cascade" }),
    schemaVersion: text("schema_version").notNull(),
    reportVersion: text("report_version").notNull(),
    promptVersion: text("prompt_version").notNull(),
    templateVersion: text("template_version").notNull(),
    provider: text("provider").notNull(),
    model: text("model").notNull(),
    reportJson: jsonb("report_json").notNull(),
    pdfBlobPath: text("pdf_blob_path"),
    checksum: text("checksum").notNull(),
    retentionDeleteAt: timestamp("retention_delete_at", { withTimezone: true }).notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("reports_request_version_uidx").on(table.reportRequestId, table.reportVersion),
    index("reports_retention_idx").on(table.retentionDeleteAt),
  ],
);

export const deliveryEvents = pgTable(
  "delivery_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    reportRequestId: uuid("report_request_id")
      .notNull()
      .references(() => reportRequests.id, { onDelete: "cascade" }),
    reportId: uuid("report_id")
      .notNull()
      .references(() => reports.id, { onDelete: "cascade" }),
    providerMessageId: text("provider_message_id"),
    recipientHash: text("recipient_hash").notNull(),
    attempt: integer("attempt").default(0).notNull(),
    status: deliveryStatusEnum("status").notNull(),
    errorCode: text("error_code"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("delivery_provider_message_uidx").on(table.providerMessageId),
    uniqueIndex("delivery_request_attempt_uidx").on(table.reportRequestId, table.attempt),
    check("delivery_attempt_nonnegative", sql`${table.attempt} >= 0`),
  ],
);

export const reportAccessTokens = pgTable(
  "report_access_tokens",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    reportRequestId: uuid("report_request_id")
      .notNull()
      .references(() => reportRequests.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    consumedAt: timestamp("consumed_at", { withTimezone: true }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("report_access_tokens_hash_uidx").on(table.tokenHash),
    index("report_access_tokens_request_idx").on(table.reportRequestId),
    index("report_access_tokens_expiry_idx").on(table.expiresAt),
  ],
);

export type ReportRequestRecord = typeof reportRequests.$inferSelect;
export type NewReportRequestRecord = typeof reportRequests.$inferInsert;
