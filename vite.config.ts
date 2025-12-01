import { defineConfig } from "vitest/config";
import tailwindcss from "@tailwindcss/vite";
import type { KIT_ROUTES } from "$lib/ROUTES";
import { sveltekit } from "@sveltejs/kit/vite";
import { kitRoutes } from "vite-plugin-kit-routes";

export default defineConfig({
  plugins: [
    tailwindcss(),
    sveltekit(),
    kitRoutes<KIT_ROUTES>()
  ],
  test: {
    expect: { requireAssertions: true },
    setupFiles: ["./src/test-setup.ts"],
    projects: [
      {
        extends: "./vite.config.ts",
        test: {
          name: "client",
          environment: "jsdom",
          include: ["src/**/*.svelte.{test,spec}.{js,ts}"],
          exclude: ["src/lib/server/**"]
        }
      },
      {
        extends: "./vite.config.ts",
        test: {
          name: "server",
          environment: "node",
          include: ["src/**/*.{test,spec}.{js,ts}"],
          exclude: ["src/**/*.svelte.{test,spec}.{js,ts}"]
        }
      }
    ]
  }
});
