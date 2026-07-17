import fs from "node:fs";
import path from "node:path";
import { QuestionBank } from "../src/lib/questionBank/questionBank.js";
import { selectQuestions } from "../src/lib/questionBank/selection.js";
import { officialQuestionPack, OFFICIAL_PERSONALITY_SLUGS } from "../src/lib/questionBank/officialPack.js";

const sessions = Number(process.argv[2] ?? 10_000);
const outputPath = process.argv[3];
let seed = 0x4e313156;
const rng = () => {
  seed = (Math.imul(seed, 1_664_525) + 1_013_904_223) >>> 0;
  return seed / 2 ** 32;
};

const bank = new QuestionBank(officialQuestionPack);
const shuffle = (items) => {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(rng() * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
};
const questionFrequency = Object.fromEntries(officialQuestionPack.questions.map(({ id }) => [id, 0]));
const targetFrequency = Object.fromEntries(OFFICIAL_PERSONALITY_SLUGS.map((slug) => [slug, 0]));
const answerPositionFrequency = { a: [0, 0, 0, 0], b: [0, 0, 0, 0], c: [0, 0, 0, 0], d: [0, 0, 0, 0] };
let duplicateSessions = 0;

for (let session = 0; session < sessions; session += 1) {
  const selected = selectQuestions({ bank, count: 11, filters: { language: "ja" }, rng });
  if (new Set(selected.map(({ id }) => id)).size !== selected.length) duplicateSessions += 1;
  for (const question of selected) {
    questionFrequency[question.id] += 1;
    targetFrequency[question.metadata.targetTrait] += 1;
    const shuffled = shuffle(question.answers);
    shuffled.forEach((answer, position) => { answerPositionFrequency[answer.id][position] += 1; });
  }
}

const frequencies = Object.values(questionFrequency);
const mean = frequencies.reduce((sum, value) => sum + value, 0) / frequencies.length;
const targetValues = Object.values(targetFrequency);
const targetMean = targetValues.reduce((sum, value) => sum + value, 0) / targetValues.length;
const report = {
  generatedAt: new Date().toISOString(),
  seed: "0x4e313156",
  sessions,
  questionsPerSession: 11,
  duplicateSessions,
  questionFrequency: {
    minimum: Math.min(...frequencies),
    maximum: Math.max(...frequencies),
    mean,
    maximumDeviationPercent: Math.max(...frequencies.map((value) => Math.abs(value - mean) / mean * 100)),
  },
  targetFrequency,
  targetMaximumDeviationPercent: Math.max(...targetValues.map((value) => Math.abs(value - targetMean) / targetMean * 100)),
  answerPositionFrequency,
};

const serialized = `${JSON.stringify(report, null, 2)}\n`;
if (outputPath) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, serialized, "utf8");
} else {
  process.stdout.write(serialized);
}
