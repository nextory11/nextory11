import { z } from "zod";

const paragraphSchema = z.string().trim().min(40).max(1_500);
const titleSchema = z.string().trim().min(1).max(120);

export const narrativeSectionSchema = z.object({
  title: titleSchema,
  summary: z.string().trim().min(20).max(400),
  body: z.array(paragraphSchema).min(2).max(4),
  keyPoints: z.array(z.string().trim().min(10).max(300)).min(2).max(5),
  reflectionQuestion: z.string().trim().min(10).max(300),
}).strict();

const growthWeekSchema = z.object({
  dayRange: z.string().trim().min(1).max(40),
  title: titleSchema,
  actions: z.array(z.string().trim().min(10).max(400)).min(2).max(4),
  reflection: z.string().trim().min(10).max(300),
}).strict();

export const reportGeneratedContentSchema = z.object({
  executiveSummary: narrativeSectionSchema,
  corePersonality: narrativeSectionSchema,
  hiddenStrengths: narrativeSectionSchema,
  traitInteraction: narrativeSectionSchema,
  decisionMakingStyle: narrativeSectionSchema,
  relationships: narrativeSectionSchema,
  careerAndTalent: narrativeSectionSchema,
  currentGrowthStage: narrativeSectionSchema,
  blindSpots: narrativeSectionSchema,
  growthPlan30Days: z.object({
    title: titleSchema,
    summary: z.string().trim().min(20).max(400),
    weeks: z.array(growthWeekSchema).length(4),
  }).strict(),
  personalRecommendations: narrativeSectionSchema,
  aiJuzaClosingMessage: paragraphSchema,
}).strict();

export const reportOutputV1Schema = reportGeneratedContentSchema.extend({
  reportId: z.string().uuid(),
  requestId: z.string().uuid(),
  schemaVersion: z.literal("1"),
  reportVersion: z.literal("premium-report.v1"),
  language: z.literal("ja"),
  result: z.object({
    type: z.string().trim().min(1).max(50),
    nameJa: z.string().trim().min(1).max(100),
    nameEn: z.string().trim().min(1).max(100),
  }).strict(),
  emailSummary: z.string().trim().min(40).max(1_000),
  metadata: z.object({
    generatedAt: z.string().datetime(),
    provider: z.string().trim().min(1).max(50),
    model: z.string().trim().min(1).max(100),
    promptVersion: z.literal("ai-juza-premium.v1"),
    templateVersion: z.literal("personal-star-report.v1"),
    profileSignature: z.string().regex(/^[a-f0-9]{64}$/u),
  }).strict(),
}).strict();

export type ReportGeneratedContent = z.infer<typeof reportGeneratedContentSchema>;
export type ReportOutputV1 = z.infer<typeof reportOutputV1Schema>;

const narrativeJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["title", "summary", "body", "keyPoints", "reflectionQuestion"],
  properties: {
    title: { type: "string" }, summary: { type: "string" },
    body: { type: "array", minItems: 2, maxItems: 4, items: { type: "string" } },
    keyPoints: { type: "array", minItems: 2, maxItems: 5, items: { type: "string" } },
    reflectionQuestion: { type: "string" },
  },
};

export const reportGeneratedContentJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["executiveSummary", "corePersonality", "hiddenStrengths", "traitInteraction", "decisionMakingStyle", "relationships", "careerAndTalent", "currentGrowthStage", "blindSpots", "growthPlan30Days", "personalRecommendations", "aiJuzaClosingMessage"],
  properties: {
    executiveSummary: narrativeJsonSchema, corePersonality: narrativeJsonSchema,
    hiddenStrengths: narrativeJsonSchema, traitInteraction: narrativeJsonSchema,
    decisionMakingStyle: narrativeJsonSchema, relationships: narrativeJsonSchema,
    careerAndTalent: narrativeJsonSchema, currentGrowthStage: narrativeJsonSchema,
    blindSpots: narrativeJsonSchema, personalRecommendations: narrativeJsonSchema,
    aiJuzaClosingMessage: { type: "string" },
    growthPlan30Days: {
      type: "object", additionalProperties: false, required: ["title", "summary", "weeks"],
      properties: {
        title: { type: "string" }, summary: { type: "string" },
        weeks: { type: "array", minItems: 4, maxItems: 4, items: {
          type: "object", additionalProperties: false, required: ["dayRange", "title", "actions", "reflection"],
          properties: {
            dayRange: { type: "string" }, title: { type: "string" },
            actions: { type: "array", minItems: 2, maxItems: 4, items: { type: "string" } },
            reflection: { type: "string" },
          },
        } },
      },
    },
  },
} as const;
