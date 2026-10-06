// Shop helpers: reset data, sign in (by form), warm pages.
import { SHOP, sleep } from "./lib.mjs"

export const reset = () => fetch(SHOP + "/api/test/reset", { method: "POST" })

export async function signIn(page, click, type, email, password) {
  await type(page.getByTestId("login-email"), email)
  await type(page.getByTestId("login-password"), password)
  await click(page.getByTestId("login-submit"))
}

/** Signs in without filming-style motion: for set-up before mark(). */
export async function quickSignIn(page, email, password) {
  await page.goto(SHOP + "/login")
  await page.getByTestId("login-email").fill(email)
  await page.getByTestId("login-password").fill(password)
  await page.getByTestId("login-submit").click()
  await page.waitForURL(/dashboard|products/, { timeout: 90000 })
}
