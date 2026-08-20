import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  challengeAiJuzaMessages,
  challengeStarReadings,
} from "../../src/data/challengeOfficialResultCopy.js";

describe("CHALLENGE final result copy", () => {
  it("registers exactly the approved 10 messages and 4 panels", () => {
    expect(challengeAiJuzaMessages).toHaveLength(10);
    expect(challengeStarReadings).toHaveLength(4);
    expect(challengeStarReadings.map(({ number }) => number)).toEqual(["01", "02", "03", "04"]);
    expect(challengeStarReadings.map(({ title }) => title)).toEqual([
      "あなたの星の本質",
      "あなたの才能",
      "あなたの恋愛・人間関係の傾向",
      "あなたの30日アクションプラン",
    ]);
  });

  it("preserves the approved panel boundaries", () => {
    expect(challengeStarReadings[0].fullText[0]).toBe("あなたは、難しいことに出会っても、「まずやってみよう」と一歩を踏み出せる人です。");
    expect(challengeStarReadings[3].fullText.at(-1)).toBe("その積み重ねが、あなたを昨日までの自分より少し先へ連れていってくれます。");
  });

  it("connects the production and review runtimes to one official source", () => {
    const app = readFileSync(new URL("../../src/App.jsx", import.meta.url), "utf8");
    const review = readFileSync(new URL("../../src/components/ChallengeResultGoldReview.jsx", import.meta.url), "utf8");
    expect(review).toContain("challengeStarReadings.map((section)");
    expect(review).not.toContain("cards={CONTENT.map");
    expect(review).toContain('import PremiumCard from "./PremiumCard"');
    expect(review).toContain('resultType="challenger"');
    expect(review).toContain("isEnabled={isPremiumEnabled}");
    expect(review).not.toContain("isEnabled={false}");
    expect(review).not.toContain("challengePremiumPause");
    expect(app).toContain('if (resultType === "challenger")');
    expect(app).toContain("isPremiumEnabled={devPreview ? true : paidCtaEnabled}");
    expect(app).toContain("onPremiumClick={devPreview ? () => {} : () => handlePremiumCheckout(result, resultType, questionBankContext)}");
    expect(app).not.toContain("<DevResultSceneViewer");
  });
});
