import { normalizeQuestionId } from "./contracts.js";

export class RotationTracker {
  #entries;

  constructor(entries = []) {
    this.#entries = entries.map((entry) => ({ ...entry, questionId: normalizeQuestionId(entry.questionId) }));
  }

  record(question, answeredAt = new Date().toISOString()) {
    this.#entries.push({
      questionId: normalizeQuestionId(question.id),
      rotationGroup: question.rotationGroup,
      cooldownGroup: question.cooldownGroup,
      answeredAt,
    });
  }

  snapshot(limit) {
    const entries = limit == null ? this.#entries : this.#entries.slice(-limit);
    return structuredClone(entries);
  }

  exclusions({ recentQuestionLimit, recentCooldownLimit } = {}) {
    const recentQuestions = recentQuestionLimit == null ? this.#entries : this.#entries.slice(-recentQuestionLimit);
    const recentCooldowns = recentCooldownLimit == null ? this.#entries : this.#entries.slice(-recentCooldownLimit);
    return {
      questionIds: new Set(recentQuestions.map((entry) => entry.questionId)),
      rotationGroups: new Set(recentQuestions.map((entry) => entry.rotationGroup).filter(Boolean)),
      cooldownGroups: new Set(recentCooldowns.map((entry) => entry.cooldownGroup).filter(Boolean)),
    };
  }
}

