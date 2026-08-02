import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PLACEHOLDER = /\b(?:todo|tbd|placeholder|lorem ipsum|fixme)\b|未設定|仮文|ダミー/iu;
const hasBrokenText = (value) => [...value].some((character) => {
  const code = character.codePointAt(0);
  return code === 0x7f || code === 0xfffd || (code < 0x20 && code !== 0x09 && code !== 0x0a && code !== 0x0d);
});

function normalized(value) {
  return typeof value === "string" ? value.trim().replace(/\s+/gu, " ") : "";
}

function wordingIssue(value, label, failures) {
  const text = normalized(value);
  if (!text) failures.push(`${label} is empty or malformed`);
  else if (PLACEHOLDER.test(text)) failures.push(`${label} contains prohibited placeholder content`);
  else if (hasBrokenText(text)) failures.push(`${label} contains broken characters`);
  return text;
}

export function auditQuestionBank(pack) {
  const failures = [];
  if (!pack || typeof pack !== "object" || !Array.isArray(pack.questions)) {
    return { status: "FAIL", questions: 0, answers: 0, failures: ["Question Bank structure is malformed"] };
  }
  if (pack.questionSetVersion !== "question-pack-v2") failures.push("questionSetVersion is not question-pack-v2");
  const questionIds = new Set();
  const prompts = new Map();
  let answerCount = 0;

  for (const [questionIndex, question] of pack.questions.entries()) {
    const label = `Question ${question?.id ?? questionIndex}`;
    if (!question || typeof question !== "object") {
      failures.push(`${label} is malformed`);
      continue;
    }
    if (typeof question.id !== "string" || !question.id) failures.push(`${label} has an invalid ID`);
    else if (questionIds.has(question.id)) failures.push(`Duplicate question ID: ${question.id}`);
    else questionIds.add(question.id);

    const prompt = wordingIssue(question.text?.ja, `${label} wording`, failures);
    if (prompt) {
      const previous = prompts.get(prompt);
      if (previous) failures.push(`Duplicate question wording: ${previous} and ${question.id}`);
      else prompts.set(prompt, question.id);
    }
    if (typeof question.category !== "string" || !question.category) failures.push(`${label} has an invalid category`);
    if (typeof question.metadata?.targetTrait !== "string" || !question.metadata.targetTrait) {
      failures.push(`${label} has an invalid target trait`);
    }
    if (!Array.isArray(question.options) || question.options.length !== 4) {
      failures.push(`${label} must contain exactly four answers`);
      continue;
    }

    const answerIds = new Set();
    const answerWording = new Map();
    for (const [answerIndex, answer] of question.options.entries()) {
      answerCount += 1;
      const answerLabel = `${label} answer ${answer?.id ?? answerIndex}`;
      if (!answer || typeof answer !== "object") {
        failures.push(`${answerLabel} is malformed`);
        continue;
      }
      if (typeof answer.id !== "string" || !answer.id) failures.push(`${answerLabel} has an invalid ID`);
      else if (answerIds.has(answer.id)) failures.push(`Duplicate answer ID in ${question.id}: ${answer.id}`);
      else answerIds.add(answer.id);

      const text = wordingIssue(answer.text?.ja, `${answerLabel} wording`, failures);
      if (text) {
        const previous = answerWording.get(text);
        if (previous) failures.push(`Duplicate answer wording in ${question.id}: ${previous} and ${answer.id}`);
        else answerWording.set(text, answer.id);
      }
      const primary = answer.metadata?.primaryTrait;
      const secondary = answer.metadata?.secondaryTrait;
      if (typeof primary !== "string" || !primary || typeof secondary !== "string" || !secondary || primary === secondary) {
        failures.push(`${answerLabel} has inconsistent trait metadata`);
      }
      if (!answer.weights || typeof answer.weights !== "object"
        || typeof answer.weights[primary] !== "number" || typeof answer.weights[secondary] !== "number") {
        failures.push(`${answerLabel} has malformed weights`);
      }
    }
  }

  return {
    status: failures.length === 0 ? "PASS" : "FAIL",
    questions: pack.questions.length,
    answers: answerCount,
    failures,
  };
}

function runCli() {
  if (process.argv.includes("--write")) {
    console.error("--write is disabled: the V2 semantic audit is read-only and never rewrites approved wording.");
    process.exitCode = 2;
    return;
  }
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const bankPath = path.join(root, "src/data/questionBank/nextory11-question-pack-v1.json");
  const result = auditQuestionBank(JSON.parse(fs.readFileSync(bankPath, "utf8")));
  console.log(JSON.stringify(result, null, 2));
  if (result.failures.length > 0) process.exitCode = 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) runCli();
