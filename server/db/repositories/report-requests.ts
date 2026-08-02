import { and, eq, inArray, lt, or, sql } from "drizzle-orm";
import { getDatabase, type Database } from "../client.js";
import { reportRequests, type NewReportRequestRecord } from "../schema.js";

export class ReportRequestsRepository {
  constructor(private readonly db: Database = getDatabase()) {}

  async create(record: NewReportRequestRecord) {
    const [created] = await this.db.insert(reportRequests).values(record).returning();
    return created;
  }

  async findStatusById(id: string) {
    const [record] = await this.db
      .select({
        id: reportRequests.id,
        createdAt: reportRequests.createdAt,
        updatedAt: reportRequests.updatedAt,
        resultType: reportRequests.resultType,
        resultNameJa: reportRequests.resultNameJa,
        resultNameEn: reportRequests.resultNameEn,
        paymentStatus: reportRequests.paymentStatus,
        generationStatus: reportRequests.generationStatus,
        deliveryStatus: reportRequests.deliveryStatus,
        reportVersion: reportRequests.reportVersion,
        expiresAt: reportRequests.expiresAt,
      })
      .from(reportRequests)
      .where(eq(reportRequests.id, id))
      .limit(1);
    return record ?? null;
  }

  async findByIdForCheckout(id: string) {
    const [record] = await this.db
      .select({
        id: reportRequests.id,
        resultType: reportRequests.resultType,
        answersJson: reportRequests.answersJson,
        paymentStatus: reportRequests.paymentStatus,
        generationStatus: reportRequests.generationStatus,
        expiresAt: reportRequests.expiresAt,
        retentionDeleteAt: reportRequests.retentionDeleteAt,
      })
      .from(reportRequests)
      .where(eq(reportRequests.id, id))
      .limit(1);
    return record ?? null;
  }

  async findForGeneration(id: string) {
    const [record] = await this.db.select().from(reportRequests).where(eq(reportRequests.id, id)).limit(1);
    return record ?? null;
  }

  async claimGeneration(id: string) {
    const staleLeaseBoundary = new Date(Date.now() - 5 * 60 * 1000);
    const [record] = await this.db.update(reportRequests).set({ generationStatus: "generating", updatedAt: new Date() })
      .where(and(
        eq(reportRequests.id, id),
        eq(reportRequests.paymentStatus, "paid"),
        or(
          inArray(reportRequests.generationStatus, ["blocked", "queued", "retryable_failed"]),
          and(eq(reportRequests.generationStatus, "generating"), lt(reportRequests.updatedAt, staleLeaseBoundary)),
        ),
      ))
      .returning();
    return record ?? null;
  }

  async markValidating(id: string) {
    await this.db.update(reportRequests).set({ generationStatus: "validating", updatedAt: new Date() })
      .where(and(eq(reportRequests.id, id), eq(reportRequests.generationStatus, "generating")));
  }

  async markCompleted(id: string, reportVersion: string) {
    await this.db.update(reportRequests).set({ generationStatus: "completed", reportVersion, updatedAt: new Date() })
      .where(eq(reportRequests.id, id));
  }

  async markGenerationFailure(id: string, retryable: boolean) {
    await this.db.update(reportRequests).set({
      generationStatus: retryable ? "retryable_failed" : "permanently_failed",
      retryCount: sql`${reportRequests.retryCount} + 1`, updatedAt: new Date(),
    }).where(eq(reportRequests.id, id));
  }
}
