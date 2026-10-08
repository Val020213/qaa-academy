import { defineConfig, devices } from "@playwright/test"
export default defineConfig({
  testDir: ".",
  testMatch: /recording\.spec\.ts/,
  workers: 1,
  retries: 0,
  outputDir: process.env.TRACE_OUT ?? "./test-output",
  reporter: [["list"], ["json"], ["html", { open: "never", outputFolder: process.env.REPORT_OUT ?? "./report" }]],
  expect: { timeout: 5_000 },
  use: { ...devices["Desktop Chrome"], baseURL: "http://localhost:5196", trace: "on", screenshot: "only-on-failure" },
})
