import { ServerConfigurationError } from "../../../server/config/env.js";
import { ReportRequestsRepository } from "../../../server/db/repositories/report-requests.js";
import type {
  VercelRequestLike,
  VercelResponseLike,
} from "../../../server/http/vercel.js";
import { logger } from "../../../server/logging/logger.js";
import { requestIdSchema } from "../../../server/validation/identifiers.js";

export default async function handler(request: VercelRequestLike, response: VercelResponseLike) {
  response.setHeader("Cache-Control", "no-store");

  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "method_not_allowed" });
  }

  const rawRequestId = Array.isArray(request.query.requestId)
    ? request.query.requestId[0]
    : request.query.requestId;
  const parsedId = requestIdSchema.safeParse(rawRequestId);
  if (!parsedId.success) {
    return response.status(400).json({ error: "invalid_request_id" });
  }

  try {
    const repository = new ReportRequestsRepository();
    const status = await repository.findStatusById(parsedId.data);
    if (!status) {
      return response.status(404).json({ error: "report_request_not_found" });
    }

    return response.status(200).json({
      requestId: status.id,
      createdAt: status.createdAt.toISOString(),
      updatedAt: status.updatedAt.toISOString(),
      result: {
        resultType: status.resultType,
        resultNameJa: status.resultNameJa,
        resultNameEn: status.resultNameEn,
      },
      paymentStatus: status.paymentStatus,
      generationStatus: status.generationStatus,
      deliveryStatus: status.deliveryStatus,
      reportVersion: status.reportVersion,
      expiresAt: status.expiresAt?.toISOString() ?? null,
    });
  } catch (error) {
    if (error instanceof ServerConfigurationError) {
      logger.error("server_configuration_unavailable", { issueCount: error.issues.length });
      return response.status(503).json({ error: "backend_unavailable" });
    }

    logger.error("report_status_read_failed", { errorCode: "internal_error" });
    return response.status(500).json({ error: "internal_error" });
  }
}
