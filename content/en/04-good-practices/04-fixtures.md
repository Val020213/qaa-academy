---
title: Fixtures
duration: 65 min
---

## Goal

Create fixtures that provide data and helpers to tests and keep setup and cleanup in one function.

- Follow the order of setup, the test and teardown.
- Write a custom fixture with `test.extend` that creates and removes data.
- Distinguish a fixture from `beforeEach`.
- Recognize when a fixture hides values that the test needs to show.

## Built-in fixtures

A **fixture** is a value a test asks for by name. Playwright's test runner prepares the resources it needs and handles their cleanup. You already use `page`:

```ts
test("shows a loading message first", async ({ page }) => {
```

The name in the braces tells the runner which fixture the test needs. Playwright includes these four:

- `page`: one browser tab. Each test gets a new one.
- `request`: a client that sends HTTP requests to the server, without a browser. You use it for API calls.
- `context`: the isolated browser context that owns the page. It holds cookies. Each test gets a new one.
- `browser`: the browser program itself. You rarely need it.

In the shop config, `use.storageState` loads the saved admin cookies. So `page` and `request` are both signed in.

## The shared import

Open `apps/practice-shop/e2e/lib/test.ts`:

```ts
// Every spec imports from this file, never from "@playwright/test".
// Custom fixtures get added here later, so every spec can use them.
export { test, expect } from "@playwright/test"
export type { Page, Locator, APIRequestContext } from "@playwright/test"
```

Specs import `test` from this file. If the team adds fixtures to the `test` it exports, specs can use them without changing their import.

## Setup and cleanup

**Setup** runs before the value is handed to the test. Cleanup, or **teardown**, runs afterwards. In an ordinary async function, an error can prevent cleanup from being reached:

```ts
async function withLamp(use: (item: string) => Promise<void>) {
  console.log("A setup")
  await use("lamp")
  console.log("B cleanup")
}

try {
  await withLamp(async (item) => {
    console.log("C test uses", item)
    throw new Error("boom")
  })
} catch {
  console.log("D caught")
}
console.log("E end")
```

Node.js prints `A setup`, `C test uses lamp`, `D caught` and `E end`. The error rejects the promise from `use`, so `await use("lamp")` throws and the function ends without printing `B cleanup`. To run cleanup in that case, you need `try ... finally`.

Playwright's test runner keeps `await use(value)` pending while the test uses the value. When the test ends, the runner lets the fixture continue with cleanup, even if it recorded a test failure.

![The runner resolves the use promise when the test ends and resumes fixture cleanup.](/images/04-fixture-lifetime.en.svg)

This program imitates that separation: it stores the test's error without interrupting the fixture.

```ts
type Use<T> = (value: T) => Promise<void>
const database = new Set<string>()

async function productFixture(use: Use<string>) {
  database.add("product-1")
  await use("product-1")
  database.delete("product-1")
}

async function runTest(name: string, body: (product: string) => Promise<void>) {
  let failure: unknown
  await productFixture(async (value) => {
    try {
      await body(value)
    } catch (error) {
      failure = error
    }
  })
  console.log(name, failure ? "FAILED" : "passed", "| rows left:", database.size)
}

await runTest("good test", async () => {})
await runTest("bad test", async () => {
  throw new Error("assertion failed")
})
```

It prints:

```text
good test passed | rows left: 0
bad test FAILED | rows left: 0
```

The product is removed in both cases. If the delete were the last line of the test body, an earlier error would prevent it from running.

### Dependencies between fixtures

A fixture can ask for another fixture. The runner sets up the dependency first and tears it down after the fixture that uses it. This code shows the order with a product that depends on a user:

![Setup follows dependencies; cleanup runs in reverse order.](/images/04-fixture-dependencies.en.svg)

```ts
type Use<T> = (value: T) => Promise<void>

async function user(use: Use<string>) {
  console.log("setup user")
  await use("Ada")
  console.log("teardown user")
}

async function product(owner: string, use: Use<string>) {
  console.log("setup product for", owner)
  await use("lamp")
  console.log("teardown product for", owner)
}

await user(async (owner) => {
  await product(owner, async (item) => {
    console.log("test:", owner, item)
  })
})
```

It prints:

```text
setup user
setup product for Ada
test: Ada lamp
teardown product for Ada
teardown user
```

The product is cleaned up first so its cleanup can still use the user.

## A custom fixture

`test.extend` takes an object containing the names and functions of the new fixtures. Each function prepares a value, hands it over with `use(value)` and waits at `await use(value)` until it can clean up.

This example creates `productsPage`, a helper for the products page, and `product`, a product prepared through the API:

```ts
import { test as base, expect } from "../test"
import { createProduct } from "./api-client"
import type { Product } from "./api-client"
import { ProductsPage } from "../pages/products.page"

type ShopFixtures = {
  productsPage: ProductsPage
  product: Product
}

export const test = base.extend<ShopFixtures>({
  productsPage: async ({ page }, use) => {
    await use(new ProductsPage(page))
  },

  product: async ({ request }, use) => {
    const product = await createProduct(request)
    await use(product)
    // Accept an already-deleted product; other cleanup failures must fail.
    const response = await request.delete(`/api/products/${product.id}`)
    expect([204, 404]).toContain(response.status())
  },
})

export { expect } from "../test"
```

- `base` is the `test` from `lib/test.ts`.
- `extend<ShopFixtures>` tells the type checker the names and types of the new fixtures.
- `productsPage` asks for `page` to build the helper.
- `product` asks for `request` to call `createProduct`, which generates a name with a random suffix and a SKU from the worker’s counter.
- After `await use(product)`, the fixture sends the delete request. It accepts `204` when deletion succeeds and `404` when the test already deleted it; any other status fails cleanup.

The spec imports the extended `test` and asks for both values:

```ts
import { expect, test } from "../lib/fixtures/products-test"

test("a product made by a fixture is in the list", async ({ productsPage, product }) => {
  await productsPage.goto()

  await expect(productsPage.row(product.id)).toBeVisible()
  await expect(productsPage.row(product.id)).toContainText(product.name)
})
```

### Fixtures the test asks for

> **Note:** The runner prepares a fixture when a test, hook or dependent fixture requests it. Automatic fixtures run without an explicit request. In these two tests, only the first needs `product`.

```ts
test("asks for a product", async ({ page, product }) => {
  await page.goto("/products")
  await expect(page.getByTestId(`products-row-${product.id}`)).toBeVisible()
})

test("does not ask for a product", async ({ page }) => {
  await page.goto("/products")
  await expect(page.getByTestId("products-table")).toBeVisible()
})
```

The second test creates no product. Each test that asks for `product` gets its own new product.

## Fixtures and beforeEach

Use `beforeEach` for a simple step that every test in one file needs, such as opening a page. Use a fixture for data or helpers that need cleanup or that several files share.

| Point | `beforeEach` | Fixture |
| --- | --- | --- |
| Cleanup | A separate `afterEach`, far from the setup | The same function, after `use` |
| Runs for | Every test in the group | Tests or hooks that need it, their dependencies and automatic fixtures |
| Sharing | Variables outside the test | A typed value in the braces |
| Reuse in other files | Hard | Import `test` |

**KISS**, "Keep It Simple", means choosing the simplest tool that does the job. A test that needs just one line of setup can keep it in its body.

## Go deeper

### Values that belong in the test

A fixture called `lowStockProduct` can hide the value that decides the test's result. If the test checks behaviour with stock 3, keep that value visible with `createProduct(request, { stock: 3 })`.

Each fixture should have one job. Separating the creation of a product, a customer and an order lets you combine only the setup each test needs.

## Practice

1. Create the file `apps/practice-shop/e2e/lib/fixtures/products-test.ts`. Copy the fixture code from this lesson.
2. Create the file `apps/practice-shop/e2e/products/fixture-practice.spec.ts`. Copy the spec code from this lesson.
3. Start the shop with `pnpm shop:dev` in one terminal.
4. In a second terminal, run your spec:

```bash
pnpm shop:e2e products/fixture-practice.spec.ts --repeat-each=2
```

5. Check that both repetitions pass with a single data reset in setup. Two separate commands would reset the data twice.
6. Add a second test in the same file. Use only `{ productsPage }` and check that `productsPage.newButton` is visible after `goto()`.
7. When you finish, delete both files, or keep them for your own notes.

## Challenge

Write a fixture that provides a page signed in as the viewer, the user who may only read. Use it to check the "viewer role" gap from `COVERAGE.md`: a viewer sees no New, Edit or Delete buttons.

Create `apps/practice-shop/e2e/challenges/viewer-test.ts` for the fixture and `apps/practice-shop/e2e/challenges/viewer-role.spec.ts` for the spec. The viewer account is in `e2e/lib/fixtures/api-client.ts`.

It is done when:

- The fixture is named `viewerPage` and extends the `test` from `lib/test.ts`.
- A test that uses `viewerPage` checks that `user-role` says `viewer`, that `products-new` does not exist, and that a product you created yourself has a visible row. Check that its `products-edit-<id>` and `products-delete-<id>` controls do not exist.
- A second test does not ask for `viewerPage` and checks that `user-role` says `admin` and `products-new` is visible.
- You ran `pnpm shop:e2e challenges/viewer-role.spec.ts` twice and both runs passed. Other specs still pass.

Search for how to change the user for just one test and how `page.request` shares cookies with `page`, while the `request` fixture keeps its own cookies separately: `playwright context clearCookies`, `playwright page.request shares cookies with context`.

## Think it through

1. This fixture has a bug. A test that deletes the product itself fails, even though the delete worked. Find the bug.

```ts
product: async ({ request }, use) => {
  const product = await createProduct(request)
  await use(product)
  await deleteProduct(request, product.id)
},
```

<details>
<summary>Answer</summary>

`deleteProduct` checks that the status is `204`. If the test already deleted the product, the server returns `404` for the second delete. The assertion fails during cleanup and the runner reports the test as failed.

</details>

2. The team adds a rule: a product that appears in an order cannot be deleted, and the server answers `409`. Another product fixture omits the status check on its cleanup request. What breaks, and what does the fixture hide?

<details>
<summary>Answer</summary>

The server refuses the delete and the product stays in the shop. The fixture does not check the response, so the test can pass even though cleanup failed. The check should accept `204` and `404`, and fail on any other status.

</details>

3. A test asks for `product`, but the API is down and `createProduct` throws. Do the test body and the cleanup after `use` run?

<details>
<summary>Answer</summary>

Neither runs: the fixture fails before handing over the value with `use`, and the runner reports a setup failure. If a fixture creates two resources and fails while creating the second, it must handle cleanup of the first.

</details>

## Next step

In the next lesson you read the Page Object in the shop and learn when to build one.
