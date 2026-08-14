import { z } from "zod";

const postgresConnectionStringSchema = z.string().min(1).refine(
  (value) => value.startsWith("postgresql://") || value.startsWith("postgres://"),
  "Expected a PostgreSQL connection string.",
);

const serverEnvSchema = z.object({
  DATABASE_URL: postgresConnectionStringSchema,
  DATABASE_URL_UNPOOLED: postgresConnectionStringSchema.optional(),
  STRIPE_MODE: z.enum(["test", "live"]).optional(),
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

const stripeEnvSchema = serverEnvSchema.extend({
  STRIPE_MODE: z.enum(["test", "live"]),
  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_"),
  STRIPE_EXPECTED_PRODUCT_ID: z.string().startsWith("prod_"),
  STRIPE_EXPECTED_PRICE_ID: z.string().startsWith("price_"),
  STRIPE_EXPECTED_AMOUNT_JPY: z.coerce.number().int().refine((value) => value === 980).default(980),
  STRIPE_API_VERSION: z.string().min(1),
  REPORT_BASE_URL: z.string().url(),
}).superRefine((value, context) => {
  const expectedPrefix = value.STRIPE_MODE === "live" ? "sk_live_" : "sk_test_";
  if (!value.STRIPE_SECRET_KEY.startsWith(expectedPrefix)) {
    context.addIssue({
      code: "custom",
      path: ["STRIPE_SECRET_KEY"],
      message: `Stripe key must match STRIPE_MODE=${value.STRIPE_MODE}.`,
    });
  }
});

const aiReportEnvSchema = serverEnvSchema.extend({
  OPENAI_API_KEY: z.string().startsWith("sk-"),
  AI_REPORT_PROVIDER: z.literal("openai"),
  AI_REPORT_MODEL: z.string().min(1),
  AI_REPORT_PROMPT_VERSION: z.literal("ai-juza-premium.v1"),
  AI_REPORT_TEMPLATE_VERSION: z.literal("personal-star-report.v1"),
});

const reportAccessEnvSchema = serverEnvSchema.extend({
  REPORT_TOKEN_PEPPER: z.string().min(32),
  REPORT_LINK_TTL_SECONDS: z.coerce.number().int().positive().default(2_592_000),
});

const premiumV231EnvSchema = serverEnvSchema.extend({
  OPENAI_API_KEY: z.string().startsWith("sk-"),
  AI_REPORT_PROVIDER: z.literal("openai"),
  AI_REPORT_MODEL: z.string().min(1),
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

export type StripeServerEnv = z.infer<typeof stripeEnvSchema>;

export function parseStripeServerEnv(source: NodeJS.ProcessEnv = process.env): StripeServerEnv {
  const parsed = stripeEnvSchema.safeParse(source);
  if (!parsed.success) {
    throw new ServerConfigurationError(
      parsed.error.issues.map((issue) => issue.path.join(".") || "Stripe environment"),
    );
  }
  return parsed.data;
}

export type AiReportEnv = z.infer<typeof aiReportEnvSchema>;
export function parseAiReportEnv(source: NodeJS.ProcessEnv = process.env): AiReportEnv {
  const parsed = aiReportEnvSchema.safeParse(source);
  if (!parsed.success) throw new ServerConfigurationError(parsed.error.issues.map((issue) => issue.path.join(".") || "AI report environment"));
  return parsed.data;
}

export function parseReportAccessEnv(source: NodeJS.ProcessEnv = process.env) {
  const parsed = reportAccessEnvSchema.safeParse(source);
  if (!parsed.success) throw new ServerConfigurationError(parsed.error.issues.map((issue) => issue.path.join(".") || "report access environment"));
  return parsed.data;
}

export type PremiumV231Env = z.infer<typeof premiumV231EnvSchema>;
export function parsePremiumV231Env(source: NodeJS.ProcessEnv = process.env): PremiumV231Env {
  const parsed = premiumV231EnvSchema.safeParse(source);
  if (!parsed.success) throw new ServerConfigurationError(parsed.error.issues.map((issue) => issue.path.join(".") || "Premium V2.3.1 environment"));
  return parsed.data;
}
