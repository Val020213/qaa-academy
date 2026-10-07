---
title: Prepare data through the API
duration: 50 min
---

## Goal

Prepare test data through the API and use the UI to check the behavior under test. In this lesson you work with the shop's helpers and their responses.

- Choose when to prepare data through the API and when to use the UI.
- Read the responses to valid and invalid data.
- Distinguish the cookies of `page.request` and the `request` fixture.
- Recognize what the test reset endpoint is for.

## Prepare, act, and check

In a delete test, creating the product is preparation. Clicking Delete and confirming are the actions you want to test. Preparing the product through the API keeps a bug in the creation form from breaking that test.

The API prepares the product in one request, without depending on the creation form. Preparation, authentication or list loading can still fail the test.

The form sends `POST /api/products` when you save a new product. The setup helper sends the same request without opening the form or filling its fields. The server processes the data through the same route.

![With a valid admin session, the form and helper reach the same server validation.](/images/04-api-preparation.en.svg)

If the test checks creation through the form, use the UI to create the product. If your environment offers no API for preparing data, use the UI and keep that preparation short.

## The API client helpers

Open `apps/practice-shop/e2e/lib/fixtures/api-client.ts`. The top comment says:

```ts
// The "request" fixture and "page.request" both carry the cookies of the
// saved admin session, so these helpers work as admin by default.
```

The file has three helpers. The first signs in:

```ts
export async function loginViaApi(
  request: APIRequestContext,
  user: { email: string; password: string }
): Promise<void> {
  const response = await request.post("/api/auth/login", {
    data: { email: user.email, password: user.password },
  })
  expect(response.ok()).toBeTruthy()
}
```

`loginViaApi` sends the credentials and checks that the response is successful. The second helper creates a product with default values:

```ts
export async function createProduct(
  request: APIRequestContext,
  overrides: Partial<Omit<Product, "id">> = {}
): Promise<Product> {
  const response = await request.post("/api/products", {
    data: {
      name: uniqueName("Product"),
      sku: uniqueSku(),
      price: 19.99,
      stock: 10,
      status: "active",
      ...overrides,
    },
  })
  expect(response.status()).toBe(201)
  return (await response.json()) as Product
}
```

`uniqueName` and `uniqueSku` generate the name and SKU. The values in `overrides` come last, so they replace the defaults for the fields you supply.

The assertion checks for status `201` before returning the product. If the server rejects the data, the helper fails during preparation.

The third deletes a product:

```ts
export async function deleteProduct(request: APIRequestContext, id: number): Promise<void> {
  const response = await request.delete(`/api/products/${id}`)
  expect(response.status()).toBe(204)
}
```

Status `204` indicates that the server completed the deletion without returning a body.

### The limits the API accepts

The rules are in `apps/practice-shop/lib/validation.ts`. Stock must be a whole number, 0 or more. Price must be greater than 0. With the other fields valid, the responses are:

- `createProduct(request, { stock: 0 })`: the server responds with `201`.
- `createProduct(request, { stock: -1 })`: the server responds with `422` and the helper's assertion fails.
- `createProduct(request, { price: 0.001 })`: the server responds with `201`, because there is no positive minimum price above zero.

A `422` response identifies the invalid field and its message:

```json
{ "errors": { "stock": "Stock must be a whole number, 0 or more." } }
```

Both the helper and the form send data to the API. The server route calls `validateProduct` and returns `422` for a price of 0; the form shows the returned error.

To test how the list displays a small price, use an allowed value such as `0.01`. To test the form's message for price 0, enter that value through the UI.

## Each client's cookies

The config loads the saved admin cookies into both the `request` fixture and the browser context for `page`. Both start with that session, but have separate cookie stores.

`page.request` shares cookies with the page's browser context. Playwright sends those cookies with that client's requests and updates the browser's cookies when the server returns a cookie. That is why `loginViaApi(page.request, ADMIN)` also signs in the test's browser.

The `request` fixture stores its own cookies. A login through that fixture changes its session without changing the browser's cookies.

## The delete test

This test from `apps/practice-shop/e2e/products/products.spec.ts` prepares the product through the API and deletes it through the UI:

```ts
test("confirming in the dialog removes the product", async ({ page, request }) => {
  const product = await createProduct(request)
  const products = new ProductsPage(page)
  await products.goto()
  await expect(products.row(product.id)).toBeVisible()

  await products.delete(product.id)

  await expect(products.row(product.id)).toHaveCount(0)
  await expect(products.message).toContainText(product.name)
})
```

The test creates the product before opening the list. The assertion waits for its row to be visible; then the Page Object clicks Delete and confirms the dialog. The final two assertions check that the row disappeared and that the message contains the product's name.

If the test finishes successfully, deletion itself cleans up the product. Other tests leave data that setup resets on the next run. In an environment that is never reset, or if that data affects a later count, you need to clean up the products you created.

If the API changes and requires a new field, tests that use `createProduct` fail during preparation. Adding the default value in the helper updates that preparation in one place.

## The reset endpoint

Look at `apps/practice-shop/app/api/test/reset/route.ts`:

```ts
// Test-only endpoint: puts the data back to its first state.
// A real project would never ship this to production, so it answers 404 there.
export async function POST() {
  if (process.env.NODE_ENV === "production" && !process.env.ENABLE_TEST_API) {
    return new NextResponse(null, { status: 404 })
  }
  resetStore()
  return NextResponse.json({ ok: true })
}
```

The test in `global.setup.ts` calls this endpoint at the start of each run to restore the seed data.

It is a test tool. In production it returns `404` if `ENABLE_TEST_API` is missing or empty; any nonempty text, even `"false"`, enables reset. The comment states the intent, but the condition allows that exception. An endpoint that erases all data would be dangerous in a real system. In a real project, ask the developers for such a tool for your test environment only.

> **Careful:** Never point your tests at a real production system. Use a test environment you can reset.

## Go deeper

### Keep the relevant data visible

A test can use the helper's defaults and change only the field that determines the case:

```ts
import { expect, test } from "../lib/test"
import { createProduct } from "../lib/fixtures/api-client"
import { ProductsPage } from "../lib/pages/products.page"

test("an archived product shows the archived badge", async ({ page, request }) => {
  const product = await createProduct(request, { status: "archived" })
  const products = new ProductsPage(page)
  await products.goto()
  await expect(products.row(product.id)).toBeVisible()

  await expect(page.getByTestId(`products-status-${product.id}`)).toHaveText("archived")
})
```

The test shows `status: "archived"`, the data needed to check the badge. The helper handles the rest of the preparation.

### Check the response body

`createProduct` checks status `201`, but does not compare every returned field with what it sent. A server returning that status with an incorrect price would pass the helper's assertion. Since the helper returns the product, the test can check `product.price` when the price is part of the case.

## Practice

1. Open `apps/practice-shop/e2e/lib/fixtures/api-client.ts`. Find the three `expect` lines that check the response.
2. Create the file `apps/practice-shop/e2e/products/api-practice.spec.ts` with this code:

```ts
import { expect, test } from "../lib/test"
import { createProduct, deleteProduct } from "../lib/fixtures/api-client"

test("a product made through the API can be read, then deleted", async ({ request }) => {
  const product = await createProduct(request)

  const found = await request.get(`/api/products/${product.id}`)
  expect(found.status()).toBe(200)

  await deleteProduct(request, product.id)

  const gone = await request.get(`/api/products/${product.id}`)
  expect(gone.status()).toBe(404)
})
```

3. Start the shop with `pnpm shop:dev`. In another terminal run:

```bash
pnpm shop:e2e products/api-practice.spec.ts
```

4. Add this line at the top of the file: `import { uniqueSku } from "../lib/helpers"`. Then add this test to the same file and run it:

```ts
test("the API answers the edge cases", async ({ request }) => {
  for (const change of [{ stock: 0 }, { stock: -1 }, { price: 0.001 }]) {
    const response = await request.post("/api/products", {
      data: { name: "Edge case", sku: uniqueSku(), price: 5, stock: 5, status: "draft", ...change },
    })
    console.log(JSON.stringify(change), response.status(), await response.text())
  }
})
```

5. Check that the output shows statuses `201`, `422`, and `201`, in that order. Check that the `422` body contains the stock error shown in the lesson.

## Challenge

Use the API to prepare a product total that is an exact multiple of 10, creating only the missing products. Then walk through every page of the list to check that no extra empty page appears.

Create the file `apps/practice-shop/e2e/challenges/pagination-edge.spec.ts`.

It is done when:

- The test reads the real total with `GET /api/products` and creates only the products needed through `createProduct`.
- `products-page` shows `Page 1 of N`, where N is the total divided by 10. The test clicks `products-next-page` until the last page and checks the text of `products-page` after each click.
- On the last page, `products-next-page` is disabled and the page shows 10 rows.
- `pnpm shop:e2e challenges/pagination-edge.spec.ts --repeat-each 2` passes both times.

Search for: `playwright APIResponse json`, `javascript remainder operator`, `playwright toBeDisabled`, `playwright toHaveText regular expression`.

## Think it through

1. The seed data has 24 products. A test calls `createProduct(request, { stock: 0, price: 0.01 })` once and opens `/products`. What do `products-count` and `products-page` show? What changes if it creates 6 products instead of 1?

<details><summary>Answer</summary>

With one new product, the count shows "25 products" and the page shows "Page 1 of 3". With six, it shows "30 products" and "Page 1 of 3". The last page goes from 5 rows to 10.

</details>

2. This test sometimes passes and sometimes fails. What is wrong with the order of preparation?

```ts
test("the new product is in the list", async ({ page, request }) => {
  const products = new ProductsPage(page)
  await products.goto()
  const product = await createProduct(request)

  await expect(products.row(product.id)).toBeVisible()
})
```

<details><summary>Answer</summary>

When the page opens, React starts loading the list from the API. This example has no later action that reloads it. The test creates the product after `goto`, so there is a race. If the server handles the list request before creating the product, the row does not appear. Create the product first, then open the page.

</details>

3. The developers add a required field, `category`, to the product. Where do tests that use `createProduct` fail, and how many places must you edit to update their preparation?

<details><summary>Answer</summary>

The API responds with `422` and the helper's assertion expecting `201` fails. Add a default `category` in `createProduct`. Tests that create products through the form need their preparation updated separately.

</details>

## Next step

In the next lesson you learn why tests become flaky and how to find the cause.
