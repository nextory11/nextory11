import { AI_JUZA_CONTEXT_VERSION } from "./contracts";
import { analyzeJuzaProfile } from "./profile";
import { resultTypes } from "../../data/resultTypes";
import { OFFICIAL_TO_LEGACY_TYPE } from "../questionBank/officialPack.js";

export function createJuzaContext({
  answers,
  result,
  resultType,
  locale = "ja",
  questionSetVersion = "nextory11.v1",
  session = null,
  mentoring = null,
  memory = [],
  questionBankContext = null,
}) {
  const normalizedAnswers = answers.map((answer, index) => ({
    questionId: answer.questionId ?? index + 1,
    answerId: answer.answerLabel ?? null,
    type: answer.type,
    score: Number(answer.score) || 1,
    text: answer.text ?? "",
    question: answer.question ?? "",
    metadata: answer.metadata ?? null,
  }));

  const legacyProfile = analyzeJuzaProfile({ answers: normalizedAnswers, result, resultType });
  const questionRanking = questionBankContext?.strengthRanking?.map((trait) => {
    const type = OFFICIAL_TO_LEGACY_TYPE[trait.personality];
    return type && resultTypes[type] ? { type, score: trait.score, ...resultTypes[type] } : null;
  }).filter(Boolean);
  const profile = questionRanking?.length ? {
    ...legacyProfile,
    scoreDistribution: Object.fromEntries(questionRanking.map(({ type, score }) => [type, score])),
    hiddenTraits: questionRanking.slice(1, 3).map(({ type, title, score, essence, strength }) => ({ type, title, score, essence, strength })),
    strengthRanking: questionRanking.map(({ type, title, score, strength }) => ({ type, title, score, strength })),
    primaryScore: questionRanking[0]?.score ?? legacyProfile.primaryScore,
  } : legacyProfile;

  return {
    version: AI_JUZA_CONTEXT_VERSION,
    locale,
    questionSet: {
      version: questionSetVersion,
      answeredQuestionIds: normalizedAnswers.map(({ questionId }) => questionId),
      answerCount: normalizedAnswers.length,
    },
    result: { type: resultType, name: result.en, label: result.title },
    profile,
    questionBank: questionBankContext ? structuredClone(questionBankContext) : null,
    journey: { answers: normalizedAnswers },
    session: session ? { id: session.id ?? null, userId: session.userId ?? null, startedAt: session.startedAt ?? null } : null,
    mentoring: mentoring ? { goals: mentoring.goals ?? [], focus: mentoring.focus ?? null } : null,
    memory: Array.isArray(memory) ? memory.slice(-20) : [],
  };
}
