import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { challengeAiJuzaMessages } from "../../src/data/challengeOfficialResultCopy";
import ResultCard from "../../src/components/ResultCard";
import { creatorAiJuzaMessages } from "../../src/data/creatorOfficialResultCopy";
import { empathAiJuzaMessages } from "../../src/data/empathOfficialResultCopy";
import { evolverAiJuzaMessages } from "../../src/data/evolverOfficialResultCopy";
import { explorerAiJuzaMessages } from "../../src/data/explorerOfficialResultCopy";
import { guardianAiJuzaMessages } from "../../src/data/guardianOfficialResultCopy";
import { harmonyAiJuzaMessages } from "../../src/data/harmonyOfficialResultCopy";
import { intuitiveAiJuzaMessages } from "../../src/data/intuitiveOfficialResultCopy";
import { luminaryAiJuzaMessages } from "../../src/data/luminaryOfficialResultCopy";
import { pioneerAiJuzaMessages } from "../../src/data/pioneerOfficialResultCopy";
import { visionaryAiJuzaMessages } from "../../src/data/visionaryOfficialResultCopy";
import { selectRandomMessageIndex } from "../../src/lib/aiJuza/randomSelection";
import { createPreviewAnswers } from "../../src/lib/devResultPreview";
import { resultScenes } from "../../src/data/resultScenes";
import { resultTypes } from "../../src/data/resultTypes";

const candidatesByType = {
  challenge: challengeAiJuzaMessages,
  explorer: explorerAiJuzaMessages,
  harmony: harmonyAiJuzaMessages,
  visionary: visionaryAiJuzaMessages,
  guardian: guardianAiJuzaMessages,
  luminary: luminaryAiJuzaMessages,
  creator: creatorAiJuzaMessages,
  pioneer: pioneerAiJuzaMessages,
  evolver: evolverAiJuzaMessages,
  empath: empathAiJuzaMessages,
  intuitive: intuitiveAiJuzaMessages,
};

const textOf = (candidate) => (
  typeof candidate === "string" ? candidate : candidate.paragraphs.join("\n\n")
);

const legacyTypeByOfficialType = {
  challenge: "challenger",
  explorer: "explorer",
  harmony: "thinker",
  visionary: "leader",
  guardian: "persistence",
  luminary: "expression",
  creator: "creator",
  pioneer: "action",
  evolver: "adaptability",
  empath: "empathy",
  intuitive: "intuition",
};

describe("NEXTORY11 AI JUZA random final audit", () => {
  it("registers exactly ten unique final candidates per type and 110 overall", () => {
    const all = [];
    Object.values(candidatesByType).forEach((candidates) => {
      expect(candidates).toHaveLength(10);
      const texts = candidates.map(textOf);
      expect(new Set(texts).size).toBe(10);
      all.push(...texts);
    });
    expect(all).toHaveLength(110);
    expect(new Set(all).size).toBe(110);
  });

  it.each(Object.entries(candidatesByType))(
    "%s selects one in-set candidate on every trial and is not index-fixed",
    (_type, candidates) => {
      const randomValues = [0.01, 0.16, 0.27, 0.38, 0.49, 0.51, 0.64, 0.75, 0.86, 0.99];
      const selected = randomValues.map((value) => {
        const index = selectRandomMessageIndex(candidates, () => value);
        expect(index).toBeGreaterThanOrEqual(0);
        expect(index).toBeLessThan(candidates.length);
        const message = candidates[index];
        expect(candidates).toContain(message);
        return message;
      });
      expect(new Set(selected.map(textOf)).size).toBeGreaterThan(1);
    },
  );

  it("maps all types through the shared random selector without signature fallback", () => {
    const source = readFileSync(new URL("../../src/components/ResultCard.jsx", import.meta.url), "utf8");
    expect(source.match(/selectRandomMessageIndex\([^)]*AiJuzaMessages\)/g)).toHaveLength(11);
    expect(source).not.toMatch(/answerSignature\s*%\s*\w*AiJuzaMessages\.length/);
    expect(source).toContain('resultType === "challenger"');
    expect(source).toContain("message: challengeAiJuzaMessages[challengeMessageIndex]");
  });

  it("renders one active message node and resets approved desktop scroll targets", () => {
    const source = readFileSync(new URL("../../src/components/ResultCard.jsx", import.meta.url), "utf8");
    expect(source.match(/<p ref=\{juzaMessageTextRef\}/g)).toHaveLength(1);
    for (const type of ["persistence", "creator", "action", "adaptability", "empathy", "intuition", "explorer"]) {
      expect(source).toContain(`"${type}"`);
    }
    expect(source).toContain("juzaMessageTextRef.current?.scrollTo({ top: 0, behavior: \"auto\" })");
    expect(source).toContain("[reading.message, resultType]");
  });

  it.each(Object.entries(legacyTypeByOfficialType))(
    "%s renders exactly one AI JUZA message in the shared responsive ResultCard",
    (_officialType, resultType) => {
      const allTypes = Object.keys(resultTypes);
      const markup = renderToStaticMarkup(createElement(ResultCard, {
        answers: createPreviewAnswers(resultType, allTypes),
        result: resultTypes[resultType],
        resultType,
        scene: resultScenes[resultType],
      }));
      expect(markup.match(/aria-label="AI JUZAからのメッセージ:/g)).toHaveLength(1);
      expect(markup.match(/juzaMessage juzaMessage--personalized/g)).toHaveLength(1);
    },
  );
});
