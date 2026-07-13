import { describe, expect, it } from "vitest";
import { reportOutputV1Schema } from "../../server/reports/contracts/report-output.v1.js";

const section = {
  title: "セクション",
  summary: "要約",
  body: ["本文"],
  keyPoints: ["ポイント"],
  reflectionQuestion: "振り返りの問い",
};

const validReport = {
  reportId: "ddecfd8e-021b-4c55-bf3a-57f10cf7bd22",
  requestId: "3be2cf8e-696a-4ddd-b52e-cd2de381c173",
  schemaVersion: "1",
  reportVersion: "v1",
  language: "ja",
  result: { type: "challenger", nameJa: "挑戦力タイプ", nameEn: "Challenger" },
  openingMessage: "オープニングメッセージ",
  coreNature: section,
  strengthsAndTalents: section,
  workAndSuitableDirection: section,
  relationshipsAndLove: section,
  futurePossibilities: section,
  actionPlan30Days: Array.from({ length: 4 }, (_, index) => ({
    dayRange: `${index * 7 + 1}日目`,
    title: "行動",
    action: "小さな一歩",
    reflection: "振り返る",
  })),
  cautionPoints: ["断定的な主張を避ける"],
  aiJuzaClosingMessage: "クロージングメッセージ",
  emailSummary: "メール要約",
  metadata: {
    generatedAt: "2026-07-12T00:00:00.000Z",
    provider: "placeholder",
    model: "placeholder",
    promptVersion: "placeholder-v1",
    templateVersion: "placeholder-v1",
  },
};

describe("report output v1", () => {
  it("accepts a complete Japanese structured report", () => {
    expect(reportOutputV1Schema.parse(validReport).language).toBe("ja");
  });

  it("rejects missing required sections and unsupported language", () => {
    const invalid = { ...validReport, language: "en", coreNature: undefined };
    expect(() => reportOutputV1Schema.parse(invalid)).toThrow();
  });
});
