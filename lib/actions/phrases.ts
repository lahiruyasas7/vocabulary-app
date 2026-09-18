"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "../prisma";
import { phraseSchema } from "../validations/phrases";

// ── Helper: parse form data ───────────────────────────────
function parsePhraseFormData(formData: FormData) {
  const rawSentences = formData
    .getAll("exampleSentences")
    .map((sentence) => sentence.toString().trim())
    .filter(Boolean);

  return {
    text: formData.get("text")?.toString().trim(),
    meaning: formData.get("meaning")?.toString().trim(),
    sinhalaPhrase: formData.get("sinhalaPhrase")?.toString().trim(),
    phraseType: formData.get("phraseType")?.toString(),
    register: formData.get("register")?.toString(),
    notes: formData.get("notes")?.toString().trim() || undefined,
    exampleSentences: rawSentences.length > 0 ? rawSentences : undefined,
    categoryIds: formData.getAll("categoryIds").map(String),
  };
}

// ── Delete ────────────────────────────────────────────────
export async function deletePhrase(phraseId: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // Verify ownership before deleting
  const phrase = await prisma.phrase.findFirst({
    where: { id: phraseId, userId: session.user.id },
    select: { id: true },
  });

  if (!phrase) return { error: "Phrase not found." };
  try {
    await prisma.phrase.delete({ where: { id: phraseId } });
  } catch (error) {
    console.error("Failed to delete phrase:", error);

    return {
      message: "Unable to delete the phrase. Please try again.",
    };
  }

  revalidatePath("/phrases");
}

// ── Create ────────────────────────────────────────────────
export async function createPhrase(_: unknown, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const parsed = phraseSchema.safeParse(parsePhraseFormData(formData));

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const {
    text,
    meaning,
    sinhalaPhrase,
    phraseType,
    register,
    notes,
    exampleSentences,
    categoryIds,
  } = parsed.data;
  try {
    await prisma.phrase.create({
      data: {
        text: text.trim(),
        meaning: meaning.trim(),
        sinhalaPhrase: sinhalaPhrase?.trim(),
        phraseType,
        register,
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
    console.error("Failed to create phrase:", error);
    return {
      message: "Unable to create the phrase. Please try again.",
    };
  }

  revalidatePath("/phrases");
  redirect("/phrases");
}

// ── Update ────────────────────────────────────────────────
export async function updatePhrase(
  phraseId: string,
  _: unknown,
  formData: FormData,
) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const existing = await prisma.phrase.findFirst({
    where: { id: phraseId, userId: session.user.id },
    select: { id: true },
  });
  if (!existing) return { error: "Phrase not found." };

  const parsed = phraseSchema.safeParse(parsePhraseFormData(formData));

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const {
    text,
    meaning,
    sinhalaPhrase,
    phraseType,
    register,
    notes,
    exampleSentences,
    categoryIds,
  } = parsed.data;
  try {
    await prisma.$transaction([
      // Delete all existing sentences first, then recreate in order
      // Simpler and safer than diffing for a small list like this
      prisma.phraseExampleSentence.deleteMany({ where: { phraseId } }),

      prisma.phrase.update({
        where: { id: phraseId },
        data: {
          text: text.trim(),
          meaning: meaning.trim(),
          sinhalaPhrase: sinhalaPhrase?.trim() ?? null,
          phraseType,
          register,
          notes: notes?.trim() ?? null,
          categories: {
            set: categoryIds?.map((id) => ({ id })) ?? [],
          },
          exampleSentences: exampleSentences?.length
            ? {
                create: exampleSentences.map((text, index) => ({
                  text: text.trim(),
                  order: index,
                }))
              }
            : undefined,
        },
      }),
    ]);
  } catch (error) {
    console.error("Failed to update phrase:", error);

    return {
      errors: {},
      message: "Failed to update the phrase. Please try again.",
    };
  }

  revalidatePath("/phrases");
  redirect("/phrases");
}