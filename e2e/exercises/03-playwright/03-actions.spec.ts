// Lesson 03-playwright/03: actions.
// Practises: fill, click, press, check, uncheck, selectOption, clear.
// Change test.fixme to test, write the steps, then run only this file:
//   pnpm e2e e2e/exercises/03-playwright/03-actions.spec.ts
// Compare with solutions/03-actions.spec.ts when you are done.
import { expect, test } from "../../lib/test"

test.fixme("fills the login form and clicks sign in", async ({ page }) => {
  await page.goto("/#/practice")
  // 1. Fill data-testid="login-email" with qa@example.com.
  // 2. Fill data-testid="login-password" with Playwright123.
  // 3. Click data-testid="login-submit".
  // 4. Check that data-testid="login-welcome" is visible.
})

test.fixme("presses Enter to add a case", async ({ page }) => {
  await page.goto("/#/practice")
  // 1. Fill data-testid="cases-input" with "Press Enter to add".
  // 2. Press the Enter key in that same field. Do not click the Add button.
  // 3. Check that data-testid="cases-item" has a count of 1.
})

test.fixme("checks and unchecks a case", async ({ page }) => {
  await page.goto("/#/practice")
  // 1. Add one case: fill data-testid="cases-input", click data-testid="cases-add".
  // 2. Check the checkbox data-testid="cases-toggle-1".
  // 3. Check that data-testid="cases-counter" has the text "1 of 1 passed".
  // 4. Uncheck the same checkbox.
  // 5. Check that the counter has the text "0 of 1 passed".
})

test.fixme("selects a filter option", async ({ page }) => {
  await page.goto("/#/practice")
  // 1. Add the cases "First case" and "Second case".
  // 2. Check the checkbox data-testid="cases-toggle-1" (the first case).
  // 3. In the list data-testid="cases-filter", select the option "passed".
  // 4. Check that data-testid="cases-item" has a count of 1.
  // 5. Check that data-testid="cases-item-title" has the text "First case".
})

test.fixme("clears a field", async ({ page }) => {
  await page.goto("/#/practice")
  // 1. Fill data-testid="login-email" with qa@example.com.
  // 2. Clear the same field.
  // 3. Check that it has the value "" (an empty string).
})
