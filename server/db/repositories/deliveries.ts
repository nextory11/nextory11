import { eq } from "drizzle-orm";
import { getDatabase, type Database } from "../client.js";
import { deliveryEvents } from "../schema.js";

export class DeliveriesRepository {
  constructor(private readonly db: Database = getDatabase()) {}

  async recordAttempt(record: typeof deliveryEvents.$inferInsert) {
    const [created] = await this.db.insert(deliveryEvents).values(record).returning();
    return created;
  }

  async listByRequestId(reportRequestId: string) {
    return this.db
      .select()
      .from(deliveryEvents)
      .where(eq(deliveryEvents.reportRequestId, reportRequestId));
  }
}
