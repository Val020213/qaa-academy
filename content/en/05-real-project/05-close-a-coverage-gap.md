---
title: Close a coverage gap
summary: Plan a new spec from a gap in COVERAGE.md, write it step by step, then take on the remaining gaps yourself.
duration: 45 min
---

## Goal

- Plan a spec in plain language before you write code.
- Choose the data setup for each scenario.
- Write a complete spec file for "editing a product".
- Take the remaining gaps as your own work.

## Plan first, code second

Do not open the editor first. Write the scenarios in plain language. Each scenario is one test. Each one says what the user sees.

The gap is "Editing a product". Open the app and edit a product by hand. Then write:

1. The edit form starts with the current values of the product.
2. Saving a new name and status updates the list.
3. An invalid price shows an error and the product keeps its old data.
4. Cancel leaves the product unchanged.

## Decide the data

Each test needs a product to edit. Do not edit a seeded product. Another test or a later run may depend on it. Create a new one for each test.

Use the UI only for the thing under test. Here the thing under test is the edit form. So create the product through the API with `createProduct`. It is faster and steadier than filling the "New product" form.

`createProduct(request, overrides)` returns the product with its `id`. Pass `overrides` to set fields, such as `{ price: 25 }`.

## Decide how to reach the form

You could open `/products/<id>` directly. But the page is rendered on the server first, and React needs a moment to be ready. Typing too early can be erased. The suite solves this in a simple way. It starts on the list, waits for the row, and then clicks **Edit**. A click moves inside the app, so React is already ready.

The new product is the newest, so it is on page 1 of the list.

## Write the spec

Create the file `apps/practice-shop/e2e/products/product-edit.spec.ts`. Notice what it reuses: `createProduct`, `uniqueName` and the `ProductsPage` Page Object.

```ts
import { expect, test } from "../lib/test"
import { createProduct } from "../lib/fixtures/api-client"
import { uniqueName } from "../lib/helpers"
import { ProductsPage } from "../lib/pages/products.page"

test.describe("Edit product", () => {
  test("the form starts with the current values", async ({ page, request }) => {
    const product = await createProduct(request, { price: 25, stock: 4, status: "draft" })
    const products = new ProductsPage(page)
    await products.goto()
    await expect(products.row(product.id)).toBeVisible()

    await page.getByTestId(`products-edit-${product.id}`).click()

    await expect(page.getByTestId("product-form-title")).toHaveText("Edit product")
    await expect(page.getByTestId("product-name")).toHaveValue(product.name)
    await expect(page.getByTestId("product-sku")).toHaveValue(product.sku)
    await expect(page.getByTestId("product-price")).toHaveValue("25")
    await expect(page.getByTestId("product-stock")).toHaveValue("4")
    await expect(page.getByTestId("product-status")).toHaveValue("draft")
  })

  test("saving a new name and status updates the list", async ({ page, request }) => {
    const product = await createProduct(request, { status: "active" })
    const newName = uniqueName("Renamed")
    const products = new ProductsPage(page)
    await products.goto()
    await expect(products.row(product.id)).toBeVisible()

    await page.getByTestId(`products-edit-${product.id}`).click()
    await page.getByTestId("product-name").fill(newName)
    await page.getByTestId("product-status").selectOption("archived")
    await page.getByTestId("product-save").click()

    await expect(page).toHaveURL(/\/products$/)
    await expect(page.getByTestId(`products-name-${product.id}`)).toHaveText(newName)
    await expect(page.getByTestId(`products-status-${product.id}`)).toHaveText("archived")
  })

  test("an invalid price shows an error and keeps the old data", async ({ page, request }) => {
    const product = await createProduct(request, { price: 30 })
    const products = new ProductsPage(page)
    await products.goto()
    await expect(products.row(product.id)).toBeVisible()

    await page.getByTestId(`products-edit-${product.id}`).click()
    await page.getByTestId("product-price").fill("0")
    await page.getByTestId("product-save").click()

    await expect(page.getByTestId("product-price-error")).toHaveText("Price must be greater than 0.")
    await expect(page).toHaveURL(new RegExp(`/products/${product.id}$`))

    const saved = await request.get(`/api/products/${product.id}`)
    expect(((await saved.json()) as { price: number }).price).toBe(30)
  })

  test("cancel leaves the product unchanged", async ({ page, request }) => {
    const product = await createProduct(request)
    const products = new ProductsPage(page)
    await products.goto()
    await expect(products.row(product.id)).toBeVisible()

    await page.getByTestId(`products-edit-${product.id}`).click()
    await page.getByTestId("product-name").fill("Not saved")
    await page.getByTestId("product-cancel").click()

    await expect(page).toHaveURL(/\/products$/)
    await expect(page.getByTestId(`products-name-${product.id}`)).toHaveText(product.name)
  })
})
```

## Read it with care

- Every test creates its own product. No test depends on another.
- Each test waits for `products.row(product.id)` before it clicks. This is the web-first wait for "the page is ready".
- The third test checks the data through the API, not only the screen. The form stays on screen after an error. The screen cannot tell you whether the server saved anything. The API can.
- No `waitForTimeout` anywhere.

Run it twice. Then update `COVERAGE.md`: add a Products row for editing, and delete "Editing a product." from the gaps.

## Your gaps

Pick one gap at a time. Plan the scenarios in words first. Each hint is a direction, not a solution.

- **Pagination.** The seed has 24 products, and other tests add more. Do not hard-code the number of pages. Look at the test ids `products-page`, `products-next-page` and `products-prev-page`. On page 1, which button is disabled?
- **Duplicate SKU.** Create a product through the API. Then try to create another with the same SKU in the form. Find the error text under the SKU field.
- **Shipped order.** A paid order can be marked as shipped. The seeded paid orders are 1002, 1006 and 1010. Check which are free. What buttons does a shipped order have?
- **Empty order filter.** No status is empty in the seed data, and orders only move forward. You cannot empty a status without breaking other tests. Look for how Playwright can answer one request itself: the `page.route` method.
- **404 page.** Open a product id that does not exist, such as `/products/999999`. The page has its own `data-testid`. Find it in `app/not-found.tsx`.
- **Return to `?next=` after login.** Start signed out. Open a protected page. Sign in through the form. Where must the browser end up? See how `auth.spec.ts` starts signed out.

## Practice

1. Create `products/product-edit.spec.ts` with the code above.
2. Run it: `pnpm --filter practice-shop e2e e2e/products/product-edit.spec.ts`.
3. Update `COVERAGE.md`.
4. Choose one gap from your list. Write its scenarios in plain words in a text file.

## Check what you know

1. Why create the product through the API?

<details><summary>Answer</summary>

The edit form is the thing under test. The API is faster and steadier for preparing data.

</details>

2. Why does each test start on the list and click Edit?

<details><summary>Answer</summary>

A click moves inside the app, so React is already ready. Typing right after a direct page load can be erased.

</details>

3. Why check the price through the API in the third test?

<details><summary>Answer</summary>

It proves the server did not save the invalid value. The screen alone does not prove that.

</details>

## Next step

In the next lesson you test a second user, the viewer, which needs a second session.
