function addWeights(scores, weights) {
  for (const [key, value] of Object.entries(weights)) scores[key] = (scores[key] ?? 0) + value;
}

function ranking(scores) {
  return Object.entries(scores)
    .map(([personality, score]) => ({ personality, score }))
    .sort((left, right) => right.score - left.score || left.personality.localeCompare(right.personality));
}

function opportunityDistribution(responses) {
  const opportunities = {};
  for (const { question } of responses) {
    const traits = new Set(question.answers.flatMap((answer) => [
      ...Object.keys(answer.personalityWeights),
      ...Object.keys(answer.secondaryWeights),
    ]));
    for (const trait of traits) {
      const maximum = Math.max(...question.answers.map((answer) =>
        (answer.personalityWeights[trait] ?? 0) + (answer.secondaryWeights[trait] ?? 0)));
      opportunities[trait] = (opportunities[trait] ?? 0) + maximum;
    }
  }
  return opportunities;
}

export function scoreQuestionnaire(responses, { hiddenTraitLimit = 2, normalizeOpportunities = false } = {}) {
  const primaryScores = {};
  const secondaryScores = {};
  const expansionScores = {};

  for (const response of responses) {
    const option = response.question.answers.find((answer) => answer.id === response.answerId);
    if (!option) throw new Error(`Unknown answer ${response.answerId} for question ${response.question.id}`);
    addWeights(primaryScores, option.personalityWeights);
    addWeights(secondaryScores, option.secondaryWeights);
    addWeights(expansionScores, option.expansionScores);
  }

  const combinedScores = { ...primaryScores };
  addWeights(combinedScores, secondaryScores);
  const opportunities = opportunityDistribution(responses);
  const normalizedScores = Object.fromEntries(Object.entries(combinedScores).map(([trait, score]) => [
    trait,
    opportunities[trait] > 0 ? score / opportunities[trait] : 0,
  ]));
  const rankedScores = normalizeOpportunities ? normalizedScores : combinedScores;
  const strengthRanking = ranking(rankedScores);
  const [primary = null, secondary = null, third = null] = strengthRanking;
  const hiddenTraits = strengthRanking.filter((trait) =>
    trait.personality !== primary?.personality && (secondaryScores[trait.personality] ?? 0) > 0).slice(0, hiddenTraitLimit);

  return {
    primaryPersonality: primary,
    secondaryPersonality: secondary,
    thirdPersonality: third,
    hiddenTraits,
    strengthRanking,
    scoreDistribution: combinedScores,
    normalizedScoreDistribution: normalizedScores,
    opportunityDistribution: opportunities,
    primaryScores,
    secondaryScores,
    expansionScores,
  };
}
