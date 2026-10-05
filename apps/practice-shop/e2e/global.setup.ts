import { expect, test } from "./lib/test"
import { ADMIN } from "./lib/fixtures/api-client"

const AUTH_FILE = "e2e/.auth/admin.json"

test("sign in as admin", async ({ page, request }) => {
  // Fresh data for every run, so a dirty server never breaks the suite.
  const reset = await request.post("/api/test/reset")
  expect(reset.ok()).toBeTruthy()

  await page.goto("/login")

  // The page is rendered on the server first, and React needs a moment to
  // "wake up" (hydrate). Text typed before that can be erased. So we type,
  // check the value, and try again until it sticks.
  await expect(async () => {
    await page.getByTestId("login-email").fill(ADMIN.email)
    await page.getByTestId("login-password").fill(ADMIN.password)
    await expect(page.getByTestId("login-email")).toHaveValue(ADMIN.email)
    await expect(page.getByTestId("login-password")).toHaveValue(ADMIN.password)
  }).toPass()

  await page.getByTestId("login-submit").click()
  await expect(page).toHaveURL(/\/dashboard/)

  // Save the cookies. Every other test starts with this session.
  await page.context().storageState({ path: AUTH_FILE })
})
