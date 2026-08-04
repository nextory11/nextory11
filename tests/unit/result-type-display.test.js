import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

import { resolveResultTypeDisplay, resultTypes } from "../../src/data/resultTypes.js";
import { toRecoveryDisplayResult } from "../../api/checkout-session-recovery.js";
import { toSafeReportStatus } from "../../api/reports/[requestId]/status.js";

const canonical = {
  challenger: ["Challenge", "挑戦力タイプ"],
  explorer: ["Explorer", "探究力タイプ"],
  thinker: ["Harmonizer", "調和力タイプ"],
  leader: ["Visionary", "未来創造タイプ"],
  persistence: ["Guardian", "守護力タイプ"],
  expression: ["Luminary", "光導力タイプ"],
  creator: ["Creator", "創造力タイプ"],
  action: ["Pioneer", "開拓力タイプ"],
  adaptability: ["Evolver", "進化力タイプ"],
  empathy: ["Empath", "共感力タイプ"],
  intuition: ["Intuitive", "直感力タイプ"],
};

describe("canonical result type display names", () => {
  it("matches the approved Result Preview names for all eleven internal IDs", () => {
    expect(Object.keys(resultTypes)).toHaveLength(11);
    for (const [type, [en, ja]] of Object.entries(canonical)) {
      expect(resolveResultTypeDisplay(type)).toEqual({ en, ja });
    }
  });

  it("replaces stored legacy labels by internal ID without changing stored data", () => {
    expect(resolveResultTypeDisplay("expression", {
      nameJa: "表現力タイプ",
      nameEn: "Expression",
    })).toEqual({ ja: "光導力タイプ", en: "Luminary" });
  });

  it("normalizes legacy Recovery response labels", () => {
    expect(toRecoveryDisplayResult({
      resultType: "expression",
      resultNameJa: "表現力タイプ",
      resultNameEn: "Expression",
    })).toEqual({ type: "expression", ja: "光導力タイプ", en: "Luminary" });
  });

  it("normalizes an existing report response without mutating stored report JSON", () => {
    const stored = {
      reportJson: {
        result: { type: "expression", nameJa: "表現力タイプ", nameEn: "Expression" },
        metadata: { checksumSource: true },
      },
    };
    const status = {
      id: "request-1",
      createdAt: new Date("2026-08-04T00:00:00.000Z"),
      updatedAt: new Date("2026-08-04T00:00:00.000Z"),
      paymentStatus: "paid",
      generationStatus: "completed",
      deliveryStatus: "not_requested",
      expiresAt: null,
    };
    const entitlement = {
      status: "active",
      grantedAt: new Date("2026-08-04T00:00:00.000Z"),
      revokedAt: null,
    };

    const response = toSafeReportStatus(status, entitlement, stored);
    expect(response.report.result).toEqual({
      type: "expression",
      nameJa: "光導力タイプ",
      nameEn: "Luminary",
    });
    expect(response.report).not.toHaveProperty("metadata");
    expect(stored.reportJson.result.nameJa).toBe("表現力タイプ");
  });

  it("keeps unknown external values as a safe fallback", () => {
    expect(resolveResultTypeDisplay("unknown", {
      nameJa: "保存済み名称",
      nameEn: "Stored Name",
    })).toEqual({ ja: "保存済み名称", en: "Stored Name" });
  });

  it("uses canonical labels in payment, report, recovery, and report-status display paths", async () => {
    const files = await Promise.all([
      readFile("src/components/PaymentStatus.jsx", "utf8"),
      readFile("src/components/ReportPreview.jsx", "utf8"),
      readFile("api/checkout-session-recovery.ts", "utf8"),
      readFile("api/reports/[requestId]/status.ts", "utf8"),
    ]);
    files.forEach((source) => expect(source).toContain("resolveResultTypeDisplay"));
  });
});
