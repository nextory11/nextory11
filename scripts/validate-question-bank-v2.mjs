import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const bankPath = path.join(root, "src/data/questionBank/nextory11-question-pack-v1.json");
const pack = JSON.parse(fs.readFileSync(bankPath, "utf8"));
const baseline = JSON.parse(execFileSync(
  "git",
  ["show", "origin/main:src/data/questionBank/nextory11-question-pack-v1.json"],
  { cwd: root, encoding: "utf8", maxBuffer: 20_000_000 },
));

const failures = [];
const warnings = [];
const invariant = (condition, message) => {
  if (!condition) failures.push(message);
};
const characters = (value) => [...value].length;
const bigrams = (value) => {
  const normalized = value.replace(/[、。？「」・\s]/gu, "");
  const result = new Set();
  for (let index = 0; index < normalized.length - 1; index += 1) {
    result.add(normalized.slice(index, index + 2));
  }
  return result;
};
const similarity = (left, right) => {
  const a = bigrams(left);
  const b = bigrams(right);
  const common = [...a].filter((token) => b.has(token)).length;
  return common / (a.size + b.size - common || 1);
};

invariant(pack.questionSetVersion === "question-pack-v2", "questionSetVersion is not question-pack-v2");
invariant(pack.questions.length === 220, `Expected 220 questions; received ${pack.questions.length}`);
invariant(new Set(pack.questions.map(({ id }) => id)).size === 220, "Question IDs are not unique");
invariant(new Set(pack.questions.map(({ text }) => text.ja)).size === 220, "Question prompts are not unique");

const categoryCounts = new Map();
const targetCounts = new Map();
const answerPrimaryCounts = new Map();
const promptLengths = [];
const answerLengths = [];
const answerOccurrences = new Map();
const overlaps = [];
const optionImbalances = [];

for (let index = 0; index < pack.questions.length; index += 1) {
  const question = pack.questions[index];
  const before = baseline.questions[index];
  invariant(question.id === before.id, `Question ID changed at index ${index}`);
  invariant(question.category === before.category, `Category changed: ${question.id}`);
  invariant(question.metadata.targetTrait === before.metadata.targetTrait, `Target changed: ${question.id}`);
  invariant(question.options.length === 4, `Expected four answers: ${question.id}`);
  invariant(new Set(question.options.map(({ id }) => id)).size === 4, `Answer IDs are not unique: ${question.id}`);

  categoryCounts.set(question.category, (categoryCounts.get(question.category) ?? 0) + 1);
  targetCounts.set(question.metadata.targetTrait, (targetCounts.get(question.metadata.targetTrait) ?? 0) + 1);
  promptLengths.push({ id: question.id, length: characters(question.text.ja), text: question.text.ja });

  const lengths = [];
  for (let answerIndex = 0; answerIndex < question.options.length; answerIndex += 1) {
    const option = question.options[answerIndex];
    const oldOption = before.options[answerIndex];
    invariant(option.id === oldOption.id, `Answer ID changed: ${question.id}/${option.id}`);
    invariant(JSON.stringify(option.weights) === JSON.stringify(oldOption.weights), `Weights changed: ${question.id}/${option.id}`);
    invariant(JSON.stringify(option.metadata) === JSON.stringify(oldOption.metadata), `Answer metadata changed: ${question.id}/${option.id}`);
    answerPrimaryCounts.set(option.metadata.primaryTrait, (answerPrimaryCounts.get(option.metadata.primaryTrait) ?? 0) + 1);
    const length = characters(option.text.ja);
    lengths.push(length);
    answerLengths.push({ id: `${question.id}/${option.id}`, length, text: option.text.ja });
    answerOccurrences.set(option.text.ja, (answerOccurrences.get(option.text.ja) ?? 0) + 1);
  }
  optionImbalances.push({
    id: question.id,
    spread: Math.max(...lengths) - Math.min(...lengths),
    ratio: Math.max(...lengths) / Math.min(...lengths),
  });

  for (let left = 0; left < question.options.length; left += 1) {
    for (let right = left + 1; right < question.options.length; right += 1) {
      const score = similarity(question.options[left].text.ja, question.options[right].text.ja);
      if (score >= 0.42) {
        overlaps.push({
          questionId: question.id,
          answers: [question.options[left].id, question.options[right].id],
          traits: [question.options[left].metadata.primaryTrait, question.options[right].metadata.primaryTrait],
          score: Number(score.toFixed(3)),
        });
      }
    }
  }
}

invariant(categoryCounts.size === 20, `Expected 20 categories; received ${categoryCounts.size}`);
for (const [category, count] of categoryCounts) invariant(count === 11, `Expected 11 ${category} questions; received ${count}`);
invariant(targetCounts.size === 11, `Expected 11 targets; received ${targetCounts.size}`);
for (const [target, count] of targetCounts) invariant(count === 20, `Expected 20 ${target} targets; received ${count}`);
for (const [target, count] of answerPrimaryCounts) invariant(count === 80, `Expected 80 primary ${target} answers; received ${count}`);

const exactRepeatedAnswers = [...answerOccurrences.entries()]
  .filter(([, count]) => count > 1)
  .sort((a, b) => b[1] - a[1]);
const longAnswers = answerLengths.filter(({ length }) => length > 28);
const longPrompts = promptLengths.filter(({ length }) => length > 64);
const severeImbalances = optionImbalances.filter(({ spread, ratio }) => spread > 10 || ratio > 1.75);

if (overlaps.length > 0) warnings.push(`${overlaps.length} answer pairs exceeded the lexical-overlap review threshold`);
if (longAnswers.length > 0) failures.push(`${longAnswers.length} answers exceed 28 characters`);
if (longPrompts.length > 0) failures.push(`${longPrompts.length} prompts exceed 64 characters`);
if (severeImbalances.length > 0) failures.push(`${severeImbalances.length} questions have severe answer-length imbalance`);

const summary = {
  status: failures.length === 0 ? "PASS" : "FAIL",
  questionSetVersion: pack.questionSetVersion,
  schemaVersion: pack.schemaVersion,
  questions: pack.questions.length,
  answers: answerLengths.length,
  uniquePrompts: new Set(pack.questions.map(({ text }) => text.ja)).size,
  uniqueAnswerLabels: answerOccurrences.size,
  repeatedAnswerPatterns: exactRepeatedAnswers.length,
  categories: Object.fromEntries(categoryCounts),
  targetQuestions: Object.fromEntries(targetCounts),
  primaryAnswerDistribution: Object.fromEntries(answerPrimaryCounts),
  promptLength: {
    average: Number((promptLengths.reduce((sum, item) => sum + item.length, 0) / promptLengths.length).toFixed(2)),
    maximum: Math.max(...promptLengths.map(({ length }) => length)),
    over64: longPrompts.length,
  },
  answerLength: {
    average: Number((answerLengths.reduce((sum, item) => sum + item.length, 0) / answerLengths.length).toFixed(2)),
    maximum: Math.max(...answerLengths.map(({ length }) => length)),
    over24: answerLengths.filter(({ length }) => length > 24).length,
    over28: longAnswers.length,
  },
  lexicalOverlapReview: overlaps,
  severeLengthImbalances: severeImbalances,
  longestPrompts: [...promptLengths].sort((a, b) => b.length - a.length).slice(0, 10),
  longestAnswers: [...answerLengths].sort((a, b) => b.length - a.length).slice(0, 10),
  failures,
  warnings,
};

console.log(JSON.stringify(summary, null, 2));
if (failures.length > 0) process.exitCode = 1;
