import { assertJuzaProvider, isPromiseLike } from "./contracts";
import { createJuzaContext } from "./context";
import { createLocalCelestialProvider } from "./providers/localCelestialProvider";

export function createAiJuzaEngine({ provider = createLocalCelestialProvider(), memoryStore = null, now = () => new Date().toISOString() } = {}) {
  const activeProvider = assertJuzaProvider(provider);

  function prepare(input) {
    const sessionId = input.session?.id;
    const memory = sessionId && memoryStore ? memoryStore.load(sessionId) : input.memory;
    return createJuzaContext({ ...input, memory });
  }

  function record(context, reading) {
    const sessionId = context.session?.id;
    if (!sessionId || !memoryStore) return;
    memoryStore.append(sessionId, { role: "juza", kind: "reading", content: reading.message, createdAt: now() });
  }

  return {
    provider: { id: activeProvider.id, version: activeProvider.version, capabilities: activeProvider.capabilities ?? {} },
    createReading(input) {
      const context = prepare(input);
      const reading = activeProvider.generateReading(context);
      if (isPromiseLike(reading)) throw new TypeError("Async AI JUZA providers must use createReadingAsync().");
      record(context, reading);
      return reading;
    },
    async createReadingAsync(input) {
      const context = prepare(input);
      const reading = await activeProvider.generateReading(context);
      record(context, reading);
      return reading;
    },
    async continueConversation(input) {
      if (typeof activeProvider.generateReply !== "function") {
        throw new Error(`Provider ${activeProvider.id} does not support conversation yet.`);
      }
      const context = prepare(input);
      const reply = await activeProvider.generateReply(context, input.message);
      const sessionId = context.session?.id;
      if (sessionId && memoryStore) {
        memoryStore.append(sessionId, { role: "user", kind: "message", content: input.message, createdAt: now() });
        memoryStore.append(sessionId, { role: "juza", kind: "message", content: reply.message, createdAt: now() });
      }
      return reply;
    },
  };
}
