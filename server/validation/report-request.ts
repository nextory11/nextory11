import { z } from "zod";
import { answerIdSchema, questionIdSchema } from "./identifiers.js";
import { normalizeDiagnosisAnswers } from "../reports/result-calculator.js";

const diagnosisAnswerSchema = z.object({
  questionId: questionIdSchema,
  answerId: answerIdSchema,
});

const rawReportRequestSchema = z
  .object({
    answers: z.array(diagnosisAnswerSchema).length(11),
  })
  .strip()
  .superRefine((value, context) => {
    const questionIds = value.answers.map((answer) => answer.questionId);
    const unique = new Set(questionIds);

    if (unique.size !== 11) {
      context.addIssue({
        code: "custom",
        path: ["answers"],
        message: "Answers must contain each recognized question exactly once.",
      });
    }

    const legacy = questionIds.every((id) => typeof id === "number");
    const official = questionIds.every((id) => typeof id === "string");
    if (!legacy && !official) {
      context.addIssue({ code: "custom", path: ["answers"], message: "Diagnosis modes cannot be mixed." });
    }
    if (legacy) {
      for (let questionId = 1; questionId <= 11; questionId += 1) {
        if (!unique.has(questionId)) context.addIssue({ code: "custom", path: ["answers"], message: `Missing recognized question ${questionId}.` });
      }
    }
  });

export const MAX_REPORT_REQUEST_BYTES = 16 * 1024;

export function parseReportRequest(input: unknown) {
  const parsed = rawReportRequestSchema.parse(input);
  const answers = [...parsed.answers].sort((left, right) =>
    typeof left.questionId === "number" && typeof right.questionId === "number"
      ? left.questionId - right.questionId
      : String(left.questionId).localeCompare(String(right.questionId)));
  return { answers: normalizeDiagnosisAnswers(answers) };
}

export type ParsedReportRequest = ReturnType<typeof parseReportRequest>;
export { rawReportRequestSchema as reportRequestSchema };
