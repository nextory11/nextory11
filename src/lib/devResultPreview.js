export const DEV_RESULT_PREVIEW_DEFAULT = "visionary";
export const DEV_RESULT_PREVIEW_SECTIONS = Object.freeze(["full", "header", "juza", "insights", "premium", "scroll"]);

export function parseDevResultPreview({ isDev, search }) {
  if (!isDev) return null;
  const params = new URLSearchParams(search);
  if (params.get("devPreview") !== "result") return null;
  return {
    previewType: params.get("previewType") ?? DEV_RESULT_PREVIEW_DEFAULT,
    section: DEV_RESULT_PREVIEW_SECTIONS.includes(params.get("section")) ? params.get("section") : "full",
    controls: params.get("controls") === "hidden" ? "hidden" : "visible",
  };
}

export function cyclePreviewType(slugs, slug, offset) {
  const index = Math.max(slugs.indexOf(slug), 0);
  return slugs[(index + offset + slugs.length) % slugs.length];
}

export function createPreviewAnswers(resultType, allResultTypes) {
  const companionTypes = allResultTypes.filter((type) => type !== resultType);
  return Array.from({ length: 11 }, (_, index) => ({
    questionId: `preview-q-${String(index + 1).padStart(2, "0")}`,
    answerLabel: `preview-a-${index + 1}`,
    text: `preview-${resultType}-${index + 1}`,
    type: index < 5 ? resultType : companionTypes[index % companionTypes.length],
    score: index < 5 ? 3 : index < 8 ? 2 : 1,
  }));
}
