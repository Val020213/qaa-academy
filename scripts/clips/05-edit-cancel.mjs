import { expect } from "@playwright/test"
import { record, SHOP } from "./lib.mjs"

try {
  await record("05-edit-cancel", async ({ page, mark, click, type, moveTo, pause }) => {
    expect((await page.request.post(SHOP + "/api/test/reset")).ok()).toBeTruthy()
    expect((await page.request.post(SHOP + "/api/auth/login", { data: { email: "admin@qa-shop.test", password: "Admin123!" } })).ok()).toBeTruthy()
    const name = `Created ${crypto.randomUUID().slice(0, 8)}`
    const created = await page.request.post(SHOP + "/api/products", { data: { name, sku: "SKU-7402", price: 12.5, stock: 7, status: "draft" } })
    expect(created.status()).toBe(201)
    const product = await created.json()
    await page.goto(SHOP + "/products")
    await expect(page.getByTestId(`products-row-${product.id}`)).toBeVisible()
    await page.getByTestId(`products-edit-${product.id}`).click()
    await expect(page.getByTestId("product-name")).toHaveValue(name)
    await page.addStyleTag({ content: "body { zoom: 1.2; }" })
    await pause(900); mark()
    await moveTo(page.getByTestId("product-name")); await pause(1800)
    await click(page.getByTestId("product-name"))
    await page.keyboard.press("ControlOrMeta+A")
    await page.keyboard.type("Not saved", { delay: 140 })
    await pause(2300)
    await click(page.getByTestId("product-cancel"))
    await expect(page).toHaveURL(/\/products$/)
    await expect(page.getByTestId(`products-name-${product.id}`)).toHaveText(name)
    const saved = await page.request.get(SHOP + `/api/products/${product.id}`)
    expect((await saved.json()).name).toBe(name)
    await moveTo(page.getByTestId(`products-name-${product.id}`)); await pause(3500)
  })
} finally {
  await fetch(SHOP + "/api/test/reset", { method: "POST" })
}
