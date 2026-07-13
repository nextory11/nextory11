/**
 * Placeholder only. The final proprietary AI Juza prompt requires separate
 * owner approval and must remain server-only. Never export this through an API.
 */
export const AI_JUZA_SYSTEM_PROMPT_VERSION = "ai-juza-system.v1-placeholder";
export const AI_JUZA_SYSTEM_PROMPT_PLACEHOLDER = Object.freeze({
  status: "not_approved" as const,
  defaultLanguage: "ja" as const,
  requiredGuardrails: [
    "no-medical-claims",
    "no-legal-claims",
    "no-financial-directives",
    "no-deterministic-fortune-telling",
    "structured-json-only",
  ] as const,
});
