import { normalizeQuestionId } from "./contracts.js";

export function createQuestionBankContext({ bank, responses, scoringResult, diagnosisSessionId = null }) {
  return {
    contextVersion: bank.descriptor.contextVersion,
    diagnosisSessionId,
    questionBank: bank.descriptor,
    selectedQuestions: responses.map(({ question }) => ({
      id: normalizeQuestionId(question.id),
      text: question.text,
      revision: question.revision,
      category: question.category,
      difficulty: question.difficulty,
      language: question.language,
      tags: [...question.tags],
      rotationGroup: question.rotationGroup,
      cooldownGroup: question.cooldownGroup,
      metadata: structuredClone(question.metadata),
    })),
    selectedAnswers: responses.map(({ question, answerId }) => ({
      questionId: normalizeQuestionId(question.id),
      questionRevision: question.revision,
      answerId,
      answerText: question.answers.find((answer) => answer.id === answerId)?.text ?? "",
      displayOrder: question.answers.map((answer) => answer.id),
    })),
    scoreDistribution: structuredClone(scoringResult.scoreDistribution),
    normalizedScoreDistribution: structuredClone(scoringResult.normalizedScoreDistribution ?? {}),
    primaryPersonality: structuredClone(scoringResult.primaryPersonality),
    secondaryPersonality: structuredClone(scoringResult.secondaryPersonality),
    thirdPersonality: structuredClone(scoringResult.thirdPersonality),
    hiddenTraits: structuredClone(scoringResult.hiddenTraits),
    strengthRanking: structuredClone(scoringResult.strengthRanking),
    expansionScores: structuredClone(scoringResult.expansionScores),
  };
}
