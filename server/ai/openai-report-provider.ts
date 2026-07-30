import { randomUUID } from "node:crypto";
import type { ReportGeneratorProvider } from "./provider.js";
import type { GenerationContext, GenerationReceipt, ReportGenerationInput, RetryDecision } from "./contracts.js";
import { AI_JUZA_PREMIUM_SYSTEM_PROMPT } from "./prompts/ai-juza-premium.v1.js";
import { reportGeneratedContentJsonSchema, reportGeneratedContentSchema } from "../reports/contracts/report-output.v1.js";
import { PREMIUM_SECTION_TITLES } from "../reports/templates/personal-star-report.v1.js";

type FetchLike = typeof fetch;

export class ReportProviderError extends Error {
  constructor(readonly code: string, readonly retryable: boolean, readonly status?: number) {
    super(code);
    this.name = "ReportProviderError";
  }
}

function extractOutputText(response: unknown): string {
  const record = response as { output_text?: unknown; output?: Array<{ content?: Array<{ type?: string; text?: string }> }> };
  if (typeof record.output_text === "string") return record.output_text;
  return record.output?.flatMap((item) => item.content ?? [])
    .filter((item) => item.type === "output_text" && typeof item.text === "string")
    .map((item) => item.text).join("") ?? "";
}

function authorizedProfile(input: ReportGenerationInput) {
  const profile = input.profile;
  return {
    questionIds: profile.selectedQuestionIds,
    answerIds: profile.selectedAnswerIds,
    primaryPersonality: profile.primaryTrait,
    secondaryPersonality: profile.secondaryTrait,
    thirdPersonality: profile.thirdTrait,
    hiddenTraits: profile.hiddenTraits,
    questionCategories: profile.categorySignals,
    questionTags: profile.relevantTags,
    normalizedBehavioralProfile: profile.normalizedDistribution,
    answerSignature: profile.profileSignature,
    questionSetVersion: profile.questionSetVersion,
  };
}

export class OpenAiReportProvider implements ReportGeneratorProvider {
  readonly name = "openai";
  constructor(private readonly config: { apiKey: string; model: string }, private readonly fetchImpl: FetchLike = fetch) {}

  async generateReport(input: ReportGenerationInput, context: GenerationContext): Promise<GenerationReceipt> {
    const response = await this.fetchImpl("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": context.idempotencyKey,
      },
      body: JSON.stringify({
        model: this.config.model,
        store: false,
        input: [
          { role: "system", content: AI_JUZA_PREMIUM_SYSTEM_PROMPT },
          { role: "user", content: JSON.stringify({
            profile: authorizedProfile(input),
            sectionTitles: PREMIUM_SECTION_TITLES,
            instruction: "指定された役割どおり12セクションをすべて作成し、内部数値は本文へ書かないでください。growthPlan30Daysには、今日から無理なく始められる互いに異なる具体的行動を必ず3件だけ作成してください。",
          }) },
        ],
        text: { format: { type: "json_schema", name: "nextory11_premium_report", strict: true, schema: reportGeneratedContentJsonSchema } },
      }),
    });
    if (!response.ok) {
      throw new ReportProviderError("provider_request_failed", response.status === 408 || response.status === 409 || response.status === 429 || response.status >= 500, response.status);
    }
    const outputText = extractOutputText(await response.json());
    if (!outputText) throw new ReportProviderError("provider_empty_output", true);
    let parsed: unknown;
    try { parsed = JSON.parse(outputText); } catch { throw new ReportProviderError("provider_invalid_json", true); }
    const content = reportGeneratedContentSchema.parse(parsed);
    return {
      provider: this.name,
      model: this.config.model,
      report: {
        reportId: randomUUID(), requestId: input.requestId, schemaVersion: "1",
        reportVersion: "premium-report.v1", language: "ja",
        result: { type: input.result.resultType, nameJa: input.result.resultNameJa, nameEn: input.result.resultNameEn },
        ...content,
        emailSummary: content.executiveSummary.summary,
        metadata: {
          generatedAt: new Date().toISOString(), provider: this.name, model: this.config.model,
          promptVersion: "ai-juza-premium.v1", templateVersion: "personal-star-report.v1",
          profileSignature: input.profile.profileSignature,
        },
      },
    };
  }

  retryGeneration(error: unknown, attempt: number): RetryDecision {
    const retryable = error instanceof ReportProviderError ? error.retryable : true;
    return { retry: retryable && attempt < 3, delayMs: Math.min(30_000, 1_000 * 2 ** attempt), reasonCode: error instanceof ReportProviderError ? error.code : "generation_failed" };
  }
}
