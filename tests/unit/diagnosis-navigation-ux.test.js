import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("diagnosis navigation UX", () => {
  it("uses normal document navigation for a new diagnosis and TOP return", async () => {
    const source = await readFile("src/App.jsx", "utf8");

    expect(source).toContain('window.location.assign("/diagnosis?new=1")');
    expect(source).toContain('window.location.assign("/")');
    expect(source).not.toContain("window.history.back()");
    expect(source).toContain("clearActiveDiagnosisSession()");
    expect(source).toContain("TOPへ戻る");
    expect(source).toContain("DIAGNOSIS_RETURN_MARKER_KEY");
    expect(source).toContain("DIAGNOSIS_RETURN_SNAPSHOT_KEY");
    expect(source).toContain("canReturnToResult ?");
    expect(source).toContain("診断結果へ戻る");
    expect(source).toContain('onClick={handleReturnToResult}');
    expect(source).toContain("const restoredOfficialSession = createOfficialQuestionSession");
    expect(source).toContain("...restoredOfficialSession");
    expect(source.indexOf("if (diagnosisSnapshot?.answers?.length")).toBeLessThan(
      source.indexOf("else if (snapshot?.answers?.length)"),
    );
    expect(source).not.toContain('window.history.replaceState({}, "", "/diagnosis")');
    expect(source).toContain('<main className="app diagnosisApp">');
  });

  it("uses one shared premium restart style for both result paths", async () => {
    const source = await readFile("src/App.jsx", "utf8");
    const styles = await readFile("src/styles/diagnosis-navigation.css", "utf8");

    expect(source.match(/className="subButton rediagnosisButton"/gu)).toHaveLength(2);
    expect(styles).toContain(".rediagnosisButton");
    expect(styles).toContain(".diagnosisNavigation__top");
  });

  it("keeps report, new diagnosis, and TOP destinations separate", async () => {
    const app = await readFile("src/App.jsx", "utf8");
    const payment = await readFile("src/components/PaymentStatus.jsx", "utf8");
    const report = await readFile("src/components/ReportPreview.jsx", "utf8");
    const trust = await readFile("src/components/TrustExperience.jsx", "utf8");

    expect(app).toContain("onReturnToTop={handleReturnToTop}");
    expect(payment).toContain("結果画面に戻る");
    expect(payment).toContain("もう一度診断する");
    expect(payment).toContain("TOPへ戻る");
    expect(report).toContain("結果画面に戻る");
    expect(report).toContain("もう一度診断する");
    expect(report).toContain("TOPへ戻る");
    expect(trust).toContain('className="trustHero__back" href="/"');
    expect(trust).not.toContain('className="trustHero__back" href="/#/"');
  });
});
