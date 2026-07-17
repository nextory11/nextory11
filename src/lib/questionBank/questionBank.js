import { normalizeQuestionId, parseQuestionBank } from "./contracts.js";

function newestRevision(left, right) {
  return right.revision - left.revision;
}

export class QuestionBank {
  #manifest;
  #byId;

  constructor(manifest) {
    this.#manifest = structuredClone(parseQuestionBank(manifest));
    this.#byId = new Map();

    for (const question of this.#manifest.questions) {
      const id = normalizeQuestionId(question.id);
      const revisions = this.#byId.get(id) ?? [];
      if (revisions.some((item) => item.revision === question.revision && item.language === question.language)) {
        throw new Error(`Duplicate question revision: ${id}@${question.revision}:${question.language}`);
      }
      revisions.push(question);
      revisions.sort(newestRevision);
      this.#byId.set(id, revisions);
    }
  }

  get descriptor() {
    const { questions: _questions, ...descriptor } = this.#manifest;
    return structuredClone(descriptor);
  }

  get size() {
    return this.#manifest.questions.length;
  }

  getQuestion(id, { language, revision } = {}) {
    const revisions = this.#byId.get(normalizeQuestionId(id)) ?? [];
    const match = revisions.find((question) =>
      (language == null || question.language === language) &&
      (revision == null || question.revision === revision));
    return match ? structuredClone(match) : null;
  }

  query(filters = {}) {
    const {
      category,
      difficulty,
      enabled = true,
      language,
      revision,
      tags,
      rotationGroup,
      cooldownGroup,
      predicate,
      latestOnly = true,
    } = filters;
    const source = latestOnly
      ? [...this.#byId.values()].flatMap((revisions) => {
        const languages = new Set();
        return revisions.filter((question) => {
          if (languages.has(question.language)) return false;
          languages.add(question.language);
          return true;
        });
      })
      : this.#manifest.questions;

    return source
      .filter((question) => {
        return (enabled == null || question.enabled === enabled) &&
          (category == null || question.category === category) &&
          (difficulty == null || question.difficulty === difficulty) &&
          (language == null || question.language === language) &&
          (revision == null || question.revision === revision) &&
          (rotationGroup == null || question.rotationGroup === rotationGroup) &&
          (cooldownGroup == null || question.cooldownGroup === cooldownGroup) &&
          (tags == null || tags.every((tag) => question.tags.includes(tag))) &&
          (predicate == null || predicate(question));
      })
      .map((question) => structuredClone(question));
  }

  randomize(filters = {}, rng = Math.random) {
    const questions = this.query(filters);
    for (let index = questions.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(rng() * (index + 1));
      [questions[index], questions[swapIndex]] = [questions[swapIndex], questions[index]];
    }
    return questions;
  }
}
