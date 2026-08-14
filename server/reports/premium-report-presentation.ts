import { premiumV231ReportEnvelopeSchema } from "../ai/premium-v2-envelope.js";
import { resolveResultTypeDisplay } from "../../src/data/resultTypes.js";

type ResultIdentity = {
  resultType: string;
  resultNameJa: string;
  resultNameEn: string;
};

/** Maps stored report versions to the stable customer ReportPreview contract. */
export function mapStoredReportForCustomer(reportJson: unknown, identity: ResultIdentity) {
  const v231 = premiumV231ReportEnvelopeSchema.safeParse(reportJson);
  if (v231.success) {
    return {
      schemaVersion: v231.data.schemaVersion,
      reportVersion: v231.data.reportVersion,
      result: {
        type: identity.resultType,
        nameJa: identity.resultNameJa,
        nameEn: identity.resultNameEn,
      },
      ...v231.data.reportContent,
    };
  }

  if (!reportJson || typeof reportJson !== "object" || Array.isArray(reportJson)) return null;
  const rawReport = reportJson as Record<string, unknown>;
  const storedResult = rawReport.result as Record<string, unknown> | undefined;
  const resultType = typeof storedResult?.type === "string" ? storedResult.type : "";
  const resultDisplay = resolveResultTypeDisplay(resultType, {
    nameJa: storedResult?.nameJa,
    nameEn: storedResult?.nameEn,
  });
  const canonicalReport = storedResult && resultType ? {
    ...rawReport,
    result: { ...storedResult, nameJa: resultDisplay.ja, nameEn: resultDisplay.en },
  } : rawReport;
  return Object.fromEntries(
    Object.entries(canonicalReport).filter(([key]) => key !== "metadata"),
  );
}
