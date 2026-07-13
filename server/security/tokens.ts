import { createHmac, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";

export function generateRequestId(): string {
  return randomUUID();
}

export function generateAccessToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

export function hashAccessToken(token: string, pepper: string): string {
  return createHmac("sha256", pepper).update(token, "utf8").digest("hex");
}

export function tokenHashesMatch(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left, "hex");
  const rightBuffer = Buffer.from(right, "hex");
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}
