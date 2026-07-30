import { z } from "zod";
import { answerIdSchema, questionIdSchema } from "./identifiers.js";
import { normalizeDiagnosisAnswers } from "../reports/result-calculator.js";

const diagnosisAnswerSchema = z.object({
  questionId: questionIdSchema,
  answerId: answerIdSchema,
});
const questionBankContextSchema = z.object({
  diagnosisSessionId: z.string().min(8).max(128).nullable().optional(),
  questionBank: z.object({ version: z.string().min(1) }).passthrough(),
  selectedQuestions: z.array(z.object({
    id: z.string(),
    text: z.string(),
    category: z.string(),
    tags: z.array(z.string()),
  }).passthrough()).length(11),
  selectedAnswers: z.array(z.object({
    questionId: z.string(),
    answerId: z.string(),
    answerText: z.string(),
    displayOrder: z.array(z.string()).length(4),
  }).passthrough()).length(11),
}).passthrough();

const rawReportRequestSchema = z
  .object({
    answers: z.array(diagnosisAnswerSchema).length(11),
    diagnosisSessionId: z.string().min(8).max(128).nullable().optional(),
    questionBankContext: questionBankContextSchema.nullable().optional(),
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
    if (official && value.questionBankContext) {
      const selectedIds = value.questionBankContext.selectedQuestions.map(({ id }) => id);
      const answerIds = value.answers.map(({ questionId }) => String(questionId));
      if (selectedIds.some((id, index) => id !== answerIds[index])) {
        context.addIssue({ code: "custom", path: ["questionBankContext"], message: "Question order does not match the submitted diagnosis." });
      }
      if (value.questionBankContext.diagnosisSessionId && value.diagnosisSessionId
        && value.questionBankContext.diagnosisSessionId !== value.diagnosisSessionId) {
        context.addIssue({ code: "custom", path: ["diagnosisSessionId"], message: "Diagnosis session identifiers do not match." });
      }
    }
  });

export const MAX_REPORT_REQUEST_BYTES = 64 * 1024;

export function parseReportRequest(input: unknown) {
  const parsed = rawReportRequestSchema.parse(input);
  const answers = parsed.answers.every(({ questionId }) => typeof questionId === "number")
    ? [...parsed.answers].sort((left, right) => Number(left.questionId) - Number(right.questionId))
    : parsed.answers;
  return {
    answers: normalizeDiagnosisAnswers(answers),
    diagnosisSessionId: parsed.diagnosisSessionId ?? parsed.questionBankContext?.diagnosisSessionId ?? null,
    questionBankContext: parsed.questionBankContext ?? null,
  };
}

export type ParsedReportRequest = ReturnType<typeof parseReportRequest>;
export { rawReportRequestSchema as reportRequestSchema };
