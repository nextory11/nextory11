import { ServerConfigurationError } from "../../../server/config/env.js";
import { ReportRequestsRepository } from "../../../server/db/repositories/report-requests.js";
import { EntitlementsRepository } from "../../../server/db/repositories/entitlements.js";
import { ReportsRepository } from "../../../server/db/repositories/reports.js";
import { authorizeReportAccess } from "../../../server/security/authorize-report-access.js";
import type {
  VercelRequestLike,
  VercelResponseLike,
} from "../../../server/http/vercel.js";
import { resolveResultTypeDisplay } from "../../../src/data/resultTypes.js";
import { logger } from "../../../server/logging/logger.js";
import { requestIdSchema } from "../../../server/validation/identifiers.js";

export function toSafeReportStatus(
  status: Awaited<ReturnType<ReportRequestsRepository["findStatusById"]>> & {},
  entitlement: Awaited<ReturnType<EntitlementsRepository["findStatusByRequestId"]>>,
  storedReport?: Awaited<ReturnType<ReportsRepository["findLatestByRequestId"]>>,
) {
  const rawReport = storedReport?.reportJson as Record<string, unknown> | undefined;
  const storedResult = rawReport?.result as Record<string, unknown> | undefined;
  const resultType = typeof storedResult?.type === "string" ? storedResult.type : "";
  const resultDisplay = resolveResultTypeDisplay(resultType, {
    nameJa: storedResult?.nameJa,
    nameEn: storedResult?.nameEn,
  });
  const canonicalReport = rawReport && storedResult ? {
    ...rawReport,
    result: { ...storedResult, nameJa: resultDisplay.ja, nameEn: resultDisplay.en },
  } : rawReport;
  const publicReport = canonicalReport ? Object.fromEntries(Object.entries(canonicalReport).filter(([key]) => key !== "metadata")) : null;
  return {
    requestId: status.id,
    createdAt: status.createdAt.toISOString(),
    updatedAt: status.updatedAt.toISOString(),
    paymentStatus: status.paymentStatus,
    generationStatus: status.generationStatus,
    deliveryStatus: status.deliveryStatus,
    entitlementStatus: entitlement?.status ?? "none",
    entitlementGrantedAt: entitlement?.grantedAt.toISOString() ?? null,
    entitlementRevokedAt: entitlement?.revokedAt?.toISOString() ?? null,
    expiresAt: status.expiresAt?.toISOString() ?? null,
    report: entitlement?.status === "active" && status.generationStatus === "completed" ? publicReport : null,
  };
}

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
    if (!await authorizeReportAccess(request, parsedId.data)) return response.status(404).json({ error: "report_unavailable" });
    const [status, entitlement, storedReport] = await Promise.all([
      new ReportRequestsRepository().findStatusById(parsedId.data),
      new EntitlementsRepository().findStatusByRequestId(parsedId.data),
      new ReportsRepository().findLatestByRequestId(parsedId.data),
    ]);
    if (!status) {
      return response.status(404).json({ error: "report_request_not_found" });
    }

    return response.status(200).json(toSafeReportStatus(status, entitlement, storedReport));
  } catch (error) {
    if (error instanceof ServerConfigurationError) {
      logger.error("server_configuration_unavailable", { issueCount: error.issues.length });
      return response.status(503).json({ error: "backend_unavailable" });
    }

    logger.error("report_status_read_failed", { errorCode: "internal_error" });
    return response.status(500).json({ error: "internal_error" });
  }
}
