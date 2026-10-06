import { record, SITE } from "./lib.mjs"
await record("strict-mode-rows", async ({ page, mark, click, type, moveTo, pause }) => {
  await page.goto(SITE + "/#/practice")
  await page.getByTestId("cases-input").waitFor()
  await page.getByTestId("cases-input").scrollIntoViewIfNeeded()
  await pause(600); mark()
  for (const t of ["Login works", "Logout works", "Reset password"]) {
    await type(page.getByTestId("cases-input"), t, 45)
    await click(page.getByTestId("cases-add"))
    await pause(700)
  }
  await pause(500)
  const rows = page.getByTestId("cases-item")
  for (let i = 0; i < 3; i++) {
    await moveTo(rows.nth(i), { steps: 20 })
    await rows.nth(i).evaluate((el) => { el.style.outline = "3px solid #ef4444"; el.style.background = "rgba(239,68,68,.1)" })
    await pause(1000)
  }
  await pause(800)
})
