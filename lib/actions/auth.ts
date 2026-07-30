"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn, signOut } from "@/lib/auth";
import { registerSchema } from "@/lib/validations/auth";
import prisma from "../prisma";

// ── Register ──────────────────────────────────────────────
export async function registerUser(_: unknown, formData: FormData) {
  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  };

  const parsed = registerSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      message: null,
    };
  }

  const { name, email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true },
  });

  if (existing) {
    return {
      errors: { email: ["This email is already registered."] },
      message: null,
    };
  }

  // bcrypt salt rounds: 12 is the industry standard for 2024+
  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    },
  });

  redirect("/login?registered=true");
}

// ── Login ─────────────────────────────────────────────────
export async function loginUser(_: unknown, formData: FormData) {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { message: "Invalid email or password." };
        default:
          return { message: "Something went wrong. Please try again." };
      }
    }
    throw error; // rethrow unknown errors
  }

  redirect("/words");
}

// ── Logout ────────────────────────────────────────────────
export async function logoutUser() {
  await signOut({ redirectTo: "/login" });
}
