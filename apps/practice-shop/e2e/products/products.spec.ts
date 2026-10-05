import { expect, test } from "../lib/test"
import { createProduct } from "../lib/fixtures/api-client"
import { uniqueName, uniqueSku } from "../lib/helpers"
import { ProductsPage } from "../lib/pages/products.page"

test.describe("Products list", () => {
  test("shows 10 rows on the first page and the total count", async ({ page, request }) => {
    // Other tests add products, so we ask the API for the real total.
    const total = ((await (await request.get("/api/products")).json()) as { total: number }).total
    const products = new ProductsPage(page)

    await products.goto()

    await expect(products.rows).toHaveCount(10)
    await expect(products.count).toHaveText(`${total} products`)
  })

  test("searching by name narrows the list", async ({ page, request }) => {
    const product = await createProduct(request, { name: uniqueName("Searchable") })
    const products = new ProductsPage(page)
    await products.goto()
    // The new product is the newest, so it is on page 1. When its row is
    // visible, the page is loaded and ready for typing.
    await expect(products.row(product.id)).toBeVisible()

    await products.search(product.name)

    await expect(products.rows).toHaveCount(1)
    await expect(products.rowByName(product.name)).toBeVisible()
    await expect(products.count).toHaveText("1 product")
  })

  test("the status filter shows only products with that status", async ({ page, request }) => {
    const prefix = uniqueName("Filter")
    const archived = await createProduct(request, { name: `${prefix} old`, status: "archived" })
    const active = await createProduct(request, { name: `${prefix} new`, status: "active" })
    const products = new ProductsPage(page)
    await products.goto()
    await expect(products.row(active.id)).toBeVisible()

    await products.search(prefix)
    await expect(products.row(archived.id)).toBeVisible()
    await products.filterByStatus("archived")

    await expect(products.row(archived.id)).toBeVisible()
    await expect(products.row(active.id)).toHaveCount(0)
  })
})

test.describe("Create product", () => {
  test("a new product appears at the top of the list", async ({ page }) => {
    const name = uniqueName("Created")
    const products = new ProductsPage(page)
    await products.goto()
    await expect(products.table).toBeVisible()

    // We arrive by clicking, not by typing the address, so React is ready.
    await products.newButton.click()
    await page.getByTestId("product-name").fill(name)
    await page.getByTestId("product-sku").fill(uniqueSku())
    await page.getByTestId("product-price").fill("12.50")
    await page.getByTestId("product-stock").fill("7")
    await page.getByTestId("product-status").selectOption("active")
    await page.getByTestId("product-save").click()

    await expect(page).toHaveURL(/\/products$/)
    await expect(products.rows.first()).toContainText(name)
  })

  test("an empty form shows an error under each field", async ({ page }) => {
    const products = new ProductsPage(page)
    await products.goto()
    await expect(products.table).toBeVisible()

    await products.newButton.click()
    await page.getByTestId("product-save").click()

    await expect(page.getByTestId("product-name-error")).toHaveText(
      "Name must have at least 3 characters."
    )
    await expect(page.getByTestId("product-sku-error")).toHaveText("SKU must look like SKU-0001.")
    await expect(page.getByTestId("product-price-error")).toHaveText("Price must be greater than 0.")
    await expect(page.getByTestId("product-stock-error")).toHaveText(
      "Stock must be a whole number, 0 or more."
    )
  })
})

test.describe("Delete product", () => {
  test("confirming in the dialog removes the product", async ({ page, request }) => {
    const product = await createProduct(request)
    const products = new ProductsPage(page)
    await products.goto()
    await expect(products.row(product.id)).toBeVisible()

    await products.delete(product.id)

    await expect(products.row(product.id)).toHaveCount(0)
    await expect(products.message).toContainText(product.name)
  })

  test("cancelling in the dialog keeps the product", async ({ page, request }) => {
    const product = await createProduct(request)
    const products = new ProductsPage(page)
    await products.goto()
    await expect(products.row(product.id)).toBeVisible()

    await products.openDeleteDialog(product.id)
    await expect(products.confirmDialog).toBeVisible()
    await products.cancelDeleteButton.click()

    await expect(products.confirmDialog).toBeHidden()
    await expect(products.row(product.id)).toBeVisible()
  })
})
