import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  luminaryAiJuzaMessages,
  luminaryOfficialCopyApproval,
  luminaryStarReadings,
} from "../../src/data/luminaryOfficialResultCopy.js";

describe("LUMINARY final result copy", () => {
  it("registers only the locked 10 AI JUZA messages and 4 STAR READING panels", () => {
    expect(luminaryOfficialCopyApproval).toMatchObject({
      status: "LOCKED",
      aiJuzaMessages: "01-10",
      starReadings: "01-04",
      totalOfficialCopy: 14,
    });
    expect(luminaryAiJuzaMessages).toHaveLength(10);
    expect(luminaryStarReadings).toHaveLength(4);
    expect(luminaryAiJuzaMessages.map(({ number }) => number)).toEqual([
      "01", "02", "03", "04", "05", "06", "07", "08", "09", "10",
    ]);
    expect(luminaryStarReadings.map(({ number }) => number)).toEqual(["01", "02", "03", "04"]);
  });

  it("preserves approved boundary text without legacy summaries", () => {
    expect(luminaryAiJuzaMessages[0].paragraphs[0]).toBe("あなたは、人が自分では気づいていない良さを\n見つけることが出来ます。");
    expect(luminaryAiJuzaMessages[9].paragraphs.at(-1)).toBe("それだけでも、世界は少し明るくなります。");
    expect(luminaryStarReadings[0].fullText[0]).toBe("あなたは、人の中にある可能性や希望を見つけ、\nその人自身がもう一度前を向けるように\n光を渡せる人です。");
    expect(luminaryStarReadings[3].fullText.at(-1)).toBe("この30日間、人の光を見つけるたびに、\n自分の中にある光も一つずつ見つけてください。");

    const activeCopy = JSON.stringify({ luminaryAiJuzaMessages, luminaryStarReadings });
    [
      "あなたは言葉や行動で、自分の想いを人に届けられる人です。",
      "あなたの表現は、人の心を動かすきっかけになります。",
      "今の気持ちを短い言葉で表してみましょう。",
      "あなたの声は、まだ見ぬ誰かの夜を照らす周波数です。",
    ].forEach((legacyText) => expect(activeCopy).not.toContain(legacyText));
  });

  it("connects desktop and mobile to one source with one random AI message", () => {
    const resultCard = readFileSync(new URL("../../src/components/ResultCard.jsx", import.meta.url), "utf8");
    expect(resultCard).toContain("luminaryAiJuzaMessages[luminaryMessageIndex]");
    expect(resultCard).toContain("selectRandomMessageIndex(luminaryAiJuzaMessages)");
    expect(resultCard).toContain("luminaryStarReadings.map((card)");
    expect(resultCard).not.toContain('title: "あなたの星の本質", previewText: result.essence');
    expect(resultCard).not.toContain('title: "あなたの才能", previewText: result.strength');
  });
});
