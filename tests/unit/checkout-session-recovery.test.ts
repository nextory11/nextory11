import { describe, expect, it } from "vitest";
import {
  isIncompleteCheckoutSession,
  validateCheckoutSessionIdForMode,
} from "../../api/checkout-session-recovery.js";

describe("checkout recovery classification", () => {
  it.each([
    ["unpaid", { payment_status: "unpaid", status: "open" }],
    ["open", { payment_status: "paid", status: "open" }],
    ["expired", { payment_status: "unpaid", status: "expired" }],
    ["canceled", { payment_status: "unpaid", status: "canceled" }],
  ])("classifies %s Checkout as incomplete", (_name, session) => {
    expect(isIncompleteCheckoutSession(session)).toBe(true);
  });

  it("keeps paid and complete Checkout on the secure recovery path", () => {
    expect(isIncompleteCheckoutSession({
      payment_status: "paid",
      status: "complete",
    })).toBe(false);
  });
});

describe("checkout recovery mode boundary", () => {
  it.each([
    ["cs_test_matching123", "test"],
    ["cs_live_matching123", "live"],
  ] as const)("accepts %s for further validation in %s mode", (sessionId, mode) => {
    expect(validateCheckoutSessionIdForMode(sessionId, mode)).toBe(sessionId);
  });

  it("rejects a Test Session in live mode", () => {
    expect(() => validateCheckoutSessionIdForMode("cs_test_wrong123", "live")).toThrow();
  });

  it("rejects a Live Session in test mode", () => {
    expect(() => validateCheckoutSessionIdForMode("cs_live_wrong123", "test")).toThrow();
  });
});
