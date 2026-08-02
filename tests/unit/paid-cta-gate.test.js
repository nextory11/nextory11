import { describe, expect, it } from "vitest";
import { isPaidCtaEnabledFlag } from "../../src/lib/stripeCheckout.js";

describe("paid CTA release gate", () => {
  it.each([undefined, null, "", "false", "TRUE", "1", true])(
    "defaults to disabled for %s",
    (value) => expect(isPaidCtaEnabledFlag(value)).toBe(false),
  );

  it("enables only for the exact string true", () => {
    expect(isPaidCtaEnabledFlag("true")).toBe(true);
  });
});
