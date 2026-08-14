import officialPack from "../../src/data/questionBank/nextory11-question-pack-v1.json";
import { buildPremiumReportProfile } from "../reports/build-premium-profile.js";
import type { NormalizedDiagnosisAnswer } from "../reports/result-calculator.js";
import { createPremiumV2Profile, type PremiumV2Profile } from "./premium-v2-profile.js";

export const PREMIUM_V2_INPUT_INCOMPLETE = "premium_v2_input_incomplete";

function fail(): never {
  throw new Error(PREMIUM_V2_INPUT_INCOMPLETE);
}

/**
 * Explicit, fail-closed boundary between the existing diagnosis contract and
 * Premium V2.3.1. It only projects approved analysis fields and never accepts
 * customer, payment, or entitlement data.
 */
export function adaptProductionDiagnosisToPremiumV2(args: {
  answers: NormalizedDiagnosisAnswer[];
  resultType: string;
}): PremiumV2Profile {
  if (!args.resultType?.trim() || args.answers.length !== 11) fail();
  const expectedIds = new Set(officialPack.questions.map((question) => question.id));
  const seenIds = new Set<string>();

  for (const answer of args.answers) {
    const questionId = typeof answer.questionId === "string" ? answer.questionId : "";
    const version = answer.metadata?.questionSetVersion;
    if (!questionId || seenIds.has(questionId) || !expectedIds.has(questionId)
      || version !== officialPack.questionSetVersion || !answer.question?.trim()
      || !answer.answerId || !answer.answer?.trim()) fail();
    const officialQuestion = officialPack.questions.find((question) => question.id === questionId);
    const officialAnswer = officialQuestion?.options.find((option) => option.id === String(answer.answerId).toLowerCase());
    if (!officialQuestion || !officialAnswer
      || officialQuestion.text.ja.normalize("NFC").trim() !== answer.question.normalize("NFC").trim()
      || officialAnswer.text.ja.normalize("NFC").trim() !== answer.answer.normalize("NFC").trim()) fail();
    seenIds.add(questionId);
  }

  const derived = buildPremiumReportProfile(args.answers, args.resultType);
  if (!derived.primaryTrait || derived.questionSetVersion !== officialPack.questionSetVersion) fail();
  return createPremiumV2Profile({
    resultType: args.resultType.trim(),
    answers: args.answers.map((answer) => ({
      questionId: String(answer.questionId),
      questionText: answer.question.normalize("NFC").trim(),
      selectedAnswerId: String(answer.answerId),
      selectedAnswerText: answer.answer.normalize("NFC").trim(),
    })),
    primaryTrait: derived.primaryTrait,
    secondaryTrait: derived.secondaryTrait,
    thirdTrait: derived.thirdTrait,
    hiddenTraits: [...derived.hiddenTraits],
    traitDistribution: { ...derived.normalizedDistribution },
    categorySignals: derived.categorySignals.map((signal) => ({ ...signal })),
    relevantTags: [...derived.relevantTags],
    questionSetVersion: derived.questionSetVersion,
  });
}
