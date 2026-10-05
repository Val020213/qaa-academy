import { expect, test } from "./lib/test"

// Example specs against the Practice app. They are the model to copy in
// module 3: one behaviour per test, selectors by data-testid, and assertions
// that wait on their own (no `waitForTimeout`).

test.beforeEach(async ({ page }) => {
  await page.goto("/#/practice")
})

test.describe("login", () => {
  test("rejects wrong credentials", async ({ page }) => {
    await page.getByTestId("login-email").fill("qa@example.com")
    await page.getByTestId("login-password").fill("wrong")
    await page.getByTestId("login-submit").click()

    await expect(page.getByTestId("login-error")).toHaveText(
      "Wrong email or password."
    )
  })

  test("accepts the test credentials", async ({ page }) => {
    await page.getByTestId("login-email").fill("qa@example.com")
    await page.getByTestId("login-password").fill("Playwright123")
    await page.getByTestId("login-submit").click()

    await expect(page.getByTestId("login-welcome")).toContainText(
      "qa@example.com"
    )
  })
})

test.describe("test case list", () => {
  test("adds a case and updates the counter", async ({ page }) => {
    await page.getByTestId("cases-input").fill("Login with a blocked user")
    await page.getByTestId("cases-add").click()

    await expect(page.getByTestId("cases-item")).toHaveCount(1)
    await expect(page.getByTestId("cases-counter")).toHaveText("0 of 1 passed")
  })
})

test.describe("slow loading", () => {
  test("shows the report when loading ends", async ({ page }) => {
    await page.getByTestId("report-load").click()

    // No manual wait: `expect` retries until the text appears.
    await expect(page.getByTestId("report-result")).toContainText("12 tests")
  })
})
