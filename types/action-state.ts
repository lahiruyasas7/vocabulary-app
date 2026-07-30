import { LoginInput, RegisterInput } from "@/lib/validations/auth";

export type ActionState<T extends object> = {
  errors: Partial<Record<keyof T, string[]>>;
  message: string | null;
};

export type RegisterActionState = ActionState<RegisterInput>;

export type LoginActionState = ActionState<LoginInput>;
