import { expect } from "@playwright/test"
import { record, SHOP } from "./lib.mjs"

try {
  await record("05-order-cancel", async ({ page, mark, click, moveTo, pause }) => {
    expect((await page.request.post(SHOP + "/api/test/reset")).ok()).toBeTruthy()
    expect((await page.request.post(SHOP + "/api/auth/login", { data: { email: "admin@qa-shop.test", password: "Admin123!" } })).ok()).toBeTruthy()
    await page.goto(SHOP + "/orders")
    const row = page.getByTestId("orders-row-1001")
    await expect(page.getByTestId("orders-status-1001")).toHaveText("pending")
    await page.addStyleTag({ content: "body { zoom: 1.2; }" })
    await row.scrollIntoViewIfNeeded()
    await pause(800); mark()
    await moveTo(page.getByTestId("orders-status-1001")); await pause(2400)
    await moveTo(page.getByTestId("orders-mark-paid-1001")); await pause(1700)
    await click(page.getByTestId("orders-cancel-1001"))
    await expect(page.getByTestId("orders-status-1001")).toHaveText("cancelled")
    await expect(page.getByTestId("orders-cancel-1001")).toHaveCount(0)
    await expect(page.getByTestId("orders-mark-paid-1001")).toHaveCount(0)
    await moveTo(page.getByTestId("orders-status-1001")); await pause(3500)
    await moveTo(row); await pause(1700)
  })
} finally {
  await fetch(SHOP + "/api/test/reset", { method: "POST" })
}
