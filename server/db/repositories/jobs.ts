import { and, asc, eq } from "drizzle-orm";
import { getDatabase, type Database } from "../client.js";
import { generationJobs } from "../schema.js";

export class JobsRepository {
  constructor(private readonly db: Database = getDatabase()) {}

  async enqueueOnce(record: typeof generationJobs.$inferInsert) {
    const [created] = await this.db
      .insert(generationJobs)
      .values(record)
      .onConflictDoNothing({ target: [generationJobs.reportRequestId, generationJobs.attempt] })
      .returning();
    return created ?? null;
  }

  async listByRequestId(reportRequestId: string) {
    return this.db
      .select()
      .from(generationJobs)
      .where(eq(generationJobs.reportRequestId, reportRequestId))
      .orderBy(asc(generationJobs.attempt));
  }

  async markRunning(reportRequestId: string, attempt = 0) {
    const [updated] = await this.db
      .update(generationJobs)
      .set({ status: "running", leasedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(generationJobs.reportRequestId, reportRequestId), eq(generationJobs.attempt, attempt)))
      .returning();
    return updated ?? null;
  }

  async markCompleted(reportRequestId: string, attempt = 0) {
    const [updated] = await this.db
      .update(generationJobs)
      .set({ status: "completed", completedAt: new Date(), errorCode: null, updatedAt: new Date() })
      .where(and(eq(generationJobs.reportRequestId, reportRequestId), eq(generationJobs.attempt, attempt)))
      .returning();
    return updated ?? null;
  }

  async markFailed(reportRequestId: string, retryable: boolean, errorCode: string, attempt = 0) {
    const [updated] = await this.db
      .update(generationJobs)
      .set({
        status: retryable ? "retry_scheduled" : "dead_letter",
        availableAt: retryable ? new Date(Date.now() + 30_000) : new Date(),
        errorCode,
        updatedAt: new Date(),
      })
      .where(and(eq(generationJobs.reportRequestId, reportRequestId), eq(generationJobs.attempt, attempt)))
      .returning();
    return updated ?? null;
  }
}
