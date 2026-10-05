import { expect, test } from "./lib/test"

// The numbers come from a slow endpoint (about 1.2 seconds).
// We never sleep: the assertions wait for us.
test.describe("Dashboard", () => {
  test("shows a loading message first", async ({ page }) => {
    await page.goto("/dashboard")

    await expect(page.getByTestId("dashboard-loading")).toBeVisible()
    await expect(page.getByTestId("dashboard-stats")).toHaveCount(0)
  })

  test("shows the numbers when they arrive", async ({ page }) => {
    await page.goto("/dashboard")

    await expect(page.getByTestId("dashboard-stats")).toBeVisible()
    await expect(page.getByTestId("dashboard-loading")).toBeHidden()
    await expect(page.getByTestId("stat-products")).toHaveText(/^\d+$/)
    await expect(page.getByTestId("stat-low-stock")).toHaveText(/^\d+$/)
    await expect(page.getByTestId("stat-pending-orders")).toHaveText(/^\d+$/)
    await expect(page.getByTestId("stat-revenue")).toHaveText(/^\$\d+\.\d{2}$/)
  })
})
