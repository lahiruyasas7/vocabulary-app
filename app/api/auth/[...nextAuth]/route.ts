console.log("AUTH_SECRET loaded:", !!process.env.AUTH_SECRET);
import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;
