import { describe, expect, it } from "vitest";
import { reportOutputV1Schema } from "../../server/reports/contracts/report-output.v1.js";
import { validateReport } from "../../server/ai/validate-report.js";

const section = (name: string) => ({
  title: name, summary: `${name}について、回答に表れた傾向を複数の角度から丁寧に読み解きます。`,
  body: [`${name}の第一の視点として、行動を始める前の考え方と周囲への関わり方に一貫した特徴が見えています。`, `${name}の第二の視点では、状況に応じて強みの使い方を丁寧に選び直せる可能性があります。`],
  keyPoints: [`${name}を小さな行動として試す`, `${name}が働いた場面を振り返る`], reflectionQuestion: `${name}が自然に表れた最近の場面は何でしょうか。`,
});

export const validPremiumReport = {
  reportId: "ddecfd8e-021b-4c55-bf3a-57f10cf7bd22", requestId: "3be2cf8e-696a-4ddd-b52e-cd2de381c173",
  schemaVersion: "1" as const, reportVersion: "premium-report.v1" as const, language: "ja" as const,
  result: { type: "challenger", nameJa: "挑戦力タイプ", nameEn: "Challenger" },
  executiveSummary: section("星の輪郭"), corePersonality: section("核となる個性"), hiddenStrengths: section("隠れた強み"),
  traitInteraction: section("特性の相互作用"), decisionMakingStyle: section("意思決定"), relationships: section("人とのつながり"),
  careerAndTalent: section("仕事と才能"), currentGrowthStage: section("成長ステージ"), blindSpots: section("盲点"),
  growthPlan30Days: { title: "30日間の成長プラン", summary: "無理のない実験を重ね、自分に合う方法を見つけるための四週間です。", weeks: Array.from({ length: 4 }, (_, index) => ({ dayRange: `${index * 7 + 1}〜${index * 7 + 7}日`, title: `第${index + 1}週`, actions: ["一日の終わりに小さな気づきを一つ記録する", "週に一度、試した行動の手応えを言葉にする"], reflection: "続けやすかった行動と、その理由を振り返ってみましょう。" })) },
  personalRecommendations: section("個別提案"),
  aiJuzaClosingMessage: "この星図はあなたを決める答えではありません。今日見つけた光を手がかりに、自分に合う一歩を選んでいってください。",
  emailSummary: "回答から見えた強みと特性の組み合わせを、日常で活かすための視点と30日間の行動としてまとめました。",
  metadata: { generatedAt: "2026-07-12T00:00:00.000Z", provider: "synthetic", model: "synthetic", promptVersion: "ai-juza-premium.v1" as const, templateVersion: "personal-star-report.v1" as const, profileSignature: "a".repeat(64) },
};

describe("Premium Report output v1", () => {
  it("accepts all twelve Japanese sections", () => expect(reportOutputV1Schema.parse(validPremiumReport).language).toBe("ja"));
  it("allows the delivery summary to reuse the executive summary", () => {
    const report = structuredClone(validPremiumReport);
    const sharedSummary = "回答に表れた個性の組み合わせを丁寧に読み解き、これからの選択へ活かすための視点としてまとめています。";
    report.executiveSummary.summary = sharedSummary;
    report.emailSummary = sharedSummary;
    expect(validateReport(report)).toEqual(report);
  });
  it("rejects a missing section", () => expect(() => reportOutputV1Schema.parse({ ...validPremiumReport, hiddenStrengths: undefined })).toThrow());
});
