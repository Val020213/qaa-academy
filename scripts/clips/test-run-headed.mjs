// Replays the steps of "accepts the test credentials" (e2e/playground.spec.ts)
// at human speed, with each Playwright line shown as a caption on the page.
import { record, SITE } from "./lib.mjs"
await record("test-run-headed", async ({ page, mark, click, type, pause }) => {
  await page.goto(SITE + "/#/practice")
  await page.getByTestId("login-email").waitFor()
  await page.evaluate(() => {
    const b = document.createElement("div")
    b.id = "__cap"
    b.style.cssText = "position:fixed;left:0;right:0;bottom:0;padding:12px 20px;background:#111827;color:#fff;font:15px ui-monospace,monospace;z-index:2147483645"
    document.body.appendChild(b)
  })
  const say = (t) => page.evaluate((t) => { document.getElementById("__cap").textContent = t }, t)
  await say("await page.goto('/#/practice')")
  await pause(1600); mark()
  await say('await page.getByTestId("login-email").fill("qa@example.com")')
  await page.getByTestId("login-email").hover(); await pause(500)
  await page.getByTestId("login-email").fill("qa@example.com"); await pause(1800)
  await say('await page.getByTestId("login-password").fill("Playwright123")')
  await page.getByTestId("login-password").hover(); await pause(500)
  await page.getByTestId("login-password").fill("Playwright123"); await pause(1800)
  await say('await page.getByTestId("login-submit").click()')
  await click(page.getByTestId("login-submit")); await pause(1600)
  await say('await expect(page.getByTestId("login-welcome")).toContainText("qa@example.com")')
  await page.getByTestId("login-welcome").waitFor()
  await page.getByTestId("login-welcome").hover()
  await pause(3500)
})
