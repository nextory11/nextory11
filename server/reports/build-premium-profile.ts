import { createHash } from "node:crypto";
import type { PremiumReportProfile } from "../ai/contracts.js";
import type { NormalizedDiagnosisAnswer } from "./result-calculator.js";
import officialPack from "../../src/data/questionBank/nextory11-question-pack-v1.json" with { type: "json" };

const LEGACY_TO_OFFICIAL: Record<string, string> = {
  challenger: "challenge", creator: "creator", empathy: "empath", adaptability: "evolver",
  explorer: "explorer", persistence: "guardian", thinker: "harmonizer", intuition: "intuitive",
  expression: "light-bringer", action: "pioneer", leader: "visionary",
};

function sortedCounts(values: string[]) {
  const counts = new Map<string, number>();
  values.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1));
  return [...counts.entries()].map(([category, count]) => ({ category, count }))
    .sort((left, right) => right.count - left.count || left.category.localeCompare(right.category));
}

export function buildPremiumReportProfile(
  answers: NormalizedDiagnosisAnswer[],
  resultType: string,
): PremiumReportProfile {
  const scores: Record<string, number> = {};
  const opportunities: Record<string, number> = {};
  const categories: string[] = [];
  const tags: string[] = [];
  let questionSetVersion = "legacy-v1";

  for (const answer of answers) {
    const metadata = answer.metadata ?? {};
    const weights = (metadata.weights ?? {}) as Record<string, number>;
    const officialQuestion = typeof answer.questionId === "string"
      ? officialPack.questions.find((question) => question.id === answer.questionId)
      : undefined;
    for (const [trait, weight] of Object.entries(weights)) {
      if (Number.isFinite(weight)) {
        scores[trait] = (scores[trait] ?? 0) + weight;
      }
    }
    if (officialQuestion) {
      const possibleTraits = new Set(officialQuestion.options.flatMap((option) => Object.keys(option.weights)));
      for (const trait of possibleTraits) {
        const maximum = Math.max(...officialQuestion.options.map((option) => Object.entries(option.weights).find(([slug]) => slug === trait)?.[1] ?? 0));
        opportunities[trait] = (opportunities[trait] ?? 0) + maximum;
      }
    }
    if (typeof metadata.category === "string") categories.push(metadata.category);
    if (Array.isArray(metadata.tags)) tags.push(...metadata.tags.filter((tag): tag is string => typeof tag === "string"));
    if (typeof metadata.questionSetVersion === "string") questionSetVersion = metadata.questionSetVersion;
  }

  if (!Object.keys(scores).length) {
    for (const answer of answers) scores[LEGACY_TO_OFFICIAL[answer.type] ?? answer.type] =
      (scores[LEGACY_TO_OFFICIAL[answer.type] ?? answer.type] ?? 0) + answer.score;
    Object.keys(scores).forEach((trait) => { opportunities[trait] = answers.length; });
  }

  const normalizedDistribution = Object.fromEntries(Object.entries(scores).map(([trait, score]) => [
    trait, Number((score / Math.max(opportunities[trait] ?? 1, 1)).toFixed(6)),
  ]));
  const ranking = Object.entries(normalizedDistribution)
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .map(([trait]) => trait);
  const primaryTrait = LEGACY_TO_OFFICIAL[resultType] ?? ranking[0] ?? resultType;
  const ordered = [primaryTrait, ...ranking.filter((trait) => trait !== primaryTrait)];
  const signatureSource = answers.map((answer) => `${answer.questionId}:${answer.answerId}`).sort().join("|");

  return {
    profileSignature: createHash("sha256").update(signatureSource).digest("hex"),
    questionSetVersion,
    selectedQuestionIds: answers.map((answer) => String(answer.questionId)),
    selectedAnswerIds: answers.map((answer) => String(answer.answerId)),
    primaryTrait: ordered[0],
    secondaryTrait: ordered[1] ?? null,
    thirdTrait: ordered[2] ?? null,
    hiddenTraits: ordered.slice(1, 3),
    normalizedDistribution,
    categorySignals: sortedCounts(categories).slice(0, 8),
    relevantTags: [...new Set(tags)].slice(0, 16),
  };
}
