const REDACTED_KEYS = /answer|prompt|email|token|secret|report|body/i;

type SafeLogValue = string | number | boolean | null | undefined;
type SafeLogFields = Record<string, SafeLogValue>;

function redact(fields: SafeLogFields): SafeLogFields {
  return Object.fromEntries(
    Object.entries(fields).map(([key, value]) => [key, REDACTED_KEYS.test(key) ? "[REDACTED]" : value]),
  );
}

function write(level: "info" | "warn" | "error", event: string, fields: SafeLogFields = {}) {
  const entry = JSON.stringify({ level, event, ...redact(fields) });
  const output = level === "error" ? console.error : level === "warn" ? console.warn : console.info;
  output(entry);
}

export const logger = {
  info: (event: string, fields?: SafeLogFields) => write("info", event, fields),
  warn: (event: string, fields?: SafeLogFields) => write("warn", event, fields),
  error: (event: string, fields?: SafeLogFields) => write("error", event, fields),
};
