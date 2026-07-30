import { describe, expect, it } from "vitest";
import { resultScenes } from "../../src/data/resultScenes.js";
import { resultTypes } from "../../src/data/resultTypes.js";
import { OFFICIAL_PERSONALITY_SLUGS, OFFICIAL_TO_LEGACY_TYPE } from "../../src/lib/questionBank/officialPack.js";
import { createPreviewAnswers, cyclePreviewType, parseDevResultPreview } from "../../src/lib/devResultPreview.js";

describe("development-only Result Scene Viewer", () => {
  it("rejects preview parameters outside development mode", () => {
    expect(parseDevResultPreview({ isDev: false, search: "?devPreview=result&previewType=visionary" })).toBeNull();
  });

  it("maps every official type to existing complete result data", () => {
    expect(OFFICIAL_PERSONALITY_SLUGS).toHaveLength(11);
    OFFICIAL_PERSONALITY_SLUGS.forEach((slug) => {
      const legacyType = OFFICIAL_TO_LEGACY_TYPE[slug];
      expect(resultTypes[legacyType]).toBeDefined();
      expect(resultScenes[legacyType]).toBeDefined();
    });
  });

  it("cycles Previous and Next through the complete official list", () => {
    expect(cyclePreviewType(OFFICIAL_PERSONALITY_SLUGS, "challenge", -1)).toBe("visionary");
    expect(cyclePreviewType(OFFICIAL_PERSONALITY_SLUGS, "visionary", 1)).toBe("challenge");
  });

  it("uses deterministic local fixtures with no customer history", () => {
    const first = createPreviewAnswers("leader", Object.keys(resultTypes));
    expect(first).toEqual(createPreviewAnswers("leader", Object.keys(resultTypes)));
    expect(first).toHaveLength(11);
    expect(first.every((answer) => answer.questionId.startsWith("preview-q-"))).toBe(true);
  });
});
