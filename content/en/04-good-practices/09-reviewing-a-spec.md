---
title: Reviewing a spec
duration: 65 min
---

## Goal

In this lesson you review a spec before asking for a review and check that its assertions detect broken behaviour.

- Apply a checklist to the spec.
- Find problems in a spec and compare its corrected version.
- Make a test fail on purpose to check what it detects.
- Resolve review comments based on behaviour and team conventions.

## The checklist

Read the test name first and check that its steps and assertions cover that behaviour. Then review the conventions and data setup with this list.

**Conventions**

- `test` and `expect` are imported from `lib/test`, not from `@playwright/test`.
- Elements are selected with `getByTestId`. No CSS, no XPath, no text selectors for things you click.
- The URL uses a path such as `/products`. The config sets the base address.
- The style matches the project: double quotes, no semicolons, 2 spaces.

**Independence**

- The test passes alone, in any order and twice in a row.
- The test creates its own data, with `uniqueName` and `uniqueSku` or `createProduct`.
- The test does not change data that other tests use, such as a seeded record.

**Waiting**

- There is no `page.waitForTimeout`.
- Checks on page state use assertions that wait: `await expect(locator)...`.
- There is no `count()` or `textContent()` followed by a plain `expect`.

**Naming and readability**

- The test name says what the user sees, such as "confirming in the dialog removes the product".
- One behaviour per test.
- Steps are in the order: prepare, act, check. A blank line separates them.
- When a locator or setup appears for the third time, consider extracting it if it represents knowledge that should change together.

**Detecting failures**

- You tried breaking the behaviour the test checks and confirmed that the test turns red.

**Cleanup**

- Data that must not stay is deleted, by the test or by a fixture.
- The test does not sign out the shared admin session.

Check the visible result of the action. `toHaveText("Name must have at least 3 characters.")` checks the message the user reads. An assertion on `text-destructive` depends on a styling class that can change even if validation still works.

The list helps find known mistakes; reviewing missing scenarios remains part of your work as a tester.

## A poor spec

This spec breaks the conventions and uses shared data:

```ts
import { test, expect } from "@playwright/test"

test("test 1", async ({ page }) => {
  await page.goto("http://localhost:5190/login")
  await page.fill("input[type=email]", "admin@qa-shop.test")
  await page.fill("input[type=password]", "Admin123!")
  await page.click("button[type=submit]")
  await page.waitForTimeout(3000)
  await page.goto("http://localhost:5190/products")
  await page.click("tbody tr:first-child .text-destructive")
  await page.click("text=Delete")
  await page.waitForTimeout(2000)
  const rows = await page.locator("tr").count()
  expect(rows).toBe(10)
})

test("test 2", async ({ page }) => {
  await page.goto("http://localhost:5190/products")
  await page.fill("input[type=search]", "Docking Station")
  expect(await page.locator("tr").count()).toBe(1)
})
```

## The problems

1. It imports from `@playwright/test`. The team imports from `../lib/test`.
2. The names "test 1" and "test 2" do not say which behaviour they check.
3. `http://localhost:5190/...` fixes the address in the test. The config has `baseURL`, so use `/products`.
4. The config already loads the admin session for every test. Login through the UI is unnecessary here.
5. `input[type=email]`, `.text-destructive` and `text=Delete` depend on the layout or text. The team uses test ids.
6. `text=Delete` matches the row buttons and the dialog button. `page.click` takes the first match, a row button. `page.getByText("Delete")` would fail in strict mode when it finds several matches.
7. `waitForTimeout(3000)` and `waitForTimeout(2000)` wait a fixed time, even if the page is ready sooner or needs longer.
8. `count()` reads once and plain `expect` does not retry. `toHaveCount` checks the locator again until the count matches or its timeout expires.
9. It deletes the first row, a seeded product that other tests may need.
10. Test 2 depends on test 1: on fresh data, the first product is "Docking Station". If it is deleted, searching leaves only the header and the `tr` count is 1. Alone, test 2 fails. The spec can fail earlier: `/login` redirects the admin to the dashboard, and `text=Delete` can select a button behind the dialog. To observe the dependency, test 1 needs a signed-out browser and confirmation with `confirm-delete-button`.
11. `count()` includes the header. With 10 products on the page, `locator("tr")` finds 11, so the number 10 is wrong. Even with the right number, the assertion does not identify the deleted product.

## The corrected version

The tests create their own products and use the page object to act on their ids:

```ts
import { expect, test } from "../lib/test"
import { createProduct } from "../lib/fixtures/api-client"
import { uniqueName } from "../lib/helpers"
import { ProductsPage } from "../lib/pages/products.page"

test("confirming in the dialog removes the product", async ({ page, request }) => {
  const product = await createProduct(request)
  const products = new ProductsPage(page)
  await products.goto()
  await expect(products.row(product.id)).toBeVisible()

  await products.delete(product.id)

  await expect(products.row(product.id)).toHaveCount(0)
})

test("searching by name shows only that product", async ({ page, request }) => {
  const product = await createProduct(request, { name: uniqueName("Searchable") })
  const products = new ProductsPage(page)
  await products.goto()
  await expect(products.row(product.id)).toBeVisible()

  await products.search(product.name)

  await expect(products.rows).toHaveCount(1)
  await expect(products.row(product.id)).toBeVisible()
})
```

The assertions wait for the row to appear before acting. The deletion check uses the same locator to confirm that the row disappears. The search checks both that only one row remains and that it belongs to the created product’s id.

## Check that the test can fail

This test can pass even if the Delete button does not delete the product:

```ts
test("confirming in the dialog removes the product", async ({ page, request }) => {
  const product = await createProduct(request)
  const products = new ProductsPage(page)
  await products.goto()
  await expect(products.row(product.id)).toBeVisible()

  await products.delete(product.id)

  await expect(page.getByTestId("product-row-" + product.id)).toHaveCount(0)
})
```

The last line looks for `product-row-` plus the id. The real test id is `products-row-`, with an `s`. Playwright finds zero elements with the wrong id, so `toHaveCount(0)` passes without checking the deletion.

The initial check uses `products.row(product.id)`, but the final check uses another locator. Check that the row was visible and that it disappears with the same locator, as in the corrected version.

To check that the test detects the failure, comment out the delete line or change the expected value and run it. If it still passes, it does not detect that change. This is a small, manual version of **mutation testing**: change the code a little and see whether the tests notice. Restore the change after the check.

## Go deeper

### A promise instead of the result

This assertion receives a promise because `await` is missing:

```ts
await products.delete(product.id)

expect(products.row(product.id).isVisible()).toBeFalsy()
```

`isVisible()` returns a promise, which is a truthy object. That is why `toBeFalsy()` fails immediately. If you change it to `toBeTruthy()`, it passes even if the row is not visible: the assertion evaluates the promise, not its result.

### Resolving review comments

A useful comment identifies the line with a problem, the behaviour it affects and the proposed change. Fix bugs in the checks before discussing style.

If someone asks for `getByRole` and the team's written rule requires `getByTestId`, follow the convention in that change and discuss updating it with the team. If the comment uncovers an accessibility bug, report it separately.

## Practice

1. Pick a spec you wrote in module 3 or this module. Go through the checklist and mark each line yes or no.
2. Fix every "no".
3. Create the file `apps/practice-shop/e2e/products/review-practice.spec.ts` and paste the corrected version.
4. Start the shop with `pnpm shop:dev`. In another terminal run:

```bash
pnpm shop:e2e products/review-practice.spec.ts --repeat-each 3
```

Both tests should pass every time. If not, read the error and the trace.

5. Put two slashes in front of the line `await products.delete(product.id)` and run again. The first test must turn red. Remove the slashes.
6. Write a third test in the same file to check that the status filter shows only archived products. Use `createProduct(request, { status: "archived" })` and `products.filterByStatus("archived")`.

## Challenge

Write a test for the Cancel button of the delete dialog. Create three broken copies, called mutants, that each change one thing. Mark them as expected failures to show that the assertions detect those changes.

Create the file `apps/practice-shop/e2e/challenges/review-cancel.spec.ts`.

It is done when:

- The real test opens the delete dialog for a product created through the API, cancels and checks that the dialog disappears and the row stays.
- There are three mutant tests marked as expected failures. Each changes exactly one thing and its title says which one.
- At least one mutant uses a wrong test id and must fail.
- `pnpm shop:e2e challenges/review-cancel.spec.ts` ends with 5 passed: the four tests and setup. Temporarily remove the expected-failure mark from one mutant and check that it turns red.

You will need to mark a test as an expected failure in Playwright. Search for: `playwright test.fail annotation`, `mutation testing explained`.

## Think it through

1. This test can pass even if the filter is broken. Find the bug.

```ts
test("the Active filter hides an archived product", async ({ page, request }) => {
  const product = await createProduct(request, { status: "archived" })
  const products = new ProductsPage(page)
  await products.goto()
  await products.filterByStatus("active")

  await expect(products.row(product.id)).toHaveCount(0)
})
```

<details><summary>Answer</summary>

If the table has not loaded yet, `toHaveCount(0)` is already true. First wait for `products.row(product.id)` to be visible; then filter and check that it disappears.

</details>

2. You combine three independent tests into one with three checks. The first assertion fails. Which results do you lose?

<details><summary>Answer</summary>

The failed assertion stops that test, so the other two checks do not run. As separate tests, the other behaviours can run and show their own results.

</details>

3. The developers rename the row test ids from `products-row-<id>` to `product-row-<id>`. What happens to tests that check visibility and those that only check absence?

<details><summary>Answer</summary>

Tests that wait for `products.row(id)` to be visible fail because the locator no longer finds the row. Those that only check `toHaveCount(0)` on the old id stay green, even though the row exists with the new name.

</details>

## Next step

In the next lesson you learn DRY in test automation: how to remove repeated knowledge from a spec, and when to leave a little repetition so each test stays easy to read.
