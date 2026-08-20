import { officialQuestionPack } from "./officialPack.js";

export const DIAGNOSIS_SESSION_POINTER_KEY = "nextory11.diagnosisSession.active.v1";
export const DIAGNOSIS_SESSION_PREFIX = "nextory11.diagnosisSession.v1.";
export const DIAGNOSIS_SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1_000;
export const COMPLETED_DIAGNOSIS_TTL_MS = 30 * 24 * 60 * 60 * 1_000;

function storageOrDefault(storage) {
  return storage ?? window.localStorage;
}

function sessionKey(id) {
  return `${DIAGNOSIS_SESSION_PREFIX}${id}`;
}

function createId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `diagnosis-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

function questionIndex() {
  return new Map(officialQuestionPack.questions.map((question) => [String(question.id), question]));
}

function rebuildQuestions(record) {
  const catalog = questionIndex();
  return record.selectedQuestionIds.map((questionId, index) => {
    const source = catalog.get(questionId);
    if (!source) throw new Error("Diagnosis session references an unknown question.");
    const order = record.displayedAnswerOrder[index];
    const answers = order.map((answerId) => source.answers.find((answer) => answer.id === answerId));
    if (answers.some((answer) => !answer)) throw new Error("Diagnosis session references an unknown answer.");
    return { ...source, answers };
  });
}

function isValidRecord(record, now = Date.now()) {
  if (!record || typeof record !== "object") return false;
  if (typeof record.diagnosisSessionId !== "string" || !record.diagnosisSessionId) return false;
  if (record.questionPackVersion !== officialQuestionPack.version) return false;
  if (!Array.isArray(record.selectedQuestionIds) || record.selectedQuestionIds.length !== 11) return false;
  if (new Set(record.selectedQuestionIds).size !== 11) return false;
  if (!Array.isArray(record.displayedAnswerOrder) || record.displayedAnswerOrder.length !== 11) return false;
  if (!record.displayedAnswerOrder.every((ids) => Array.isArray(ids) && ids.length === 4 && new Set(ids).size === 4)) return false;
  if (!Array.isArray(record.submittedAnswers) || record.submittedAnswers.length > 11) return false;
  if (!Number.isInteger(record.currentIndex) || record.currentIndex < 0 || record.currentIndex > 11) return false;
  if (record.currentIndex > record.submittedAnswers.length) return false;
  if (!["in_progress", "completed"].includes(record.completionStatus)) return false;
  if (record.completionStatus === "completed"
    && (record.currentIndex !== 11 || record.submittedAnswers.length !== 11 || !Date.parse(record.completedAt))) return false;
  const startedAt = Date.parse(record.startedAt);
  const updatedAt = Date.parse(record.updatedAt);
  if (!Number.isFinite(startedAt) || !Number.isFinite(updatedAt) || updatedAt < startedAt) return false;
  const ttl = record.completionStatus === "completed" ? COMPLETED_DIAGNOSIS_TTL_MS : DIAGNOSIS_SESSION_TTL_MS;
  if (now - updatedAt > ttl) return false;
  try {
    const questions = rebuildQuestions(record);
    for (let index = 0; index < questions.length; index += 1) {
      const sourceAnswerIds = new Set(questionIndex().get(record.selectedQuestionIds[index]).answers.map(({ id }) => id));
      if (!record.displayedAnswerOrder[index].every((answerId) => sourceAnswerIds.has(answerId))) return false;
    }
    for (let index = 0; index < record.submittedAnswers.length; index += 1) {
      const answer = record.submittedAnswers[index];
      if (!answer || String(answer.questionId) !== record.selectedQuestionIds[index]) return false;
      if (!record.displayedAnswerOrder[index].includes(answer.answerId)) return false;
    }
  } catch {
    return false;
  }
  return true;
}

export function createDiagnosisSession(questionSession, storage) {
  const target = storageOrDefault(storage);
  const now = new Date().toISOString();
  const record = {
    diagnosisSessionId: createId(),
    questionPackVersion: questionSession.questionSetVersion,
    selectedQuestionIds: questionSession.questions.map((question) => String(question.id)),
    displayedAnswerOrder: questionSession.questions.map((question) => question.answers.map((answer) => answer.id)),
    currentIndex: 0,
    submittedAnswers: [],
    startedAt: now,
    updatedAt: now,
    completionStatus: "in_progress",
  };
  target.setItem(sessionKey(record.diagnosisSessionId), JSON.stringify(record));
  target.setItem(DIAGNOSIS_SESSION_POINTER_KEY, record.diagnosisSessionId);
  return { record, questions: questionSession.questions };
}

export function readDiagnosisSession(id, storage, now = Date.now()) {
  const target = storageOrDefault(storage);
  if (!id) return null;
  try {
    const record = JSON.parse(target.getItem(sessionKey(id)) ?? "null");
    if (!isValidRecord(record, now)) {
      target.removeItem(sessionKey(id));
      if (target.getItem(DIAGNOSIS_SESSION_POINTER_KEY) === id) target.removeItem(DIAGNOSIS_SESSION_POINTER_KEY);
      return null;
    }
    return { record, questions: rebuildQuestions(record) };
  } catch {
    target.removeItem(sessionKey(id));
    if (target.getItem(DIAGNOSIS_SESSION_POINTER_KEY) === id) target.removeItem(DIAGNOSIS_SESSION_POINTER_KEY);
    return null;
  }
}

export function readActiveDiagnosisSession(storage, now = Date.now()) {
  const target = storageOrDefault(storage);
  return readDiagnosisSession(target.getItem(DIAGNOSIS_SESSION_POINTER_KEY), target, now);
}

export function updateDiagnosisSession(id, updates, storage) {
  const target = storageOrDefault(storage);
  const restored = readDiagnosisSession(id, target);
  if (!restored) return null;
  if (restored.record.completionStatus === "completed") return restored;
  const completionStatus = updates.completionStatus ?? restored.record.completionStatus;
  const record = {
    ...restored.record,
    ...updates,
    diagnosisSessionId: restored.record.diagnosisSessionId,
    questionPackVersion: restored.record.questionPackVersion,
    selectedQuestionIds: restored.record.selectedQuestionIds,
    displayedAnswerOrder: restored.record.displayedAnswerOrder,
    completionStatus,
    completedAt: completionStatus === "completed"
      ? (restored.record.completedAt ?? new Date().toISOString())
      : null,
    updatedAt: new Date().toISOString(),
  };
  if (!isValidRecord(record)) throw new Error("Refusing to persist an invalid diagnosis session.");
  target.setItem(sessionKey(id), JSON.stringify(record));
  target.setItem(DIAGNOSIS_SESSION_POINTER_KEY, id);
  return { record, questions: restored.questions };
}

export function clearActiveDiagnosisPointer(storage) {
  storageOrDefault(storage).removeItem(DIAGNOSIS_SESSION_POINTER_KEY);
}

export function clearActiveDiagnosisSession(storage) {
  const target = storageOrDefault(storage);
  const activeId = target.getItem(DIAGNOSIS_SESSION_POINTER_KEY);
  if (activeId) target.removeItem(sessionKey(activeId));
  target.removeItem(DIAGNOSIS_SESSION_POINTER_KEY);
}
