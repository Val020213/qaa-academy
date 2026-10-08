import { expect, test } from "../../../apps/practice-shop/e2e/lib/test"
import { ProductsPage } from "../../../apps/practice-shop/e2e/lib/pages/products.page"
import { ADMIN, createProduct, loginViaApi } from "../../../apps/practice-shop/e2e/lib/fixtures/api-client"

test.beforeEach(async ({ page, request }) => {
  expect((await request.post("/api/test/reset")).ok()).toBeTruthy()
  await loginViaApi(page.request, ADMIN)
})

test("product-row-id", async ({ page }) => {
  const product = await createProduct(page.request)
  const products = new ProductsPage(page)
  await products.goto()
  await expect(products.row(product.id)).toBeVisible()

  // await products.delete(product.id)

  await expect(page.getByTestId("product-row-" + product.id)).toHaveCount(0)
})

test("products-row-id", async ({ page }) => {
  const product = await createProduct(page.request)
  const products = new ProductsPage(page)
  await products.goto()
  await expect(products.row(product.id)).toBeVisible()

  // await products.delete(product.id)

  await expect(products.row(product.id)).toHaveCount(0)
})

test("paid / payed", async ({ page }) => {
  await page.goto("/orders")
  await expect(page.getByTestId("orders-status-1005")).toHaveText("pending")

  await page.getByTestId("orders-mark-paid-1005").click()

  await expect(page.getByTestId("orders-status-1005")).toHaveText("payed")
  await expect(page.getByTestId("orders-mark-paid-1005")).toHaveCount(0)
})
