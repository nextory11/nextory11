import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { AccessTokensRepository } from "../../server/db/repositories/access-tokens.js";
import { EntitlementsRepository } from "../../server/db/repositories/entitlements.js";
import { JobsRepository } from "../../server/db/repositories/jobs.js";
import { PaymentsRepository } from "../../server/db/repositories/payments.js";
import { ReportRequestsRepository } from "../../server/db/repositories/report-requests.js";
import { ReportsRepository } from "../../server/db/repositories/reports.js";
import { StripeEventsRepository } from "../../server/db/repositories/stripe-events.js";
import type { Database } from "../../server/db/client.js";
import * as schema from "../../server/db/schema.js";
import {
  calculateDiagnosisResult,
  normalizeDiagnosisAnswers,
  type RecognizedAnswer,
} from "../../server/reports/result-calculator.js";
import { generateAccessToken, generateRequestId, hashAccessToken } from "../../server/security/tokens.js";
import { parseReportRequest } from "../../server/validation/report-request.js";
import { DatabasePaymentEventStore } from "../../server/stripe/process-event.js";

const runId = randomUUID();
const syntheticRequestIds: string[] = [];
let pool: Pool;

function parseLocalEnv(contents: string): Record<string, string> {
  const values: Record<string, string> = {};
  for (const line of contents.split(/\r?\n/u)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/u);
    if (!match) continue;
    values[match[1]] = match[2].replace(/^(['"])(.*)\1$/u, "$2");
  }
  return values;
}

const recognizedAnswers: RecognizedAnswer[] = Array.from({ length: 11 }, (_, index) => ({
  questionId: (index + 1) as RecognizedAnswer["questionId"],
  answerId: "A" as const,
}));

async function withRollback<T>(test: (db: Database) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  await client.query("BEGIN");
  const db = drizzle(client, { schema }) as Database;
  try {
    return await test(db);
  } finally {
    await client.query("ROLLBACK");
    client.release();
  }
}

async function expectUniqueViolation(operation: Promise<unknown>) {
  try {
    await operation;
    throw new Error("Expected a database uniqueness violation.");
  } catch (error) {
    expect((error as { cause?: { code?: string } }).cause?.code).toBe("23505");
  }
}

async function createSyntheticRequest(db: Database) {
  const parsed = parseReportRequest({ answers: recognizedAnswers });
  const result = calculateDiagnosisResult(parsed.answers);
  const requestId = generateRequestId();
  syntheticRequestIds.push(requestId);
  const repository = new ReportRequestsRepository(db);
  const record = await repository.create({
    id: requestId,
    answersJson: parsed.answers,
    resultType: result.resultType,
    resultNameJa: result.resultNameJa,
    resultNameEn: result.resultNameEn,
    paymentStatus: "awaiting_payment",
    generationStatus: "blocked",
    deliveryStatus: "not_requested",
    retentionDeleteAt: new Date(Date.now() + 86_400_000),
  });
  return { record, parsed, result };
}

beforeAll(async () => {
  const values = parseLocalEnv(await readFile(".env.local", "utf8"));
  const directUrl = values.DATABASE_URL_UNPOOLED;
  if (!directUrl) throw new Error("Development direct database configuration is missing.");
  const hostname = new URL(directUrl).hostname;
  if (hostname.includes("-pooler")) {
    throw new Error("Integration tests require the direct Development database connection.");
  }
  pool = new Pool({ connectionString: directUrl });
});

afterAll(async () => {
  if (!pool) return;
  const client = await pool.connect();
  try {
    const requestCount = syntheticRequestIds.length
      ? await client.query(
          "select count(*)::int as count from report_requests where id = any($1::uuid[])",
          [syntheticRequestIds],
        )
      : { rows: [{ count: 0 }] };
    const markerCount = await client.query(
      `select (
        (select count(*) from stripe_events where event_id like $1) +
        (select count(*) from payments where checkout_session_id like $2) +
        (select count(*) from reports where provider = $3)
      )::int as count`,
      [`evt_nextory11_phase_a_${runId}%`, `cs_nextory11_phase_a_${runId}%`, `phase-a-test-${runId}`],
    );
    expect(requestCount.rows[0].count).toBe(0);
    expect(markerCount.rows[0].count).toBe(0);
  } finally {
    client.release();
    await pool.end();
  }
});

describe("Neon Development database integration", () => {
  it("creates and retrieves a valid blocked report request with 11 server-derived answers", async () => {
    await withRollback(async (db) => {
      const { record, parsed, result } = await createSyntheticRequest(db);
      const storedAnswers = record.answersJson as unknown[];
      expect(storedAnswers).toHaveLength(11);
      expect(record.resultType).toBe(result.resultType);
      expect(record.resultType).toBe("challenger");
      expect(record.paymentStatus).toBe("awaiting_payment");
      expect(record.generationStatus).toBe("blocked");
      expect(parsed.answers).toEqual(normalizeDiagnosisAnswers(recognizedAnswers));

      const status = await new ReportRequestsRepository(db).findStatusById(record.id);
      expect(status).toMatchObject({
        id: record.id,
        paymentStatus: "awaiting_payment",
        generationStatus: "blocked",
        resultType: "challenger",
      });
    });
  });

  it("rejects invalid, missing, duplicate, and unknown question IDs before storage", () => {
    expect(() => parseReportRequest({ answers: recognizedAnswers.slice(0, 10) })).toThrow();
    expect(() =>
      parseReportRequest({
        answers: recognizedAnswers.map((answer, index) =>
          index === 10 ? { ...answer, questionId: 10 } : answer,
        ),
      }),
    ).toThrow();
    expect(() =>
      parseReportRequest({
        answers: recognizedAnswers.map((answer, index) =>
          index === 10 ? { ...answer, questionId: 99 } : answer,
        ),
      }),
    ).toThrow();
    expect(() => parseReportRequest({ answers: [] })).toThrow();
  });

  it("records a Stripe event idempotently", async () => {
    await withRollback(async (db) => {
      const repository = new StripeEventsRepository(db);
      const event = {
        eventId: `evt_nextory11_phase_a_${runId}_unique`,
        eventType: "checkout.session.completed",
        objectId: `cs_nextory11_phase_a_${runId}_event`,
        livemode: false,
      };
      expect(await repository.recordOnce(event)).not.toBeNull();
      expect(await repository.recordOnce(event)).toBeNull();
    });
  });

  it("enforces payment reference uniqueness", async () => {
    await withRollback(async (db) => {
      const { record } = await createSyntheticRequest(db);
      const repository = new PaymentsRepository(db);
      const payment = {
        reportRequestId: record.id,
        checkoutSessionId: `cs_nextory11_phase_a_${runId}_payment`,
        paymentIntentId: `pi_nextory11_phase_a_${runId}`,
        productId: "prod_synthetic",
        priceId: "price_synthetic",
        amount: 980,
        currency: "jpy",
        livemode: false,
        status: "paid" as const,
      };
      await repository.create(payment);
      await expectUniqueViolation(repository.create({ ...payment, id: randomUUID() }));
    });
  });

  it("grants at most one entitlement per report request", async () => {
    await withRollback(async (db) => {
      const { record } = await createSyntheticRequest(db);
      const payment = await new PaymentsRepository(db).create({
        reportRequestId: record.id,
        checkoutSessionId: `cs_nextory11_phase_a_${runId}_entitlement`,
        productId: "prod_synthetic",
        priceId: "price_synthetic",
        amount: 980,
        currency: "jpy",
        livemode: false,
        status: "paid",
      });
      const repository = new EntitlementsRepository(db);
      expect(await repository.grantOnce({ reportRequestId: record.id, paymentId: payment.id })).not.toBeNull();
      expect(await repository.grantOnce({ reportRequestId: record.id, paymentId: payment.id })).toBeNull();
    });
  });

  it("enforces generation-job attempt uniqueness", async () => {
    await withRollback(async (db) => {
      const { record } = await createSyntheticRequest(db);
      const repository = new JobsRepository(db);
      const job = { reportRequestId: record.id, attempt: 0, status: "queued" as const };
      expect(await repository.enqueueOnce(job)).not.toBeNull();
      expect(await repository.enqueueOnce(job)).toBeNull();
    });
  });

  it("atomically records verified payment, entitlement, queued state, and one generation job", async () => {
    await withRollback(async (db) => {
      const { record } = await createSyntheticRequest(db);
      const transitionTime = new Date();
      const store = new DatabasePaymentEventStore(db, () => transitionTime);
      const input = {
        eventId: `evt_nextory11_phase_a_${runId}_durable_job`,
        eventType: "checkout.session.completed",
        objectId: `cs_nextory11_phase_a_${runId}_durable_job`,
        payment: {
          reportRequestId: record.id,
          checkoutSessionId: `cs_nextory11_phase_a_${runId}_durable_job`,
          paymentIntentId: `pi_nextory11_phase_a_${runId}_durable_job`,
          productId: "prod_synthetic",
          priceId: "price_synthetic",
          amount: 980,
          currency: "jpy" as const,
          livemode: false,
          paidAt: transitionTime,
        },
      };
      expect(await store.applyPaidEventInTransaction(db, input)).toBe("processed");
      expect(await store.applyPaidEventInTransaction(db, input)).toBe("duplicate");
      expect(await new ReportRequestsRepository(db).findStatusById(record.id)).toMatchObject({
        paymentStatus: "paid",
        generationStatus: "queued",
      });
      expect(await new EntitlementsRepository(db).findActiveByRequestId(record.id)).not.toBeNull();
      expect(await new JobsRepository(db).listByRequestId(record.id)).toHaveLength(1);
    });
  });

  it("enforces report-version uniqueness", async () => {
    await withRollback(async (db) => {
      const { record } = await createSyntheticRequest(db);
      const repository = new ReportsRepository(db);
      const report = {
        reportRequestId: record.id,
        schemaVersion: "1",
        reportVersion: "phase-a-v1",
        promptVersion: "placeholder",
        templateVersion: "placeholder",
        provider: `phase-a-test-${runId}`,
        model: "synthetic",
        reportJson: { synthetic: true },
        checksum: "synthetic-checksum",
        retentionDeleteAt: new Date(Date.now() + 86_400_000),
      };
      await repository.createVersion(report);
      await expectUniqueViolation(repository.createVersion(report));
    });
  });

  it("stores only an access-token hash and retrieves an unexpired token", async () => {
    await withRollback(async (db) => {
      const { record } = await createSyntheticRequest(db);
      const token = generateAccessToken();
      const tokenHash = hashAccessToken(token, "synthetic-phase-a-pepper-with-more-than-32-characters");
      const repository = new AccessTokensRepository(db);
      const created = await repository.create({
        reportRequestId: record.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 60_000),
      });
      expect(created.tokenHash).toBe(tokenHash);
      expect(created.tokenHash).not.toBe(token);
      expect(await repository.findUsableByHash(tokenHash)).toMatchObject({ id: created.id });
      expect(await repository.findUsableByHash(hashAccessToken(`${token}x`, "synthetic-phase-a-pepper-with-more-than-32-characters"))).toBeNull();
    });
  });
});
