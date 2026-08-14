import { createHash } from "node:crypto";
import { premiumV231ReportEnvelopeSchema, type PremiumV231ReportEnvelope } from "./premium-v2-envelope.js";

export const PREMIUM_V231_REPORT_VERSION = "premium-report.v2.3.1";
export const PREMIUM_V231_PRODUCTION_GATE = "PREMIUM_V231_PRODUCTION_ENABLED";

export function isPremiumV231ProductionEnabled(source: NodeJS.ProcessEnv = process.env) {
  return source[PREMIUM_V231_PRODUCTION_GATE] === "true";
}

export class PremiumV231IntegrationError extends Error {
  constructor(readonly code: string) { super(code); this.name = "PremiumV231IntegrationError"; }
}

export type ProductionReportRecord = {
  reportRequestId: string;
  reportVersion: string;
  reportJson: unknown;
};

export interface PremiumV231PersistencePort {
  findVersion(reportRequestId: string, reportVersion: string): Promise<ProductionReportRecord | null>;
  createVersion(record: {
    reportRequestId: string;
    schemaVersion: string;
    reportVersion: string;
    promptVersion: string;
    templateVersion: string;
    provider: string;
    model: string;
    reportJson: PremiumV231ReportEnvelope;
    checksum: string;
    retentionDeleteAt: Date;
  }): Promise<unknown>;
}

export interface PremiumV231EntitlementPort {
  findActiveByRequestId(reportRequestId: string): Promise<{ reportRequestId: string } | null>;
}

export interface PremiumV231RequestStatePort {
  findForGeneration(id: string): Promise<{
    id: string;
    paymentStatus: string;
    generationStatus: string;
    retryCount: number;
    retentionDeleteAt: Date;
  } | null>;
  claimGeneration(id: string): Promise<unknown | null>;
  markValidating(id: string): Promise<void>;
  markCompleted(id: string, reportVersion: string): Promise<void>;
  markGenerationFailure(id: string, retryable: boolean): Promise<void>;
}

export class PremiumV231ProductionPersistenceAdapter {
  constructor(private readonly reports: PremiumV231PersistencePort) {}

  async restore(reportRequestId: string) {
    const record = await this.reports.findVersion(reportRequestId, PREMIUM_V231_REPORT_VERSION);
    if (!record) return null;
    return premiumV231ReportEnvelopeSchema.parse(record.reportJson);
  }

  async persist(reportRequestId: string, envelope: PremiumV231ReportEnvelope, retentionDeleteAt: Date) {
    const validated = premiumV231ReportEnvelopeSchema.parse(envelope);
    const checksum = createHash("sha256").update(JSON.stringify(validated)).digest("hex");
    await this.reports.createVersion({
      reportRequestId,
      schemaVersion: validated.schemaVersion,
      reportVersion: validated.reportVersion,
      promptVersion: validated.promptVersion,
      templateVersion: "premium-report-envelope.v2.3.1",
      provider: "openai",
      model: validated.model,
      reportJson: validated,
      checksum,
      retentionDeleteAt,
    });
    const confirmed = await this.restore(reportRequestId);
    if (!confirmed) throw new PremiumV231IntegrationError("premium_v231_persistence_unconfirmed");
    return confirmed;
  }
}

export class PremiumV231ProductionEntitlementAdapter {
  constructor(private readonly entitlements: PremiumV231EntitlementPort) {}
  async requireEligible(reportRequestId: string, paymentStatus: string) {
    const entitlement = await this.entitlements.findActiveByRequestId(reportRequestId);
    if (!entitlement || entitlement.reportRequestId !== reportRequestId || paymentStatus !== "paid") {
      throw new PremiumV231IntegrationError("premium_v231_entitlement_required");
    }
    return entitlement;
  }
}

type IntegrationDependencies = {
  requests: PremiumV231RequestStatePort;
  persistence: PremiumV231ProductionPersistenceAdapter;
  entitlement: PremiumV231ProductionEntitlementAdapter;
  generateValidatedEnvelope: (reportRequestId: string) => Promise<PremiumV231ReportEnvelope>;
  enabled?: boolean;
};

/** Internal service only. No customer route imports this module. */
export async function generateOrRestorePremiumV231(reportRequestId: string, dependencies: IntegrationDependencies) {
  if (!(dependencies.enabled ?? isPremiumV231ProductionEnabled())) {
    throw new PremiumV231IntegrationError("premium_v231_production_disabled");
  }
  const request = await dependencies.requests.findForGeneration(reportRequestId);
  if (!request) throw new PremiumV231IntegrationError("premium_v231_request_not_found");
  await dependencies.entitlement.requireEligible(reportRequestId, request.paymentStatus);

  const existing = await dependencies.persistence.restore(reportRequestId);
  if (existing) return { source: "restored" as const, envelope: existing };
  if (request.retryCount >= 3) throw new PremiumV231IntegrationError("premium_v231_retry_limit");

  const claimed = await dependencies.requests.claimGeneration(reportRequestId);
  if (!claimed) throw new PremiumV231IntegrationError("premium_v231_generation_in_progress");
  try {
    const envelope = premiumV231ReportEnvelopeSchema.parse(
      await dependencies.generateValidatedEnvelope(reportRequestId),
    );
    await dependencies.requests.markValidating(reportRequestId);
    const persisted = await dependencies.persistence.persist(reportRequestId, envelope, request.retentionDeleteAt);
    await dependencies.requests.markCompleted(reportRequestId, PREMIUM_V231_REPORT_VERSION);
    return { source: "generated" as const, envelope: persisted };
  } catch (error) {
    await dependencies.requests.markGenerationFailure(reportRequestId, true);
    throw error;
  }
}
