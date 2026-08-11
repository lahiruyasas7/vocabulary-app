import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    env: {
      DATABASE_URL: process.env.DATABAE_URL!,
      AUTH_SECRET: "Srgf5KhbBAQqc4YtvDYisLT7EwGXLMQL",
    },
    setupFiles: ["./lib/test-setup.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});