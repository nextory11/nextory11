import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const officialCtaFiles = [
  "src/official-site/sections/OfficialHero.jsx",
  "src/official-site/sections/HowToUseNextory11.jsx",
  "src/official-site/pages/ChallengeWorldPage.jsx",
  "src/official-site/pages/CreatorWorldPage.jsx",
  "src/official-site/pages/ExplorerWorldPage.jsx",
  "src/official-site/pages/GuardianWorldPage.jsx",
  "src/official-site/pages/HarmonyWorldPage.jsx",
  "src/official-site/pages/LuminaryWorldPage.jsx",
];

describe("explicit new-diagnosis entry", () => {
  it("marks every Official Website diagnosis CTA as a fresh start", async () => {
    const routing = await readFile("src/official-site/routing.js", "utf8");
    expect(routing).toContain('DIAGNOSIS_PATH = "/diagnosis?new=1"');

    for (const file of officialCtaFiles) {
      const source = await readFile(file, "utf8");
      expect(source).not.toContain('href="/diagnosis"');
      expect(source).toContain("/diagnosis?new=1");
    }
  });

  it("consumes the fresh-start intent before session restoration", async () => {
    const source = await readFile("src/App.jsx", "utf8");
    const freshStart = source.indexOf('get("new") === "1"');
    const restoration = source.indexOf("readActiveDiagnosisSession()", freshStart);
    expect(freshStart).toBeGreaterThan(-1);
    expect(restoration).toBeGreaterThan(freshStart);
    expect(source.slice(freshStart, restoration)).toContain("clearActiveDiagnosisSession()");
    expect(source.slice(freshStart, restoration)).toContain("handleStart()");
  });
});
