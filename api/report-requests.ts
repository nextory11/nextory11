import { ZodError } from "zod";
import { ServerConfigurationError } from "../server/config/env.js";
import { ReportRequestsRepository } from "../server/db/repositories/report-requests.js";
import type { VercelRequestLike, VercelResponseLike } from "../server/http/vercel.js";
import { logger } from "../server/logging/logger.js";
import { calculateDiagnosisResult } from "../server/reports/result-calculator.js";
import { generateRequestId } from "../server/security/tokens.js";
import { generateAccessToken, hashAccessToken } from "../server/security/tokens.js";
import { AccessTokensRepository } from "../server/db/repositories/access-tokens.js";
import { parseReportAccessEnv } from "../server/config/env.js";
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
    const selectedQuestionContext = new Map(
      (parsed.questionBankContext?.selectedQuestions ?? []).map((question) => [question.id, question]),
    );
    const selectedAnswerContext = new Map(
      (parsed.questionBankContext?.selectedAnswers ?? []).map((answer) => [answer.questionId, answer]),
    );
    const purchasedQuestions = parsed.answers.map((answer, index) => {
      const questionContext = selectedQuestionContext.get(String(answer.questionId));
      const answerContext = selectedAnswerContext.get(String(answer.questionId));
      return {
        order: index,
        questionId: answer.questionId,
        questionText: answer.question,
        answerId: answer.answerId,
        answerText: answer.answer,
        typeScores: answer.metadata?.weights ?? null,
        category: answer.metadata?.category ?? questionContext?.category ?? null,
        tags: answer.metadata?.tags ?? questionContext?.tags ?? [],
        displayOrder: answerContext?.displayOrder ?? null,
      };
    });
    const requestId = generateRequestId();
    const retentionDeleteAt = new Date(
      Date.now() + DEFAULT_RETENTION_DAYS * 24 * 60 * 60 * 1_000,
    );
    const repository = new ReportRequestsRepository();
    const record = await repository.create({
      id: requestId,
      answersJson: {
        snapshotVersion: "nextory11-paid-diagnosis-v1",
        diagnosisSessionId: parsed.diagnosisSessionId,
        questionPackVersion: parsed.questionBankContext?.questionBank.version ?? null,
        selectedQuestions: parsed.questionBankContext?.selectedQuestions ?? null,
        selectedAnswers: parsed.questionBankContext?.selectedAnswers ?? null,
        answers: parsed.answers,
        purchasedQuestions,
        serverCalculatedResultType: calculated.resultType,
        calculatedResult: calculated,
        completedAt: new Date().toISOString(),
      },
      resultType: calculated.resultType,
      resultNameJa: calculated.resultNameJa,
      resultNameEn: calculated.resultNameEn,
      paymentStatus: "awaiting_payment",
      generationStatus: "blocked",
      deliveryStatus: "not_requested",
      retentionDeleteAt,
    });
    const accessEnv = parseReportAccessEnv();
    const accessToken = generateAccessToken();
    await new AccessTokensRepository().create({
      reportRequestId: record.id,
      tokenHash: hashAccessToken(accessToken, accessEnv.REPORT_TOKEN_PEPPER),
      expiresAt: new Date(Date.now() + accessEnv.REPORT_LINK_TTL_SECONDS * 1_000),
    });

    logger.info("report_request_created", { requestId: record.id });
    return response.status(201).json({
      requestId: record.id,
      createdAt: record.createdAt.toISOString(),
      result: calculated,
      paymentStatus: record.paymentStatus,
      generationStatus: record.generationStatus,
      accessToken,
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
