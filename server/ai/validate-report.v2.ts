import { reportGeneratedContentSchema, type ReportGeneratedContent } from "../reports/contracts/report-output.v1.js";

export interface PremiumV2ValidationResult {
  report: ReportGeneratedContent;
  warnings: string[];
  metrics: { longestSentence: number; repeatedParagraphs: number; contradictionFlags: number; repeatedThemes: string[]; actionChainComplete: boolean };
}

export const PREMIUM_V2_INVALID_30_DAY_ACTION = "premium_v2_invalid_30_day_action";
export const PREMIUM_V2_MISSING_JUZA_CLOSING = "premium_v2_missing_juza_closing";

const unnatural = /(宇宙的な調和|新しい次元へ|必ず成功|絶対に|運命です|〜であると言えるでしょう)/u;
const contradictionPairs = [
  [/慎重に.{0,30}(考|検討)/u, /(考える前|すぐに|即座に).{0,20}(行動|動く)/u],
  [/(一人|単独).{0,20}(好む|得意)/u, /(常に|いつも).{0,20}(協力|人と一緒)/u],
] as const;
const semanticThemes = ["未来", "方向", "構想", "具体化", "共通", "共有"] as const;

function prose(report: ReportGeneratedContent) {
  const sections = [report.executiveSummary, report.corePersonality, report.hiddenStrengths, report.traitInteraction,
    report.decisionMakingStyle, report.relationships, report.careerAndTalent, report.currentGrowthStage,
    report.blindSpots, report.personalRecommendations];
  return [...sections.flatMap((section) => [section.summary, ...section.body, ...section.keyPoints, section.reflectionQuestion]),
    report.growthPlan30Days.summary, ...report.growthPlan30Days.actions.flatMap((action) => [action.action, action.purpose]),
    report.aiJuzaClosingMessage];
}

export function validatePremiumV2Report(output: unknown): PremiumV2ValidationResult {
  const report = reportGeneratedContentSchema.parse(output);
  const values = prose(report);
  const normalized = values.filter((value) => value.length >= 30).map((value) => value.normalize("NFKC").replace(/\s+/gu, "").toLowerCase());
  const repeatedParagraphs = normalized.length - new Set(normalized).size;
  const sentences = values.flatMap((value) => value.split(/[。！？]/u)).filter(Boolean);
  const longestSentence = Math.max(0, ...sentences.map((sentence) => [...sentence].length));
  const joined = values.join("\n");
  const contradictionFlags = contradictionPairs.filter(([left, right]) => left.test(joined) && right.test(joined)).length;
  const repeatedThemes = semanticThemes.filter((theme) => values.filter((value) => value.includes(theme)).length >= 5);
  const ranges = report.growthPlan30Days.actions.map((action) => {
    const numbers = [...action.timing.matchAll(/\d+/gu)].map((match) => Number(match[0]));
    return numbers.length >= 2 ? { start: numbers[0], end: numbers[1] } : null;
  });
  const actionChainComplete = ranges.every(Boolean) && ranges[0]?.start === 1 && ranges.at(-1)?.end === 30
    && ranges.every((range, index) => range !== null && range.start <= range.end && (index === 0 || range.start === (ranges[index - 1]?.end ?? -1) + 1));
  const warnings: string[] = [];
  if (values.some((value) => unnatural.test(value))) warnings.push("unnatural_or_overstated_language");
  if (longestSentence > 100) warnings.push("long_sentence");
  if (repeatedParagraphs > 0) warnings.push("exact_repetition");
  if (contradictionFlags > 0) warnings.push("possible_contradiction_requires_human_review");
  if (repeatedThemes.length > 0) warnings.push("possible_semantic_repetition_requires_human_review");
  if (!actionChainComplete) warnings.push("incomplete_30_day_action_chain");
  return { report, warnings, metrics: { longestSentence, repeatedParagraphs, contradictionFlags, repeatedThemes, actionChainComplete } };
}

/** Production-candidate gate. Quality warnings remain warnings; completeness fails closed. */
export function validatePremiumV231Strict(output: unknown): PremiumV2ValidationResult {
  if (!output || typeof output !== "object" || !("aiJuzaClosingMessage" in output)
    || typeof output.aiJuzaClosingMessage !== "string" || !output.aiJuzaClosingMessage.trim()) {
    throw new Error(PREMIUM_V2_MISSING_JUZA_CLOSING);
  }
  const validation = validatePremiumV2Report(output);
  if (!validation.metrics.actionChainComplete) throw new Error(PREMIUM_V2_INVALID_30_DAY_ACTION);
  if (!validation.report.aiJuzaClosingMessage.trim()) throw new Error(PREMIUM_V2_MISSING_JUZA_CLOSING);
  return validation;
}
