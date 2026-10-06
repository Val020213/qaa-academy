import { record, SITE } from "./lib.mjs"
await record("auto-wait-report", async ({ page, mark, click, moveTo, pause }) => {
  await page.goto(SITE + "/#/practice")
  const btn = page.getByTestId("report-load")
  await btn.waitFor()
  await btn.scrollIntoViewIfNeeded()
  await pause(1800); mark()
  await moveTo(btn); await pause(2500)
  await click(btn)
  await page.getByTestId("report-result").waitFor()
  await pause(5500)
})
