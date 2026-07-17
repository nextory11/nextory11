import { createHash } from "node:crypto";
import { parseAiReportEnv } from "../config/env.js";
import { EntitlementsRepository } from "../db/repositories/entitlements.js";
import { ReportRequestsRepository } from "../db/repositories/report-requests.js";
import { ReportsRepository } from "../db/repositories/reports.js";
import { OpenAiReportProvider } from "../ai/openai-report-provider.js";
import type { ReportGeneratorProvider } from "../ai/provider.js";
import { validateReport } from "../ai/validate-report.js";
import { buildPremiumReportProfile } from "./build-premium-profile.js";
import { normalizeDiagnosisAnswers, type RecognizedAnswer } from "./result-calculator.js";
import { AI_JUZA_SYSTEM_PROMPT_VERSION } from "../ai/prompts/ai-juza-premium.v1.js";
import { PERSONAL_STAR_REPORT_TEMPLATE_VERSION, PERSONAL_STAR_REPORT_VERSION } from "./templates/personal-star-report.v1.js";

export class PremiumReportGenerationError extends Error {
  constructor(readonly code: string, readonly statusCode: number) { super(code); this.name = "PremiumReportGenerationError"; }
}

type Dependencies = {
  provider?: ReportGeneratorProvider;
  requests?: Pick<ReportRequestsRepository, "findForGeneration" | "claimGeneration" | "markValidating" | "markCompleted" | "markGenerationFailure">;
  entitlements?: Pick<EntitlementsRepository, "findActiveByRequestId">;
  reports?: Pick<ReportsRepository, "findLatestByRequestId" | "createVersion">;
};

export async function generatePremiumReport(requestId: string, dependencies: Dependencies = {}) {
  const requests = dependencies.requests ?? new ReportRequestsRepository();
  const entitlements = dependencies.entitlements ?? new EntitlementsRepository();
  const reports = dependencies.reports ?? new ReportsRepository();
  const [request, entitlement, existing] = await Promise.all([
    requests.findForGeneration(requestId), entitlements.findActiveByRequestId(requestId), reports.findLatestByRequestId(requestId),
  ]);
  if (!request) throw new PremiumReportGenerationError("report_request_not_found", 404);
  if (!entitlement || request.paymentStatus !== "paid") throw new PremiumReportGenerationError("premium_entitlement_required", 403);
  if (existing) return { report: existing.reportJson, created: false };
  if (request.retryCount >= 3) throw new PremiumReportGenerationError("generation_retry_limit", 409);
  const claimed = await requests.claimGeneration(requestId);
  if (!claimed) throw new PremiumReportGenerationError("generation_in_progress", 409);

  const env = dependencies.provider ? null : parseAiReportEnv();
  const provider = dependencies.provider ?? new OpenAiReportProvider({ apiKey: env!.OPENAI_API_KEY, model: env!.AI_REPORT_MODEL });
  try {
    const answers = normalizeDiagnosisAnswers(claimed.answersJson as RecognizedAnswer[]);
    const profile = buildPremiumReportProfile(answers, claimed.resultType);
    const receipt = await provider.generateReport({
      requestId, result: { resultType: claimed.resultType, resultNameJa: claimed.resultNameJa, resultNameEn: claimed.resultNameEn },
      answers, profile, language: "ja", reportVersion: PERSONAL_STAR_REPORT_VERSION,
      promptVersion: AI_JUZA_SYSTEM_PROMPT_VERSION, templateVersion: PERSONAL_STAR_REPORT_TEMPLATE_VERSION,
    }, { attempt: claimed.retryCount, idempotencyKey: `premium-report:${requestId}:${PERSONAL_STAR_REPORT_VERSION}` });
    await requests.markValidating(requestId);
    const report = validateReport(receipt.report, { requestId, resultType: claimed.resultType, resultNameJa: claimed.resultNameJa });
    const checksum = createHash("sha256").update(JSON.stringify(report)).digest("hex");
    await reports.createVersion({
      id: report.reportId, reportRequestId: requestId, schemaVersion: report.schemaVersion,
      reportVersion: report.reportVersion, promptVersion: report.metadata.promptVersion,
      templateVersion: report.metadata.templateVersion, provider: receipt.provider, model: receipt.model,
      reportJson: report, checksum, retentionDeleteAt: claimed.retentionDeleteAt,
    });
    await requests.markCompleted(requestId, report.reportVersion);
    return { report, created: true };
  } catch (error) {
    const decision = provider.retryGeneration(error, claimed.retryCount + 1);
    await requests.markGenerationFailure(requestId, decision.retry);
    throw new PremiumReportGenerationError(decision.retry ? "generation_retry_available" : "generation_unavailable", decision.retry ? 503 : 422);
  }
}
