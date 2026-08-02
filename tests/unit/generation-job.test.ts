import { describe, expect, it, vi } from "vitest";
import { PremiumReportGenerationError } from "../../server/reports/generate-premium-report.js";
import { processDurableGenerationJob } from "../../server/reports/process-generation-job.js";

describe("durable Premium generation job processing", () => {
  it("can complete without success-page execution", async () => {
    const jobs = {
      markRunning: vi.fn().mockResolvedValue({}),
      markCompleted: vi.fn().mockResolvedValue({}),
      markFailed: vi.fn().mockResolvedValue({}),
    };
    const generate = vi.fn().mockResolvedValue({ created: true, report: {} });
    await expect(processDurableGenerationJob("request-id", { jobs, generate })).resolves.toMatchObject({ created: true });
    expect(generate).toHaveBeenCalledOnce();
    expect(jobs.markCompleted).toHaveBeenCalledOnce();
    expect(jobs.markFailed).not.toHaveBeenCalled();
  });

  it("preserves retryability after a transient generation failure", async () => {
    const jobs = {
      markRunning: vi.fn().mockResolvedValue({}),
      markCompleted: vi.fn().mockResolvedValue({}),
      markFailed: vi.fn().mockResolvedValue({}),
    };
    const error = new PremiumReportGenerationError("generation_retry_available", 503);
    await expect(processDurableGenerationJob("request-id", {
      jobs,
      generate: vi.fn().mockRejectedValue(error),
    })).rejects.toBe(error);
    expect(jobs.markFailed).toHaveBeenCalledWith(
      "request-id",
      true,
      "generation_retry_available",
    );
  });
});
