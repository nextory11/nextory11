import { describe, expect, it } from "vitest";
import { isIncompleteCheckoutSession } from "../../api/checkout-session-recovery.js";

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
