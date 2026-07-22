import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
  },
  resolve: {
    alias: {
      "@": "/src",
      "next/link": "/src/__tests__/__mocks__/next-link.tsx",
    },
  },
});
