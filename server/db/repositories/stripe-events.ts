import { eq } from "drizzle-orm";
import { getDatabase, type Database } from "../client.js";
import { stripeEvents } from "../schema.js";

export class StripeEventsRepository {
  constructor(private readonly db: Database = getDatabase()) {}

  async recordOnce(record: typeof stripeEvents.$inferInsert) {
    const [created] = await this.db
      .insert(stripeEvents)
      .values(record)
      .onConflictDoNothing({ target: stripeEvents.eventId })
      .returning();
    return created ?? null;
  }

  async markProcessed(eventId: string) {
    const [updated] = await this.db
      .update(stripeEvents)
      .set({ status: "processed", processedAt: new Date() })
      .where(eq(stripeEvents.eventId, eventId))
      .returning();
    return updated ?? null;
  }
}
