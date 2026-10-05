import { expect, test } from "../../../lib/test"

test("the login error is hidden, then visible", async ({ page }) => {
  await page.goto("/#/practice")
  await expect(page.getByTestId("login-error")).toBeHidden()

  await page.getByTestId("login-submit").click()

  await expect(page.getByTestId("login-error")).toBeVisible()
  await expect(page.getByTestId("login-error")).toHaveText(
    "Enter your email and password."
  )
})

test("the report button is disabled while the report loads", async ({
  page,
}) => {
  await page.goto("/#/practice")
  await page.getByTestId("report-load").click()

  await expect(page.getByTestId("report-load")).toBeDisabled()
  await expect(page.getByTestId("report-loading")).toBeVisible()

  await expect(page.getByTestId("report-result")).toContainText("12 tests")
  await expect(page.getByTestId("report-load")).toBeEnabled()
  await expect(page.getByTestId("report-loading")).toBeHidden()
})

test("a passed case is checked and has the passed status", async ({ page }) => {
  await page.goto("/#/practice")
  await page.getByTestId("cases-input").fill("Check me")
  await page.getByTestId("cases-add").click()

  await page.getByTestId("cases-toggle-1").check()

  await expect(page.getByTestId("cases-toggle-1")).toBeChecked()
  await expect(page.getByTestId("cases-item")).toHaveAttribute(
    "data-status",
    "passed"
  )
})

test("the page has the right URL and keeps what you type", async ({ page }) => {
  await page.goto("/#/practice")

  await expect(page).toHaveURL(/#\/practice/)

  await page.getByTestId("login-email").fill("qa@example.com")
  await expect(page.getByTestId("login-email")).toHaveValue("qa@example.com")
})

test("deleting the last case shows the empty message", async ({ page }) => {
  await page.goto("/#/practice")
  await page.getByTestId("cases-input").fill("Delete me")
  await page.getByTestId("cases-add").click()
  await expect(page.getByTestId("cases-empty")).toBeHidden()

  await page.getByTestId("cases-delete-1").click()

  await expect(page.getByTestId("cases-item")).toHaveCount(0)
  await expect(page.getByTestId("cases-empty")).toBeVisible()
})
