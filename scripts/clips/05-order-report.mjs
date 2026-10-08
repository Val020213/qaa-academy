import { recordTool } from "./tool-session.mjs"
await recordTool("05-order-report", async ({ page, mark, click, pause }) => {
  await page.goto("http://127.0.0.1:5189/")
  await page.getByText("paid / payed", { exact: true }).waitFor()
  await page.addStyleTag({ content: "body { zoom: 1.5; }" })
  await pause(900); mark()
  await pause(1800)
  await click(page.getByText("paid / payed", { exact: true }))
  await pause(5000)
  await page.mouse.wheel(0, 320); await pause(4500)
  await page.mouse.wheel(0, 430); await pause(3500)
})
