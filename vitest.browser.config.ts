import { defineConfig } from 'vitest/config'
import { webdriverio } from '@vitest/browser-webdriverio'
import tailwindcss from '@tailwindcss/vite'
import type { KIT_ROUTES } from '$lib/ROUTES'
import { sveltekit } from '@sveltejs/kit/vite'
import { kitRoutes } from 'vite-plugin-kit-routes'

export default defineConfig({
  plugins: [
    tailwindcss(),
    sveltekit(),
    kitRoutes<KIT_ROUTES>()
  ],
  test: {
    browser: {
      enabled: true,
      provider: webdriverio(),
      // https://vitest.dev/config/browser/webdriverio
      instances: [
        { browser: 'chrome' },
        { browser: 'firefox' },
      ],
    },
  },
})
