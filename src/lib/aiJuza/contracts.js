export const AI_JUZA_CONTEXT_VERSION = "ai-juza.context.v1";
export const AI_JUZA_READING_VERSION = "ai-juza.reading.v1";

/**
 * Runtime guard for pluggable providers. A future remote provider only needs
 * to implement generateReading(context), and may return either a value or a Promise.
 */
export function assertJuzaProvider(provider) {
  if (!provider || typeof provider.generateReading !== "function") {
    throw new TypeError("AI JUZA provider must implement generateReading(context).");
  }
  return provider;
}

export function isPromiseLike(value) {
  return Boolean(value && typeof value.then === "function");
}
