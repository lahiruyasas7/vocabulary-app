import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema } from "./auth";

describe("loginSchema", () => {
  it("accepts valid login data", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "password123",
    });

    expect(result.success).toBe(true);
  });

  it("rejects an empty email", () => {
    const result = loginSchema.safeParse({
      email: "",
      password: "password123",
    });

    expect(result.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const result = loginSchema.safeParse({
      email: "invalid-email",
      password: "password123",
    });

    expect(result.success).toBe(false);
  });

  it("rejects a password shorter than 6 characters", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "12345",
    });

    expect(result.success).toBe(false);
  });

  it("accepts a password with exactly 6 characters", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "123456",
    });

    expect(result.success).toBe(true);
  });
});

describe("registerSchema", () => {
  const validInput = {
    name: "Lahiru",
    email: "lahiru@example.com",
    password: "password123",
    confirmPassword: "password123",
  };

  it("accepts valid registration data", () => {
    const result = registerSchema.safeParse(validInput);

    expect(result.success).toBe(true);
  });

  it("rejects passwords that do not match", () => {
    const result = registerSchema.safeParse({
      ...validInput,
      confirmPassword: "different123",
    });

    expect(result.success).toBe(false);
  });

  it("rejects a password shorter than 6 characters", () => {
    const result = registerSchema.safeParse({
      ...validInput,
      password: "12345",
      confirmPassword: "12345",
    });

    expect(result.success).toBe(false);
  });

  it("accepts a password with exactly 72 characters", () => {
    const password = "a".repeat(72);

    const result = registerSchema.safeParse({
      ...validInput,
      password,
      confirmPassword: password,
    });

    expect(result.success).toBe(true);
  });

  it("rejects a password longer than 72 characters", () => {
    const password = "a".repeat(73);

    const result = registerSchema.safeParse({
      ...validInput,
      password,
      confirmPassword: password,
    });

    expect(result.success).toBe(false);
  });
});