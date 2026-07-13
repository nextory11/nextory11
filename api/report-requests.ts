import { ZodError } from "zod";
import { ServerConfigurationError } from "../server/config/env.js";
import { ReportRequestsRepository } from "../server/db/repositories/report-requests.js";
import type { VercelRequestLike, VercelResponseLike } from "../server/http/vercel.js";
import { logger } from "../server/logging/logger.js";
import { calculateDiagnosisResult } from "../server/reports/result-calculator.js";
import { generateRequestId } from "../server/security/tokens.js";
import {
  MAX_REPORT_REQUEST_BYTES,
  parseReportRequest,
} from "../server/validation/report-request.js";

const DEFAULT_RETENTION_DAYS = 30;

function bodySize(body: unknown): number {
  return Buffer.byteLength(JSON.stringify(body ?? null), "utf8");
}

export default async function handler(request: VercelRequestLike, response: VercelResponseLike) {
  response.setHeader("Cache-Control", "no-store");

  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "method_not_allowed" });
  }

  const declaredLength = Number(request.headers["content-length"] ?? 0);
  if (declaredLength > MAX_REPORT_REQUEST_BYTES || bodySize(request.body) > MAX_REPORT_REQUEST_BYTES) {
    return response.status(413).json({ error: "request_too_large" });
  }

  try {
    const parsed = parseReportRequest(request.body);
    const calculated = calculateDiagnosisResult(parsed.answers);
    const requestId = generateRequestId();
    const retentionDeleteAt = new Date(
      Date.now() + DEFAULT_RETENTION_DAYS * 24 * 60 * 60 * 1_000,
    );
    const repository = new ReportRequestsRepository();
    const record = await repository.create({
      id: requestId,
      answersJson: parsed.answers,
      resultType: calculated.resultType,
      resultNameJa: calculated.resultNameJa,
      resultNameEn: calculated.resultNameEn,
      paymentStatus: "awaiting_payment",
      generationStatus: "blocked",
      deliveryStatus: "not_requested",
      retentionDeleteAt,
    });

    logger.info("report_request_created", { requestId: record.id });
    return response.status(201).json({
      requestId: record.id,
      createdAt: record.createdAt.toISOString(),
      result: calculated,
      paymentStatus: record.paymentStatus,
      generationStatus: record.generationStatus,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return response.status(400).json({ error: "invalid_report_request" });
    }
    if (error instanceof ServerConfigurationError) {
      logger.error("server_configuration_unavailable", { issueCount: error.issues.length });
      return response.status(503).json({ error: "backend_unavailable" });
    }

    logger.error("report_request_create_failed", { errorCode: "internal_error" });
    return response.status(500).json({ error: "internal_error" });
  }
}
