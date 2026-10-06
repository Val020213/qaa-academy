import { recordDevtools } from "./devtools.mjs"
import { SITE } from "./lib.mjs"
await recordDevtools("devtools-elements", { panel: "elements", dock: "right" }, async ({ page, mark, dt, pause }) => {
  await page.goto(SITE + "/#/practice")
  await page.getByTestId("login-email").waitFor()
  await pause(1500); mark()
  await dt.click(200, 150)
  await pause(1200)
  await dt.search('[data-testid="login-email"]')
  await pause(5000)
})
