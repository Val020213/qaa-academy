---
title: Prepare data through the API
summary: Use the API to create and delete test data, and keep the UI for the one test about that UI.
duration: 30 min
---

## Goal

- Explain why test data is prepared through the API.
- Read the helpers in `api-client.ts`.
- Explain how `page.request` shares the browser cookies.
- Explain why the reset endpoint exists only for tests.

## One rule

A test is about one thing. In a delete test, the thing is the delete button. Creating the product to delete is not the thing.

So the rule is: **the UI is under test only in the test about that UI.** Everything else, the test prepares through the API.

An **API** is the way programs talk to the server, without a screen. A request to the API is faster than clicking through a form. It also has fewer steps that can fail.

To get a product to delete through the UI, you open the form, fill five fields and click save. A bug in the form then breaks your delete test. Through the API it is one request, and only the delete feature can break the test.

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

The second creates a product. It uses `uniqueName` and `uniqueSku`, so the data is unique. You can change any field:

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

The helper checks that the status is `201`. This is the HTTP code for "created". If the API fails, the test stops here with a clear message, not later on the screen.

The third deletes a product:

```ts
export async function deleteProduct(request: APIRequestContext, id: number): Promise<void> {
  const response = await request.delete(`/api/products/${id}`)
  expect(response.status()).toBe(204)
}
```

The status `204` means "done, nothing to return".

## The cookies are shared

The `request` fixture is a client for API calls. The config loads the saved admin cookies into it, as it does for `page`. So the request is signed in as admin.

`page.request` is the same kind of client, but it belongs to the page. It uses the cookies of the page's browser context. When a cookie changes in one, the other sees it.

You saw this in the sign out test: `loginViaApi(page.request, ADMIN)` gives the browser a session without opening the login page.

## The delete test

Here is the delete test from `apps/practice-shop/e2e/products/products.spec.ts`:

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

Read it in order.

1. `createProduct(request)` prepares the product through the API.
2. The test opens the page and waits for the row. A visible row means the page is ready.
3. The only UI steps are the ones under test: the click and the confirm.

The test needs no cleanup. The test itself deletes the product. Other tests leave their products. That is fine: the names are unique and the next run resets the data.

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

A call to this endpoint puts all data back to the seed data. The setup test uses it once per run.

It exists only for tests, so it is blocked in production. An endpoint that erases all data would be dangerous in a real system. In a real project, ask the developers for such a tool for your test environment only.

> **Careful:** Never point your tests at a real production system. Use a test environment you can reset.

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

4. The test never opens a browser page. Look at how fast it runs next to the UI tests.
5. Write one sentence: why does this test not need `uniqueName` in its own code?

## Check what you know

1. When is the UI used to create data?

<details><summary>Answer</summary>

Only in the test about that UI, such as the test for the create form.

</details>

2. What does `page.request` share with the page?

<details><summary>Answer</summary>

The cookies of the browser context.

</details>

3. Why does `createProduct` check for status 201?

<details><summary>Answer</summary>

If the API fails, the test stops at once with a clear error, not later on the screen.

</details>

4. Why does the reset endpoint answer 404 in production?

<details><summary>Answer</summary>

It erases all data. It must exist only for tests.

</details>

## Next step

In the next lesson you learn why tests become flaky and how to find the cause.
