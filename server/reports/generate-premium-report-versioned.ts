import { createPremiumV231ReportEnvelope } from "../ai/premium-v2-envelope.js";
import { adaptProductionDiagnosisToPremiumV2 } from "../ai/premium-v2-production-adapter.js";
import {
  generateOrRestorePremiumV231,
  isPremiumV231ProductionEnabled,
  PremiumV231IntegrationError,
  PremiumV231ProductionEntitlementAdapter,
  PremiumV231ProductionPersistenceAdapter,
} from "../ai/premium-v231-production-integration.js";
import { generatePremiumV2Review, PremiumV2ProviderError } from "../ai/openai-report-provider.v2.js";
import {
  AI_JUZA_PREMIUM_V231_PROMPT_VERSION,
  AI_JUZA_PREMIUM_V231_SYSTEM_PROMPT,
} from "../ai/prompts/ai-juza-premium.v2.3.1.js";
import { AI_JUZA_PREMIUM_V2_RECOMMENDED_MAX_OUTPUT_TOKENS } from "../ai/prompts/ai-juza-premium.v2.js";
import { parsePremiumV231Env } from "../config/env.js";
import { EntitlementsRepository } from "../db/repositories/entitlements.js";
import { ReportRequestsRepository } from "../db/repositories/report-requests.js";
import { ReportsRepository } from "../db/repositories/reports.js";
import { generatePremiumReport, PremiumReportGenerationError } from "./generate-premium-report.js";
import { normalizeDiagnosisAnswers, type RecognizedAnswer } from "./result-calculator.js";

type ExistingReportReader = {
  findLatestByRequestId(requestId: string): Promise<{ reportJson: unknown } | null>;
};
type RequestReader = {
  findForGeneration(requestId: string): Promise<{ paymentStatus: string } | null>;
};
type EntitlementReader = {
  findActiveByRequestId(requestId: string): Promise<unknown | null>;
};

type VersionedDependencies = {
  reports?: ExistingReportReader;
  requests?: RequestReader;
  entitlements?: EntitlementReader;
  gateEnabled?: boolean;
  generateV1?: typeof generatePremiumReport;
  generateV231?: (requestId: string) => Promise<{ report: unknown; created: boolean }>;
};

function mapV231Error(error: unknown): never {
  if (error instanceof PremiumReportGenerationError) throw error;
  if (error instanceof PremiumV231IntegrationError) {
    const mapped: Record<string, [string, number]> = {
      premium_v231_request_not_found: ["report_request_not_found", 404],
      premium_v231_entitlement_required: ["premium_entitlement_required", 403],
      premium_v231_retry_limit: ["generation_retry_limit", 409],
      premium_v231_generation_in_progress: ["generation_in_progress", 409],
    };
    const [code, status] = mapped[error.code] ?? ["generation_temporarily_unavailable", 503];
    throw new PremiumReportGenerationError(code, status);
  }
  if (error instanceof PremiumV2ProviderError) {
    throw new PremiumReportGenerationError("generation_temporarily_unavailable", 503);
  }
  throw error;
}

export async function generatePremiumReportV231(requestId: string) {
  const requests = new ReportRequestsRepository();
  const reports = new ReportsRepository();
  const entitlements = new EntitlementsRepository();
  try {
    const result = await generateOrRestorePremiumV231(requestId, {
      requests,
      persistence: new PremiumV231ProductionPersistenceAdapter(reports),
      entitlement: new PremiumV231ProductionEntitlementAdapter(entitlements),
      enabled: true,
      generateValidatedEnvelope: async () => {
        const request = await requests.findForGeneration(requestId);
        if (!request) throw new PremiumV231IntegrationError("premium_v231_request_not_found");
        const stored = request.answersJson as RecognizedAnswer[] | { answers?: RecognizedAnswer[] };
        const answers = normalizeDiagnosisAnswers(Array.isArray(stored) ? stored : (stored.answers ?? []));
        const profile = adaptProductionDiagnosisToPremiumV2({ answers, resultType: request.resultType });
        const env = parsePremiumV231Env();
        const generated = await generatePremiumV2Review({
          apiKey: env.OPENAI_API_KEY,
          model: env.AI_REPORT_MODEL,
          profile,
          maxOutputTokens: AI_JUZA_PREMIUM_V2_RECOMMENDED_MAX_OUTPUT_TOKENS,
          systemPrompt: AI_JUZA_PREMIUM_V231_SYSTEM_PROMPT,
          promptVersion: AI_JUZA_PREMIUM_V231_PROMPT_VERSION,
        });
        return createPremiumV231ReportEnvelope({
          model: generated.model,
          generatedAt: new Date().toISOString(),
          questionSetVersion: profile.questionSetVersion,
          resultType: profile.resultType,
          profileSignature: profile.answerProfileSignature,
          usage: generated.usage,
          reportContent: generated.report,
        });
      },
    });
    return { report: result.envelope, created: result.source === "generated" };
  } catch (error) {
    mapV231Error(error);
  }
}

/** Existing reports always win; the gate selects generation only when absent. */
export async function generatePremiumReportVersioned(requestId: string, dependencies: VersionedDependencies = {}) {
  const reports = dependencies.reports ?? new ReportsRepository();
  const requests = dependencies.requests ?? new ReportRequestsRepository();
  const entitlements = dependencies.entitlements ?? new EntitlementsRepository();
  const [existing, request, entitlement] = await Promise.all([
    reports.findLatestByRequestId(requestId),
    requests.findForGeneration(requestId),
    entitlements.findActiveByRequestId(requestId),
  ]);
  if (!request) throw new PremiumReportGenerationError("report_request_not_found", 404);
  if (!entitlement || request.paymentStatus !== "paid") {
    throw new PremiumReportGenerationError("premium_entitlement_required", 403);
  }
  if (existing) return { report: existing.reportJson, created: false };

  const enabled = dependencies.gateEnabled ?? isPremiumV231ProductionEnabled();
  if (!enabled) return (dependencies.generateV1 ?? generatePremiumReport)(requestId);
  return (dependencies.generateV231 ?? generatePremiumReportV231)(requestId);
}
