import { describe, expect, it } from "vitest";
import {
  generateAccessToken,
  generateRequestId,
  hashAccessToken,
  tokenHashesMatch,
} from "../../server/security/tokens.js";
import { requestIdSchema } from "../../server/validation/identifiers.js";

describe("opaque identifiers", () => {
  it("generates UUID request IDs", () => {
    const first = generateRequestId();
    const second = generateRequestId();
    expect(requestIdSchema.parse(first)).toBe(first);
    expect(first).not.toBe(second);
  });

  it("generates random access tokens and compares only their hashes", () => {
    const token = generateAccessToken();
    const pepper = "safe-test-pepper-that-is-longer-than-thirty-two-characters";
    const digest = hashAccessToken(token, pepper);
    expect(token).not.toContain(digest);
    expect(tokenHashesMatch(digest, hashAccessToken(token, pepper))).toBe(true);
    expect(tokenHashesMatch(digest, hashAccessToken(`${token}x`, pepper))).toBe(false);
  });
});
