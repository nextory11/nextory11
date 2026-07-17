import type { VercelRequestLike } from "../http/vercel.js";
import { parseReportAccessEnv } from "../config/env.js";
import { AccessTokensRepository } from "../db/repositories/access-tokens.js";
import { hashAccessToken } from "./tokens.js";

export async function authorizeReportAccess(request: VercelRequestLike, reportRequestId: string) {
  const header = request.headers.authorization;
  const value = Array.isArray(header) ? header[0] : header;
  const match = value?.match(/^Bearer\s+([A-Za-z0-9_-]{32,})$/u);
  if (!match) return false;
  const env = parseReportAccessEnv();
  const token = await new AccessTokensRepository().findUsableByHash(hashAccessToken(match[1], env.REPORT_TOKEN_PEPPER));
  return token?.reportRequestId === reportRequestId;
}
