import { defineConfig, devices } from "@playwright/test"
export default defineConfig({
  testDir: ".",
  testMatch: /.*\.spec\.ts/,
  outputDir: process.env.TRACE_OUT ?? "./out",
  workers: 1,
  reporter: [["list"], ["json"], ["html", { open: "never", outputFolder: process.env.REPORT_OUT ?? "./report" }]],
  expect: { timeout: 3000 },
  use: { baseURL: "http://localhost:5186", trace: "on", screenshot: "only-on-failure" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
})
