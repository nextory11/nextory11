import { reportGeneratedContentJsonSchema } from "../reports/contracts/report-output.v1.js";
import { AI_JUZA_PREMIUM_V2_PROMPT_VERSION, AI_JUZA_PREMIUM_V2_SYSTEM_PROMPT } from "./prompts/ai-juza-premium.v2.js";
import { toPremiumV2AuthorizedInput, type PremiumV2Profile } from "./premium-v2-profile.js";
import { validatePremiumV231Strict, validatePremiumV2Report } from "./validate-report.v2.js";
import { AI_JUZA_PREMIUM_V231_PROMPT_VERSION } from "./prompts/ai-juza-premium.v2.3.1.js";

export interface PremiumV2Generation {
  report: ReturnType<typeof validatePremiumV2Report>["report"];
  validation: Omit<ReturnType<typeof validatePremiumV2Report>, "report">;
  usage: { inputTokens: number; outputTokens: number; totalTokens: number };
  model: string;
  promptVersion: string;
}

export type PremiumV2ProviderErrorCode = "premium_v2_provider_timeout" | "premium_v2_provider_rate_limited"
  | "premium_v2_provider_5xx" | "premium_v2_provider_invalid_response" | "premium_v2_output_truncated"
  | "premium_v2_validation_failed";

export class PremiumV2ProviderError extends Error {
  constructor(public readonly code: PremiumV2ProviderErrorCode) { super(code); }
}

function outputText(payload: any) {
  if (typeof payload.output_text === "string") return payload.output_text;
  return payload.output?.flatMap((item: any) => item.content ?? []).filter((item: any) => item.type === "output_text").map((item: any) => item.text).join("") ?? "";
}

export async function generatePremiumV2Review(args: { apiKey: string; model: string; profile: PremiumV2Profile; maxOutputTokens: number; systemPrompt?: string; promptVersion?: string; timeoutMs?: number }): Promise<PremiumV2Generation> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), args.timeoutMs ?? 120_000);
  let response: Response;
  try { response = await fetch("https://api.openai.com/v1/responses", { method: "POST", signal: controller.signal, headers: { Authorization: `Bearer ${args.apiKey}`, "Content-Type": "application/json" }, body: JSON.stringify({
    model: args.model, store: false, max_output_tokens: args.maxOutputTokens,
    input: [{ role: "system", content: args.systemPrompt ?? AI_JUZA_PREMIUM_V2_SYSTEM_PROMPT }, { role: "user", content: JSON.stringify({ profile: toPremiumV2AuthorizedInput(args.profile), instruction: "回答根拠と派生プロフィールを照合し、各章の役割を重複させず12章を完成してください。" }) }],
    text: { format: { type: "json_schema", name: "nextory11_premium_report_v2_review", strict: true, schema: reportGeneratedContentJsonSchema } },
  }) }); } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw new PremiumV2ProviderError("premium_v2_provider_timeout");
    throw new PremiumV2ProviderError("premium_v2_provider_invalid_response");
  } finally { clearTimeout(timeout); }
  if (response.status === 429) throw new PremiumV2ProviderError("premium_v2_provider_rate_limited");
  if (response.status >= 500) throw new PremiumV2ProviderError("premium_v2_provider_5xx");
  if (!response.ok) throw new PremiumV2ProviderError("premium_v2_provider_invalid_response");
  let payload: any;
  try { payload = await response.json(); } catch { throw new PremiumV2ProviderError("premium_v2_provider_invalid_response"); }
  if (payload.status === "incomplete" || payload.incomplete_details?.reason === "max_output_tokens") {
    throw new PremiumV2ProviderError("premium_v2_output_truncated");
  }
  const text = outputText(payload);
  if (!text.trim()) throw new PremiumV2ProviderError("premium_v2_provider_invalid_response");
  let parsed: unknown;
  try { parsed = JSON.parse(text); } catch { throw new PremiumV2ProviderError("premium_v2_provider_invalid_response"); }
  const promptVersion = args.promptVersion ?? AI_JUZA_PREMIUM_V2_PROMPT_VERSION;
  let validation: ReturnType<typeof validatePremiumV2Report>;
  try {
    validation = promptVersion === AI_JUZA_PREMIUM_V231_PROMPT_VERSION
      ? validatePremiumV231Strict(parsed)
      : validatePremiumV2Report(parsed);
  } catch { throw new PremiumV2ProviderError("premium_v2_validation_failed"); }
  return { report: validation.report, validation: { warnings: validation.warnings, metrics: validation.metrics }, usage: { inputTokens: payload.usage?.input_tokens ?? 0, outputTokens: payload.usage?.output_tokens ?? 0, totalTokens: payload.usage?.total_tokens ?? 0 }, model: args.model, promptVersion };
}
