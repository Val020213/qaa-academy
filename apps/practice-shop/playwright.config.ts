import { defineConfig, devices } from "@playwright/test"

const PORT = process.env.SHOP_E2E_PORT ?? "5190"
const baseURL = `http://localhost:${PORT}`

export default defineConfig({
  testDir: "./e2e",

  // The app keeps its data in memory and every test shares it,
  // so tests run one at a time, in one worker.
  fullyParallel: false,
  workers: 1,

  // Fail the CI build if someone forgets a test.only.
  forbidOnly: !!process.env.CI,
  // Retry only on CI, so a flaky test is never hidden on your machine.
  retries: process.env.CI ? 2 : 0,

  reporter: [["list"], ["html", { open: "never" }]],

  timeout: 30_000,
  expect: { timeout: 5_000 },

  use: {
    baseURL,
    // Keep the trace and the screenshot only when a test fails.
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    // Every test starts already signed in as admin (saved by the setup project).
    storageState: "e2e/.auth/admin.json",
  },

  projects: [
    {
      // Runs first: resets the data and signs in. It must NOT load the
      // session file, because that file does not exist yet. Plain
      // "undefined" would keep the default above, so we pass an empty session.
      name: "setup",
      testMatch: /global\.setup\.ts/,
      use: { storageState: { cookies: [], origins: [] } },
    },
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      // Wait for the setup project to finish before running any test.
      dependencies: ["setup"],
    },
  ],

  webServer: {
    command: `pnpm dev --port ${PORT}`,
    url: baseURL,
    // Locally, use the dev server that is already running. On CI, start a new one.
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
