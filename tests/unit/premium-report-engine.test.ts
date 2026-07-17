import { describe, expect, it, vi } from "vitest";
import { OpenAiReportProvider } from "../../server/ai/openai-report-provider.js";
import { validateReport } from "../../server/ai/validate-report.js";
import { validPremiumReport } from "./report-output.test.js";
import { generatePremiumReport } from "../../server/reports/generate-premium-report.js";

const profile = {
  profileSignature: "a".repeat(64), questionSetVersion: "question-pack-v1",
  selectedQuestionIds: ["n11-a"], selectedAnswerIds: ["b"], primaryTrait: "challenge",
  secondaryTrait: "creator", thirdTrait: "empath", hiddenTraits: ["creator", "empath"],
  normalizedDistribution: { challenge: 0.8, creator: 0.6 }, categorySignals: [{ category: "action", count: 2 }], relevantTags: ["action"],
};

describe("Premium Report engine", () => {
  it("sends only the authorized diagnosis profile with API retention disabled", async () => {
    const content = Object.fromEntries(Object.entries(validPremiumReport).filter(([key]) => !["reportId", "requestId", "schemaVersion", "reportVersion", "language", "result", "emailSummary", "metadata"].includes(key)));
    const fetchSpy = vi.fn(async (_url: string | URL | Request, _init?: RequestInit) => ({ ok: true, status: 200, json: async () => ({ output_text: JSON.stringify(content) }) }));
    const provider = new OpenAiReportProvider({ apiKey: "sk-test", model: "approved-model" }, fetchSpy as unknown as typeof fetch);
    await provider.generateReport({ requestId: validPremiumReport.requestId, result: { resultType: "challenger", resultNameJa: "挑戦力タイプ", resultNameEn: "Challenger" }, answers: [], profile, language: "ja", reportVersion: "premium-report.v1", promptVersion: "ai-juza-premium.v1", templateVersion: "personal-star-report.v1" }, { attempt: 0, idempotencyKey: "test-key" });
    const body = JSON.parse(String((fetchSpy.mock.calls[0][1] as RequestInit).body));
    expect(body.store).toBe(false);
    const transmitted = JSON.parse(body.input[1].content);
    expect(transmitted.profile).toEqual(expect.objectContaining({ questionIds: ["n11-a"], answerIds: ["b"], answerSignature: "a".repeat(64) }));
    expect(JSON.stringify(transmitted)).not.toMatch(/email|payment|name|ipAddress/iu);
  });

  it("refuses generation without a verified active entitlement", async () => {
    const provider = { name: "synthetic", generateReport: vi.fn(), retryGeneration: vi.fn() };
    await expect(generatePremiumReport(validPremiumReport.requestId, {
      provider,
      requests: { findForGeneration: vi.fn(async () => ({ id: validPremiumReport.requestId, paymentStatus: "paid" })), claimGeneration: vi.fn(), markValidating: vi.fn(), markCompleted: vi.fn(), markGenerationFailure: vi.fn() } as never,
      entitlements: { findActiveByRequestId: vi.fn(async () => null) },
      reports: { findLatestByRequestId: vi.fn(async () => null), createVersion: vi.fn() } as never,
    })).rejects.toMatchObject({ code: "premium_entitlement_required" });
    expect(provider.generateReport).not.toHaveBeenCalled();
  });

  it("preserves entitlement and marks a failed generation retryable", async () => {
    const request = {
      id: validPremiumReport.requestId, paymentStatus: "paid", generationStatus: "queued", retryCount: 0,
      answersJson: Array.from({ length: 11 }, (_, index) => ({ questionId: index + 1, answerId: "A" })),
      resultType: "challenger", resultNameJa: "挑戦力タイプ", resultNameEn: "Challenger", retentionDeleteAt: new Date(Date.now() + 86_400_000),
    };
    const markFailure = vi.fn();
    const provider = { name: "synthetic", generateReport: vi.fn(async () => { throw new Error("temporary"); }), retryGeneration: vi.fn(() => ({ retry: true, delayMs: 1000, reasonCode: "temporary" })) };
    await expect(generatePremiumReport(validPremiumReport.requestId, {
      provider,
      requests: { findForGeneration: vi.fn(async () => request), claimGeneration: vi.fn(async () => request), markValidating: vi.fn(), markCompleted: vi.fn(), markGenerationFailure: markFailure } as never,
      entitlements: { findActiveByRequestId: vi.fn(async () => ({ id: "entitlement", status: "active" })) } as never,
      reports: { findLatestByRequestId: vi.fn(async () => null), createVersion: vi.fn() } as never,
    })).rejects.toMatchObject({ code: "generation_retry_available" });
    expect(markFailure).toHaveBeenCalledWith(validPremiumReport.requestId, true);
  });

  it("persists a validated report once and reuses it without another provider call", async () => {
    const request = {
      id: validPremiumReport.requestId, paymentStatus: "paid", generationStatus: "queued", retryCount: 0,
      answersJson: Array.from({ length: 11 }, (_, index) => ({ questionId: index + 1, answerId: "A" })),
      resultType: "challenger", resultNameJa: "挑戦力タイプ", resultNameEn: "Challenger", retentionDeleteAt: new Date(Date.now() + 86_400_000),
    };
    const createVersion = vi.fn();
    const markCompleted = vi.fn();
    const provider = { name: "synthetic", generateReport: vi.fn(async () => ({ report: validPremiumReport, provider: "synthetic", model: "synthetic" })), retryGeneration: vi.fn() };
    const result = await generatePremiumReport(validPremiumReport.requestId, {
      provider,
      requests: { findForGeneration: vi.fn(async () => request), claimGeneration: vi.fn(async () => request), markValidating: vi.fn(), markCompleted, markGenerationFailure: vi.fn() } as never,
      entitlements: { findActiveByRequestId: vi.fn(async () => ({ id: "entitlement", status: "active" })) } as never,
      reports: { findLatestByRequestId: vi.fn(async () => null), createVersion } as never,
    });
    expect(result.created).toBe(true);
    expect(createVersion).toHaveBeenCalledOnce();
    expect(markCompleted).toHaveBeenCalledWith(validPremiumReport.requestId, "premium-report.v1");
  });

  it("rejects provider identity leakage and duplicated paragraphs", () => {
    expect(() => validateReport({ ...validPremiumReport, aiJuzaClosingMessage: "OpenAIとして回答します。" }, { requestId: validPremiumReport.requestId, resultType: "challenger", resultNameJa: "挑戦力タイプ" })).toThrow();
    const duplicate = { ...validPremiumReport, corePersonality: { ...validPremiumReport.corePersonality, body: [validPremiumReport.corePersonality.body[0], validPremiumReport.corePersonality.body[0]] } };
    expect(() => validateReport(duplicate)).toThrow();
  });
});
