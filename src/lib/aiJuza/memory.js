export function createInMemoryJuzaMemoryStore({ maxTurns = 50 } = {}) {
  const sessions = new Map();

  return {
    load(sessionId) {
      return [...(sessions.get(sessionId) ?? [])];
    },
    append(sessionId, turn) {
      if (!sessionId) return;
      const turns = [...(sessions.get(sessionId) ?? []), { ...turn }].slice(-maxTurns);
      sessions.set(sessionId, turns);
    },
    clear(sessionId) {
      sessions.delete(sessionId);
    },
  };
}
