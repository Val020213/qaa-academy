// Needs: `playwright show-report --host 127.0.0.1 --port 5189 <report-folder>` (see README.md).
import { record } from "./lib.mjs"
await record("html-report", async ({ page, mark, click, pause }) => {
  await page.goto("http://127.0.0.1:5189/")
  await page.getByText("rejects wrong credentials").first().waitFor()
  await pause(2500); mark()
  await click(page.getByRole("link", { name: /Failed/ }))
  await pause(1800)
  await click(page.getByRole("link", { name: /^All/ }))
  await pause(1200)
  await click(page.getByText("rejects wrong credentials").first())
  await page.getByText("Test Steps").first().waitFor().catch(() => {})
  await pause(2500)
  await page.mouse.wheel(0, 350); await pause(2000)
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); await pause(2500)
})
