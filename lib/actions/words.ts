"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { z } from "zod";
import prisma from "../prisma";
import { PartOfSpeech } from "@/app/generated/prisma/enums";

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

  await prisma.word.delete({ where: { id: wordId } });
  revalidatePath("/words");
}

// ── Create ────────────────────────────────────────────────
const wordSchema = z.object({
  text: z.string().min(1, "Word is required").max(100),
  meaning: z.string().min(1, "Meaning is required").max(1000),
  partOfSpeech: z.nativeEnum(PartOfSpeech),
  exampleSentence: z.string().max(500).optional(),
  notes: z.string().max(500).optional(),
  categoryIds: z.array(z.string()).optional(),
});

export async function createWord(_: unknown, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const raw = {
    text: formData.get("text"),
    meaning: formData.get("meaning"),
    partOfSpeech: formData.get("partOfSpeech"),
    exampleSentence: formData.get("exampleSentence") || undefined,
    notes: formData.get("notes") || undefined,
    categoryIds: formData.getAll("categoryIds"),
  };

  const parsed = wordSchema.safeParse(raw);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { text, meaning, partOfSpeech, exampleSentence, notes, categoryIds } =
    parsed.data;

  await prisma.word.create({
    data: {
      text: text.trim(),
      meaning: meaning.trim(),
      partOfSpeech,
      exampleSentence: exampleSentence?.trim(),
      notes: notes?.trim(),
      userId: session.user.id,
      categories: categoryIds?.length
        ? { connect: categoryIds.map((id) => ({ id })) }
        : undefined,
    },
  });

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

  const raw = {
    text: formData.get("text"),
    meaning: formData.get("meaning"),
    partOfSpeech: formData.get("partOfSpeech"),
    exampleSentence: formData.get("exampleSentence") || undefined,
    notes: formData.get("notes") || undefined,
    categoryIds: formData.getAll("categoryIds"),
  };

  const parsed = wordSchema.safeParse(raw);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { text, meaning, partOfSpeech, exampleSentence, notes, categoryIds } =
    parsed.data;

  await prisma.word.update({
    where: { id: wordId },
    data: {
      text: text.trim(),
      meaning: meaning.trim(),
      partOfSpeech,
      exampleSentence: exampleSentence?.trim() ?? null,
      notes: notes?.trim() ?? null,
      categories: {
        set: categoryIds?.map((id) => ({ id })) ?? [],
      },
    },
  });

  revalidatePath("/words");
  redirect("/words");
}
