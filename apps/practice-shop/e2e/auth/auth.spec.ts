import { expect, test } from "../lib/test"
import type { Page } from "../lib/test"
import { ADMIN, loginViaApi } from "../lib/fixtures/api-client"

// These tests start signed out: an empty session instead of the saved admin one.
test.use({ storageState: { cookies: [], origins: [] } })

// Same idea as in global.setup.ts: type until the value sticks,
// because React may not be ready yet when the page has just loaded.
async function fillLoginForm(page: Page, email: string, password: string) {
  await expect(async () => {
    await page.getByTestId("login-email").fill(email)
    await page.getByTestId("login-password").fill(password)
    await expect(page.getByTestId("login-email")).toHaveValue(email)
    await expect(page.getByTestId("login-password")).toHaveValue(password)
  }).toPass()
}

test.describe("Sign in", () => {
  test("a signed-out visitor is sent to the login page", async ({ page }) => {
    await page.goto("/products")

    await expect(page).toHaveURL(/\/login\?next=%2Fproducts/)
    await expect(page.getByTestId("login-card")).toBeVisible()
  })

  test("a wrong password shows an error", async ({ page }) => {
    await page.goto("/login")
    await fillLoginForm(page, ADMIN.email, "not-the-password")
    await page.getByTestId("login-submit").click()

    await expect(page.getByTestId("login-error")).toHaveText("Wrong email or password.")
  })

  test("an empty form asks for email and password", async ({ page }) => {
    await page.goto("/login")

    // A click before React is ready sends the form the old way and reloads
    // the page. So we click again until the message shows up.
    await expect(async () => {
      await page.getByTestId("login-submit").click()
      await expect(page.getByTestId("login-error")).toBeVisible({ timeout: 1_000 })
    }).toPass()
    await expect(page.getByTestId("login-error")).toHaveText("Enter your email and password.")
  })

  test("the admin lands on the dashboard and sees the name", async ({ page }) => {
    await page.goto("/login")
    await fillLoginForm(page, ADMIN.email, ADMIN.password)
    await page.getByTestId("login-submit").click()

    await expect(page).toHaveURL(/\/dashboard/)
    await expect(page.getByTestId("user-name")).toHaveText(ADMIN.name)
  })
})

test.describe("Sign out", () => {
  test("signing out returns to the login page", async ({ page }) => {
    // Log in with a NEW session just for this test. Signing out deletes the
    // session on the server, so we must not use the shared admin one.
    await loginViaApi(page.request, ADMIN)
    await page.goto("/dashboard")
    // The numbers appear only after React is running, so the button works now.
    await expect(page.getByTestId("dashboard-stats")).toBeVisible()

    await page.getByTestId("logout-button").click()

    await expect(page).toHaveURL(/\/login/)
    await expect(page.getByTestId("login-card")).toBeVisible()
  })
})
