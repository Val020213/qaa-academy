import { recordDevtools } from "./devtools.mjs"
import { SHOP } from "./lib.mjs"
await recordDevtools("devtools-network", { panel: "network", dock: "bottom" }, async ({ page, mark, dt, pause }) => {
  await page.goto(SHOP + "/login")
  await page.getByTestId("login-email").waitFor()
  await dt.click(303, 346)
  await pause(2000); mark()
  await page.getByTestId("login-email").click()
  await page.keyboard.type("admin@qa-shop.test", { delay: 60 })
  await page.getByTestId("login-password").click()
  await page.keyboard.type("wrong-password", { delay: 60 })
  await pause(900)
  await page.getByTestId("login-submit").click()
  await page.getByTestId("login-error").waitFor()
  await pause(2500)
  await dt.click(300, 400)
  for (const ch of "login") { await dt.send("Input.insertText", { text: ch }); await pause(120) }
  await pause(1500)
  await dt.click(60, 552)
  await pause(5000)
})
