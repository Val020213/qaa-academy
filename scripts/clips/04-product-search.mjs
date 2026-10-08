import { expect } from "@playwright/test"
import { record, SHOP } from "./lib.mjs"

try {
  await record("04-product-search", async ({ page, mark, type, moveTo, pause }) => {
    expect((await page.request.post(SHOP + "/api/test/reset")).ok()).toBeTruthy()
    expect((await page.request.post(SHOP + "/api/auth/login", { data: { email: "admin@qa-shop.test", password: "Admin123!" } })).ok()).toBeTruthy()
    const name = `Searchable ${crypto.randomUUID().slice(0, 8)}`
    const created = await page.request.post(SHOP + "/api/products", { data: { name, sku: "SKU-7401", price: 12.5, stock: 7, status: "draft" } })
    expect(created.status()).toBe(201)
    const product = await created.json()
    await page.goto(SHOP + "/products")
    const row = page.getByTestId(`products-row-${product.id}`)
    await expect(row).toBeVisible()
    await page.addStyleTag({ content: "body { zoom: 1.2; }" })
    await pause(800); mark()
    await moveTo(row); await pause(2000)
    await type(page.getByTestId("products-search"), name, 90)
    await expect(page.getByTestId(/^products-row-/)).toHaveCount(1)
    await expect(row).toBeVisible()
    await pause(2400)
    await moveTo(row); await pause(2400)
  })
} finally {
  await fetch(SHOP + "/api/test/reset", { method: "POST" })
}
