import { describe, expect, it } from "vitest";
import {
  createQuestionBankContext,
  QuestionBank,
  QuestionBankMigrationRegistry,
  RotationTracker,
  scoreQuestionnaire,
  selectQuestions,
} from "../../src/lib/questionBank/index.js";

function option(id, primary, secondary = {}, expansionScores = {}) {
  return {
    id,
    text: `fixture.answer.${id}`,
    personalityWeights: primary,
    secondaryWeights: secondary,
    expansionScores,
    metadata: {},
    extensions: {},
  };
}

function question(id, trait, overrides = {}) {
  return {
    id,
    revision: 1,
    category: "fixture",
    difficulty: 1,
    text: `fixture.question.${id}`,
    answers: [
      option("a", { [trait]: 2 }, { [`${trait}-secondary`]: 1 }, { confidence: 1 }),
      option("b", { [trait]: 1 }),
      option("c", { alternate: 1 }),
      option("d", {}, { latent: 1 }),
    ],
    tags: ["fixture"],
    rotationGroup: `rotation-${id}`,
    cooldownGroup: `cooldown-${id}`,
    enabled: true,
    language: "en",
    metadata: {},
    extensions: {},
    ...overrides,
  };
}

function manifest(questions, overrides = {}) {
  return {
    bankId: "fixture-bank",
    version: "1.0.0",
    contextVersion: "question-context/v1",
    language: null,
    metadata: {},
    questions,
    ...overrides,
  };
}

describe("Question Bank framework", () => {
  it("validates JSON-compatible banks and requires exactly four answer options", () => {
    expect(() => new QuestionBank(manifest([question("q1", "alpha")]))).not.toThrow();
    const invalid = question("q2", "beta");
    invalid.answers.pop();
    expect(() => new QuestionBank(manifest([invalid]))).toThrow();
  });

  it("retrieves the latest language-specific revision without leaking mutable state", () => {
    const first = question("q1", "alpha");
    const second = question("q1", "alpha", { revision: 2, text: "fixture.question.q1.r2" });
    const bank = new QuestionBank(manifest([first, second]));
    const retrieved = bank.getQuestion("q1", { language: "en" });
    expect(retrieved.revision).toBe(2);
    retrieved.text = "mutated";
    expect(bank.getQuestion("q1").text).toBe("fixture.question.q1.r2");
  });

  it("filters by metadata fields and tags", () => {
    const bank = new QuestionBank(manifest([
      question("q1", "alpha", { category: "one", tags: ["seasonal"] }),
      question("q2", "beta", { category: "two", enabled: false }),
    ]));
    expect(bank.query({ category: "one", tags: ["seasonal"] }).map(({ id }) => id)).toEqual(["q1"]);
    expect(bank.query({ enabled: false }).map(({ id }) => id)).toEqual(["q2"]);
  });

  it("selects a configurable balanced set without duplicate ids or rotation groups", () => {
    const bank = new QuestionBank(manifest([
      question("q1", "alpha", { rotationGroup: "shared" }),
      question("q2", "alpha", { rotationGroup: "shared" }),
      question("q3", "beta"),
      question("q4", "gamma"),
    ]));
    const selected = selectQuestions({ bank, count: 3, rng: () => 0.5 });
    expect(new Set(selected.map(({ id }) => id)).size).toBe(3);
    expect(new Set(selected.map(({ rotationGroup }) => rotationGroup)).size).toBe(3);
    const coveredTraits = new Set(selected.flatMap((item) => item.answers.flatMap((answer) => Object.keys(answer.personalityWeights))));
    expect([...new Set(["alpha", "beta", "gamma"])].every((trait) => coveredTraits.has(trait))).toBe(true);
  });

  it("respects question, rotation and cooldown history", () => {
    const q1 = question("q1", "alpha");
    const q2 = question("q2", "beta", { cooldownGroup: q1.cooldownGroup });
    const q3 = question("q3", "gamma");
    const bank = new QuestionBank(manifest([q1, q2, q3]));
    const tracker = new RotationTracker();
    tracker.record(q1);
    expect(selectQuestions({ bank, count: 1, rotationTracker: tracker })[0].id).toBe("q3");
  });

  it("scores primary, secondary, third, hidden and expansion traits only from answer data", () => {
    const q1 = question("q1", "alpha");
    const q2 = question("q2", "beta");
    const scored = scoreQuestionnaire([
      { question: q1, answerId: "a" },
      { question: q2, answerId: "a" },
      { question: q1, answerId: "b" },
    ]);
    expect(scored.primaryPersonality).toMatchObject({ personality: "alpha", score: 3 });
    expect(scored.secondaryPersonality).toMatchObject({ personality: "beta", score: 2 });
    expect(scored.thirdPersonality).toMatchObject({ personality: "alpha-secondary", score: 1 });
    expect(scored.expansionScores.confidence).toBe(2);
    expect(scored.hiddenTraits.map(({ personality }) => personality)).toContain("alpha-secondary");
  });

  it("migrates through registered versions without mutating the source", () => {
    const source = manifest([], { version: "1" });
    const registry = new QuestionBankMigrationRegistry()
      .register("1", "2", (bank) => ({ ...bank, metadata: { migrated: 1 } }))
      .register("2", "3", (bank) => ({ ...bank, metadata: { ...bank.metadata, migratedAgain: true } }));
    const migrated = registry.migrate(source, "3");
    expect(migrated).toMatchObject({ version: "3", metadata: { migrated: 1, migratedAgain: true } });
    expect(source.version).toBe("1");
  });

  it("creates a versioned, JSON-compatible AI JUZA context", () => {
    const q1 = question("q1", "alpha");
    const bank = new QuestionBank(manifest([q1]));
    const responses = [{ question: q1, answerId: "a" }];
    const context = createQuestionBankContext({ bank, responses, scoringResult: scoreQuestionnaire(responses) });
    expect(context).toMatchObject({
      contextVersion: "question-context/v1",
      primaryPersonality: { personality: "alpha" },
      selectedQuestions: [{ id: "q1", revision: 1 }],
      selectedAnswers: [{ questionId: "q1", answerId: "a" }],
    });
    expect(() => JSON.stringify(context)).not.toThrow();
  });

  it("handles 2,200 records without architectural changes", () => {
    const questions = Array.from({ length: 2200 }, (_, index) => question(`q${index}`, `trait-${index % 11}`));
    const bank = new QuestionBank(manifest(questions));
    expect(bank.size).toBe(2200);
    expect(selectQuestions({ bank, count: 100, rng: () => 0.42 })).toHaveLength(100);
  });
});
