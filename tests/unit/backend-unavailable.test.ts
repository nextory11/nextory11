import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.restoreAllMocks();
  vi.resetModules();
});

describe("unavailable database configuration", () => {
  it("fails the report-request API safely without exposing configuration", async () => {
    const originalDatabaseUrl = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;
    vi.resetModules();
    const errorOutput = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const { default: handler } = await import("../../api/report-requests.js");
    let statusCode = 200;
    let payload: unknown;
    const response = {
      setHeader: vi.fn(),
      status(code: number) {
        statusCode = code;
        return this;
      },
      json(body: unknown) {
        payload = body;
        return body;
      },
    };
    const answers = Array.from({ length: 11 }, (_, index) => ({
      questionId: index + 1,
      answerId: "A",
    }));

    try {
      await handler({ method: "POST", headers: {}, query: {}, body: { answers } }, response);
      expect(statusCode).toBe(503);
      expect(payload).toEqual({ error: "backend_unavailable" });
      expect(errorOutput).toHaveBeenCalledTimes(1);
      expect(errorOutput.mock.calls.flat().join(" ")).not.toContain("postgresql://");
    } finally {
      if (originalDatabaseUrl === undefined) delete process.env.DATABASE_URL;
      else process.env.DATABASE_URL = originalDatabaseUrl;
    }
  });
});
