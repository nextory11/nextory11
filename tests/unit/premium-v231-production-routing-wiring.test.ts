import { describe, expect, it, vi } from "vitest";
import { createPremiumV231ReportEnvelope } from "../../server/ai/premium-v2-envelope.js";
import { validatePremiumV231Strict } from "../../server/ai/validate-report.v2.js";
import { generatePremiumReportVersioned } from "../../server/reports/generate-premium-report-versioned.js";
import { mapStoredReportForCustomer } from "../../server/reports/premium-report-presentation.js";
import { buildPremiumV231ProductionVerificationFixture } from "../fixtures/premium-v231-production-verification.fixture.js";

const identity = { resultType: "challenger", resultNameJa: "挑戦力タイプ", resultNameEn: "Challenger" };
const request = { id: "r1", paymentStatus: "paid", answersJson: [], resultType: "challenger" };
const entitlement = { reportRequestId: "r1" };

function envelope() {
  return createPremiumV231ReportEnvelope({
    model: "test-model",
    generatedAt: "2026-08-13T00:00:00.000Z",
    questionSetVersion: "nextory11-question-pack.v1",
    resultType: "challenger",
    profileSignature: "a".repeat(64),
    usage: { inputTokens: 1, outputTokens: 2, totalTokens: 3 },
    reportContent: validatePremiumV231Strict(buildPremiumV231ProductionVerificationFixture()).report,
  });
}

function setup(existing: unknown = null, eligible = true) {
  return {
    reports: { findLatestByRequestId: vi.fn(async () => existing ? ({ reportJson: existing }) : null) },
    requests: { findForGeneration: vi.fn(async () => request) },
    entitlements: { findActiveByRequestId: vi.fn(async () => eligible ? entitlement : null) },
    generateV1: vi.fn(async () => ({ report: { reportVersion: "premium-report.v1" }, created: true })),
    generateV231: vi.fn(async () => ({ report: envelope(), created: true })),
  };
}

describe("Premium V2.3.1 customer routing wiring", () => {
  it("restores an existing V1 report without regeneration", async () => {
    const existing = { reportVersion: "premium-report.v1", result: identity };
    const dependencies = setup(existing);
    const result = await generatePremiumReportVersioned("r1", { ...dependencies, gateEnabled: true });
    expect(result).toEqual({ report: existing, created: false });
    expect(dependencies.generateV1).not.toHaveBeenCalled();
    expect(dependencies.generateV231).not.toHaveBeenCalled();
  });

  it("restores and maps an existing V2.3.1 envelope", async () => {
    const existing = envelope();
    const dependencies = setup(existing);
    const result = await generatePremiumReportVersioned("r1", { ...dependencies, gateEnabled: true });
    const presentation = mapStoredReportForCustomer(result.report, identity)!;
    expect(result.created).toBe(false);
    expect(presentation.reportVersion).toBe("premium-report.v2.3.1");
    expect(presentation.result).toEqual({ type: "challenger", nameJa: "挑戦力タイプ", nameEn: "Challenger" });
    expect(dependencies.generateV231).not.toHaveBeenCalled();
  });

  it("uses V1 when no report exists and the gate is off", async () => {
    const dependencies = setup();
    await expect(generatePremiumReportVersioned("r1", { ...dependencies, gateEnabled: false }))
      .resolves.toMatchObject({ report: { reportVersion: "premium-report.v1" } });
    expect(dependencies.generateV1).toHaveBeenCalledTimes(1);
    expect(dependencies.generateV231).not.toHaveBeenCalled();
  });

  it("uses V2.3.1 when no report exists, the gate is on, and entitlement is valid", async () => {
    const dependencies = setup();
    await expect(generatePremiumReportVersioned("r1", { ...dependencies, gateEnabled: true }))
      .resolves.toMatchObject({ report: { reportVersion: "premium-report.v2.3.1" } });
    expect(dependencies.generateV231).toHaveBeenCalledTimes(1);
    expect(dependencies.generateV1).not.toHaveBeenCalled();
  });

  it("blocks a request without an active entitlement before either generator", async () => {
    const dependencies = setup(null, false);
    await expect(generatePremiumReportVersioned("r1", { ...dependencies, gateEnabled: true }))
      .rejects.toMatchObject({ code: "premium_entitlement_required", statusCode: 403 });
    expect(dependencies.generateV1).not.toHaveBeenCalled();
    expect(dependencies.generateV231).not.toHaveBeenCalled();
  });

  it("preserves every required V2 section in the ReportPreview contract", () => {
    const source = envelope();
    const presentation = mapStoredReportForCustomer(source, identity)!;
    for (const key of [
      "executiveSummary", "corePersonality", "hiddenStrengths", "traitInteraction",
      "decisionMakingStyle", "relationships", "careerAndTalent", "currentGrowthStage",
      "blindSpots", "personalRecommendations",
    ] as const) {
      expect(presentation[key]).toEqual(source.reportContent[key]);
    }
    expect(presentation.growthPlan30Days).toEqual(source.reportContent.growthPlan30Days);
    expect(presentation.aiJuzaClosingMessage).toBe(source.reportContent.aiJuzaClosingMessage);
  });

  it("leaves an existing V1 customer presentation unchanged", () => {
    const v1 = { reportVersion: "premium-report.v1", result: identity, executiveSummary: { summary: "existing" }, metadata: { private: true } };
    expect(mapStoredReportForCustomer(v1, identity)).toEqual({
      reportVersion: "premium-report.v1", result: identity, executiveSummary: { summary: "existing" },
    });
  });
});
