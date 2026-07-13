import { getTableConfig } from "drizzle-orm/pg-core";
import { describe, expect, it } from "vitest";
import {
  entitlements,
  generationJobs,
  payments,
  reportAccessTokens,
  reports,
} from "../../server/db/schema.js";

describe("repository database constraints", () => {
  it("defines unique payment and entitlement correlation keys", () => {
    const paymentIndexes = getTableConfig(payments).indexes.map((index) => index.config.name);
    const entitlementIndexes = getTableConfig(entitlements).indexes.map((index) => index.config.name);
    expect(paymentIndexes).toContain("payments_checkout_session_uidx");
    expect(paymentIndexes).toContain("payments_payment_intent_uidx");
    expect(entitlementIndexes).toContain("entitlements_report_request_uidx");
  });

  it("defines idempotency constraints for jobs, reports, and access tokens", () => {
    expect(getTableConfig(generationJobs).indexes.map((index) => index.config.name)).toContain(
      "generation_jobs_request_attempt_uidx",
    );
    expect(getTableConfig(reports).indexes.map((index) => index.config.name)).toContain(
      "reports_request_version_uidx",
    );
    expect(getTableConfig(reportAccessTokens).indexes.map((index) => index.config.name)).toContain(
      "report_access_tokens_hash_uidx",
    );
  });
});
