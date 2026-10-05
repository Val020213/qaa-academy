import { defineConfig, devices } from "@playwright/test"

// The port can be changed with QAA_E2E_PORT, to avoid another app that already
// uses 5180 (with `reuseExistingServer`, Playwright would test that other app
// without telling you).
const PORT = process.env.QAA_E2E_PORT ?? "5180"
const BASE_URL = `http://localhost:${PORT}`

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  // In CI, a forgotten `test.only` makes the run fail.
  forbidOnly: !!process.env.CI,
  // Retries only in CI: on your machine you want to see the failure at once.
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI
    ? [["github"], ["html", { open: "never" }]]
    : [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  // Playwright starts the app before the tests and stops it at the end.
  webServer: {
    command: `pnpm dev --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
})
