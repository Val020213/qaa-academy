// Lesson 03-playwright/01: anatomy of a test.
// Practises: test(), page.goto, one action, one assertion.
// Change test.fixme to test, write the steps, then run only this file:
//   pnpm e2e e2e/exercises/03-playwright/01-anatomy-of-a-test.spec.ts
// Compare with solutions/01-anatomy-of-a-test.spec.ts when you are done.
import { expect, test } from "../../lib/test"

test.fixme("shows the page title", async ({ page }) => {
  await page.goto("/#/practice")
  // 1. Use expect with the element data-testid="playground-title".
  // 2. Check that its text is exactly "Practice app".
})

test.fixme("asks for both fields when the form is empty", async ({ page }) => {
  await page.goto("/#/practice")
  // 1. Click the button data-testid="login-submit" without typing anything.
  // 2. Check that data-testid="login-error" has the text
  //    "Enter your email and password."
})

test.fixme("welcomes the user after a valid login", async ({ page }) => {
  await page.goto("/#/practice")
  // 1. Fill data-testid="login-email" with qa@example.com.
  // 2. Fill data-testid="login-password" with Playwright123.
  // 3. Click data-testid="login-submit".
  // 4. Check that data-testid="login-welcome" contains
  //    "Signed in as qa@example.com."
})
