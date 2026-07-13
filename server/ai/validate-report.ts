import {
  reportOutputV1Schema,
  type ReportOutputV1,
} from "../reports/contracts/report-output.v1.js";

export function validateReport(output: unknown): ReportOutputV1 {
  return reportOutputV1Schema.parse(output);
}
