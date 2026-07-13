import { and, eq, gt, isNull } from "drizzle-orm";
import { getDatabase, type Database } from "../client.js";
import { reportAccessTokens } from "../schema.js";

export class AccessTokensRepository {
  constructor(private readonly db: Database = getDatabase()) {}

  async create(record: typeof reportAccessTokens.$inferInsert) {
    const [created] = await this.db.insert(reportAccessTokens).values(record).returning();
    return created;
  }

  async findUsableByHash(tokenHash: string, now = new Date()) {
    const [record] = await this.db
      .select()
      .from(reportAccessTokens)
      .where(
        and(
          eq(reportAccessTokens.tokenHash, tokenHash),
          gt(reportAccessTokens.expiresAt, now),
          isNull(reportAccessTokens.consumedAt),
          isNull(reportAccessTokens.revokedAt),
        ),
      )
      .limit(1);
    return record ?? null;
  }
}
