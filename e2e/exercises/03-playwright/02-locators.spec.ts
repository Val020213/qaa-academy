// Lesson 03-playwright/02: locators.
// Practises: getByTestId, getByLabel, getByRole, first, nth, filter and chaining.
// Change test.fixme to test, write the steps, then run only this file:
//   pnpm e2e e2e/exercises/03-playwright/02-locators.spec.ts
// Compare with solutions/02-locators.spec.ts when you are done.
import { expect, test } from "../../lib/test"

test.fixme("finds the email field by test id and by label", async ({ page }) => {
  await page.goto("/#/practice")
  // 1. Fill data-testid="login-email" with qa@example.com.
  // 2. Find the same field with page.getByLabel("Email").
  // 3. Check that this locator has the value qa@example.com.
})

test.fixme("finds a button by its role and name", async ({ page }) => {
  await page.goto("/#/practice")
  // 1. Find the button with page.getByRole("button", { name: "Sign in" }).
  // 2. Click it.
  // 3. Check that data-testid="login-error" is visible.
})

test.fixme("picks one case out of many with first and nth", async ({ page }) => {
  await page.goto("/#/practice")
  // 1. Add the case "First case": fill data-testid="cases-input",
  //    then click data-testid="cases-add".
  // 2. Add the case "Second case" the same way.
  // 3. Check that data-testid="cases-item" has a count of 2.
  // 4. Check that the first data-testid="cases-item-title" has the text "First case".
  // 5. Check that the second one (use nth(1)) has the text "Second case".
})

test.fixme("filters rows by their text", async ({ page }) => {
  await page.goto("/#/practice")
  // 1. Add three cases: "Login works", "Logout works", "Reset password".
  // 2. Check that data-testid="cases-item" has a count of 3.
  // 3. Filter the rows with filter({ hasText: "Logout" }).
  // 4. Check that the filtered locator has a count of 1.
})

test.fixme("chains locators to act inside one row", async ({ page }) => {
  await page.goto("/#/practice")
  // 1. Add the cases "First case" and "Second case".
  // 2. Find the row data-testid="cases-item" that has the text "Second case".
  // 3. Inside that row, find the checkbox with getByRole("checkbox") and check it.
  // 4. Check that data-testid="cases-counter" has the text "1 of 2 passed".
})
