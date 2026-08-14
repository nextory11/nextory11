import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import officialPack from "../../src/data/questionBank/nextory11-question-pack-v1.json" with { type: "json" };
import { premiumV231ReportEnvelopeSchema } from "../../server/ai/premium-v2-envelope.js";
import { getDatabase } from "../../server/db/client.js";
import { entitlements, payments, reportAccessTokens, reportRequests, reports } from "../../server/db/schema.js";
import type { VercelRequestLike, VercelResponseLike } from "../../server/http/vercel.js";
import { generatePremiumReportVersioned } from "../../server/reports/generate-premium-report-versioned.js";
import { calculateDiagnosisResult, type RecognizedAnswer } from "../../server/reports/result-calculator.js";
import { generateAccessToken, hashAccessToken } from "../../server/security/tokens.js";

const VERIFY_GATE = "PREMIUM_V231_INTERNAL_VERIFICATION_ENABLED";
const VERIFY_SECRET = "PREMIUM_V231_INTERNAL_VERIFICATION_SECRET";
const VERIFY_HEADER = "x-nextory-verification-token";
const LIFECYCLE_LABEL = "premium-v231-final-production-verification";

const requestSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("run") }).strict(),
  z.object({ action: z.literal("cleanup"), cleanupToken: z.string().regex(/^[a-f0-9]{64}$/u) }).strict(),
]);

type SyntheticIdentity = {
  requestId: string;
  paymentId: string;
  accessToken: string;
  createdAt: string;
  result: { type: string; ja: string; en: string };
};

type HandlerDependencies = {
  setupSynthetic(): Promise<SyntheticIdentity>;
  generate(requestId: string): ReturnType<typeof generatePremiumReportVersioned>;
  cleanupSynthetic(): Promise<number>;
};

function sha256(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function deterministicUuid(secret: string, label: string) {
  const hex = sha256(`${LIFECYCLE_LABEL}:${label}:${secret}`).slice(0, 32);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20)}`;
}

function cleanupToken(secret: string, requestId: string) {
  return createHmac("sha256", secret).update(`cleanup:${requestId}`, "utf8").digest("hex");
}

function authorized(request: VercelRequestLike, expected: string) {
  const raw = request.headers[VERIFY_HEADER];
  const supplied = Array.isArray(raw) ? raw[0] : raw;
  if (!supplied) return false;
  const left = Buffer.from(sha256(supplied), "hex");
  const right = Buffer.from(sha256(expected), "hex");
  return timingSafeEqual(left, right);
}

function verificationConfig(source: NodeJS.ProcessEnv = process.env) {
  if (source.VERCEL_ENV !== "production" || source[VERIFY_GATE] !== "true") return null;
  const secret = source[VERIFY_SECRET];
  const pepper = source.REPORT_TOKEN_PEPPER;
  if (!secret || secret.length < 32 || !pepper || pepper.length < 32) return null;
  return { secret, pepper };
}

async function setupProductionSynthetic(): Promise<SyntheticIdentity> {
  const config = verificationConfig();
  if (!config) throw new Error("verification_disabled");
  const db = getDatabase();
  const requestId = deterministicUuid(config.secret, "request");
  const paymentId = deterministicUuid(config.secret, "payment");
  const accessToken = generateAccessToken();
  const createdAt = new Date();
  const retentionDeleteAt = new Date(createdAt.getTime() + 2 * 60 * 60 * 1000);
  const answers = officialPack.questions.slice(0, 11).map((question) => ({
    questionId: question.id,
    answerId: question.options[0]!.id as RecognizedAnswer["answerId"],
  }));
  const result = calculateDiagnosisResult(answers);

  await db.transaction(async (tx) => {
    const [existing] = await tx.select({ id: reportRequests.id }).from(reportRequests)
      .where(eq(reportRequests.id, requestId)).limit(1);
    if (existing) throw new Error("verification_already_exists");
    await tx.insert(reportRequests).values({
      id: requestId,
      answersJson: answers,
      resultType: result.resultType,
      resultNameJa: result.resultNameJa,
      resultNameEn: result.resultNameEn,
      paymentStatus: "paid",
      generationStatus: "blocked",
      retentionDeleteAt,
    });
    await tx.insert(payments).values({
      id: paymentId,
      reportRequestId: requestId,
      checkoutSessionId: `cs_internal_${requestId}`,
      paymentIntentId: `pi_internal_${requestId}`,
      productId: "synthetic-internal",
      priceId: "synthetic-internal",
      amount: 0,
      currency: "jpy",
      livemode: false,
      status: "paid",
      paidAt: createdAt,
    });
    await tx.insert(entitlements).values({ reportRequestId: requestId, paymentId, status: "active" });
    await tx.insert(reportAccessTokens).values({
      reportRequestId: requestId,
      tokenHash: hashAccessToken(accessToken, config.pepper),
      expiresAt: retentionDeleteAt,
    });
  });

  return {
    requestId,
    paymentId,
    accessToken,
    createdAt: createdAt.toISOString(),
    result: { type: result.resultType, ja: result.resultNameJa, en: result.resultNameEn },
  };
}

async function cleanupProductionSynthetic() {
  const config = verificationConfig();
  if (!config) throw new Error("verification_disabled");
  const db = getDatabase();
  const requestId = deterministicUuid(config.secret, "request");
  const paymentId = deterministicUuid(config.secret, "payment");
  await db.transaction(async (tx) => {
    await tx.delete(reportAccessTokens).where(eq(reportAccessTokens.reportRequestId, requestId));
    await tx.delete(reports).where(eq(reports.reportRequestId, requestId));
    await tx.delete(entitlements).where(and(eq(entitlements.reportRequestId, requestId), eq(entitlements.paymentId, paymentId)));
    await tx.delete(payments).where(and(eq(payments.reportRequestId, requestId), eq(payments.id, paymentId)));
    await tx.delete(reportRequests).where(eq(reportRequests.id, requestId));
  });
  const [residual] = await db.select({ id: reportRequests.id }).from(reportRequests)
    .where(eq(reportRequests.id, requestId)).limit(1);
  return residual ? 1 : 0;
}

const productionDependencies: HandlerDependencies = {
  setupSynthetic: setupProductionSynthetic,
  generate: generatePremiumReportVersioned,
  cleanupSynthetic: cleanupProductionSynthetic,
};

export function createPremiumV231VerificationHandler(dependencies: HandlerDependencies = productionDependencies) {
  return async function handler(request: VercelRequestLike, response: VercelResponseLike) {
    response.setHeader("Cache-Control", "no-store");
    const config = verificationConfig();
    if (!config) return response.status(404).json({ error: "not_found" });
    if (request.method !== "POST") return response.status(404).json({ error: "not_found" });
    if (!authorized(request, config.secret)) return response.status(404).json({ error: "not_found" });
    const parsed = requestSchema.safeParse(request.body);
    if (!parsed.success) return response.status(400).json({ error: "invalid_verification_request" });

    if (parsed.data.action === "cleanup") {
      const requestId = deterministicUuid(config.secret, "request");
      const expected = cleanupToken(config.secret, requestId);
      if (!timingSafeEqual(Buffer.from(parsed.data.cleanupToken, "hex"), Buffer.from(expected, "hex"))) {
        return response.status(404).json({ error: "not_found" });
      }
      const residualRows = await dependencies.cleanupSynthetic();
      return response.status(residualRows === 0 ? 200 : 500).json({ status: residualRows === 0 ? "cleaned" : "cleanup_failed", residualRows });
    }

    let synthetic: SyntheticIdentity | undefined;
    try {
      synthetic = await dependencies.setupSynthetic();
      const generated = await dependencies.generate(synthetic.requestId);
      if (!generated.created) throw new Error("verification_generation_not_created");
      const envelope = premiumV231ReportEnvelopeSchema.parse(generated.report);
      const restored = await dependencies.generate(synthetic.requestId);
      if (restored.created) throw new Error("verification_duplicate_generation");
      premiumV231ReportEnvelopeSchema.parse(restored.report);
      return response.status(201).json({
        status: "completed",
        reportVersion: envelope.reportVersion,
        promptVersion: envelope.promptVersion,
        requestId: synthetic.requestId,
        accessToken: synthetic.accessToken,
        createdAt: synthetic.createdAt,
        result: synthetic.result,
        cleanupToken: cleanupToken(config.secret, deterministicUuid(config.secret, "request")),
      });
    } catch (error) {
      if (error instanceof Error && error.message === "verification_already_exists") {
        return response.status(409).json({ error: "verification_already_executed" });
      }
      if (synthetic) await dependencies.cleanupSynthetic().catch(() => undefined);
      return response.status(500).json({ error: "verification_failed" });
    }
  };
}

export default createPremiumV231VerificationHandler();
