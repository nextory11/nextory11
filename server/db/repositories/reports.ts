import { and, desc, eq } from "drizzle-orm";
import { getDatabase, type Database } from "../client.js";
import { reports } from "../schema.js";

export class ReportsRepository {
  constructor(private readonly db: Database = getDatabase()) {}

  async createVersion(record: typeof reports.$inferInsert) {
    const [created] = await this.db.insert(reports).values(record).returning();
    return created;
  }

  async findVersion(reportRequestId: string, reportVersion: string) {
    const [record] = await this.db
      .select()
      .from(reports)
      .where(
        and(eq(reports.reportRequestId, reportRequestId), eq(reports.reportVersion, reportVersion)),
      )
      .limit(1);
    return record ?? null;
  }

  async findLatestByRequestId(reportRequestId: string) {
    const [record] = await this.db.select().from(reports)
      .where(eq(reports.reportRequestId, reportRequestId)).orderBy(desc(reports.createdAt)).limit(1);
    return record ?? null;
  }
}
