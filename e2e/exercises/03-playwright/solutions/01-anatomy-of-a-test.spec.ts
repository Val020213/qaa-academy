import { expect, test } from "../../../lib/test"

test("shows the page title", async ({ page }) => {
  await page.goto("/#/practice")

  await expect(page.getByTestId("playground-title")).toHaveText("Practice app")
})

test("asks for both fields when the form is empty", async ({ page }) => {
  await page.goto("/#/practice")

  await page.getByTestId("login-submit").click()

  await expect(page.getByTestId("login-error")).toHaveText(
    "Enter your email and password."
  )
})

test("welcomes the user after a valid login", async ({ page }) => {
  await page.goto("/#/practice")

  await page.getByTestId("login-email").fill("qa@example.com")
  await page.getByTestId("login-password").fill("Playwright123")
  await page.getByTestId("login-submit").click()

  await expect(page.getByTestId("login-welcome")).toContainText(
    "Signed in as qa@example.com."
  )
})
