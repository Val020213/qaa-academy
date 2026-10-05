import { expect, test } from "../../../lib/test"

test("finds the email field by test id and by label", async ({ page }) => {
  await page.goto("/#/practice")

  await page.getByTestId("login-email").fill("qa@example.com")

  await expect(page.getByLabel("Email")).toHaveValue("qa@example.com")
})

test("finds a button by its role and name", async ({ page }) => {
  await page.goto("/#/practice")

  await page.getByRole("button", { name: "Sign in" }).click()

  await expect(page.getByTestId("login-error")).toBeVisible()
})

test("picks one case out of many with first and nth", async ({ page }) => {
  await page.goto("/#/practice")

  for (const title of ["First case", "Second case"]) {
    await page.getByTestId("cases-input").fill(title)
    await page.getByTestId("cases-add").click()
  }

  await expect(page.getByTestId("cases-item")).toHaveCount(2)
  await expect(page.getByTestId("cases-item-title").first()).toHaveText(
    "First case"
  )
  await expect(page.getByTestId("cases-item-title").nth(1)).toHaveText(
    "Second case"
  )
})

test("filters rows by their text", async ({ page }) => {
  await page.goto("/#/practice")

  for (const title of ["Login works", "Logout works", "Reset password"]) {
    await page.getByTestId("cases-input").fill(title)
    await page.getByTestId("cases-add").click()
  }

  const rows = page.getByTestId("cases-item")
  await expect(rows).toHaveCount(3)
  await expect(rows.filter({ hasText: "Logout" })).toHaveCount(1)
})

test("chains locators to act inside one row", async ({ page }) => {
  await page.goto("/#/practice")

  for (const title of ["First case", "Second case"]) {
    await page.getByTestId("cases-input").fill(title)
    await page.getByTestId("cases-add").click()
  }

  const secondRow = page
    .getByTestId("cases-item")
    .filter({ hasText: "Second case" })
  await secondRow.getByRole("checkbox").check()

  await expect(page.getByTestId("cases-counter")).toHaveText("1 of 2 passed")
})
