import { questions } from "../../src/data/questions.js";
import { resultTypes } from "../../src/data/resultTypes.js";
import type { AnswerId, QuestionId } from "../validation/identifiers.js";

type PublicAnswer = { text: string; type: string; score: number };
type PublicQuestion = { id: number; question: string; answers: PublicAnswer[] };
type PublicResult = { title: string; en: string };

export interface RecognizedAnswer {
  questionId: QuestionId;
  answerId: AnswerId;
}

export interface NormalizedDiagnosisAnswer extends RecognizedAnswer {
  question: string;
  answer: string;
  answerLabel: AnswerId;
  type: string;
  score: number;
}

export interface CalculatedResult {
  resultType: string;
  resultNameJa: string;
  resultNameEn: string;
}

const questionCatalog = questions as PublicQuestion[];
const resultCatalog = resultTypes as Record<string, PublicResult>;

function answerIndex(answerId: AnswerId): number {
  return answerId.charCodeAt(0) - 65;
}

export function resolveRecognizedAnswer(answer: RecognizedAnswer): NormalizedDiagnosisAnswer {
  const question = questionCatalog.find((candidate) => candidate.id === answer.questionId);
  const recognized = question?.answers[answerIndex(answer.answerId)];

  if (!question || !recognized) {
    throw new Error("Unrecognized diagnosis answer.");
  }

  return {
    ...answer,
    question: question.question.normalize("NFC").trim(),
    answer: recognized.text.normalize("NFC").trim(),
    answerLabel: answer.answerId,
    type: recognized.type,
    score: recognized.score,
  };
}

export function calculateDiagnosisResult(answers: RecognizedAnswer[]): CalculatedResult {
  const counts: Record<string, number> = {};

  for (const answer of answers) {
    const recognized = resolveRecognizedAnswer(answer);
    counts[recognized.type] = (counts[recognized.type] || 0) + 1;
  }

  // This intentionally matches the frontend: stable sorting preserves the first
  // encountered type when two types have the same count.
  const resultType =
    Object.entries(counts).sort((left, right) => right[1] - left[1])[0]?.[0] ||
    Object.keys(resultCatalog)[0];
  const result = resultCatalog[resultType];

  if (!result) {
    throw new Error("Diagnosis result configuration is unavailable.");
  }

  return {
    resultType,
    resultNameJa: result.title.normalize("NFC").trim(),
    resultNameEn: result.en.normalize("NFC").trim(),
  };
}

export function normalizeDiagnosisAnswers(answers: RecognizedAnswer[]): NormalizedDiagnosisAnswer[] {
  return answers.map(resolveRecognizedAnswer);
}
