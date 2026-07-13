import { z } from "zod";

const serverEnvSchema = z.object({
  DATABASE_URL: z.string().url().startsWith("postgresql://"),
  DATABASE_URL_UNPOOLED: z.string().url().startsWith("postgresql://").optional(),
  STRIPE_SECRET_KEY: z.string().min(1).optional(),
  STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),
  STRIPE_EXPECTED_PRODUCT_ID: z.string().min(1).optional(),
  STRIPE_EXPECTED_PRICE_ID: z.string().min(1).optional(),
  STRIPE_EXPECTED_AMOUNT_JPY: z.coerce.number().int().positive().optional(),
  STRIPE_API_VERSION: z.string().min(1).optional(),
  OPENAI_API_KEY: z.string().min(1).optional(),
  AI_REPORT_PROVIDER: z.string().min(1).optional(),
  AI_REPORT_MODEL: z.string().min(1).optional(),
  AI_REPORT_PROMPT_VERSION: z.string().min(1).optional(),
  AI_REPORT_TEMPLATE_VERSION: z.string().min(1).optional(),
  RESEND_API_KEY: z.string().min(1).optional(),
  RESEND_FROM_EMAIL: z.string().email().optional(),
  BLOB_READ_WRITE_TOKEN: z.string().min(1).optional(),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
  REPORT_TOKEN_PEPPER: z.string().min(32).optional(),
  INTERNAL_JOB_SECRET: z.string().min(32).optional(),
  REPORT_BASE_URL: z.string().url().optional(),
  REPORT_RETENTION_DAYS: z.coerce.number().int().positive().optional(),
  REPORT_LINK_TTL_SECONDS: z.coerce.number().int().positive().optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export class ServerConfigurationError extends Error {
  readonly issues: string[];

  constructor(issues: string[]) {
    super("Required server configuration is unavailable.");
    this.name = "ServerConfigurationError";
    this.issues = issues;
  }
}

export function parseServerEnv(source: NodeJS.ProcessEnv = process.env): ServerEnv {
  const parsed = serverEnvSchema.safeParse(source);

  if (!parsed.success) {
    throw new ServerConfigurationError(
      parsed.error.issues.map((issue) => issue.path.join(".") || "server environment"),
    );
  }

  return parsed.data;
}

let cachedEnv: ServerEnv | undefined;

export function getServerEnv(): ServerEnv {
  cachedEnv ??= parseServerEnv();
  return cachedEnv;
}
