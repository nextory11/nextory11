import type { NormalizedDiagnosisAnswer } from "../reports/result-calculator.js";
import type { ReportOutputV1 } from "../reports/contracts/report-output.v1.js";

export interface ReportGenerationInput {
  requestId: string;
  result: {
    resultType: string;
    resultNameJa: string;
    resultNameEn: string;
  };
  answers: NormalizedDiagnosisAnswer[];
  language: "ja";
  reportVersion: string;
  promptVersion: string;
  templateVersion: string;
  profile: PremiumReportProfile;
}

export interface PremiumReportProfile {
  profileSignature: string;
  questionSetVersion: string;
  selectedQuestionIds: string[];
  selectedAnswerIds: string[];
  primaryTrait: string;
  secondaryTrait: string | null;
  thirdTrait: string | null;
  hiddenTraits: string[];
  normalizedDistribution: Record<string, number>;
  categorySignals: Array<{ category: string; count: number }>;
  relevantTags: string[];
}

export interface GenerationContext {
  attempt: number;
  idempotencyKey: string;
}

export interface GenerationReceipt {
  report: ReportOutputV1;
  provider: string;
  model: string;
}

export interface RetryDecision {
  retry: boolean;
  delayMs: number;
  reasonCode: string;
}
