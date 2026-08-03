"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { z } from "zod";
import prisma from "../prisma";
import { PartOfSpeech } from "@/app/generated/prisma/enums";
import { wordSchema } from "../validations/words";

// ── Helper: parse form data ───────────────────────────────
function parseWordFormData(formData: FormData) {
  const rawSentences = formData
    .getAll("exampleSentences")
    .map((sentence) => sentence.toString().trim())
    .filter(Boolean);

  return {
    text: formData.get("text")?.toString().trim(),
    meaning: formData.get("meaning")?.toString().trim(),
    sinhalaWord: formData.get("sinhalaWord")?.toString().trim(),
    partOfSpeech: formData.get("partOfSpeech")?.toString(),
    notes: formData.get("notes")?.toString().trim() || undefined,
    exampleSentences: rawSentences.length > 0 ? rawSentences : undefined,
    categoryIds: formData.getAll("categoryIds").map(String),
  };
}

// ── Delete ────────────────────────────────────────────────
export async function deleteWord(wordId: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // Verify ownership before deleting
  const word = await prisma.word.findFirst({
    where: { id: wordId, userId: session.user.id },
    select: { id: true },
  });

  if (!word) return { error: "Word not found." };
  try {
    await prisma.word.delete({ where: { id: wordId } });
  } catch (error) {
    console.error("Failed to delete word:", error);

    return {
      message: "Unable to delete the word. Please try again.",
    };
  }

  revalidatePath("/words");
}

// // ── Create ────────────────────────────────────────────────
// const wordSchema = z.object({
//   text: z.string().min(1, "Word is required").max(100),
//   meaning: z.string().min(1, "Meaning is required").max(1000),
//   partOfSpeech: z.nativeEnum(PartOfSpeech),
//   exampleSentence: z.string().max(500).optional(),
//   notes: z.string().max(500).optional(),
//   categoryIds: z.array(z.string()).optional(),
// });

export async function createWord(_: unknown, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const parsed = wordSchema.safeParse(parseWordFormData(formData));

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const {
    text,
    meaning,
    sinhalaWord,
    partOfSpeech,
    notes,
    exampleSentences,
    categoryIds,
  } = parsed.data;
  try {
    await prisma.word.create({
      data: {
        text: text.trim(),
        meaning: meaning.trim(),
        sinhalaWord: sinhalaWord?.trim(),
        partOfSpeech,
        notes: notes?.trim(),
        userId: session.user.id,
        categories: categoryIds?.length
          ? { connect: categoryIds.map((id) => ({ id })) }
          : undefined,
        exampleSentences: exampleSentences?.length
          ? {
              create: exampleSentences.map((text, index) => ({
                text: text.trim(),
                order: index,
              })),
            }
          : undefined,
      },
    });
  } catch (error) {
    console.error("Failed to create word:", error);
    return {
      message: "Unable to create the word. Please try again.",
    };
  }

  revalidatePath("/words");
  redirect("/words");
}

// ── Update ────────────────────────────────────────────────
export async function updateWord(
  wordId: string,
  _: unknown,
  formData: FormData,
) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const existing = await prisma.word.findFirst({
    where: { id: wordId, userId: session.user.id },
    select: { id: true },
  });
  if (!existing) return { error: "Word not found." };

  const parsed = wordSchema.safeParse(parseWordFormData(formData));

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const {
    text,
    meaning,
    partOfSpeech,
    notes,
    exampleSentences,
    categoryIds,
    sinhalaWord,
  } = parsed.data;
  try {
    await prisma.$transaction([
      // Delete all existing sentences first, then recreate in order
      // Simpler and safer than diffing for a small list like this
      prisma.exampleSentence.deleteMany({ where: { wordId } }),

      prisma.word.update({
        where: { id: wordId },
        data: {
          text: text.trim(),
          meaning: meaning.trim(),
          sinhalaWord: sinhalaWord?.trim() ?? null,
          partOfSpeech,
          notes: notes?.trim() ?? null,
          categories: {
            set: categoryIds?.map((id) => ({ id })) ?? [],
          },
          exampleSentences: exampleSentences?.length
            ? {
                create: exampleSentences.map((text, index) => ({
                  text: text.trim(),
                  order: index,
                })),
              }
            : undefined,
        },
      }),
    ]);
  } catch (error) {
    console.error("Failed to update word:", error);

    return {
      errors: {},
      message: "Failed to update the word. Please try again.",
    };
  }

  revalidatePath("/words");
  redirect("/words");
}
