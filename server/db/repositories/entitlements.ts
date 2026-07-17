import { eq } from "drizzle-orm";
import { getDatabase, type Database } from "../client.js";
import { entitlements } from "../schema.js";

export class EntitlementsRepository {
  constructor(private readonly db: Database = getDatabase()) {}

  async grantOnce(record: typeof entitlements.$inferInsert) {
    const [created] = await this.db
      .insert(entitlements)
      .values(record)
      .onConflictDoNothing({ target: entitlements.reportRequestId })
      .returning();
    return created ?? null;
  }

  async findActiveByRequestId(reportRequestId: string) {
    const [record] = await this.db
      .select()
      .from(entitlements)
      .where(eq(entitlements.reportRequestId, reportRequestId))
      .limit(1);
    return record?.status === "active" && !record.revokedAt ? record : null;
  }

  async findStatusByRequestId(reportRequestId: string) {
    const [record] = await this.db
      .select({
        status: entitlements.status,
        grantedAt: entitlements.grantedAt,
        revokedAt: entitlements.revokedAt,
      })
      .from(entitlements)
      .where(eq(entitlements.reportRequestId, reportRequestId))
      .limit(1);
    return record ?? null;
  }
}
