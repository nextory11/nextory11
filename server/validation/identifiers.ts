import { z } from "zod";

export const requestIdSchema = z.string().uuid();
export const questionIdSchema = z.number().int().min(1).max(11);
export const answerIdSchema = z
  .string()
  .transform((value) => value.normalize("NFKC").trim().toUpperCase())
  .pipe(z.enum(["A", "B", "C", "D"]));

export type RequestId = z.infer<typeof requestIdSchema>;
export type QuestionId = z.infer<typeof questionIdSchema>;
export type AnswerId = z.infer<typeof answerIdSchema>;
