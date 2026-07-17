import rawPack from "../../data/questionBank/nextory11-question-pack-v1.json" with { type: "json" };
import { parseQuestionBank } from "./contracts.js";

export const OFFICIAL_PERSONALITY_SLUGS = Object.freeze([
  "challenge", "creator", "empath", "evolver", "explorer", "guardian",
  "harmonizer", "intuitive", "light-bringer", "pioneer", "visionary",
]);

export const OFFICIAL_TO_LEGACY_TYPE = Object.freeze({
  challenge: "challenger",
  creator: "creator",
  empath: "empathy",
  evolver: "adaptability",
  explorer: "explorer",
  guardian: "persistence",
  harmonizer: "thinker",
  intuitive: "intuition",
  "light-bringer": "expression",
  pioneer: "action",
  visionary: "leader",
});

const officialSlugSet = new Set(OFFICIAL_PERSONALITY_SLUGS);

function localized(value, locale, fieldName) {
  const text = value?.[locale] ?? value?.ja;
  if (typeof text !== "string" || !text.trim()) throw new Error(`Question Pack is missing ${fieldName}`);
  return text.normalize("NFC").trim();
}

function splitWeights(weights, metadata) {
  const primary = metadata?.primaryTrait;
  const personalityWeights = {};
  const secondaryWeights = {};
  for (const [slug, value] of Object.entries(weights ?? {})) {
    if (!officialSlugSet.has(slug) || !Number.isFinite(value)) throw new Error(`Invalid personality weight: ${slug}`);
    if (slug === primary) personalityWeights[slug] = value;
    else secondaryWeights[slug] = value;
  }
  if (!Object.keys(personalityWeights).length || !Object.keys(secondaryWeights).length) {
    throw new Error("Every official answer requires primary and secondary weights");
  }
  return { personalityWeights, secondaryWeights };
}

export function adaptOfficialQuestionPack(input = rawPack, locale = "ja") {
  const questions = input.questions.map((question) => ({
    id: question.id,
    revision: Number(String(question.version).split(".")[0]) || 1,
    category: question.category,
    difficulty: question.difficulty,
    text: localized(question.text, locale, `${question.id}.text`),
    answers: question.options.map((option) => ({
      id: option.id,
      text: localized(option.text, locale, `${question.id}.${option.id}.text`),
      ...splitWeights(option.weights, option.metadata),
      expansionScores: {},
      metadata: option.metadata ?? {},
      extensions: {},
    })),
    tags: question.tags ?? [],
    rotationGroup: question.rotationGroup ?? null,
    cooldownGroup: question.cooldownGroup ?? null,
    enabled: question.enabled !== false,
    language: question.language ?? locale,
    metadata: question.metadata ?? {},
    extensions: { bankVersion: question.bankVersion ?? input.questionSetVersion },
  }));

  const manifest = {
    bankId: "nextory11-official",
    version: input.questionSetVersion,
    contextVersion: input.schemaVersion,
    language: locale,
    metadata: { source: "official-question-pack-v1", scoring: input.scoring },
    questions,
  };
  const parsed = parseQuestionBank(manifest);
  validateOfficialQuestionPack(parsed);
  return parsed;
}

export function validateOfficialQuestionPack(pack) {
  if (pack.questions.length !== 220) throw new Error(`Expected 220 questions; received ${pack.questions.length}`);
  const ids = new Set();
  const counts = Object.fromEntries(OFFICIAL_PERSONALITY_SLUGS.map((slug) => [slug, 0]));
  for (const question of pack.questions) {
    if (ids.has(String(question.id))) throw new Error(`Duplicate Question ID: ${question.id}`);
    ids.add(String(question.id));
    const target = question.metadata.targetTrait;
    if (!officialSlugSet.has(target)) throw new Error(`Invalid target trait: ${target}`);
    counts[target] += 1;
    if (new Set(question.answers.map((answer) => answer.id)).size !== 4) throw new Error(`Duplicate answer ID: ${question.id}`);
  }
  for (const [slug, count] of Object.entries(counts)) {
    if (count !== 20) throw new Error(`Expected 20 ${slug} questions; received ${count}`);
  }
  return true;
}

export const officialQuestionPack = adaptOfficialQuestionPack();
