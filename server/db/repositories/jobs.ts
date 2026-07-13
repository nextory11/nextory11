import { asc, eq } from "drizzle-orm";
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
}
