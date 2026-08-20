import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  guardianAiJuzaMessages,
  guardianOfficialCopyApproval,
  guardianStarReadings,
  guardianTypeDescriptor,
} from "../../src/data/guardianOfficialResultCopy.js";

describe("GUARDIAN final result copy", () => {
  it("registers exactly the locked 10 messages and 4 panels", () => {
    expect(guardianOfficialCopyApproval).toMatchObject({ status: "LOCKED", totalOfficialCopy: 14 });
    expect(guardianAiJuzaMessages).toHaveLength(10);
    expect(guardianStarReadings).toHaveLength(4);
    expect(guardianAiJuzaMessages.map(({ number }) => number)).toEqual(["01", "02", "03", "04", "05", "06", "07", "08", "09", "10"]);
    expect(guardianStarReadings.map(({ number }) => number)).toEqual(["01", "02", "03", "04"]);
    expect(guardianTypeDescriptor).toBe("大切な人やものを守り、安心できる未来をつくる人");
  });

  it("preserves approved boundary copy without mixed-type text", () => {
    expect(guardianAiJuzaMessages[0].paragraphs[0]).toBe("あなたは、誰かが困っているとき、\n見て見ぬふりをするより、\n自分にできることを考える人です。");
    expect(guardianAiJuzaMessages[9].paragraphs.at(-1)).toBe("それがGUARDIANの大きな役割です。");
    expect(guardianStarReadings[0].fullText[0]).toBe("あなたは、大切な人やものを守り、\n周りに安心できる環境をつくれる人です。");
    expect(guardianStarReadings[3].fullText.at(-1)).toBe("この30日間、\nあなた自身も含めて、\n大切なものが安心できる場所を少しずつつくってみてください。");
    const activeCopy = JSON.stringify({ guardianAiJuzaMessages, guardianStarReadings });
    ["LUMINARY", "PIONEER", "INTUITIVE", "EMPATH", "EVOLVER"].forEach((type) => expect(activeCopy).not.toContain(type));
  });

  it("connects desktop and mobile to the same source and removes legacy card construction", () => {
    const resultCard = readFileSync(new URL("../../src/components/ResultCard.jsx", import.meta.url), "utf8");
    expect(resultCard).toContain("guardianAiJuzaMessages[guardianMessageIndex]");
    expect(resultCard).toContain("selectRandomMessageIndex(guardianAiJuzaMessages)");
    expect(resultCard).toContain("guardianStarReadings.map((card)");
    expect(resultCard).toContain('resultType === "persistence"');
    expect(resultCard).toContain("isGuardian ? guardianTypeDescriptor");
    expect(resultCard).not.toContain('title: "あなたの星の本質",\n      previewText: result.essence');
    expect(resultCard).not.toContain("fullText: [result.strength, scene.message]");
    expect(resultCard).not.toContain("fullText: [scene.message, result.essence]");
  });
});
