import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import checkoutSessionsHandler from "./api/checkout-sessions.ts";
import reportRequestsHandler from "./api/report-requests.ts";
import reportStatusHandler from "./api/reports/[requestId]/status.ts";
import reportGenerateHandler from "./api/reports/[requestId]/generate.ts";
import stripeWebhookHandler from "./api/stripe/webhook.ts";

const MAX_DEV_API_BODY_BYTES = 64 * 1024;

function createResponse(response) {
  return {
    setHeader(name, value) {
      response.setHeader(name, value);
    },
    status(statusCode) {
      response.statusCode = statusCode;
      return this;
    },
    json(body) {
      response.setHeader("Content-Type", "application/json; charset=utf-8");
      response.end(JSON.stringify(body));
    },
  };
}

async function readJsonBody(request) {
  const chunks = [];
  let total = 0;
  for await (const chunk of request) {
    total += chunk.byteLength;
    if (total > MAX_DEV_API_BODY_BYTES) throw new Error("request_too_large");
    chunks.push(Buffer.from(chunk));
  }
  if (chunks.length === 0) return undefined;
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function queryFromUrl(url) {
  const query = {};
  for (const [key, value] of url.searchParams) {
    const current = query[key];
    query[key] = current === undefined ? value : Array.isArray(current) ? [...current, value] : [current, value];
  }
  return query;
}

function localApiPlugin() {
  return {
    name: "nextory11-local-api",
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        const url = new URL(request.url || "/", "http://localhost");
        const statusMatch = url.pathname.match(/^\/api\/reports\/([^/]+)\/status$/u);
        const generateMatch = url.pathname.match(/^\/api\/reports\/([^/]+)\/generate$/u);
        const route =
          url.pathname === "/api/report-requests"
            ? { handler: reportRequestsHandler, rawBody: false }
            : url.pathname === "/api/checkout-sessions"
              ? { handler: checkoutSessionsHandler, rawBody: false }
              : url.pathname === "/api/stripe/webhook"
                ? { handler: stripeWebhookHandler, rawBody: true }
                : statusMatch
                  ? { handler: reportStatusHandler, rawBody: false }
                  : generateMatch
                    ? { handler: reportGenerateHandler, rawBody: false }
                  : null;

        if (!route) return next();

        const query = queryFromUrl(url);
        if (statusMatch) query.requestId = decodeURIComponent(statusMatch[1]);
        if (generateMatch) query.requestId = decodeURIComponent(generateMatch[1]);
        const apiRequest = request;
        apiRequest.query = query;

        try {
          if (!route.rawBody && request.method !== "GET") {
            apiRequest.body = await readJsonBody(request);
          }
          await route.handler(apiRequest, createResponse(response));
        } catch (error) {
          if (response.writableEnded) return;
          const tooLarge = error instanceof Error && error.message === "request_too_large";
          response.statusCode = tooLarge ? 413 : 400;
          response.setHeader("Content-Type", "application/json; charset=utf-8");
          response.end(JSON.stringify({ error: tooLarge ? "request_too_large" : "invalid_request" }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const serverEnv = loadEnv(mode, process.cwd(), "");
  Object.assign(process.env, serverEnv);

  return {
    plugins: [localApiPlugin(), react()],
  };
});
