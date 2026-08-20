import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearActiveDiagnosisSession,
  COMPLETED_DIAGNOSIS_TTL_MS,
  createDiagnosisSession,
  DIAGNOSIS_SESSION_POINTER_KEY,
  DIAGNOSIS_SESSION_PREFIX,
  DIAGNOSIS_SESSION_TTL_MS,
  readActiveDiagnosisSession,
  readDiagnosisSession,
  updateDiagnosisSession,
} from "../../src/lib/questionBank/diagnosisSession.js";
import { createOfficialQuestionSession } from "../../src/lib/questionBank/session.js";

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

function answerFor(question) {
  return { questionId: String(question.id), answerId: question.answers[0].id };
}

describe("persisted diagnosis sessions", () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  it("restores the exact question and displayed-answer order with progress", () => {
    const storage = memoryStorage();
    const questionSession = createOfficialQuestionSession({ rng: seeded(10), storage });
    const created = createDiagnosisSession(questionSession, storage);
    const submittedAnswers = questionSession.questions.slice(0, 3).map(answerFor);
    updateDiagnosisSession(created.record.diagnosisSessionId, { currentIndex: 3, submittedAnswers }, storage);

    const restored = readActiveDiagnosisSession(storage);
    expect(restored.record.diagnosisSessionId).toBe(created.record.diagnosisSessionId);
    expect(restored.record.selectedQuestionIds).toEqual(created.record.selectedQuestionIds);
    expect(restored.record.displayedAnswerOrder).toEqual(created.record.displayedAnswerOrder);
    expect(restored.record.submittedAnswers).toEqual(submittedAnswers);
    expect(restored.questions.map((question) => question.answers.map(({ id }) => id)))
      .toEqual(created.record.displayedAnswerOrder);
  });

  it("keeps completed sessions immutable and creates unique explicit new sessions", () => {
    const storage = memoryStorage();
    const firstQuestionSession = createOfficialQuestionSession({ rng: seeded(20), storage });
    const first = createDiagnosisSession(firstQuestionSession, storage);
    const allAnswers = firstQuestionSession.questions.map(answerFor);
    const completed = updateDiagnosisSession(first.record.diagnosisSessionId, {
      currentIndex: 11,
      submittedAnswers: allAnswers,
      completionStatus: "completed",
    }, storage);
    const mutation = updateDiagnosisSession(first.record.diagnosisSessionId, {
      currentIndex: 0,
      submittedAnswers: [],
      completionStatus: "in_progress",
    }, storage);
    expect(mutation.record).toEqual(completed.record);

    const second = createDiagnosisSession(
      createOfficialQuestionSession({ rng: seeded(21), storage }),
      storage,
    );
    expect(second.record.diagnosisSessionId).not.toBe(first.record.diagnosisSessionId);
    expect(readDiagnosisSession(first.record.diagnosisSessionId, storage).record.completionStatus).toBe("completed");
  });

  it("clears only the active diagnosis when a different user starts and preserves purchase access data", () => {
    const storage = memoryStorage();
    const first = createDiagnosisSession(
      createOfficialQuestionSession({ rng: seeded(25), storage }),
      storage,
    );
    const diagnosisKey = `${DIAGNOSIS_SESSION_PREFIX}${first.record.diagnosisSessionId}`;
    storage.setItem("nextory11.checkoutSnapshot.active.v2", "purchased-report-reference");

    clearActiveDiagnosisSession(storage);

    expect(storage.getItem(DIAGNOSIS_SESSION_POINTER_KEY)).toBeNull();
    expect(storage.getItem(diagnosisKey)).toBeNull();
    expect(storage.getItem("nextory11.checkoutSnapshot.active.v2")).toBe("purchased-report-reference");
  });

  it("removes corrupt and expired incomplete records without deleting valid completed records", () => {
    const storage = memoryStorage();
    const questionSession = createOfficialQuestionSession({ rng: seeded(30), storage });
    const corrupt = createDiagnosisSession(questionSession, storage);
    storage.setItem(`${DIAGNOSIS_SESSION_PREFIX}${corrupt.record.diagnosisSessionId}`, "{bad json");
    expect(readActiveDiagnosisSession(storage)).toBeNull();
    expect(storage.getItem(DIAGNOSIS_SESSION_POINTER_KEY)).toBeNull();

    const incomplete = createDiagnosisSession(questionSession, storage);
    expect(readDiagnosisSession(
      incomplete.record.diagnosisSessionId,
      storage,
      Date.now() + DIAGNOSIS_SESSION_TTL_MS + 1,
    )).toBeNull();

    const completed = createDiagnosisSession(questionSession, storage);
    updateDiagnosisSession(completed.record.diagnosisSessionId, {
      currentIndex: 11,
      submittedAnswers: questionSession.questions.map(answerFor),
      completionStatus: "completed",
    }, storage);
    expect(readDiagnosisSession(
      completed.record.diagnosisSessionId,
      storage,
      Date.now() + DIAGNOSIS_SESSION_TTL_MS + 1,
    )).not.toBeNull();
    expect(readDiagnosisSession(
      completed.record.diagnosisSessionId,
      storage,
      Date.now() + COMPLETED_DIAGNOSIS_TTL_MS + 1,
    )).toBeNull();
  });
});
