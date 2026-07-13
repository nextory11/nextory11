import { describe, expect, it } from "vitest";
import { parseReportRequest } from "../../server/validation/report-request.js";

const validAnswers = Array.from({ length: 11 }, (_, index) => ({
  questionId: index + 1,
  answerId: "A",
}));

describe("report request validation", () => {
  it("accepts exactly 11 recognized answers", () => {
    const parsed = parseReportRequest({ answers: validAnswers, resultType: "client-claim" });
    expect(parsed.answers).toHaveLength(11);
    expect(parsed.answers[0]).toMatchObject({ questionId: 1, answerId: "A" });
    expect(parsed.answers[0]).not.toHaveProperty("resultType");
  });

  it("rejects fewer or more than 11 answers", () => {
    expect(() => parseReportRequest({ answers: validAnswers.slice(0, 10) })).toThrow();
    expect(() => parseReportRequest({ answers: [...validAnswers, validAnswers[0]] })).toThrow();
  });

  it("rejects invalid question IDs", () => {
    const invalid = validAnswers.map((answer) => ({ ...answer }));
    invalid[10].questionId = 12;
    expect(() => parseReportRequest({ answers: invalid })).toThrow();
  });

  it("rejects invalid answer IDs", () => {
    const invalid = validAnswers.map((answer) => ({ ...answer }));
    invalid[0].answerId = "E";
    expect(() => parseReportRequest({ answers: invalid })).toThrow();
  });

  it("rejects duplicate questions even when the array has 11 entries", () => {
    const invalid = validAnswers.map((answer) => ({ ...answer }));
    invalid[10].questionId = 10;
    expect(() => parseReportRequest({ answers: invalid })).toThrow();
  });
});
