import { record, SHOP } from "./lib.mjs"
import { reset, signIn } from "./shop.mjs"
await reset()
await record("shop-viewer-role", async ({ page, mark, click, type, pause }) => {
  await page.goto(SHOP + "/login")
  await page.getByTestId("login-email").waitFor()
  await pause(600); mark()
  await signIn(page, click, type, "viewer@qa-shop.test", "Viewer123!")
  await page.getByTestId("dashboard-title").waitFor({ timeout: 60000 })
  await pause(1200)
  await click(page.getByRole("link", { name: "Products" }).first())
  await page.getByTestId("products-table").waitFor()
  await pause(2500)
  await click(page.getByRole("link", { name: "Orders" }).first())
  await page.getByTestId("orders-table").waitFor()
  await pause(2500)
})
