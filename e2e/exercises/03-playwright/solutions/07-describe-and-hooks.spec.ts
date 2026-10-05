import { expect, test } from "../../../lib/test"

test.describe("login", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/#/practice")
  })

  test("shows an error for a wrong password", async ({ page }) => {
    await page.getByTestId("login-email").fill("qa@example.com")
    await page.getByTestId("login-password").fill("wrong")
    await page.getByTestId("login-submit").click()

    await expect(page.getByTestId("login-error")).toHaveText(
      "Wrong email or password."
    )
  })

  test("signing out shows the form again", async ({ page }) => {
    await page.getByTestId("login-email").fill("qa@example.com")
    await page.getByTestId("login-password").fill("Playwright123")
    await page.getByTestId("login-submit").click()
    await expect(page.getByTestId("login-form")).toBeHidden()

    await page.getByTestId("login-logout").click()

    await expect(page.getByTestId("login-form")).toBeVisible()
  })
})

test.describe("test case list", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/#/practice")
  })

  test("starts empty", async ({ page }) => {
    await expect(page.getByTestId("cases-empty")).toBeVisible()
    await expect(page.getByTestId("cases-counter")).toHaveText("0 of 0 passed")
  })

  test("adds a case", async ({ page }) => {
    await page.getByTestId("cases-input").fill("Isolation check")
    await page.getByTestId("cases-add").click()

    await expect(page.getByTestId("cases-item")).toHaveCount(1)
  })

  test("starts empty again, even after another test added a case", async ({
    page,
  }) => {
    // Each test gets a new page, so the case from the test above is gone.
    await expect(page.getByTestId("cases-item")).toHaveCount(0)
  })
})
