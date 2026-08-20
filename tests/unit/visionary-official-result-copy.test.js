import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { visionaryTypeDescriptor } from "../../src/data/visionaryOfficialResultCopy.js";

const resultCardSource = readFileSync(new URL("../../src/components/ResultCard.jsx", import.meta.url), "utf8");

describe("VISIONARY official type descriptor", () => {
  it("keeps the HIRO-approved descriptor as the single shared source", () => {
    expect(visionaryTypeDescriptor).toBe("まだ見ぬ未来を、自分の想像力で描く人");
    expect(resultCardSource).toContain("isVisionary ? visionaryTypeDescriptor");
    expect(resultCardSource).toContain('<span className="visionaryMobileCopy">{visionaryTypeDescriptor}</span>');
  });

  it("removes the legacy descriptor from active runtime", () => {
    expect(resultCardSource).not.toContain("未来は、選ぶものじゃない。描くものだ。");
  });
});
