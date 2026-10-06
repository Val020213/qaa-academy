---
title: Reviewing a spec
summary: Review your own spec with a checklist, prove that a test can fail, and fix a deliberately poor spec step by step.
duration: 80 min
---

## Start with a puzzle

This test has been green for six months. Last week a developer broke the delete feature: the Delete button does nothing. The test is still green. Nobody skipped it and it has no syntax error.

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

A green test that cannot turn red is worse than no test. Look at the last line. Why can it not fail?

Write down your guess before you read on.

## Goal

- Review your own spec with a checklist before you ask for a review.
- Prove that a test can fail, and find tests that cannot.
- Rewrite a poor spec to follow the team conventions.
- Judge a review comment: fix it now, discuss it, or leave it.

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

**Can it fail?**

- If the feature broke, this test would turn red. You know it, because you tried.

**Cleanup**

- Data that must not stay is deleted, by the test or by a fixture.
- The test does not sign out the shared admin session.

## A poor spec

This spec is poor on purpose. It breaks many rules. Before you read the list, take a pen and find as many problems as you can. Count them. Then compare.

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

1. **Wrong import.** It uses `@playwright/test`. The team imports from `../lib/test`.
2. **Bad names.** "test 1" and "test 2" say nothing. The name must say what the user sees.
3. **Full URLs.** `http://localhost:5190/...` is fixed in the test. The config has `baseURL`, so use `/products`.
4. **Login through the UI.** The config already signs every test in as admin. The login steps are slow and not needed.
5. **CSS and text selectors.** `input[type=email]`, `.text-destructive` and `text=Delete` break when the layout or the words change. The class `.text-destructive` is a styling class: it is a colour, not a meaning. The team uses test ids.
6. **`text=Delete` matches many elements.** Every row has a Delete button, and the dialog has one too. `page.click` does not complain: it silently takes the first match, which is a row button and not the confirm button of the dialog. A locator such as `page.getByText("Delete")` would stop with a strict mode error instead. That error is useful: it tells you the selector is too loose.
7. **Fixed waits.** `waitForTimeout(3000)` and `waitForTimeout(2000)` are slow and flaky.
8. **No waiting check.** `count()` reads once and plain `expect` does not retry. Use `toHaveCount`.
9. **It deletes the first row.** That is seeded data. It breaks the other tests that use it.
10. **Test 2 depends on test 1.** Test 1 deletes the first row, which is the newest product, "Docking Station" on fresh data. Test 2 then searches for it and expects one `tr`. That one `tr` is only the header row, so test 2 passes only after test 1. Alone, it fails. (If you run this poor spec as it is, you may not even get that far. The config already signs you in, so `/login` sends test 1 straight to the dashboard and the email fill times out. Also, `text=Delete` can hit a row button behind the open dialog. To see the data problem, start test 1 in a signed-out browser and click `confirm-delete-button`.)
11. **Weak checks.** `count()` counts the header row too. With 10 products on the page, `locator("tr")` finds 11, so the number 10 is wrong. Even with the right number, it says nothing about the deleted product.

How many did you find? Finding eight or more on your own means the checklist is already in your head. Finding fewer is normal. Use the list for every spec until it is a habit.

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

### Back to the puzzle

The last line looks for `product-row-` plus the id. The real test id is `products-row-`, with an `s`. No element ever has the wrong id, so the count is always 0. The test passes even if the delete does nothing.

The real spec protects itself in a second way. It first waits for `products.row(product.id)` to be visible. That proves the id is right, because the row was found. Only then does it delete and check that the row is gone. A "gone" check needs a "was there" check before it.

## Go deeper

### Why a checklist beats memory

You already know most of these rules. Still, you forget some of them when you are tired or in a hurry. Pilots and surgeons use checklists for the same reason. A checklist turns "have a good spec" into small yes or no questions. Each line in this checklist comes from a problem you met in this module. Writing the rules once and reading them every time is also DRY: the knowledge lives in one list, not in everyone's head.

### A common wrong idea: a passing test is a good test

A green test only says that no assertion failed. It does not say the test can fail. The puzzle showed one way. Here is another, with a different cause:

```ts
await products.delete(product.id)

expect(products.row(product.id).isVisible()).toBeFalsy()
```

There is no `await`. `isVisible()` returns a promise, and a promise is an object. An object is truthy, so `toBeFalsy()` fails here at once and the test is red. Change it to `toBeTruthy()` and the test is always green. Both mistakes teach the same lesson: a check that cannot fail gives false trust.

How to find such a test: make it fail on purpose. Comment out the delete line, or change the expected value, and run it. If it still passes, it does not check anything. This is a small, hand-made version of **mutation testing**: change the code a little and see whether the tests notice.

### How it shows up in QA work: review the idea first

When you review, read the test name first and ask: what risk does this protect? Then ask if the steps and the checks match that name. Style comes second. A perfectly styled test that checks nothing is worse than an ugly test that catches bugs.

Also look for duplication. When three tests start with the same ten lines, a reviewer will ask for a helper, a fixture or a Page Object. The next lesson shows how to choose, and when to leave the repetition alone.

### Test what the user sees, not how the code is built

A good review also asks: does this check a thing a user can see? `toHaveText("Name must have at least 3 characters.")` is what the user reads. A check on a CSS class such as `text-destructive` is how the code is built. If the developers change the colour, the class changes and the test fails, but the user sees nothing wrong. Prefer the visible.

### Reviewing with an AI assistant

You may ask an AI assistant to review a spec, or to suggest a better version. It is a fast second pair of eyes. Use it with one rule: you must run the code, and you must be able to explain every line to a teammate. Never paste code you cannot explain. An assistant can write a test that passes and cannot fail, exactly like the puzzle. Your job is to find out.

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
6. Check that the first test can fail. Put two slashes in front of the line `await products.delete(product.id)` and run again. It must turn red. Remove the slashes.
7. Write a third test in the same file. Use the corrected style to check that the status filter shows only archived products. Use `createProduct(request, { status: "archived" })` and `products.filterByStatus("archived")`.

## Challenge

Brief: a test is only worth its name if it can fail. You will write a test for the Cancel button of the delete dialog, and then you will prove that it can fail. For the proof, you write three broken copies of the test, called mutants. Each mutant changes one thing. Each mutant must turn red, and you tell Playwright to expect that.

Create the file `apps/practice-shop/e2e/challenges/review-cancel.spec.ts`.

It is done when:

- One real test opens the delete dialog for a product it made through the API, cancels, and checks that the dialog is gone and the row is still there.
- Three mutant tests exist, each marked as an expected failure, and each changes exactly one thing from the real test. The title of each says what it changes.
- At least one mutant uses a wrong test id, as in the puzzle, and still has to fail.
- `pnpm shop:e2e challenges/review-cancel.spec.ts` ends with 5 passed: your four tests and the setup test. Then temporarily remove the expected-failure mark from one mutant and see it turn red.

You will need something this lesson did not teach: how to mark a test as "expected to fail" in Playwright, so that the run is green only when the test fails. Search for: `playwright test.fail annotation`, `mutation testing explained`.

## Think it through

1. **Predict.** Run the poor "test 2" from this lesson alone, on fresh data. Does it pass? Say why, in two sentences.

<details><summary>Answer</summary>

It fails. `count()` reads once. Right after typing it may see the whole list, 10 rows and a header, so 11. After the filter works it sees one data row and one header row, so 2. It never returns 1. The test only passes by accident in the original order, because test 1 deleted "Docking Station" first. Then the search shows zero data rows, and only the header row is left, so the count is 1. The test is green for the wrong reason, which is worse than red.

</details>

2. **Find the bug.** The code runs without errors. It can pass even if the filter is broken. Why?

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

Right after `goto`, the table is not loaded yet, so no row exists, and `toHaveCount(0)` is already true. The test can pass before the filter does any work. It would pass with a broken filter. The fix is to wait first for `products.row(product.id)` to be visible, then filter, and then check that it is gone. A "gone" check needs a "was there" check before it.

</details>

3. **Two versions.** A reviewer says: "Your three tests each create a product and open the page. Merge them into one test with three checks, to save time." Both versions work. Which is better, and what would make you choose the other?

<details><summary>Answer</summary>

Three tests are better in most cases. When one fails, the title says which behaviour broke, and the other two still run and show their result. One long test stops at the first failed check and hides the rest. Merge them when the setup is very slow, for example a data import that takes minutes, and all the checks look at the same state. Here the setup is one fast API call, so the saving is tiny.

</details>

4. **What breaks if.** The developers rename the row test ids from `products-row-<id>` to `product-row-<id>`. Which of your tests turn red, which stay green, and which group is more dangerous?

<details><summary>Answer</summary>

Tests that wait for `products.row(id)` to be visible turn red, because the row is not found. Tests that only check `toHaveCount(0)` on a row, without a visible check first, stay green, and they stay green forever. The green group is more dangerous. It shows exactly why you check "was there" before "is gone", and why you try to make a test fail once.

</details>

5. **Explain it.** Explain to a new teammate why you run the checklist on your own spec before the review. Use three sentences and do not use the word "rule".

<details><summary>Answer</summary>

A good answer: "The reviewer has little time, so I remove the small problems first. Then they can spend their time on the question that matters, which is whether the test protects something real. It also teaches me, because each line in the list came from a mistake someone already made." The idea is that you protect the reviewer's attention and also learn from the list.

</details>

6. **Judgement.** A reviewer writes: "Please use `getByRole` here, it is better for accessibility." The team rule in the README says to use `getByTestId`. What do you do?

<details><summary>Answer</summary>

There is more than one good answer. Follow the written rule in this change, so the code stays consistent, and thank the reviewer. Then start a talk with the team: if they agree that roles are better, change the rule and move all the tests together. A mix of two styles in one suite is harder to read than either style alone. What you do depends on how strong the reason is and how much work a change of the whole suite would be. If the reason is a real accessibility bug in the app, raise it as a separate issue.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **What makes a code review useful and respectful?**
   - Search for: `code review best practices small changes comments`
   - Try it: take one spec you wrote and write three review comments on it as if you were the reviewer. Each comment has three parts: what you see, why it matters, and what you suggest.
   - A good answer explains: at least three habits of good reviewers and good authors.

2. **What is mutation testing, and how does it check that tests can fail?**
   - Search for: `mutation testing explained`
   - Try it: in `review-practice.spec.ts`, change `toHaveCount(0)` to `toHaveCount(1)` in the delete test and run it. Then put it back, and change `products.delete` to `products.openDeleteDialog`. Write down which change the test caught.
   - A good answer explains: how the tool changes the code on purpose, and what a surviving mutant tells you.

3. **What are test smells, such as assertion roulette or mystery guest?**
   - Search for: `test smells assertion roulette mystery guest`
   - Try it: open `e2e/products/products.spec.ts` and look for a smell from your search. Write down the line and the name of the smell, or write why you found none.
   - A good answer explains: at least two named smells, what each looks like, and how to fix it.

## Next step

In the next lesson you learn DRY in test automation: how to remove repeated knowledge from a spec, and when to leave a little repetition so each test stays easy to read.
