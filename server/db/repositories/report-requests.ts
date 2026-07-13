import { eq } from "drizzle-orm";
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
}
