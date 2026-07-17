import { eq } from "drizzle-orm";
import { getDatabase, type Database } from "../client.js";
import { payments } from "../schema.js";

export class PaymentsRepository {
  constructor(private readonly db: Database = getDatabase()) {}

  async create(record: typeof payments.$inferInsert) {
    const [created] = await this.db.insert(payments).values(record).returning();
    return created;
  }

  async findByCheckoutSessionId(checkoutSessionId: string) {
    const [record] = await this.db
      .select()
      .from(payments)
      .where(eq(payments.checkoutSessionId, checkoutSessionId))
      .limit(1);
    return record ?? null;
  }

  async findByPaymentIntentId(paymentIntentId: string) {
    const [record] = await this.db
      .select()
      .from(payments)
      .where(eq(payments.paymentIntentId, paymentIntentId))
      .limit(1);
    return record ?? null;
  }
}
