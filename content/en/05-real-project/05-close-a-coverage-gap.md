---
title: Close a coverage gap
duration: 80 min
---

## Goal

In this lesson you turn a gap in `COVERAGE.md` into a product-edit spec. You prepare each test's data and check both the UI and the saved data.

- Plan the scenarios before writing the spec.
- Create a separate product for each test and reach the form from the list.
- Check the starting values, saving, validation and cancellation.
- Prove that an assertion detects an incorrect result and update the coverage.

## Plan the scenarios

The gap is "Editing a product". Open the shop and edit a product by hand. Write the results you will check:

1. The edit form starts with the current values of the product.
2. Saving a new name and status updates the list.
3. An invalid price shows an error and the product keeps its old data.
4. Cancel leaves the product unchanged.

![Changing a product’s name and cancelling keeps its original name in the list.](/clips/05-edit-cancel.webm)

Each scenario becomes a test. The plan leaves out other field errors, such as invalid stock or an empty name, because the suite already checks them in the create form in `products/products.spec.ts`.

## Decide the data

Create a new product for each test. If all four edit the seeded product `SKU-0001`, one test's name change alters the data the next test receives.

Prepare that product through the API with `createProduct`, because you are testing the edit form here. Each test reaches its action without filling in the "New product" form first.

`createProduct(request, overrides)` returns the product with its `id`. Pass `overrides` to set fields, such as `{ price: 25 }`.

If the create API fails, tests that use it to prepare their data also fail. Keep the test that creates a product through the form in `products.spec.ts` to check that UI path.

## Reach the form from the list

You can open `/products/<id>/edit` directly with `page.goto` or start on the list and click **Edit**. The suite uses the second path.

The shop generates the form's HTML on the server. The browser can display it before React attaches its event handlers during hydration. Typing before those handlers exist can leave React state unchanged; a later render can restore that value in the controlled input.

The list rows come from a request the browser sends after React runs. The test waits for the product's row, then clicks **Edit**. That row confirms React has loaded the list. The Next.js link allows navigation to the form within the app; a visible link alone does not prove that any form is ready.

The new product is on page 1 because the API sorts products by id, newest first.

## Write the spec

Create the file `apps/practice-shop/e2e/products/product-edit.spec.ts`. Reuse `createProduct`, `uniqueName` and the `ProductsPage` Page Object.

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
    await expect(page).toHaveURL(new RegExp(`/products/${product.id}/edit$`))

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

The Edit control is a link (`<a>`) that carries the test id. `click()` also works with links. The locator depends on the test id, so changing the HTML tag while keeping that id does not require changing the locator.

## Review the checks

Waiting for `products.row(product.id)` states which product must be available before the click. The click also waits for its element, but the assertion helps identify a failure to load the row.

The third test checks the error on screen and the saved price through the API. The form stays on screen after an error; that alone does not prove that the server kept the data unchanged.

The test waits for the error text before reading the API. That text appears once the server has answered the save attempt.

![The test waits for the PUT error before reading the saved price through the API.](/images/05-validation-read.en.svg)

Reading the API immediately after the click can return the old price while the save is still pending.

## Choose another gap

Plan one gap at a time. Use these hints to find the controls and results you need to check:

- Product detail page: open the name link in the list. Look for the test ids `product-detail-` and `products-view-<id>`, the product data and the back link.
- Delete from the detail page: use the admin's Delete button and the confirm dialog. Check the browser's destination and that the product no longer exists.
- Pagination: inspect `products-page`, `products-next-page` and `products-prev-page`. The seed has 24 products and other tests add more; avoid fixing the page count.
- Duplicate SKU: create a product through the API and try to create another with the same SKU in the form. Check the error under the SKU field.
- Shipped order: use a paid order that no other test changes. The seeded paid orders are 1002, 1006 and 1010. Check the final status and the available buttons.
- Empty order filter: every status has orders in the seed, and orders only move forward. Emptying a status can break other tests. Look up how to answer the request with `page.route`.
- 404 page: open a missing id, such as `/products/999999`. Find its `data-testid` in `components/not-found-card.tsx` and inspect its uses in `app/not-found.tsx` and `app/(dashboard)/not-found.tsx`.
- Return to `?next=` after login: start signed out, open a protected page and sign in through the form. Check the browser's destination. See how `auth.spec.ts` starts signed out.

## Go deeper

### Field values are text

The first test uses `toHaveValue("25")` because the input field's value is text. With `toHaveValue(25)`, the type checker rejects the numeric argument.

### A method to open the edit form

The three repeated actions, opening the list, waiting for the row and clicking Edit, can go in the Page Object:

```ts
// Add to the ProductsPage class in lib/pages/products.page.ts
async openEdit(id: number) {
  await this.goto()
  // waitFor is a wait, not an assertion, so the Page Object stays assertion-free.
  await this.row(id).waitFor()
  await this.page.getByTestId(`products-edit-${id}`).click()
}
```

The test would use `await products.openEdit(product.id)`. A change to that path would be handled in one method, though readers would need to open the Page Object to see the wait.

## Practice

1. Create `products/product-edit.spec.ts` with the code above.
2. Run it twice: `pnpm --filter practice-shop e2e e2e/products/product-edit.spec.ts`.
3. In `product-edit.spec.ts`, change the fourth test to click `product-save` instead of `product-cancel`. Run it, read the failure and undo the change.
4. Update `COVERAGE.md`: add a Products row for editing and delete "Editing a product." from the gaps.
5. Choose another gap from the list and write its scenarios in a text file.

## Challenge

Close the **pagination** gap in `apps/practice-shop/e2e/products/product-pagination.spec.ts`. The list shows 10 products per page. The page count can grow when other tests create products.

It is done when:

- Page 1 shows 10 rows, Previous is disabled, Next is enabled and the text starts with "Page 1 of" without a fixed total.
- After one click on Next, the text starts with "Page 2 of", Previous is enabled and the first row shows a different product from page 1.
- Another test reaches the last page without fixing its number in the code and checks that Next is disabled.
- The spec passes twice in a row and each test passes alone with `--grep`. You change an expected number on purpose, run the spec, read the failure and undo the change.

Search for: `playwright toBeDisabled`, `playwright toHaveText regular expression` and `playwright locator textContent`.

## Think it through

1. Suppose the server saves the invalid price before answering with the error. In the third test, which assertions pass and which one fails?

<details><summary>Answer</summary>

The error and URL checks pass because the form shows the message and stays on the edit page. The last assertion fails: the API returns the invalid price instead of 30.

</details>

2. This ending of the third test can pass even if the server saves the invalid price. Find the bug.

```ts
await page.getByTestId("product-save").click()
const saved = await request.get(`/api/products/${product.id}`)
expect(((await saved.json()) as { price: number }).price).toBe(30)
await expect(page.getByTestId("product-price-error")).toBeVisible()
```

<details><summary>Answer</summary>

The API read can finish before the save and return the old price. Wait for the form error first, which appears after the server's response, then read the saved price.

</details>

3. The team changes the list to show the oldest products first. What breaks in the four tests, and what do you change?

<details><summary>Answer</summary>

The new product falls outside page 1, so `products.row(product.id)` never becomes visible. Search for the unique name first with `products.search(product.name)` to keep the path through the list.

</details>

## Next step

In the next lesson you test a second user, the viewer, which needs a second session.
