// Lesson 03-playwright/07: describe and hooks.
// Practises: test.describe, test.beforeEach, isolation between tests.
// Change test.fixme to test, write the steps, then run only this file:
//   pnpm e2e e2e/exercises/03-playwright/07-describe-and-hooks.spec.ts
// Compare with solutions/07-describe-and-hooks.spec.ts when you are done.
// The groups and the beforeEach hooks are already here. Write the tests.
import { expect, test } from "../../lib/test"

test.describe("login", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/#/practice")
  })

  test.fixme("shows an error for a wrong password", async ({ page }) => {
    // 1. Fill data-testid="login-email" with qa@example.com.
    // 2. Fill data-testid="login-password" with wrong.
    // 3. Click data-testid="login-submit".
    // 4. Check that data-testid="login-error" has the text "Wrong email or password."
  })

  test.fixme("signing out shows the form again", async ({ page }) => {
    // 1. Log in with qa@example.com and Playwright123.
    // 2. Check that data-testid="login-form" is hidden.
    // 3. Click data-testid="login-logout".
    // 4. Check that data-testid="login-form" is visible.
  })
})

test.describe("test case list", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/#/practice")
  })

  test.fixme("starts empty", async ({ page }) => {
    // 1. Check that data-testid="cases-empty" is visible.
    // 2. Check that data-testid="cases-counter" has the text "0 of 0 passed".
  })

  test.fixme("adds a case", async ({ page }) => {
    // 1. Fill data-testid="cases-input" with "Isolation check" and click data-testid="cases-add".
    // 2. Check that data-testid="cases-item" has a count of 1.
  })

  test.fixme("starts empty again, even after another test added a case", async ({
    page,
  }) => {
    // 1. Do nothing else: the page is new for this test.
    // 2. Check that data-testid="cases-item" has a count of 0.
  })
})
