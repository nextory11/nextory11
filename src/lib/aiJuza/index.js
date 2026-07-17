export { AI_JUZA_CONTEXT_VERSION, AI_JUZA_READING_VERSION } from "./contracts";
export { createJuzaContext } from "./context";
export { createAiJuzaEngine } from "./engine";
export { createInMemoryJuzaMemoryStore } from "./memory";
export { analyzeJuzaProfile, createAnswerSignature } from "./profile";
export { createLocalCelestialProvider } from "./providers/localCelestialProvider";

import { createAiJuzaEngine } from "./engine";

const defaultEngine = createAiJuzaEngine();

export function createAiJuzaReading(input) {
  return defaultEngine.createReading(input);
}
