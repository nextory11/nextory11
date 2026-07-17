import { describe, expect, it } from "vitest";
import { resultTypes } from "../../src/data/resultTypes";
import {
  createAiJuzaEngine,
  createAiJuzaReading,
  createInMemoryJuzaMemoryStore,
  createJuzaContext,
} from "../../src/lib/aiJuza";

const answers = Array.from({ length: 11 }, (_, index) => ({
  questionId: index + 1,
  answerLabel: String.fromCharCode(65 + (index % 4)),
  text: `answer-${index + 1}`,
  type: index < 5 ? "creator" : index < 8 ? "intuition" : "empathy",
  score: 2,
}));

describe("AI JUZA personalized reading", () => {
  it("derives the score distribution, hidden traits and strength ranking from answers", () => {
    const reading = createAiJuzaReading({ answers, result: resultTypes.creator, resultType: "creator" });

    expect(reading.profile.answerCount).toBe(11);
    expect(reading.profile.scoreDistribution.creator).toBe(10);
    expect(reading.profile.hiddenTraits[0]).toMatchObject({ type: "empathy", score: 6 });
    expect(reading.profile.strengthRanking.map(({ type }) => type).slice(0, 3)).toEqual(["creator", "empathy", "intuition"]);
    expect(reading.message).toContain(resultTypes.creator.strength);
    expect(reading.message).toContain(resultTypes.empathy.title);
  });

  it("varies the celestial mentor wording when the answer journey changes", () => {
    const first = createAiJuzaReading({ answers, result: resultTypes.creator, resultType: "creator" });
    const changedAnswers = answers.map((answer, index) => index === 0 ? { ...answer, answerLabel: "D", text: "different-choice" } : answer);
    const second = createAiJuzaReading({ answers: changedAnswers, result: resultTypes.creator, resultType: "creator" });

    expect(second.message).not.toBe(first.message);
  });

  it("keeps dynamic question and mentoring metadata in a versioned context", () => {
    const context = createJuzaContext({
      answers: answers.slice(0, 4),
      result: resultTypes.creator,
      resultType: "creator",
      questionSetVersion: "adaptive.v2",
      mentoring: { goals: ["creative-confidence"], focus: "career" },
    });

    expect(context.version).toBe("ai-juza.context.v1");
    expect(context.questionSet).toMatchObject({ version: "adaptive.v2", answerCount: 4 });
    expect(context.mentoring).toEqual({ goals: ["creative-confidence"], focus: "career" });
  });

  it("supports async providers and opt-in session memory without changing the UI contract", async () => {
    const memoryStore = createInMemoryJuzaMemoryStore();
    const provider = {
      id: "test-provider",
      version: "1",
      capabilities: { conversation: true },
      async generateReading(context) {
        return { message: `reading:${context.profile.personalityType}`, profile: context.profile };
      },
      async generateReply(context, message) {
        return { message: `${context.memory.length}:${message}` };
      },
    };
    const engine = createAiJuzaEngine({ provider, memoryStore, now: () => "2026-01-01T00:00:00.000Z" });
    const input = { answers, result: resultTypes.creator, resultType: "creator", session: { id: "session-1" } };

    await engine.createReadingAsync(input);
    const reply = await engine.continueConversation({ ...input, message: "次の一歩は？" });

    expect(reply.message).toBe("1:次の一歩は？");
    expect(memoryStore.load("session-1")).toHaveLength(3);
  });
});
