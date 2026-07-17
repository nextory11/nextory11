import { z } from "zod";

export const requestIdSchema = z.string().uuid();
export const questionIdSchema = z.union([
  z.number().int().min(1).max(11),
  z.string().regex(/^n11-[a-z-]+-\d{2}$/u),
]);
export const answerIdSchema = z
  .string()
  .transform((value) => value.normalize("NFKC").trim())
  .pipe(z.union([z.enum(["A", "B", "C", "D"]), z.enum(["a", "b", "c", "d"])]));

export type RequestId = z.infer<typeof requestIdSchema>;
export type QuestionId = z.infer<typeof questionIdSchema>;
export type AnswerId = z.infer<typeof answerIdSchema>;
