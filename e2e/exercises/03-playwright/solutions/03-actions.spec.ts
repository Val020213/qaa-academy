import { expect, test } from "../../../lib/test"

test("fills the login form and clicks sign in", async ({ page }) => {
  await page.goto("/#/practice")

  await page.getByTestId("login-email").fill("qa@example.com")
  await page.getByTestId("login-password").fill("Playwright123")
  await page.getByTestId("login-submit").click()

  await expect(page.getByTestId("login-welcome")).toBeVisible()
})

test("presses Enter to add a case", async ({ page }) => {
  await page.goto("/#/practice")

  await page.getByTestId("cases-input").fill("Press Enter to add")
  await page.getByTestId("cases-input").press("Enter")

  await expect(page.getByTestId("cases-item")).toHaveCount(1)
})

test("checks and unchecks a case", async ({ page }) => {
  await page.goto("/#/practice")
  await page.getByTestId("cases-input").fill("Check me")
  await page.getByTestId("cases-add").click()

  await page.getByTestId("cases-toggle-1").check()
  await expect(page.getByTestId("cases-counter")).toHaveText("1 of 1 passed")

  await page.getByTestId("cases-toggle-1").uncheck()
  await expect(page.getByTestId("cases-counter")).toHaveText("0 of 1 passed")
})

test("selects a filter option", async ({ page }) => {
  await page.goto("/#/practice")
  for (const title of ["First case", "Second case"]) {
    await page.getByTestId("cases-input").fill(title)
    await page.getByTestId("cases-add").click()
  }
  await page.getByTestId("cases-toggle-1").check()

  await page.getByTestId("cases-filter").selectOption("passed")

  await expect(page.getByTestId("cases-item")).toHaveCount(1)
  await expect(page.getByTestId("cases-item-title")).toHaveText("First case")
})

test("clears a field", async ({ page }) => {
  await page.goto("/#/practice")
  await page.getByTestId("login-email").fill("qa@example.com")

  await page.getByTestId("login-email").clear()

  await expect(page.getByTestId("login-email")).toHaveValue("")
})
