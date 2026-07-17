import { z } from "zod";

const jsonPrimitiveSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);
const jsonValueSchema = z.lazy(() => z.union([
  jsonPrimitiveSchema,
  z.array(jsonValueSchema),
  z.record(z.string(), jsonValueSchema),
]));

const weightMapSchema = z.record(z.string().min(1), z.number().finite()).default({});

export const answerOptionSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  personalityWeights: weightMapSchema,
  secondaryWeights: weightMapSchema,
  expansionScores: weightMapSchema,
  metadata: z.record(z.string(), jsonValueSchema).default({}),
  extensions: z.record(z.string(), jsonValueSchema).default({}),
}).strict();

export const questionSchema = z.object({
  id: z.union([z.string().min(1), z.number().int().nonnegative()]),
  revision: z.number().int().positive(),
  category: z.string().min(1),
  difficulty: z.union([z.string().min(1), z.number().finite()]),
  text: z.string().min(1),
  answers: z.array(answerOptionSchema).length(4),
  tags: z.array(z.string().min(1)).default([]),
  rotationGroup: z.string().min(1).nullable().default(null),
  cooldownGroup: z.string().min(1).nullable().default(null),
  enabled: z.boolean().default(true),
  language: z.string().min(2),
  metadata: z.record(z.string(), jsonValueSchema).default({}),
  extensions: z.record(z.string(), jsonValueSchema).default({}),
}).strict();

export const questionBankSchema = z.object({
  bankId: z.string().min(1),
  version: z.string().min(1),
  contextVersion: z.string().min(1),
  language: z.string().min(2).nullable().default(null),
  metadata: z.record(z.string(), jsonValueSchema).default({}),
  questions: z.array(questionSchema),
}).strict();

export function parseQuestionBank(input) {
  return questionBankSchema.parse(input);
}

export function normalizeQuestionId(id) {
  return String(id);
}

