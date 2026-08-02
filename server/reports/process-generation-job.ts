import { JobsRepository } from "../db/repositories/jobs.js";
import {
  generatePremiumReport,
  PremiumReportGenerationError,
} from "./generate-premium-report.js";

type GenerationJobDependencies = {
  jobs?: Pick<JobsRepository, "markRunning" | "markCompleted" | "markFailed">;
  generate?: typeof generatePremiumReport;
};

export async function processDurableGenerationJob(
  reportRequestId: string,
  dependencies: GenerationJobDependencies = {},
) {
  const jobs = dependencies.jobs ?? new JobsRepository();
  const generate = dependencies.generate ?? generatePremiumReport;
  await jobs.markRunning(reportRequestId);
  try {
    const result = await generate(reportRequestId);
    await jobs.markCompleted(reportRequestId);
    return result;
  } catch (error) {
    const retryable = error instanceof PremiumReportGenerationError
      && [409, 503].includes(error.statusCode);
    const code = error instanceof PremiumReportGenerationError ? error.code : "generation_unavailable";
    await jobs.markFailed(reportRequestId, retryable, code);
    throw error;
  }
}
