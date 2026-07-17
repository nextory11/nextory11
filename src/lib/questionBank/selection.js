import { normalizeQuestionId } from "./contracts.js";

function traitsFor(question) {
  const traits = new Set();
  for (const answer of question.answers) {
    Object.keys(answer.personalityWeights).forEach((trait) => traits.add(trait));
    Object.keys(answer.secondaryWeights).forEach((trait) => traits.add(trait));
  }
  return [...traits];
}

function shuffle(items, rng) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(rng() * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}

export function selectQuestions({
  bank,
  count,
  filters = {},
  rotationTracker,
  recentQuestionLimit,
  recentCooldownLimit,
  rng = Math.random,
  adaptiveRanker,
}) {
  if (!Number.isInteger(count) || count < 0) throw new TypeError("Selection count must be a non-negative integer");
  if (count === 0) return [];

  const exclusions = rotationTracker?.exclusions({ recentQuestionLimit, recentCooldownLimit }) ?? {
    questionIds: new Set(), rotationGroups: new Set(), cooldownGroups: new Set(),
  };
  const candidates = shuffle(bank.query(filters), rng).filter((question) =>
    !exclusions.questionIds.has(normalizeQuestionId(question.id)) &&
    (!question.rotationGroup || !exclusions.rotationGroups.has(question.rotationGroup)) &&
    (!question.cooldownGroup || !exclusions.cooldownGroups.has(question.cooldownGroup)));

  const selected = [];
  const selectedIds = new Set();
  const selectedRotationGroups = new Set();
  const coverage = new Map();
  const targetCoverage = new Map();
  const categoryCoverage = new Map();

  while (selected.length < count) {
    const eligible = candidates.filter((question) =>
      !selectedIds.has(normalizeQuestionId(question.id)) &&
      (!question.rotationGroup || !selectedRotationGroups.has(question.rotationGroup)));
    if (!eligible.length) break;

    const ranked = eligible.map((question, order) => {
      const traits = traitsFor(question);
      const targetTrait = question.metadata?.targetTrait;
      const targetScore = targetTrait ? (targetCoverage.get(targetTrait) ?? 0) : 0;
      const categoryScore = categoryCoverage.get(question.category) ?? 0;
      const adaptiveScore = adaptiveRanker ? Number(adaptiveRanker(question, { selected: [...selected], coverage: new Map(coverage) })) || 0 : 0;
      return { question, traits, targetTrait, targetScore, categoryScore, adaptiveScore, order };
    }).sort((left, right) =>
      left.targetScore - right.targetScore ||
      left.categoryScore - right.categoryScore ||
      right.adaptiveScore - left.adaptiveScore ||
      left.order - right.order);

    const choice = ranked[0];
    selected.push(choice.question);
    selectedIds.add(normalizeQuestionId(choice.question.id));
    if (choice.question.rotationGroup) selectedRotationGroups.add(choice.question.rotationGroup);
    choice.traits.forEach((trait) => coverage.set(trait, (coverage.get(trait) ?? 0) + 1));
    if (choice.targetTrait) targetCoverage.set(choice.targetTrait, (targetCoverage.get(choice.targetTrait) ?? 0) + 1);
    categoryCoverage.set(choice.question.category, (categoryCoverage.get(choice.question.category) ?? 0) + 1);
  }

  if (selected.length < count) {
    throw new RangeError(`Unable to select ${count} questions under the active constraints; selected ${selected.length}`);
  }
  return selected;
}
