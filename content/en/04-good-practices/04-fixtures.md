---
title: Fixtures
summary: Understand fixtures and cleanup, write a custom fixture with test.extend, and judge when a fixture helps and when it hides too much.
duration: 85 min
---

## Start with a puzzle

Read this plain TypeScript. It is not Playwright. A function prepares a lamp, hands it to a test, and cleans up afterwards. The test throws an error on purpose.

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

Which letters print, and in which order? Is the cleanup line `B` among them?

Then think: a Playwright fixture looks the same, and Playwright says it cleans up also when a test fails. How can that be?

Write down your guess before you read on.

## Goal

- Predict the order in which setup, test and cleanup run.
- Write a custom fixture with `test.extend` that creates and removes data.
- Explain why cleanup after `use` is safer than cleanup at the end of a test.
- Decide when a fixture helps and when it hides what the test is about.

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
export type { Page, Locator, APIRequestContext } from "@playwright/test"
```

Every spec imports `test` from here. This gives the team one place to change. If you add a fixture to this file, all specs get it, and no spec needs to change its import.

## The idea in plain code: two halves

### Back to the puzzle

Plain TypeScript prints `A setup`, `C test uses lamp`, `D caught` and `E end`. The line `B cleanup` never prints. When the test throws, the error travels back through `await use(...)`, and the function stops there. So in plain code you must write `try ... finally` to get a cleanup that always runs.

Playwright does this work for you. It calls your fixture and runs your test with the value. When the test fails, Playwright records the failure, and still lets your fixture continue after `use`. So the cleanup runs. This small program imitates that, with a runner that keeps the error aside:

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

Even the failed test leaves nothing behind. Compare with a cleanup written as the last line of the test body: that line is never reached when an earlier line throws, and the product stays in the shop.

### What happens with two fixtures?

A fixture can ask for another fixture. In which order do you expect setup and teardown when a product needs a user? Guess, then read the result of this plain code, where one function holds the other:

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

The last thing prepared is the first thing removed. This is the right order: you cannot remove a user while the product still belongs to it. Playwright tears down fixtures in the same reverse order.

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

Check that claim with an experiment. Put `console.log("fixture: creating a product")` before the `createProduct` line. Write two tests in the same file: one that lists `product`, one that lists only `page`. What do you expect in the terminal after one run? You should see the line once, for the first test only.

## Fixtures versus beforeEach

`beforeEach` runs code before every test in a group. It also works, but fixtures are better in most cases.

| Point | `beforeEach` | Fixture |
| --- | --- | --- |
| Cleanup | A separate `afterEach`, far from the setup | The same function, after `use` |
| Runs for | Every test in the group | Only tests that ask for it |
| Sharing | Variables outside the test | A typed value in the braces |
| Reuse in other files | Hard | Import `test` |

Use `beforeEach` for a simple step that every test in one file needs, such as opening a page. Use a fixture for data or helpers that need cleanup or that many files share.

The simplest tool that does the job is the best one. This is **KISS**, "Keep It Simple". Do not write a fixture for one test that needs one line of setup.

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

A fixture should also have **one job**. A fixture that creates a product, a customer, an order and signs in a user is hard to name and hard to reuse. Four small fixtures that each do one thing are easy to combine.

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

## Challenge

Write a fixture that gives a test a page signed in as the viewer, the user who may only read. Then use it to check the "viewer role" gap from `COVERAGE.md`: a viewer sees no New, Edit or Delete buttons.

Create these files: `apps/practice-shop/e2e/challenges/viewer-test.ts` for the fixture and `apps/practice-shop/e2e/challenges/viewer-role.spec.ts` for the spec.

The viewer account is in `e2e/lib/fixtures/api-client.ts`. Every test starts signed in as admin, so your fixture must change that for its own test only.

It is done when:

- The fixture is named `viewerPage`, extends the `test` from `lib/test.ts`, and has a short comment that says what it does.
- A test that uses `viewerPage` shows that the element `user-role` says `viewer`, that `products-new` does not exist, and that the delete button of a product you created yourself does not exist.
- A second test in the same file does not ask for `viewerPage`, and still shows the admin: `user-role` says `admin` and `products-new` is visible.
- You ran the file twice, with `pnpm shop:e2e challenges/viewer-role.spec.ts`, and both runs passed. Other spec files still pass, because no test signed out the admin session.

You will need something this lesson did not teach: how to replace the signed-in user inside one test, and how cookies are shared (or not shared) between `page` and the `request` fixture. Search for: `playwright context clearCookies`, `playwright page.request shares cookies with context`. Read the Playwright page about fixtures like an engineer: find the signature of `test.extend`, copy the smallest example, and look at the part about teardown.

> **Tip:** You may ask an AI assistant for help with this challenge. Run every line it gives you, and explain each line in your own words before you keep it. If you cannot explain a line, you do not own it.

## Think it through

1. Predict the output of this plain code, and say why the last line comes first among the teardown lines.

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

<details><summary>Answer</summary>

It prints `setup user`, `setup product for Ada`, `test: Ada lamp`, `teardown product for Ada`, `teardown user`. The product depends on the user, so it is removed first. If the user were removed first, the product would point at something that no longer exists, and the cleanup of the product could fail. A fixture that depends on another is always torn down before the one it depends on.

</details>

2. This fixture has a bug. A test that deletes the product itself fails, even though the delete worked. Find the bug.

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

3. A file has three tests that all need one product. Version one uses `test.beforeEach` with a variable `let product`. Version two uses a `product` fixture. Both work. Which do you choose for this one file, and what would change your mind?

<details><summary>Answer</summary>

For one file and three tests, `beforeEach` is simple and enough, and it follows KISS. The fixture starts to win when a second file needs the same product, when cleanup must be paired with the setup, or when some tests in the file do not need the product. The choice depends on how many places use the setup, and on whether it needs cleanup.

</details>

4. Today the shop lets you delete any product. The product team adds a rule: a product that appears in an order cannot be deleted, and the server answers `409`. The `product` fixture from this lesson ignores the status of its cleanup request. What breaks, and what does the fixture hide?

<details><summary>Answer</summary>

Nothing turns red. The cleanup sends a delete, the server refuses, and the fixture does not look at the answer. The product stays in the shop after every run, and the data slowly fills with leftovers. The ignored status was a good choice for "the test already deleted it", but it also hides real failures. A better fixture accepts `204` and `404` and fails on any other status. The change in the requirement shows the cost of a silent cleanup.

</details>

5. Explain to a teammate, in three sentences and without the word "before", what a fixture is and why it is better than copying setup lines into each test.

<details><summary>Answer</summary>

A good answer says: a fixture is a named piece of setup that a test asks for in its parameters. Playwright creates it when the test starts and removes it when the test ends, even if the test fails. Copying the setup into each test repeats the knowledge and forgets the cleanup. A fixture keeps setup and cleanup in one function, so they cannot drift apart.

</details>

6. A test asks for `product`, but the API is down when the fixture runs, and `createProduct` throws. What happens to the test body? Is the cleanup line after `use` executed?

<details><summary>Answer</summary>

The test body never runs. The test is reported as failed, with an error from the fixture setup. The cleanup line after `use` is not executed either, because the function stopped before it reached `use`. That is fine here: nothing was created, so nothing needs removal. The edge case matters when a fixture creates two things: if the second creation fails, the first one is left behind, and you must handle it yourself with `try ... catch`.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **What is a worker-scoped fixture in Playwright, and how is it different from a test-scoped one?**
   - Search for: `playwright fixtures scope worker test`
   - Try it: in a scratch spec, write a fixture that prints `created` and then calls `use(1)`, and give it the option `{ scope: "worker" }`. The documentation shows how to declare worker fixtures in `test.extend`. Use the fixture in two tests and run the file. Count how many times `created` prints. Then remove the `scope` option and count again.
   - A good answer explains: how often each kind is created, and an example where worker scope is useful.

2. **What are setup and teardown in testing, and why is cleanup important?**
   - Search for: `test fixture setup teardown xUnit pattern`
   - Try it: write a test that creates a product with `createProduct` and has no cleanup. Run it three times. Open `/api/products` in the browser and count how many leftover products there are.
   - A good answer explains: what each step does, and what can go wrong when a test leaves data behind.

3. **What is an automatic fixture in Playwright?**
   - Search for: `playwright automatic fixtures auto true`
   - Try it: write a fixture with `{ auto: true }` that prints the test title when each test starts. Run two tests that do not list it, and see if it still prints.
   - A good answer explains: how it differs from a normal fixture, and one case where it fits, such as saving logs when a test fails.

## Next step

In the next lesson you read the Page Object in the shop and learn when to build one.
