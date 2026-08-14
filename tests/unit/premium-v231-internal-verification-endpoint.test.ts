import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createPremiumV231ReportEnvelope } from "../../server/ai/premium-v2-envelope.js";
import { createPremiumV231VerificationHandler } from "../../api/internal/premium-v231-verification.js";
import { validatePremiumV231Strict } from "../../server/ai/validate-report.v2.js";
import { buildPremiumV231ProductionVerificationFixture } from "../fixtures/premium-v231-production-verification.fixture.js";

const secret = "v".repeat(32);
const identity = {
  requestId: "11111111-1111-4111-a111-111111111111",
  paymentId: "22222222-2222-4222-a222-222222222222",
  accessToken: "a".repeat(43),
  createdAt: "2026-08-13T00:00:00.000Z",
  result: { type: "challenger", ja: "挑戦力タイプ", en: "Challenger" },
};

function envelope() {
  return createPremiumV231ReportEnvelope({
    model: "test-model",
    generatedAt: "2026-08-13T00:00:00.000Z",
    questionSetVersion: "nextory11-question-pack.v1",
    resultType: "challenger",
    profileSignature: "a".repeat(64),
    usage: { inputTokens: 1, outputTokens: 2, totalTokens: 3 },
    reportContent: validatePremiumV231Strict(buildPremiumV231ProductionVerificationFixture()).report,
  });
}

function response() {
  const state = { status: 0, body: undefined as unknown };
  return {
    state,
    response: {
      setHeader: vi.fn(),
      status(code: number) { state.status = code; return this; },
      json(body: unknown) { state.body = body; return body; },
    },
  };
}

function request(body: unknown, token?: string) {
  return { method: "POST", headers: token ? { "x-nextory-verification-token": token } : {}, body, query: {} };
}

function dependencies() {
  const report = envelope();
  return {
    setupSynthetic: vi.fn(async () => identity),
    generate: vi.fn()
      .mockResolvedValueOnce({ report, created: true })
      .mockResolvedValueOnce({ report, created: false }),
    cleanupSynthetic: vi.fn(async () => 0),
  };
}

beforeEach(() => {
  process.env.VERCEL_ENV = "production";
  process.env.PREMIUM_V231_INTERNAL_VERIFICATION_ENABLED = "true";
  process.env.PREMIUM_V231_INTERNAL_VERIFICATION_SECRET = secret;
  process.env.REPORT_TOKEN_PEPPER = "p".repeat(32);
});

afterEach(() => {
  delete process.env.VERCEL_ENV;
  delete process.env.PREMIUM_V231_INTERNAL_VERIFICATION_ENABLED;
  delete process.env.PREMIUM_V231_INTERNAL_VERIFICATION_SECRET;
  delete process.env.REPORT_TOKEN_PEPPER;
});

describe("temporary Premium V2.3.1 internal verification endpoint", () => {
  it("is disabled by default", async () => {
    delete process.env.PREMIUM_V231_INTERNAL_VERIFICATION_ENABLED;
    const deps = dependencies(); const out = response();
    await createPremiumV231VerificationHandler(deps)(request({ action: "run" }, secret), out.response);
    expect(out.state.status).toBe(404); expect(deps.setupSynthetic).not.toHaveBeenCalled();
  });

  it("blocks an unauthenticated request", async () => {
    const deps = dependencies(); const out = response();
    await createPremiumV231VerificationHandler(deps)(request({ action: "run" }), out.response);
    expect(out.state.status).toBe(404); expect(deps.setupSynthetic).not.toHaveBeenCalled();
  });

  it("blocks a wrong verification token", async () => {
    const deps = dependencies(); const out = response();
    await createPremiumV231VerificationHandler(deps)(request({ action: "run" }, "wrong"), out.response);
    expect(out.state.status).toBe(404); expect(deps.setupSynthetic).not.toHaveBeenCalled();
  });

  it("rejects arbitrary customer identity fields", async () => {
    const deps = dependencies(); const out = response();
    await createPremiumV231VerificationHandler(deps)(request({ action: "run", customerId: "customer" }, secret), out.response);
    expect(out.state.status).toBe(400); expect(deps.setupSynthetic).not.toHaveBeenCalled();
  });

  it("creates synthetic identity internally without caller arguments", async () => {
    const deps = dependencies(); const out = response();
    await createPremiumV231VerificationHandler(deps)(request({ action: "run" }, secret), out.response);
    expect(deps.setupSynthetic).toHaveBeenCalledWith();
  });

  it("uses the locked V2.3.1 generation and restore contract", async () => {
    const deps = dependencies(); const out = response();
    await createPremiumV231VerificationHandler(deps)(request({ action: "run" }, secret), out.response);
    expect(deps.generate).toHaveBeenCalledTimes(2);
    expect(deps.generate).toHaveBeenNthCalledWith(1, identity.requestId);
    expect(deps.generate).toHaveBeenNthCalledWith(2, identity.requestId);
    expect(out.state.body).toMatchObject({ reportVersion: "premium-report.v2.3.1", promptVersion: "ai-juza-premium.v2.3.1-closing-refinement" });
  });

  it("blocks a repeated lifecycle before generation", async () => {
    const deps = dependencies();
    deps.setupSynthetic.mockRejectedValueOnce(new Error("verification_already_exists"));
    const out = response();
    await createPremiumV231VerificationHandler(deps)(request({ action: "run" }, secret), out.response);
    expect(out.state.status).toBe(409); expect(deps.generate).not.toHaveBeenCalled();
  });

  it("allows cleanup only with the exact issued cleanup token", async () => {
    const deps = dependencies(); const run = response(); const handler = createPremiumV231VerificationHandler(deps);
    await handler(request({ action: "run" }, secret), run.response);
    const cleanupToken = (run.state.body as { cleanupToken: string }).cleanupToken;
    const denied = response();
    await handler(request({ action: "cleanup", cleanupToken: "0".repeat(64) }, secret), denied.response);
    expect(denied.state.status).toBe(404); expect(deps.cleanupSynthetic).not.toHaveBeenCalled();
    const allowed = response();
    await handler(request({ action: "cleanup", cleanupToken }, secret), allowed.response);
    expect(allowed.state.status).toBe(200); expect(deps.cleanupSynthetic).toHaveBeenCalledTimes(1);
  });

  it("never returns Production or provider secrets", async () => {
    const deps = dependencies(); const out = response();
    await createPremiumV231VerificationHandler(deps)(request({ action: "run" }, secret), out.response);
    const serialized = JSON.stringify(out.state.body);
    expect(serialized).not.toContain("DATABASE_URL");
    expect(serialized).not.toContain(secret);
    expect(serialized).not.toContain("OPENAI_API_KEY");
  });

  it("returns only the required browser-access and cleanup fields", async () => {
    const deps = dependencies(); const out = response();
    await createPremiumV231VerificationHandler(deps)(request({ action: "run" }, secret), out.response);
    expect(Object.keys(out.state.body as object).sort()).toEqual([
      "accessToken", "cleanupToken", "createdAt", "promptVersion", "reportVersion", "requestId", "result", "status",
    ]);
  });
});
