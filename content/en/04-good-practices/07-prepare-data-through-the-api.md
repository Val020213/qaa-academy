---
title: Prepare data through the API
summary: Use the API to create and delete test data, and keep the UI for the one test about that UI.
duration: 45 min
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

## Go deeper

### Why the API is faster and the UI is a layer on top

The form in the shop does not talk to the server in a special way. When you click Save, the page sends this request: `POST /api/products`. That is the same request `createProduct` sends. The server does the same work for both.

So the UI path does extra steps. The browser loads the page, React starts, five fields are typed, the button is clicked, the page moves to the list, and the list loads again. Any of these steps can be slow or break. The API path has one step. When you only need a product to exist, one step is better than eight.

### A common wrong idea: API data makes the test less real

Some people say a test is fake if the data did not come from the screen. This is not true. A test needs to be real about the thing it checks. The delete test checks the delete flow. It does not need to prove the create form works. One other test, "a new product appears at the top of the list", does that.

A second wrong idea is the opposite: "the API accepts anything". It does not. The API applies the same rules as the form. Try this thought: what happens when a test calls `createProduct(request, { price: 0 })`? The server answers `422`, because the price must be greater than 0. The helper checks for `201`, so the test stops at the helper line with a clear message. You never write directly into the data and skip the rules.

### How it shows up in QA work: put the state in an override

`createProduct` has default values and accepts overrides. A test states only the field that matters:

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

The body of the product, with name, SKU, price and stock, is written once in the helper. The test shows only `status: "archived"`, so a reader sees what is special. This is DRY, and it also keeps the test readable.

### A trade-off

The API helper ties your tests to the API. If the API changes, for example a new required field, `createProduct` breaks, and so do all tests that use it. You fix it in one place. That is a good deal. But it only works when the API is stable and your team gives you access. If there is no API, use the UI for setup and keep it short.

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

5. What happens when a test runs `createProduct(request, { price: 0 })`? Name the status code and say where the test stops.

<details><summary>Answer</summary>

The server rejects the price, because the rule says it must be greater than 0. It answers `422`. The helper expects `201`, so the check inside `createProduct` fails. The test stops on the `createProduct` line, before it opens any page. The error shows `422` against `201`.

</details>

6. This test sometimes fails, because the new product is not in the list. Find the bug.

```ts
test("the new product is in the list", async ({ page, request }) => {
  const products = new ProductsPage(page)
  await products.goto()
  const product = await createProduct(request)

  await expect(products.row(product.id)).toBeVisible()
})
```

<details><summary>Answer</summary>

The page loads the list once, when it opens. The product is created after that, so the list on screen does not include it. The test waits for a row that never comes. Create the product first, then open the page. Then the list that loads already contains the product.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **What do the HTTP status codes 201, 204, 401, 403, 404 and 422 mean?**
   - Search for: `HTTP status codes MDN 422 403`
   - A good answer explains: the meaning of each code in one sentence, and which ones the shop returns for which problem.

2. **What do the HTTP methods GET, POST, PUT and DELETE do in a REST API?**
   - Search for: `REST API methods GET POST PUT DELETE`
   - A good answer explains: what each method does, and which one the shop uses to create, change and delete a product.

3. **Why do teams build test-only endpoints such as a reset, and what risks come with them?**
   - Search for: `test-only endpoints security risk production`
   - A good answer explains: why the endpoint helps tests, and how a team keeps it away from production.

## Next step

In the next lesson you learn why tests become flaky and how to find the cause.
