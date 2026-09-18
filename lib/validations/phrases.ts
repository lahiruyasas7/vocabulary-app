import { PhraseType, Register } from "@/app/generated/prisma/enums";
import { z } from "zod";

export const exampleSentenceSchema = z
  .string()
  .min(1)
  .max(500, "Sentence must be less than 500 characters");

export const phraseSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, "Phrase is required")
    .max(200, "Phrase must be less than 200 characters"),
  meaning: z
    .string()
    .trim()
    .min(1, "Meaning is required")
    .max(1000, "Meaning must be less than 1000 characters"),
  sinhalaPhrase: z
    .string()
    .max(500, "Sinhala Phrase must be less than 500 characters")
    .optional(),
  phraseType: z.nativeEnum(PhraseType, {
    message: "Please select a phrase type",
  }).optional(),
  register: z.nativeEnum(Register, {
    message: "Please select a register",
  }).optional(),
  notes: z
    .string()
    .trim()
    .max(500, "Notes must be less than 500 characters")
    .optional(),
  exampleSentences: z
    .array(exampleSentenceSchema)
    .max(10, "Maximum 10 example sentences allowed")
    .optional(),
  categoryIds: z.array(z.string()).optional(),
});

export type PhraseInput = z.infer<typeof phraseSchema>;