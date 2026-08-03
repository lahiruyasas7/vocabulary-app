"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { z } from "zod";
import prisma from "../prisma";

const categorySchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name must be less than 50 characters")
    .regex(
      /^[a-zA-Z0-9\s&'-]+$/,
      "Only letters, numbers, spaces, &, ' and - allowed",
    ),
});

type CategoryActionState = {
  errors: {
    name?: string[];
  };
  message?: string | null;
};

// ── Create ────────────────────────────────────────────────
export async function createCategory(_: unknown, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
  });

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const name = parsed.data.name.trim();

  try {
    const existing = await prisma.category.findUnique({
      where: {
        userId_name: {
          userId: session.user.id,
          name,
        },
      },
      select: {
        id: true,
      },
    });

    if (existing) {
      return {
        errors: {
          name: ["A category with this name already exists."],
        },
        message: null,
      };
    }

    await prisma.category.create({
      data: {
        name,
        userId: session.user.id,
      },
    });
  } catch (error) {
    console.error("Failed to create category:", error);

    return {
      errors: {},
      message: "Unable to create category. Please try again.",
    };
  }

  revalidatePath("/categories");
  revalidatePath("/words"); // word filters reference categories
}

// ── Delete ────────────────────────────────────────────────
// Must THROW on error (not return) so useOptimistic rolls back correctly
export async function deleteCategory(categoryId: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const category = await prisma.category.findFirst({
    where: { id: categoryId, userId: session.user.id },
    select: { id: true, _count: { select: { words: true } } },
  });

  if (!category) throw new Error("Category not found.");
  try {
    await prisma.category.delete({ where: { id: categoryId } });
  } catch (error) {
    console.error("Failed to delete category:", error);

    return {
      errors: {},
      message: "Failed to delete the category. Please try again.",
    };
  }

  revalidatePath("/categories");
  revalidatePath("/words");
}

// ── Rename ────────────────────────────────────────────────
export async function renameCategory(
  categoryId: string,
  _: CategoryActionState | undefined,
  formData: FormData,
): Promise<CategoryActionState | undefined> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const name = parsed.data.name.trim();

  // Verify ownership
  const existing = await prisma.category.findFirst({
    where: { id: categoryId, userId: session.user.id },
    select: { id: true },
  });

  if (!existing) throw new Error("Category not found.");
  try {
    // Check name conflict (excluding self)
    const conflict = await prisma.category.findFirst({
      where: {
        userId: session.user.id,
        name,
        NOT: { id: categoryId },
      },
      select: { id: true },
    });

    if (conflict) {
      return {
        errors: { name: ["A category with this name already exists."] },
      };
    }

    await prisma.category.update({
      where: { id: categoryId },
      data: { name },
    });
  } catch (error) {
    console.error("Failed to rename category:", error);

    return {
      errors: {
        name: undefined,
      },
      message: "Unable to rename category.",
    };
  }

  revalidatePath("/categories");
  revalidatePath("/words");
}
