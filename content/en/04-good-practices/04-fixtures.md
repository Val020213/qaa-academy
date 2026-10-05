---
title: Fixtures
summary: Understand fixtures, the built-in ones, and write a custom fixture that creates and cleans up a product.
duration: 35 min
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

## Next step

In the next lesson you read the Page Object in the shop and learn when to build one.
