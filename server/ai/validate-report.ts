import { reportOutputV1Schema, type ReportOutputV1 } from "../reports/contracts/report-output.v1.js";

const FORBIDDEN = /(ChatGPT|OpenAI|LLM|プロンプト|システムメッセージ|医療診断|精神疾患|必ず成功|絶対に|確実に未来)/iu;
const MARKDOWN = /```|^#{1,6}\s|\*\*|__.+__/mu;
const INTERNAL_SCORE = /\d+(?:\.\d+)?\s*(?:%|％|点)/u;

function allProse(report: ReportOutputV1): string[] {
  const sectionKeys = ["executiveSummary", "corePersonality", "hiddenStrengths", "traitInteraction", "decisionMakingStyle", "relationships", "careerAndTalent", "currentGrowthStage", "blindSpots", "personalRecommendations"] as const;
  const prose = sectionKeys.flatMap((key) => {
    const section = report[key];
    return [section.title, section.summary, ...section.body, ...section.keyPoints, section.reflectionQuestion];
  });
  report.growthPlan30Days.actions.forEach((action) => prose.push(action.title, action.action, action.purpose));
  return [...prose, report.growthPlan30Days.title, report.growthPlan30Days.summary, report.aiJuzaClosingMessage, report.emailSummary];
}

function normalizeParagraph(value: string) {
  return value.normalize("NFKC").replace(/\s+/gu, " ").trim().toLowerCase();
}

export class ReportQualityError extends Error {
  constructor(readonly code: string) { super(code); this.name = "ReportQualityError"; }
}

export function validateReport(output: unknown, expected?: { requestId: string; resultType: string; resultNameJa: string }): ReportOutputV1 {
  const report = reportOutputV1Schema.parse(output);
  if (expected && (report.requestId !== expected.requestId || report.result.type !== expected.resultType || report.result.nameJa !== expected.resultNameJa)) {
    throw new ReportQualityError("report_context_mismatch");
  }
  const prose = allProse(report);
  if (prose.some((value) => FORBIDDEN.test(value))) throw new ReportQualityError("forbidden_language");
  if (prose.some((value) => MARKDOWN.test(value) || /^[[{]/u.test(value.trim()))) throw new ReportQualityError("format_leakage");
  if (prose.some((value) => INTERNAL_SCORE.test(value))) throw new ReportQualityError("internal_score_leakage");
  // The provider deliberately derives emailSummary from the executive
  // summary. Validate it for forbidden language and format above, but do not
  // treat that delivery-only copy as a duplicate report paragraph.
  const paragraphs = prose.slice(0, -1).filter((value) => value.length >= 40).map(normalizeParagraph);
  if (new Set(paragraphs).size !== paragraphs.length) throw new ReportQualityError("duplicate_paragraph");
  const japaneseCharacters = prose.join("").match(/[ぁ-んァ-ヶ一-龠]/gu)?.length ?? 0;
  if (japaneseCharacters < 500) throw new ReportQualityError("insufficient_japanese_content");
  return report;
}
