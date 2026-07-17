import { describe, expect, it } from "vitest";
import { QuestionBank } from "../../src/lib/questionBank/questionBank.js";
import { scoreQuestionnaire } from "../../src/lib/questionBank/scoring.js";
import {
  OFFICIAL_PERSONALITY_SLUGS,
  OFFICIAL_TO_LEGACY_TYPE,
  officialQuestionPack,
  validateOfficialQuestionPack,
} from "../../src/lib/questionBank/officialPack.js";
import {
  createOfficialQuestionSession,
  QUESTION_BANK_HISTORY_KEY,
  resetQuestionBankHistory,
  saveQuestionHistory,
} from "../../src/lib/questionBank/session.js";
import { parseReportRequest } from "../../server/validation/report-request.js";
import { calculateDiagnosisResult } from "../../server/reports/result-calculator.js";

function memoryStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
  };
}

function seeded(seed) {
  let value = seed >>> 0;
  return () => ((value = (value * 1664525 + 1013904223) >>> 0) / 4294967296);
}

describe("official Question Pack v1", () => {
  it("contains 220 validated questions and 20 targets for every official slug", () => {
    expect(validateOfficialQuestionPack(officialQuestionPack)).toBe(true);
    expect(officialQuestionPack.questions).toHaveLength(220);
    for (const slug of OFFICIAL_PERSONALITY_SLUGS) {
      expect(officialQuestionPack.questions.filter((question) => question.metadata.targetTrait === slug)).toHaveLength(20);
    }
    expect(new Set(officialQuestionPack.questions.map(({ id }) => id)).size).toBe(220);
    expect(officialQuestionPack.questions.every((question) => question.answers.length === 4)).toBe(true);
  });

  it("selects deterministic unique sessions while preserving stable answer identities", () => {
    const first = createOfficialQuestionSession({ rng: seeded(42), storage: memoryStorage() });
    const again = createOfficialQuestionSession({ rng: seeded(42), storage: memoryStorage() });
    expect(first.questions.map(({ id }) => id)).toEqual(again.questions.map(({ id }) => id));
    expect(new Set(first.questions.map(({ id }) => id)).size).toBe(11);
    expect(new Set(first.questions.map((question) => question.metadata.targetTrait))).toEqual(new Set(OFFICIAL_PERSONALITY_SLUGS));
    expect(new Set(first.questions.map((question) => question.category)).size).toBe(11);
    expect(first.questions.every((question) => new Set(question.answers.map(({ id }) => id)).size === 4)).toBe(true);
  });

  it("avoids recent questions and safely resets malformed or explicit history", () => {
    const storage = memoryStorage();
    const first = createOfficialQuestionSession({ rng: seeded(7), storage });
    saveQuestionHistory(first.questions, storage);
    const second = createOfficialQuestionSession({ rng: seeded(7), storage });
    expect(second.questions.some((question) => first.questions.some((prior) => prior.id === question.id))).toBe(false);
    storage.setItem(QUESTION_BANK_HISTORY_KEY, "not-json");
    expect(() => createOfficialQuestionSession({ rng: seeded(8), storage })).not.toThrow();
    resetQuestionBankHistory(storage);
    expect(storage.getItem(QUESTION_BANK_HISTORY_KEY)).toBeNull();
  });

  it("keeps scoring unchanged when answer display order changes", () => {
    const bank = new QuestionBank(officialQuestionPack);
    const questions = bank.query().slice(0, 11);
    const responses = questions.map((question) => ({ question, answerId: question.answers[0].id }));
    const reversed = questions.map((question) => ({ question: { ...question, answers: [...question.answers].reverse() }, answerId: question.answers[0].id }));
    expect(scoreQuestionnaire(responses, { normalizeOpportunities: true })).toEqual(
      scoreQuestionnaire(reversed, { normalizeOpportunities: true }),
    );
  });

  it("accepts official stable IDs server-side and calculates a supported Result Scene", () => {
    const questions = officialQuestionPack.questions.slice(0, 11);
    const payload = { answers: questions.map((question) => ({ questionId: question.id, answerId: question.answers[0].id })) };
    const parsed = parseReportRequest(payload);
    expect(parsed.answers).toHaveLength(11);
    expect(calculateDiagnosisResult(parsed.answers).resultType).toMatch(/^(action|creator|intuition|thinker|empathy|expression|explorer|challenger|leader|persistence|adaptability)$/u);
  });

  it("uses the same opportunity-normalized result on the client and server", () => {
    const session = createOfficialQuestionSession({ rng: seeded(99), storage: memoryStorage() });
    const responses = session.questions.map((question, index) => ({
      question,
      answerId: question.answers[index % question.answers.length].id,
    }));
    const client = scoreQuestionnaire(responses, { normalizeOpportunities: true });
    const server = calculateDiagnosisResult(responses.map(({ question, answerId }) => ({ questionId: question.id, answerId })));
    expect(server.resultType).toBe(OFFICIAL_TO_LEGACY_TYPE[client.primaryPersonality.personality]);
  });
});
