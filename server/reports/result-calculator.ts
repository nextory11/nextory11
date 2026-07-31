import { questions } from "../../src/data/questions.js";
import { resultTypes } from "../../src/data/resultTypes.js";
import type { AnswerId, QuestionId } from "../validation/identifiers.js";
import officialPack from "../../src/data/questionBank/nextory11-question-pack-v1.json" with { type: "json" };

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
  metadata?: Record<string, unknown>;
}

export interface CalculatedResult {
  resultType: string;
  resultNameJa: string;
  resultNameEn: string;
}

const questionCatalog = questions as PublicQuestion[];
const resultCatalog = resultTypes as Record<string, PublicResult>;

function answerIndex(answerId: AnswerId): number {
  return answerId.toUpperCase().charCodeAt(0) - 65;
}

const officialToLegacy: Record<string, string> = {
  challenge: "challenger", creator: "creator", empath: "empathy", evolver: "adaptability",
  explorer: "explorer", guardian: "persistence", harmonizer: "thinker", intuitive: "intuition",
  "light-bringer": "expression", pioneer: "action", visionary: "leader",
};

function resolveOfficialAnswer(answer: RecognizedAnswer): NormalizedDiagnosisAnswer | null {
  if (typeof answer.questionId !== "string") return null;
  const question = officialPack.questions.find((candidate) => candidate.id === answer.questionId);
  const option = question?.options.find((candidate) => candidate.id === answer.answerId.toLowerCase());
  if (!question || !option) throw new Error("Unrecognized official diagnosis answer.");
  const primarySlug = option.metadata.primaryTrait;
  const type = officialToLegacy[primarySlug];
  if (!type) throw new Error("Unsupported official personality slug.");
  return {
    ...answer,
    answerId: option.id as AnswerId,
    question: question.text.ja.normalize("NFC").trim(),
    answer: option.text.ja.normalize("NFC").trim(),
    answerLabel: option.id as AnswerId,
    type,
    score: 1,
    metadata: {
      questionSetVersion: officialPack.questionSetVersion,
      category: question.category,
      tags: question.tags,
      weights: option.weights,
      primaryTrait: primarySlug,
      secondaryTrait: option.metadata.secondaryTrait,
    },
  };
}

export function resolveRecognizedAnswer(answer: RecognizedAnswer): NormalizedDiagnosisAnswer {
  const official = resolveOfficialAnswer(answer);
  if (official) return official;
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
  if (answers.every((answer) => typeof answer.questionId === "string")) {
    const scores: Record<string, number> = {};
    const opportunities: Record<string, number> = {};
    for (const answer of answers) {
      const recognized = resolveOfficialAnswer(answer);
      if (!recognized) throw new Error("Invalid official answer mode.");
      const weights = recognized.metadata?.weights as Record<string, number>;
      for (const [slug, weight] of Object.entries(weights)) scores[slug] = (scores[slug] ?? 0) + weight;

      const question = officialPack.questions.find((candidate) => candidate.id === answer.questionId);
      if (!question) throw new Error("Official diagnosis question configuration is unavailable.");
      const traits = new Set(question.options.flatMap((option) => Object.keys(option.weights)));
      for (const trait of traits) {
        const maximum = Math.max(...question.options.map((option) =>
          Object.entries(option.weights).find(([slug]) => slug === trait)?.[1] ?? 0));
        opportunities[trait] = (opportunities[trait] ?? 0) + maximum;
      }
    }
    const normalizedScores = Object.fromEntries(Object.entries(scores).map(([trait, score]) => [
      trait,
      opportunities[trait] > 0 ? score / opportunities[trait] : 0,
    ]));
    const officialType = Object.entries(normalizedScores).sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))[0]?.[0] ?? "pioneer";
    const resultType = officialToLegacy[officialType];
    const result = resultCatalog[resultType];
    if (!result) throw new Error("Official diagnosis result configuration is unavailable.");
    return { resultType, resultNameJa: result.title.normalize("NFC").trim(), resultNameEn: result.en.normalize("NFC").trim() };
  }
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
