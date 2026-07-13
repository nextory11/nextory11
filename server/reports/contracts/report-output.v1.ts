import { z } from "zod";

const paragraphSchema = z.string().trim().min(1).max(1_500);
const titleSchema = z.string().trim().min(1).max(120);

const narrativeSectionSchema = z.object({
  title: titleSchema,
  summary: z.string().trim().min(1).max(400),
  body: z.array(paragraphSchema).min(1).max(6),
  keyPoints: z.array(z.string().trim().min(1).max(300)).min(1).max(8),
  reflectionQuestion: z.string().trim().min(1).max(300),
});

const actionPlanItemSchema = z.object({
  dayRange: z.string().trim().min(1).max(40),
  title: titleSchema,
  action: z.string().trim().min(1).max(500),
  reflection: z.string().trim().min(1).max(300),
});

export const reportOutputV1Schema = z.object({
  reportId: z.string().uuid(),
  requestId: z.string().uuid(),
  schemaVersion: z.literal("1"),
  reportVersion: z.string().trim().min(1).max(50),
  language: z.literal("ja"),
  result: z.object({
    type: z.string().trim().min(1).max(50),
    nameJa: z.string().trim().min(1).max(100),
    nameEn: z.string().trim().min(1).max(100),
  }),
  openingMessage: paragraphSchema,
  coreNature: narrativeSectionSchema,
  strengthsAndTalents: narrativeSectionSchema,
  workAndSuitableDirection: narrativeSectionSchema,
  relationshipsAndLove: narrativeSectionSchema,
  futurePossibilities: narrativeSectionSchema,
  actionPlan30Days: z.array(actionPlanItemSchema).min(4).max(10),
  cautionPoints: z.array(z.string().trim().min(1).max(400)).min(1).max(8),
  aiJuzaClosingMessage: paragraphSchema,
  emailSummary: z.string().trim().min(1).max(1_000),
  metadata: z.object({
    generatedAt: z.string().datetime(),
    provider: z.string().trim().min(1).max(50),
    model: z.string().trim().min(1).max(100),
    promptVersion: z.string().trim().min(1).max(50),
    templateVersion: z.string().trim().min(1).max(50),
  }),
});

export type ReportOutputV1 = z.infer<typeof reportOutputV1Schema>;
