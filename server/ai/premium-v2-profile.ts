export interface PremiumV2AnswerEvidence {
  questionId: string;
  questionText: string;
  selectedAnswerId: string;
  selectedAnswerText: string;
}

export interface PremiumV2Profile {
  resultType: string;
  answers: PremiumV2AnswerEvidence[];
  primaryTrait: string;
  secondaryTrait: string | null;
  thirdTrait: string | null;
  hiddenTraits: string[];
  traitDistribution: Record<string, number>;
  categorySignals: Array<{ category: string; count: number }>;
  relevantTags: string[];
  answerProfileSignature: string;
  questionSetVersion: string;
}

const forbiddenKeys = /^(name|email|address|phone|ip|stripe|payment|customer|accessToken|requestId|health)/iu;

export function createPremiumV2Profile(input: Omit<PremiumV2Profile, "answerProfileSignature">): PremiumV2Profile {
  if (input.answers.length !== 11) throw new Error("premium_v2_requires_11_answers");
  for (const answer of input.answers) {
    if (!answer.questionId || !answer.questionText || !answer.selectedAnswerId || !answer.selectedAnswerText) {
      throw new Error("premium_v2_answer_evidence_incomplete");
    }
  }
  if (Object.keys(input).some((key) => forbiddenKeys.test(key))) throw new Error("premium_v2_pii_rejected");
  const signature = input.answers.map((answer) => `${answer.questionId}:${answer.selectedAnswerId}`).join("|");
  // This is a stable review-fixture identifier, not a security primitive. Keeping
  // it runtime-neutral lets the local review UI display fixtures without bundling
  // Node crypto. Production V1 signatures remain untouched.
  let hash = 2166136261;
  for (const character of signature) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619) >>> 0;
  const block = hash.toString(16).padStart(8, "0");
  return { ...input, answerProfileSignature: block.repeat(8) };
}

export function toPremiumV2AuthorizedInput(profile: PremiumV2Profile) {
  return {
    resultType: profile.resultType,
    answers: profile.answers,
    derivedProfile: {
      primaryTrait: profile.primaryTrait,
      secondaryTrait: profile.secondaryTrait,
      thirdTrait: profile.thirdTrait,
      hiddenTraits: profile.hiddenTraits,
      traitDistribution: profile.traitDistribution,
      categorySignals: profile.categorySignals,
      relevantTags: profile.relevantTags,
      answerProfileSignature: profile.answerProfileSignature,
      questionSetVersion: profile.questionSetVersion,
    },
  };
}
