import type { IncomingHttpHeaders } from "node:http";

export interface VercelRequestLike {
  method?: string;
  headers: IncomingHttpHeaders;
  body?: unknown;
  query: Record<string, string | string[] | undefined>;
}

export interface VercelResponseLike {
  setHeader(name: string, value: string): void;
  status(statusCode: number): VercelResponseLike;
  json(body: unknown): unknown;
}
