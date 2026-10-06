// Needs: `playwright show-trace --host 127.0.0.1 --port 5187 <trace.zip>` (see README.md).
import { record } from "./lib.mjs"
await record("trace-viewer", async ({ page, mark, click, pause }) => {
  await page.goto("http://127.0.0.1:5187/")
  await page.locator(".action-title").first().waitFor()
  await pause(2500); mark()
  const act = (t) => page.locator(".action-title", { hasText: t }).first()
  await click(act('Fill "qa@example.com"')); await pause(1800)
  await click(act('Fill "wrong"')); await pause(1800)
  await click(act("Click")); await pause(1800)
  await click(page.locator(".tabbed-pane-tab-label", { hasText: "Before" }).first()); await pause(1500)
  await click(page.locator(".tabbed-pane-tab-label", { hasText: "After" }).first()); await pause(1500)
  await click(act('Expect "toHaveText"')); await pause(1800)
  await click(page.locator(".tabbed-pane-tab-label", { hasText: "Errors" })); await pause(4000)
})
