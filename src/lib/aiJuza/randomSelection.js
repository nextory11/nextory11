export function selectRandomMessageIndex(messages, random = Math.random) {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new RangeError("AI JUZA messages must contain at least one candidate.");
  }

  return Math.floor(random() * messages.length);
}
