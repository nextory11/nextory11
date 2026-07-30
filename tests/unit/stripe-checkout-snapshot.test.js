import { beforeEach, describe, expect, it } from "vitest";
import {
  clearCheckoutSnapshot,
  readCheckoutSnapshot,
  saveCheckoutSnapshot,
} from "../../src/lib/stripeCheckout.js";

function memoryStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
  };
}

function snapshot(requestId, checkoutSessionId, diagnosisSessionId) {
  return {
    requestId,
    checkoutSessionId,
    diagnosisSessionId,
    accessToken: `token-${requestId}`,
    createdAt: new Date().toISOString(),
  };
}

describe("checkout snapshot isolation", () => {
  beforeEach(() => {
    globalThis.window = { localStorage: memoryStorage() };
  });

  it("restores each purchase by Stripe Session instead of the latest diagnosis", () => {
    const older = snapshot("request-old", "cs_test_old", "diagnosis-old");
    const newer = snapshot("request-new", "cs_test_new", "diagnosis-new");
    saveCheckoutSnapshot(older);
    saveCheckoutSnapshot(newer);

    expect(readCheckoutSnapshot().requestId).toBe("request-new");
    expect(readCheckoutSnapshot("cs_test_old")).toMatchObject(older);
    expect(readCheckoutSnapshot("cs_test_new")).toMatchObject(newer);
  });

  it("clears one checkout without deleting another purchase", () => {
    saveCheckoutSnapshot(snapshot("request-a", "cs_test_a", "diagnosis-a"));
    saveCheckoutSnapshot(snapshot("request-b", "cs_test_b", "diagnosis-b"));
    clearCheckoutSnapshot("cs_test_a");

    expect(readCheckoutSnapshot("cs_test_a")).toBeNull();
    expect(readCheckoutSnapshot("cs_test_b")).toMatchObject({ requestId: "request-b" });
  });

  it("rejects expired recovery data and removes its session mapping", () => {
    const expired = snapshot("request-expired", "cs_test_expired", "diagnosis-expired");
    expired.createdAt = new Date(Date.now() - 31 * 24 * 60 * 60 * 1_000).toISOString();
    window.localStorage.setItem("nextory11.checkoutSnapshot.v2.request-expired", JSON.stringify(expired));
    window.localStorage.setItem("nextory11.checkoutSnapshot.session.v2.cs_test_expired", "request-expired");

    expect(readCheckoutSnapshot("cs_test_expired")).toBeNull();
    expect(window.localStorage.getItem("nextory11.checkoutSnapshot.session.v2.cs_test_expired")).toBeNull();
  });
});
