---
title: Reviewing a spec
summary: Use a checklist on your own spec before review, then fix a deliberately poor spec step by step.
duration: 50 min
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
- The same locator, setup or data creation is not repeated in many tests. When it appears a third time, move it to a Page Object, a fixture or a helper.

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

## Go deeper

### Why a checklist beats memory

You already know most of these rules. Still, you forget some of them when you are tired or in a hurry. Pilots and surgeons use checklists for the same reason. A checklist turns "have a good spec" into small yes or no questions. Each line in this checklist comes from a problem you met in this module. Writing the rules once and reading them every time is also DRY: the knowledge lives in one list, not in everyone's head.

### A common wrong idea: a passing test is a good test

A green test only says that no assertion failed. It does not say the test can fail. Look at this ending of a delete test:

```ts
await products.delete(product.id)

await expect(page.getByTestId("product-row-" + product.id)).toHaveCount(0)
```

The id is wrong. The real id is `products-row-`, with an `s`. No element ever has the wrong id, so the count is always 0. The test passes even if the delete does nothing. A check that cannot fail is worse than no check, because it gives false trust.

How to find such a test: make it fail on purpose. Comment out the delete line, or change the expected value, and run it. If it still passes, it does not check anything. The real spec protects itself in another way. It first waits for `products.row(product.id)` to be visible, so you know the id is right, and only then deletes.

### How it shows up in QA work: review the idea first

When you review, read the test name first and ask: what risk does this protect? Then ask if the steps and the checks match that name. Style comes second. A perfectly styled test that checks nothing is worse than an ugly test that catches bugs.

Also look for duplication. When three tests start with the same ten lines, a reviewer will ask for a helper, a fixture or a Page Object. The next lesson shows how to choose, and when to leave the repetition alone.

### A limit of checklists

A checklist is a floor, not a ceiling. It finds the problems you already know. It cannot tell you if you forgot an important scenario. Use it, and then use your own judgement as a tester.

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

5. This test passes. Why can you not trust it? How would you prove your doubt?

```ts
await products.delete(product.id)

await expect(page.getByTestId("product-row-" + product.id)).toHaveCount(0)
```

<details><summary>Answer</summary>

The test id has a typo: it is `product-row-`, but the real one is `products-row-`. No element has that id, so the count is always 0, even when the delete fails. To prove it, remove the `products.delete(...)` line and run the test. It still passes, so it cannot detect a broken delete.

</details>

6. A reviewer writes: "Please use `getByRole` here, it is better for accessibility." The team rule in the README says to use `getByTestId`. What should you do?

<details><summary>Answer</summary>

Follow the written rule in this pull request, so the code stays consistent. Then thank the reviewer and start a talk with the team: if they agree that roles are better, change the rule and move all the tests together. A mix of two styles in one suite is harder to read than either style alone.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **What makes a code review useful and respectful?**
   - Search for: `code review best practices small changes comments`
   - A good answer explains: at least three habits of good reviewers and good authors.

2. **What is mutation testing, and how does it check that tests can fail?**
   - Search for: `mutation testing explained`
   - A good answer explains: how the tool changes the code on purpose, and what a surviving mutant tells you.

3. **What are test smells, such as assertion roulette or mystery guest?**
   - Search for: `test smells assertion roulette mystery guest`
   - A good answer explains: at least two named smells, what each looks like, and how to fix it.

## Next step

In the next lesson you learn DRY in test automation: how to remove repeated knowledge from a spec, and when to leave a little repetition so each test stays easy to read.
