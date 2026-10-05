---
title: Fixtures
summary: Understand fixtures, the built-in ones, and write a custom fixture that creates and cleans up a product.
duration: 50 min
---

## Goal

- Explain what a fixture is.
- Name the four built-in fixtures.
- Write a custom fixture with `test.extend`.
- Choose between a fixture and `beforeEach`.

## What is a fixture

A **fixture** is something a test asks for by name. Playwright prepares it before the test and removes it after.

You already use one. In this line, `page` is a fixture:

```ts
test("shows a loading message first", async ({ page }) => {
```

You write the name in curly braces. Playwright gives you a fresh, ready browser page. You did not create it.

## The built-in fixtures

Playwright gives you these four. You ask only for the ones you need.

- `page`: one browser tab. Each test gets a new one.
- `request`: a client that sends HTTP requests to the server, without a browser. You use it for API calls.
- `context`: the browser profile that owns the page. It holds cookies. One test gets one context.
- `browser`: the browser program itself. You rarely need it.

In the shop config, `use.storageState` puts the saved admin cookies into the context. So `page` and `request` are both signed in. Lesson 6 explains this.

## Why specs import from lib/test.ts

Open `apps/practice-shop/e2e/lib/test.ts`:

```ts
// Every spec imports from this file, never from "@playwright/test".
// Custom fixtures get added here later, so every spec can use them.
export { test, expect } from "@playwright/test"
```

Every spec imports `test` from here. This gives the team one place to change. If you add a fixture to this file, all specs get it, and no spec needs to change its import.

## A custom fixture

Many tests need the same two things: a product that exists, and a products page helper. A custom fixture gives them by name.

You build one with `test.extend`. It takes an object. Each key is a fixture name. Each value is a function.

The function does three things: prepare, call `use`, clean up. The call to `use(value)` hands the value to the test. When the test ends, the code after `use` runs.

Here is a complete example. It makes two fixtures: `productsPage` and `product`.

```ts
import { test as base } from "../test"
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
    // Cleanup. The test may have deleted the product already,
    // so we do not check the status here.
    await request.delete(`/api/products/${product.id}`)
  },
})

export { expect } from "../test"
```

Read it step by step.

- `base` is the normal `test` from `lib/test.ts`.
- `extend<ShopFixtures>` tells TypeScript the names and types of the new fixtures.
- The `product` fixture asks for `request`. Fixtures can use other fixtures.
- `createProduct` makes a product through the API with a unique name and SKU.
- After the test, the last line deletes the product.

Now a spec can use both:

```ts
import { expect, test } from "../lib/fixtures/products-test"

test("a product made by a fixture is in the list", async ({ productsPage, product }) => {
  await productsPage.goto()

  await expect(productsPage.row(product.id)).toBeVisible()
  await expect(productsPage.row(product.id)).toContainText(product.name)
})
```

The test body has no setup lines. The names in the braces say what it needs.

> **Note:** A fixture runs only when a test asks for it. A test that does not list `product` does not create one.

## Fixtures versus beforeEach

`beforeEach` runs code before every test in a group. It also works, but fixtures are better in most cases.

| Point | `beforeEach` | Fixture |
| --- | --- | --- |
| Cleanup | A separate `afterEach`, far from the setup | The same function, after `use` |
| Runs for | Every test in the group | Only tests that ask for it |
| Sharing | Variables outside the test | A typed value in the braces |
| Reuse in other files | Hard | Import `test` |

Use `beforeEach` for a simple step that every test in one file needs, such as opening a page. Use a fixture for data or helpers that need cleanup or that many files share.

## Go deeper

### Why a fixture has two halves

A fixture function does something odd: it stops in the middle. It runs up to `await use(value)`, waits there, and then goes on. You can see the idea in plain TypeScript, with no Playwright:

```ts
async function productFixture(use: (value: string) => Promise<void>) {
  console.log("1 setup")
  await use("a product")
  console.log("3 cleanup")
}

await productFixture(async (value) => {
  console.log("2 the test uses:", value)
})
```

It prints `1 setup`, then `2 the test uses: a product`, then `3 cleanup`. Playwright does the same. It calls your fixture, and when your code reaches `use`, Playwright runs the test with the value. When the test ends, Playwright lets your function finish. It runs the cleanup also when the test fails, so a failed test does not leave data behind.

### A common wrong idea: a fixture runs before every test

Beginners read `test.extend` and think every test gets every fixture. It does not. A fixture is made only for a test that names it. Look at these two tests:

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

The second test creates no product, because it does not list `product` in the braces. Each test that asks for `product` also gets its own new product. Two tests never share one.

### How it shows up in QA work

Look at `products.spec.ts`. The line `const products = new ProductsPage(page)` is written in all 7 tests. That is repetition of the same knowledge: how to build the page helper. The `productsPage` fixture from this lesson writes it once, and each test just asks for `productsPage`. This is the idea called DRY, from the programming module.

### When not to use a fixture

A fixture is wrong when it hides something the test is about. Imagine a fixture called `lowStockProduct`. The test reads `product.stock`, but the number 3 is hidden inside the fixture. A reader must open another file to understand the test. If the value matters to the behaviour, write it in the test with `createProduct(request, { stock: 3 })`. Use fixtures for setup that is the same everywhere, and keep the important values visible.

## Practice

1. Open `apps/practice-shop/e2e/lib/test.ts` and read it.
2. Create the file `apps/practice-shop/e2e/lib/fixtures/products-test.ts`. Copy the fixture code from this lesson.
3. Create the file `apps/practice-shop/e2e/products/fixture-practice.spec.ts`. Copy the spec code from this lesson.
4. Start the shop with `pnpm shop:dev` in one terminal.
5. In a second terminal, run your spec:

```bash
pnpm shop:e2e products/fixture-practice.spec.ts
```

6. The test should pass. Run it a second time to check it is independent.
7. Add a second test in the same file. Use only `{ productsPage }` and check that `productsPage.newButton` is visible after `goto()`.
8. When you finish, delete both files, or keep them for your own notes.

## Check what you know

1. What is a fixture?

<details><summary>Answer</summary>

Something a test asks for by name. Playwright prepares it before the test and cleans it after.

</details>

2. Which built-in fixture sends API requests without a browser?

<details><summary>Answer</summary>

`request`.

</details>

3. What does `await use(product)` do inside a fixture?

<details><summary>Answer</summary>

It gives the value to the test. When the test ends, the code after `use` runs as cleanup.

</details>

4. Name one advantage of a fixture over `beforeEach`.

<details><summary>Answer</summary>

The cleanup is in the same function as the setup. Also, it runs only for tests that ask for it.

</details>

5. What does this code print, in order? Why does a fixture put the cleanup after `use`, and not at the end of the test body?

```ts
async function productFixture(use: (value: string) => Promise<void>) {
  console.log("1 setup")
  await use("a product")
  console.log("3 cleanup")
}

await productFixture(async (value) => {
  console.log("2 the test uses:", value)
})
```

<details><summary>Answer</summary>

It prints `1 setup`, `2 the test uses: a product` and `3 cleanup`. In Playwright, the code after `use` runs even when the test fails. Cleanup at the end of a test body is skipped when an earlier line fails. So a fixture leaves no data behind.

</details>

6. This fixture has a bug. A test that deletes the product itself fails, even though the delete worked. Find the bug.

```ts
product: async ({ request }, use) => {
  const product = await createProduct(request)
  await use(product)
  await deleteProduct(request, product.id)
},
```

<details><summary>Answer</summary>

`deleteProduct` checks that the status is `204`. If the test already deleted the product, the second delete returns `404`, and the check fails during cleanup. The test is then reported as failed. The lesson uses `request.delete(...)` without a check, because the product may already be gone.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **What is a worker-scoped fixture in Playwright, and how is it different from a test-scoped one?**
   - Search for: `playwright fixtures scope worker test`
   - A good answer explains: how often each kind is created, and an example where worker scope is useful.

2. **What are setup and teardown in testing, and why is cleanup important?**
   - Search for: `test fixture setup teardown xUnit pattern`
   - A good answer explains: what each step does, and what can go wrong when a test leaves data behind.

3. **What is an automatic fixture in Playwright?**
   - Search for: `playwright automatic fixtures auto true`
   - A good answer explains: how it differs from a normal fixture, and one case where it fits, such as saving logs when a test fails.

## Next step

In the next lesson you read the Page Object in the shop and learn when to build one.
