import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("PaymentStatus restart flow", () => {
  it("leaves the Stripe return URL and starts a new diagnosis without starting checkout", async () => {
    const source = await readFile("src/App.jsx", "utf8");
    const callback = source.match(
      /function handlePaymentRestart\(\) \{(?<body>[\s\S]*?)\n  \}/u,
    );

    expect(callback?.groups?.body).toContain("handleNewDiagnosis()");
    expect(callback?.groups?.body).not.toContain("redirectToStripeCheckout");
    expect(source).toContain("onRestart={handlePaymentRestart}");
    expect(source).toContain("clearActiveDiagnosisSession()");
    expect(source).toContain('window.history.replaceState({}, "", "/diagnosis")');
    expect(source).toContain("もう一度診断する");
  });
});
