---
title: Reviewing a spec
summary: Use a checklist on your own spec before review, then fix a deliberately poor spec step by step.
duration: 35 min
---

## Goal

- Apply a checklist to your own spec before you ask for a review.
- Spot the common problems in a poor spec.
- Rewrite a poor spec to follow the team conventions.

## Why review your own spec first

A reviewer's time is limited. If they must write "use `getByTestId`" for the tenth time, they have no time to ask the useful question: does this test check the right thing?

Read your spec once, with a checklist, before you ask for review. Most comments disappear.

## The checklist

**Conventions**

- `test` and `expect` are imported from `lib/test`, not from `@playwright/test`.
- Every element is selected with `getByTestId`. No CSS, no XPath, no text selectors for things you click.
- The URL uses a path such as `/products`. The config sets the base address.
- The style matches the project: double quotes, no semicolons, 2 spaces.

**Independence**

- The test passes alone, in any order and twice in a row.
- The test creates its own data, with `uniqueName` and `uniqueSku` or `createProduct`.
- The test does not change data that other tests use, such as a seeded record.

**Waiting**

- There is no `page.waitForTimeout`.
- Every check uses a web-first assertion: `await expect(locator)...`.
- There is no `count()` or `textContent()` followed by a plain `expect`.

**Naming and readability**

- The test name says what the user sees, such as "confirming in the dialog removes the product".
- One behaviour per test.
- Steps are in the order: prepare, act, check. A blank line separates them.

**Cleanup**

- Data that must not stay is deleted, by the test or by a fixture.
- The test does not sign out the shared admin session.

## A poor spec

This spec is poor on purpose. It breaks many rules. Read it and find the problems before you read the list.

```ts
import { test, expect } from "@playwright/test"

test("test 1", async ({ page }) => {
  await page.goto("http://localhost:5190/login")
  await page.fill("input[type=email]", "admin@qa-shop.test")
  await page.fill("input[type=password]", "Admin123!")
  await page.click("button[type=submit]")
  await page.waitForTimeout(3000)
  await page.goto("http://localhost:5190/products")
  await page.click("tr:nth-child(1) .danger")
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

1. **Wrong import.** It uses `@playwright/test`. The team imports from `../lib/test`.
2. **Bad names.** "test 1" and "test 2" say nothing. The name must say what the user sees.
3. **Full URLs.** `http://localhost:5190/...` is fixed in the test. The config has `baseURL`, so use `/products`.
4. **Login through the UI.** The config already signs every test in as admin. The login steps are slow and not needed.
5. **CSS and text selectors.** `input[type=email]`, `tr:nth-child(1) .danger` and `text=Delete` break when the layout or the words change. The team uses test ids.
6. **`text=Delete` matches many elements.** Every row has a Delete button, and the dialog has one too. This is the strict mode problem.
7. **Fixed waits.** `waitForTimeout(3000)` and `waitForTimeout(2000)` are slow and flaky.
8. **No waiting check.** `count()` reads once and plain `expect` does not retry. Use `toHaveCount`.
9. **It deletes the first row.** That is seeded data. It breaks the other tests that use it.
10. **Test 2 depends on test 1.** Test 1 deletes the first row, which is the newest product, "Docking Station" on fresh data. Test 2 then searches for it and expects one `tr`. That one `tr` is only the header row, so test 2 passes only after test 1. Alone, it fails.
11. **Weak checks.** `count()` counts the header row too. In test 1, the number 10 says nothing about the deleted product.

## The corrected version

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
})
```

Check the result against the checklist. Both tests make their own product, use test ids through the Page Object, wait with assertions and pass in any order.

## Practice

1. Pick a spec you wrote in module 3, or one from this module. Go through the checklist. Mark each line yes or no.
2. Fix every "no".
3. Create the file `apps/practice-shop/e2e/products/review-practice.spec.ts`. Paste the corrected version above into it.
4. Start the shop with `pnpm shop:dev`. In another terminal run:

```bash
pnpm shop:e2e products/review-practice.spec.ts --repeat-each 3
```

5. Both tests should pass every time. If not, read the error and the trace.
6. Write a third test in the same file. Use the corrected style to check that the status filter shows only archived products. Use `createProduct(request, { status: "archived" })` and `products.filterByStatus("archived")`.

## Check what you know

1. Name three things in the checklist about waiting.

<details><summary>Answer</summary>

No `waitForTimeout`. Every check is a web-first assertion. No plain `expect` on a value from `count()` or `textContent()`.

</details>

2. Why is `test("test 1")` a poor name?

<details><summary>Answer</summary>

It does not say what the user sees. When it fails, nobody knows what broke.

</details>

3. Why is deleting the first row of the table a problem?

<details><summary>Answer</summary>

It is shared, seeded data. Other tests may need it. A test must create and delete its own data.

</details>

4. How do you make a test ready for review?

<details><summary>Answer</summary>

Apply the checklist yourself and fix every item, then run the test alone and several times.

</details>

## Next step

You finished the good practices. In the next module you use these skills on a real project.
