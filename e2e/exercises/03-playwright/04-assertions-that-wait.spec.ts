// Lesson 03-playwright/04: assertions that wait.
// Practises: toBeVisible, toBeHidden, toBeDisabled, toBeEnabled, toBeChecked,
// toHaveAttribute, toHaveURL, toHaveValue, toHaveCount.
// Change test.fixme to test, write the steps, then run only this file:
//   pnpm e2e e2e/exercises/03-playwright/04-assertions-that-wait.spec.ts
// Compare with solutions/04-assertions-that-wait.spec.ts when you are done.
// Do not use page.waitForTimeout. The assertions wait for you.
import { expect, test } from "../../lib/test"

test.fixme("the login error is hidden, then visible", async ({ page }) => {
  await page.goto("/#/practice")
  // 1. Check that data-testid="login-error" is hidden.
  // 2. Click data-testid="login-submit" without typing anything.
  // 3. Check that the error is visible.
  // 4. Check that it has the text "Enter your email and password."
})

test.fixme("the report button is disabled while the report loads", async ({
  page,
}) => {
  await page.goto("/#/practice")
  // 1. Click data-testid="report-load".
  // 2. Check that data-testid="report-load" is disabled.
  // 3. Check that data-testid="report-loading" is visible.
  // 4. Check that data-testid="report-result" contains "12 tests".
  // 5. Check that data-testid="report-load" is enabled again.
  // 6. Check that data-testid="report-loading" is hidden.
})

test.fixme("a passed case is checked and has the passed status", async ({
  page,
}) => {
  await page.goto("/#/practice")
  // 1. Add one case: fill data-testid="cases-input", click data-testid="cases-add".
  // 2. Check the checkbox data-testid="cases-toggle-1".
  // 3. Check that this checkbox is checked.
  // 4. Check that data-testid="cases-item" has the attribute data-status
  //    with the value "passed".
})

test.fixme("the page has the right URL and keeps what you type", async ({
  page,
}) => {
  await page.goto("/#/practice")
  // 1. Check that the page URL matches the pattern /#\/practice/.
  // 2. Fill data-testid="login-email" with qa@example.com.
  // 3. Check that the field has the value qa@example.com.
})

test.fixme("deleting the last case shows the empty message", async ({ page }) => {
  await page.goto("/#/practice")
  // 1. Add one case called "Delete me".
  // 2. Check that data-testid="cases-empty" is hidden.
  // 3. Click data-testid="cases-delete-1".
  // 4. Check that data-testid="cases-item" has a count of 0.
  // 5. Check that data-testid="cases-empty" is visible.
})
