import { PartOfSpeech } from "@/app/generated/prisma/enums";
import { z } from "zod";

export const exampleSentenceSchema = z
  .string()
  .min(1)
  .max(500, "Sentence must be less than 500 characters");

export const wordSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, "Word is required")
    .max(100, "Word must be less than 100 characters"),
  meaning: z
    .string()
    .trim()
    .min(1, "Meaning is required")
    .max(1000, "Meaning must be less than 1000 characters"),
  sinhalaWord: z
    .string()
    .max(500, "Sinhala Word must be less than 500 characters")
    .optional(),
  partOfSpeech: z.nativeEnum(PartOfSpeech, {
    message: "Please select a part of speech",
  }),
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

export type WordInput = z.infer<typeof wordSchema>;
