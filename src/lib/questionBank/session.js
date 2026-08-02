import { QuestionBank } from "./questionBank.js";
import { RotationTracker } from "./rotation.js";
import { selectQuestions } from "./selection.js";
import { officialQuestionPack } from "./officialPack.js";

export const QUESTION_BANK_HISTORY_KEY = "nextory11.questionBankHistory.v1";
export const QUESTION_BANK_SELECTION_COUNT = 11;

function shuffle(items, rng = Math.random) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(rng() * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}

export function readQuestionHistory(storage = window.localStorage) {
  try {
    const value = JSON.parse(storage.getItem(QUESTION_BANK_HISTORY_KEY) ?? "null");
    if (value?.version !== officialQuestionPack.version || !Array.isArray(value.entries)) return [];
    return value.entries.filter((entry) => typeof entry?.questionId === "string").slice(-55);
  } catch {
    return [];
  }
}

export function saveQuestionHistory(questions, storage = window.localStorage) {
  const previous = readQuestionHistory(storage);
  const timestamp = new Date().toISOString();
  const entries = [...previous, ...questions.map((question) => ({
    questionId: String(question.id),
    rotationGroup: question.rotationGroup,
    cooldownGroup: question.cooldownGroup,
    answeredAt: timestamp,
  }))].slice(-55);
  storage.setItem(QUESTION_BANK_HISTORY_KEY, JSON.stringify({ version: officialQuestionPack.version, entries, updatedAt: timestamp }));
}

export function resetQuestionBankHistory(storage = window.localStorage) {
  storage.removeItem(QUESTION_BANK_HISTORY_KEY);
}

export function createOfficialQuestionSession({ count = QUESTION_BANK_SELECTION_COUNT, rng = Math.random, storage } = {}) {
  const bank = new QuestionBank(officialQuestionPack);
  const history = readQuestionHistory(storage);
  const recentQuestionIds = new Set(history.slice(-33).map(({ questionId }) => questionId));
  const questionOnlyTracker = {
    exclusions: () => ({ questionIds: recentQuestionIds, rotationGroups: new Set(), cooldownGroups: new Set() }),
  };
  const attempts = [
    { tracker: new RotationTracker(history), recentQuestionLimit: 33, recentCooldownLimit: 11 },
    { tracker: questionOnlyTracker },
    { tracker: null },
  ];
  let selected;
  for (const attempt of attempts) {
    try {
      selected = selectQuestions({
        bank, count, rng, rotationTracker: attempt.tracker,
        recentQuestionLimit: attempt.recentQuestionLimit,
        recentCooldownLimit: attempt.recentCooldownLimit,
        filters: { language: "ja" },
      });
      break;
    } catch {
      // Deliberately relax freshness before falling back to the complete valid pool.
    }
  }
  if (!selected) throw new Error("Question Bank session could not be created");
  return {
    bank,
    questions: selected.map((question) => ({ ...question, answers: shuffle(question.answers, rng) })),
    questionSetVersion: officialQuestionPack.version,
  };
}

if (import.meta.env?.DEV && typeof window !== "undefined") {
  window.__NEXTORY11_RESET_QUESTION_HISTORY__ = resetQuestionBankHistory;
}
