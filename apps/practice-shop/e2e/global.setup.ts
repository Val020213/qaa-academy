import { expect, test } from "./lib/test"
import { ADMIN } from "./lib/fixtures/api-client"

const AUTH_FILE = "e2e/.auth/admin.json"

test("sign in as admin", async ({ page, request }) => {
  // Reset products and orders to the seed data before this run.
  const reset = await request.post("/api/test/reset")
  expect(reset.ok()).toBeTruthy()

  await page.goto("/login")

  // React hydrates the server-rendered form. Earlier input can be erased.
  // toPass retries filling and checking until both values match once;
  // it does not check whether hydration clears them later.
  await expect(async () => {
    await page.getByTestId("login-email").fill(ADMIN.email)
    await page.getByTestId("login-password").fill(ADMIN.password)
    await expect(page.getByTestId("login-email")).toHaveValue(ADMIN.email)
    await expect(page.getByTestId("login-password")).toHaveValue(ADMIN.password)
  }).toPass()

  await page.getByTestId("login-submit").click()
  await expect(page).toHaveURL(/\/dashboard/)

  // Save the cookies for tests that keep the default storageState.
  await page.context().storageState({ path: AUTH_FILE })
})
