import { resultTypes } from "../../data/resultTypes";

function scoreAnswers(answers) {
  const scores = Object.fromEntries(Object.keys(resultTypes).map((type) => [type, 0]));
  answers.forEach((answer) => {
    if (answer.type in scores) scores[answer.type] += Number(answer.score) || 1;
  });
  return scores;
}

export function createAnswerSignature(answers) {
  return answers.reduce((hash, answer, index) => {
    const value = `${answer.questionId ?? index + 1}:${answer.answerLabel ?? answer.type}:${answer.text ?? ""}`;
    return [...value].reduce((total, character) => ((total * 31) + character.charCodeAt(0)) >>> 0, hash);
  }, 2166136261);
}

export function analyzeJuzaProfile({ answers, result, resultType }) {
  const scores = scoreAnswers(answers);
  const ranking = Object.entries(scores)
    .map(([type, score]) => ({ type, score, ...resultTypes[type] }))
    .sort((left, right) => right.score - left.score || left.type.localeCompare(right.type));
  const primary = ranking.find((trait) => trait.type === resultType) ?? ranking[0];
  const hiddenTraits = ranking.filter((trait) => trait.type !== resultType && trait.score > 0).slice(0, 2);

  return {
    personalityType: resultType,
    personalityName: result.en,
    personalityLabel: result.title,
    scoreDistribution: Object.fromEntries(ranking.map(({ type, score }) => [type, score])),
    hiddenTraits: hiddenTraits.map(({ type, title, score, essence, strength }) => ({ type, title, score, essence, strength })),
    strengthRanking: ranking.filter(({ score }) => score > 0).map(({ type, title, score, strength }) => ({ type, title, score, strength })),
    answerCount: answers.length,
    primaryScore: primary?.score ?? 0,
    answerSignature: createAnswerSignature(answers),
  };
}
