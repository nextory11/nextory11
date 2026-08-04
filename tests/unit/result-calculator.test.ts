import { describe, expect, it } from "vitest";
import { calculateDiagnosisResult } from "../../server/reports/result-calculator.js";

describe("server diagnosis calculation", () => {
  it("recalculates the result from recognized answer IDs", () => {
    const answers = Array.from({ length: 11 }, (_, index) => ({
      questionId: (index + 1) as 1,
      answerId: "A" as const,
    }));

    expect(calculateDiagnosisResult(answers)).toMatchObject({
      resultType: "challenger",
      resultNameEn: "Challenge",
    });
  });

  it("uses first encountered type as the frontend tie-break", () => {
    const answers = [
      { questionId: 1 as const, answerId: "A" as const },
      { questionId: 2 as const, answerId: "B" as const },
      { questionId: 3 as const, answerId: "B" as const },
      { questionId: 4 as const, answerId: "A" as const },
      { questionId: 5 as const, answerId: "D" as const },
      { questionId: 6 as const, answerId: "D" as const },
      { questionId: 7 as const, answerId: "D" as const },
      { questionId: 8 as const, answerId: "D" as const },
      { questionId: 9 as const, answerId: "B" as const },
      { questionId: 10 as const, answerId: "D" as const },
      { questionId: 11 as const, answerId: "D" as const },
    ];

    expect(calculateDiagnosisResult(answers).resultType).toBe("action");
  });
});
