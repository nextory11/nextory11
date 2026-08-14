import { z } from "zod";
import { reportGeneratedContentSchema } from "../reports/contracts/report-output.v1.js";
import { AI_JUZA_PREMIUM_V231_PROMPT_VERSION } from "./prompts/ai-juza-premium.v2.3.1.js";

const usageSchema = z.object({
  inputTokens: z.number().int().nonnegative(),
  outputTokens: z.number().int().nonnegative(),
  totalTokens: z.number().int().nonnegative(),
}).strict();

export const premiumV231ReportEnvelopeSchema = z.object({
  schemaVersion: z.literal("1"),
  reportVersion: z.literal("premium-report.v2.3.1"),
  promptVersion: z.literal(AI_JUZA_PREMIUM_V231_PROMPT_VERSION),
  model: z.string().trim().min(1).max(100),
  generatedAt: z.string().datetime(),
  questionSetVersion: z.string().trim().min(1).max(100),
  resultType: z.string().trim().min(1).max(50),
  profileSignature: z.string().regex(/^[a-f0-9]{64}$/u),
  validationStatus: z.literal("passed"),
  usage: usageSchema,
  reportContent: reportGeneratedContentSchema,
}).strict();

export type PremiumV231ReportEnvelope = z.infer<typeof premiumV231ReportEnvelopeSchema>;

export function createPremiumV231ReportEnvelope(
  input: Omit<PremiumV231ReportEnvelope, "schemaVersion" | "reportVersion" | "promptVersion" | "validationStatus">,
): PremiumV231ReportEnvelope {
  return premiumV231ReportEnvelopeSchema.parse({
    ...input,
    schemaVersion: "1",
    reportVersion: "premium-report.v2.3.1",
    promptVersion: AI_JUZA_PREMIUM_V231_PROMPT_VERSION,
    validationStatus: "passed",
  });
}

export interface PremiumV231ReportStore {
  restore(key: string): Promise<PremiumV231ReportEnvelope | null>;
  persistOnce(key: string, envelope: PremiumV231ReportEnvelope): Promise<"stored" | "exists">;
}

/** Local/Test store only. No production DB schema or entitlement is changed. */
export class InMemoryPremiumV231ReportStore implements PremiumV231ReportStore {
  readonly #reports = new Map<string, PremiumV231ReportEnvelope>();
  async restore(key: string) { return this.#reports.get(key) ?? null; }
  async persistOnce(key: string, envelope: PremiumV231ReportEnvelope) {
    if (this.#reports.has(key)) return "exists" as const;
    this.#reports.set(key, premiumV231ReportEnvelopeSchema.parse(envelope));
    return "stored" as const;
  }
}

export class PremiumV231GenerateOnceCoordinator {
  readonly #inFlight = new Map<string, Promise<PremiumV231ReportEnvelope>>();
  constructor(private readonly store: PremiumV231ReportStore) {}

  async restoreOrGenerate(key: string, generateValidated: () => Promise<PremiumV231ReportEnvelope>) {
    const saved = await this.store.restore(key);
    if (saved) return { source: "restored" as const, envelope: saved };
    const existing = this.#inFlight.get(key);
    if (existing) return { source: "concurrent" as const, envelope: await existing };
    const task = (async () => {
      const envelope = premiumV231ReportEnvelopeSchema.parse(await generateValidated());
      const result = await this.store.persistOnce(key, envelope);
      if (result === "exists") {
        const restored = await this.store.restore(key);
        if (!restored) throw new Error("premium_v2_persistence_failed");
        return restored;
      }
      return envelope;
    })();
    this.#inFlight.set(key, task);
    try { return { source: "generated" as const, envelope: await task }; }
    finally { this.#inFlight.delete(key); }
  }
}
