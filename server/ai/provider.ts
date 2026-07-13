import type {
  GenerationContext,
  GenerationReceipt,
  ReportGenerationInput,
  RetryDecision,
} from "./contracts.js";

export interface ReportGeneratorProvider {
  readonly name: string;
  generateReport(
    input: ReportGenerationInput,
    context: GenerationContext,
  ): Promise<GenerationReceipt>;
  retryGeneration(error: unknown, attempt: number): RetryDecision;
}
