import { recordTool } from "./tool-session.mjs"
await recordTool("04-review-mutation", async ({ page, mark, click, pause }) => {
  const report = "http://127.0.0.1:5189/"
  const zoom = () => page.addStyleTag({ content: "body { zoom: 1.5; }" })
  await page.goto(report)
  await page.getByText("product-row-id", { exact: true }).waitFor()
  await zoom(); await pause(900); mark()
  await pause(1800)
  await click(page.getByText("product-row-id", { exact: true }))
  await click(page.getByText(/Expect.*toHaveCount/).first())
  await page.mouse.wheel(0, 150); await pause(4700)
  await page.goto(report); await zoom(); await pause(1500)
  await click(page.getByText("products-row-id", { exact: true }))
  await pause(3000)
  await page.mouse.wheel(0, 230); await pause(4500)
})
