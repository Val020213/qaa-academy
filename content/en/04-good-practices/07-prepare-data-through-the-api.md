---
title: Prepare data through the API
summary: Use the API to create test data, keep the UI for the one test about that UI, and know what the API will refuse.
duration: 75 min
---

## Start with a puzzle

You write a test for the shop. It needs a product with price `0`. The product form refuses a price of 0: it shows "Price must be greater than 0."

A teammate says: "Skip the form. Send the product straight to the API. The API is just the back door, so it has no form rules."

Another teammate says: "The API is the same server code. It will refuse too."

One of them is right. If it is the second one, the test also cannot get the product it wants, and you have a second question: what should you do then?

Write down your guess before you read on.

## Goal

- Decide when a test may prepare data through the API and when it must use the UI.
- Predict what the API answers to valid and invalid data, with the status code.
- Explain how `page.request` and the `request` fixture differ.
- Explain why a reset endpoint exists only for tests.

## One rule

A test is about one thing. In a delete test, the thing is the delete button. Creating the product to delete is not the thing.

So the rule is: **the UI is under test only in the test about that UI.** Everything else, the test prepares through the API.

An **API** is the way programs talk to the server, without a screen. A request to the API is faster than clicking through a form. It also has fewer steps that can fail.

To get a product to delete through the UI, you open the form, fill five fields and click save. A bug in the form then breaks your delete test. Through the API it is one request, and only the delete feature can break the test.

This is **decomposition** for tests. Break the test into steps: prepare, act, check. Then ask for each step: "Is this step the thing I test?" If not, take the cheapest safe way.

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

### Predict before you run

Look at `createProduct`. Three calls, and for each one say the status code you expect:

1. `createProduct(request, { stock: 0 })`
2. `createProduct(request, { stock: -1 })`
3. `createProduct(request, { price: 0.001 })`

The rules are in `apps/practice-shop/lib/validation.ts`. Stock must be a whole number, 0 or more. Price must be greater than 0.

Call 1 gets `201`: 0 is allowed. Call 2 gets `422`: below the edge. Call 3 also gets `201`. The rule says "greater than 0", and 0.001 is greater than 0. The shop has no minimum price above zero. Whether that is a bug is a product question, and you will meet this kind of edge again in the last lesson of this module.

A `422` response has a body. It names the field and the message:

```json
{ "errors": { "stock": "Stock must be a whole number, 0 or more." } }
```

### Back to the puzzle

The second teammate is right. The API and the form both call the same function, `validateProduct`, so a price of 0 gets a `422` from both. The API is not a back door. It is the same door, without the screen around it.

So your test cannot create a product with price 0, and it should not need one: the app does not allow it. If you want to test how the list shows an odd price, use an allowed small positive value, such as `0.01`. If the real need is "what does the form say for price 0", that is a test about the form, and it uses the UI.

## The cookies are shared

The `request` fixture is a client for API calls. The config loads the saved admin cookies into it, as it does for `page`. So the request is signed in as admin.

`page.request` is the same kind of client, but it belongs to the page. It uses the cookies of the page's browser context. When a cookie changes in one, the other sees it. The `request` fixture has its own cookies. A login through the `request` fixture does not change the browser.

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

A second wrong idea is the opposite: "the API accepts anything". As the puzzle showed, it does not. You never write directly into the data and skip the rules.

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

### Read the response, not only the status

A status code says "it worked" or "it did not". The body says what exactly. When you test through `request`, look at both. Ask yourself: if the API answered `201` but returned the wrong price, which line would notice? `createProduct` returns the body, so a test can check `product.price` against what it sent.

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
6. Check your three predictions from "Predict before you run". Add this line at the top of the file: `import { uniqueSku } from "../lib/helpers"`. Then add this test to the same file and run it:

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

7. Read the output. The test prints the status and the body for each change. Does the `422` body look like the JSON shown above? Which of your predictions was wrong, if any?

## Challenge

Brief: the products list shows 10 products per page. Bugs like to live where a total is an exact multiple of the page size, because "the last page" is easy to calculate wrong. You will test exactly that edge. Your test makes the total number of products an exact multiple of 10, with as few new products as needed, and then walks through every page.

Create the file `apps/practice-shop/e2e/challenges/pagination-edge.spec.ts`.

It is done when:

- The test reads the real total with `GET /api/products`, and creates only as many products as needed, through `createProduct`, so the total is a multiple of 10.
- `products-page` shows `Page 1 of N` where N is the total divided by 10. There is no empty extra page.
- The test clicks `products-next-page` until the last page. After each click, it checks the text of `products-page`.
- On the last page, `products-next-page` is disabled, and the page shows 10 rows.
- `pnpm shop:e2e challenges/pagination-edge.spec.ts --repeat-each 2` passes both times.

You will need something this lesson did not teach: how to read a number from a response body, how to calculate how many products are missing, and how to assert that a button is disabled. Search for: `playwright APIResponse json`, `javascript remainder operator`, `playwright toBeDisabled`, `playwright toHaveText regular expression`.

## Think it through

1. **Predict.** The seed data has 24 products and a fresh run starts from it. A test calls `createProduct(request, { stock: 0, price: 0.01 })` once and opens `/products`. What does `products-count` show, and what does `products-page` show? What changes if the test creates 6 products instead of 1?

<details><summary>Answer</summary>

The helper gets `201`, because stock 0 and price 0.01 are on the allowed side of both edges. The total becomes 25, so the count shows "25 products" and the page shows "Page 1 of 3". With 6 products the total is 30. The page then shows "Page 1 of 3" again, and the last page holds 10 rows, not 5. The count text is the same in shape, and the page count did not grow. This is the edge you test in the challenge.

</details>

2. **Find the bug.** This test sometimes passes and sometimes fails. The code runs without errors. What is wrong?

```ts
test("the new product is in the list", async ({ page, request }) => {
  const products = new ProductsPage(page)
  await products.goto()
  const product = await createProduct(request)

  await expect(products.row(product.id)).toBeVisible()
})
```

<details><summary>Answer</summary>

The list is loaded from the API once, after the page starts. The test creates the product after `goto`, so there is a race. If the product exists before the list request reaches the server, the row shows and the test passes. If the list request is faster, the row never shows and the test fails. The fix is to create the product first, then open the page, so the list that loads already contains the product.

</details>

3. **Two versions.** The delete test leaves nothing behind, but other tests leave products. Version A adds `afterEach` to delete every product the test made. Version B leaves them, because the setup resets the data on the next run. Which is better here, and when would you choose the other?

<details><summary>Answer</summary>

Version B is enough here, because the shop keeps data in memory and `global.setup.ts` resets it at the start of each run. Version A adds code and one more request per test, and it can fail by itself. Choose A when the tests run on a shared environment that is never reset, or when leftovers change what other tests see, such as a count of all products. A reasonable middle way is to clean only in the tests whose leftovers matter.

</details>

4. **What breaks if.** The developers add a required field, `category`, to the product. Which tests fail, on which line, and how many places must you edit?

<details><summary>Answer</summary>

Every test that calls `createProduct` fails on the `createProduct` line, because the API answers `422` and the helper expects `201`. The failure is clear and early, and you fix it in one place: add a default `category` to the helper. The form tests fail too, but for a different reason, because they fill the form and the new field stays empty. You edit those tests separately. The helper is the reason the first group costs one edit.

</details>

5. **Explain it.** A manager says: "Creating the product through the API is cheating. A real user uses the form." Answer in three sentences without the word "faster".

<details><summary>Answer</summary>

A good answer: "Each test checks one behaviour, and the delete test checks delete, not the form. If the form breaks, the delete test would fail for a reason that has nothing to do with delete, and the team would look in the wrong place. One other test already checks the form, so the form is still covered, once and in the right place." The main idea is that each test should fail for one reason only.

</details>

6. **Edge case.** Suppose the config allowed four workers, so tests ran at the same time. Each worker loads `helpers.ts` and starts `uniqueSku` at its own random number between 1000 and 9999. What can go wrong, how often, and what would the failure look like?

<details><summary>Answer</summary>

Two workers can get SKU numbers that touch, because each counts up from its own random start. Then the second `createProduct` gets `422`, with "This SKU is already used by another product." The chance is small. With four workers and about twenty products per worker, the chance of at least one clash is roughly 2.6 in 100, and across many runs it will happen, and it will look random. This is a flaky test with a real cause. Today the config uses one worker, so it cannot happen. If you ever add workers, give each worker its own range of numbers, for example by using the worker number in the SKU.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **What do the HTTP status codes 201, 204, 401, 403, 404 and 422 mean?**
   - Search for: `HTTP status codes MDN 422 403`
   - Try it: in a scratch spec file, use the `request` fixture to call `GET /api/products/99999`. Then add `test.use({ storageState: { cookies: [], origins: [] } })` at the top of a second test file and call `GET /api/products`. Print `response.status()` for each.
   - A good answer explains: the meaning of each code in one sentence, and which ones the shop returns for which problem.

2. **What do the HTTP methods GET, POST, PUT and DELETE do in a REST API?**
   - Search for: `REST API methods GET POST PUT DELETE`
   - Try it: open the shop in your browser, then DevTools, then the Network tab. Edit a product and save. Find the request in the list, and read its method, its address and its response.
   - A good answer explains: what each method does, and which one the shop uses to create, change and delete a product.

3. **Why do teams build test-only endpoints such as a reset, and what risks come with them?**
   - Search for: `test-only endpoints security risk production`
   - Try it: in a scratch spec, call `POST /api/test/reset`, then `GET /api/products`, and print the `total`. Run it only when no other test is running. Then say why your own session still works after the reset.
   - A good answer explains: why the endpoint helps tests, and how a team keeps it away from production.

## Next step

In the next lesson you learn why tests become flaky and how to find the cause.
