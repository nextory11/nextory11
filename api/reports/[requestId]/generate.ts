import { ServerConfigurationError } from "../../../server/config/env.js";
import type { VercelRequestLike, VercelResponseLike } from "../../../server/http/vercel.js";
import { logger } from "../../../server/logging/logger.js";
import { PremiumReportGenerationError } from "../../../server/reports/generate-premium-report.js";
import { generatePremiumReportVersioned } from "../../../server/reports/generate-premium-report-versioned.js";
import { authorizeReportAccess } from "../../../server/security/authorize-report-access.js";
import { requestIdSchema } from "../../../server/validation/identifiers.js";

export default async function handler(request: VercelRequestLike, response: VercelResponseLike) {
  response.setHeader("Cache-Control", "no-store");
  if (request.method !== "POST") { response.setHeader("Allow", "POST"); return response.status(405).json({ error: "method_not_allowed" }); }
  const rawId = Array.isArray(request.query.requestId) ? request.query.requestId[0] : request.query.requestId;
  const parsed = requestIdSchema.safeParse(rawId);
  if (!parsed.success) return response.status(400).json({ error: "invalid_request_id" });
  try {
    if (!await authorizeReportAccess(request, parsed.data)) return response.status(404).json({ error: "report_unavailable" });
    const result = await generatePremiumReportVersioned(parsed.data);
    return response.status(result.created ? 201 : 200).json({ status: "completed" });
  } catch (error) {
    if (error instanceof PremiumReportGenerationError) return response.status(error.statusCode).json({ error: error.code });
    if (error instanceof ServerConfigurationError) {
      logger.error("premium_report_configuration_unavailable", { issueCount: error.issues.length });
      return response.status(503).json({ error: "generation_temporarily_unavailable" });
    }
    logger.error("premium_report_generation_failed", { requestId: parsed.data, errorCode: "internal_error" });
    return response.status(500).json({ error: "generation_temporarily_unavailable" });
  }
}
