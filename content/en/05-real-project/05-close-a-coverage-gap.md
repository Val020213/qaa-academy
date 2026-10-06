---
title: Close a coverage gap
summary: Plan a new spec from a gap in COVERAGE.md, predict what each choice costs, write it step by step, then close a gap with no solution given.
duration: 100 min
---

## Start with a puzzle

Maya writes a test for the edit form of the shop. She starts on the edit page itself:

```ts
await page.goto(`/products/${product.id}/edit`)
await page.getByTestId("product-name").fill("Renamed")
await page.getByTestId("product-save").click()
await expect(page.getByTestId(`products-name-${product.id}`)).toHaveText("Renamed")
```

She runs it 20 times. It passes 18 times. Twice it fails, and the list still shows the old name. The app has no bug. No step shows an error. The failing runs look the same as the passing runs, until the last line.

What is different in those two runs? Which line is the cause?

Write down your guess before you read on.

## Goal

- Plan a spec in plain language before you write any code.
- Predict what a data choice or a navigation choice costs you later.
- Decide how each test gets its data, and say why.
- Write a spec for a gap in `COVERAGE.md` and prove that it can fail.

## Plan first, code second

Do not open the editor first. Break the problem into steps in plain words. This is called **decomposition**. A short plan written as sentences, before the real code, is called **pseudocode**.

The gap is "Editing a product". Open the shop and edit a product by hand. Then write what the user sees. Each sentence will become one test.

1. The edit form starts with the current values of the product.
2. Saving a new name and status updates the list.
3. An invalid price shows an error and the product keeps its old data.
4. Cancel leaves the product unchanged.

Before you go on, find one scenario that is missing. Think about the stock field, the SKU field and an empty name. Why did the plan not include them? The answer is a choice: each test costs time to run and to read. The shop suite already tests field errors for the create form in `products/products.spec.ts`. A good plan names what it leaves out, and why.

## Decide the data

Each test needs a product to edit. Imagine that all four tests edit the seeded product `SKU-0001`. What do you expect when the second test renames it, and the tests run in another order next week?

They depend on each other. One test leaves a changed product for the next one. So create a new product for each test.

Use the UI only for the thing under test. Here the thing under test is the edit form. So create the product through the API with `createProduct`. It is faster and steadier than filling the "New product" form.

`createProduct(request, overrides)` returns the product with its `id`. Pass `overrides` to set fields, such as `{ price: 25 }`.

## Decide how to reach the form

You have two ways to reach the edit form:

- A. Open `/products/<id>/edit` directly with `page.goto`.
- B. Start on the list, find the row, and click **Edit**.

A is shorter. Which one do you expect to be steadier? Decide before you read the next paragraph.

The suite uses B. The shop renders each page on the server first, and the browser shows that HTML at once. The JavaScript of React loads a moment later and takes control of the form. Text typed in that gap can be erased. A click inside the app happens after React is running, so the form is ready.

The new product is the newest, so it is on page 1 of the list. The API sorts products by id, newest first.

### Back to the puzzle

Maya used option A. In the two failing runs, her `fill` ran in the gap, before React took control. React then set the field back to its starting value. She clicked Save with the old name, and the app saved the old name. No step failed. Only the last assertion told her that something was wrong.

The lesson here is a method for finding this kind of bug. **Debug like a scientist.** Make one guess ("typing too early"). Run one small experiment (add a check that the field holds the new value before you click). Change one thing at a time. If the failures stop, the guess was right.

## Write the spec

Create the file `apps/practice-shop/e2e/products/product-edit.spec.ts`. Notice what it reuses: `createProduct`, `uniqueName` and the `ProductsPage` Page Object. A test also has a shape: **Arrange** (create the data and open the page), **Act** (do the thing), **Assert** (check what the user sees). Find the three parts in each test.

```ts
import { expect, test } from "../lib/test"
import { createProduct } from "../lib/fixtures/api-client"
import { uniqueName } from "../lib/helpers"
import { ProductsPage } from "../lib/pages/products.page"

test.describe("Edit product", () => {
  test("the form starts with the current values", async ({ page, request }) => {
    const product = await createProduct(request, { price: 25, stock: 4, status: "draft" })
    const products = new ProductsPage(page)
    await products.goto()
    await expect(products.row(product.id)).toBeVisible()

    await page.getByTestId(`products-edit-${product.id}`).click()

    await expect(page.getByTestId("product-form-title")).toHaveText("Edit product")
    await expect(page.getByTestId("product-name")).toHaveValue(product.name)
    await expect(page.getByTestId("product-sku")).toHaveValue(product.sku)
    await expect(page.getByTestId("product-price")).toHaveValue("25")
    await expect(page.getByTestId("product-stock")).toHaveValue("4")
    await expect(page.getByTestId("product-status")).toHaveValue("draft")
  })

  test("saving a new name and status updates the list", async ({ page, request }) => {
    const product = await createProduct(request, { status: "active" })
    const newName = uniqueName("Renamed")
    const products = new ProductsPage(page)
    await products.goto()
    await expect(products.row(product.id)).toBeVisible()

    await page.getByTestId(`products-edit-${product.id}`).click()
    await page.getByTestId("product-name").fill(newName)
    await page.getByTestId("product-status").selectOption("archived")
    await page.getByTestId("product-save").click()

    await expect(page).toHaveURL(/\/products$/)
    await expect(page.getByTestId(`products-name-${product.id}`)).toHaveText(newName)
    await expect(page.getByTestId(`products-status-${product.id}`)).toHaveText("archived")
  })

  test("an invalid price shows an error and keeps the old data", async ({ page, request }) => {
    const product = await createProduct(request, { price: 30 })
    const products = new ProductsPage(page)
    await products.goto()
    await expect(products.row(product.id)).toBeVisible()

    await page.getByTestId(`products-edit-${product.id}`).click()
    await page.getByTestId("product-price").fill("0")
    await page.getByTestId("product-save").click()

    await expect(page.getByTestId("product-price-error")).toHaveText("Price must be greater than 0.")
    await expect(page).toHaveURL(new RegExp(`/products/${product.id}/edit$`))

    const saved = await request.get(`/api/products/${product.id}`)
    expect(((await saved.json()) as { price: number }).price).toBe(30)
  })

  test("cancel leaves the product unchanged", async ({ page, request }) => {
    const product = await createProduct(request)
    const products = new ProductsPage(page)
    await products.goto()
    await expect(products.row(product.id)).toBeVisible()

    await page.getByTestId(`products-edit-${product.id}`).click()
    await page.getByTestId("product-name").fill("Not saved")
    await page.getByTestId("product-cancel").click()

    await expect(page).toHaveURL(/\/products$/)
    await expect(page.getByTestId(`products-name-${product.id}`)).toHaveText(product.name)
  })
})
```

The Edit control is a link (`<a>`) that carries the test id. `click()` works the same for a link or a button. You choose elements by test id, not by tag, so the markup can change without breaking the test.

## Read it with care

- Every test creates its own product. No test depends on another.
- Each test waits for `products.row(product.id)` before it clicks. A click already waits for its element, so the wait is not strictly needed. It states the intent ("the list is ready") and gives a clearer failure message than a click that times out.
- The third test checks the data through the API, not only the screen. The form stays on screen after an error. The screen cannot tell you whether the server saved anything. The API can. Look at the order: the test first waits for the error text, and only then reads the API. The error text proves that the server has answered.
- No `waitForTimeout` anywhere.

Run it twice. Then update `COVERAGE.md`: add a Products row for editing, and delete "Editing a product." from the gaps.

## Your gaps

Pick one gap at a time. Plan the scenarios in words first. Each hint is a direction, not a solution.

- **Product detail page.** In the list, the product name is a link. Click it and read the page. Look for the test ids that start with `product-detail-`, and for `products-view-<id>` in the list. Which ones does a viewer also see? Where does the back link take you?
- **Delete from the detail page.** The detail page has its own Delete button for the admin. It opens the same confirm dialog as the list. After you confirm, where does the browser go? How do you prove that the product is gone?
- **Pagination.** The seed has 24 products, and other tests add more. Do not hard-code the number of pages. Look at the test ids `products-page`, `products-next-page` and `products-prev-page`. On page 1, which button is disabled?
- **Duplicate SKU.** Create a product through the API. Then try to create another with the same SKU in the form. Find the error text under the SKU field.
- **Shipped order.** A paid order can be marked as shipped. The seeded paid orders are 1002, 1006 and 1010. Check which are free. What buttons does a shipped order have?
- **Empty order filter.** No status is empty in the seed data, and orders only move forward. You cannot empty a status without breaking other tests. Look for how Playwright can answer one request itself: the `page.route` method.
- **404 page.** Open a product id that does not exist, such as `/products/999999`. The page has its own `data-testid`. Find it in `components/not-found-card.tsx`. Two files use that card: `app/not-found.tsx` and `app/(dashboard)/not-found.tsx`. Which one shows for an unknown product, and why does the page still have the header?
- **Return to `?next=` after login.** Start signed out. Open a protected page. Sign in through the form. Where must the browser end up? See how `auth.spec.ts` starts signed out.

## Go deeper

### Why the page needs a moment: server rendering

The shop renders the page on the server first. The browser receives ready HTML and shows it at once. After that, the JavaScript of React loads and attaches its event handlers. This step is called **hydration**. Before it ends, the page looks ready but does not react correctly to your typing.

That is why the suite starts on the list, waits for a row, and clicks **Edit**. The list rows come from a request that the browser sends after React runs. When a row is on screen, React is already running. You can learn this idea more deeply by reading about server-side rendering and hydration. Many modern sites work this way.

### A wrong idea: "toHaveValue(25) is the same as toHaveValue('25')"

The first test checks `toHaveValue("25")` with quotes. Why a string? Because the text in an input field is always text. The number 25 and the text "25" are different in TypeScript. If you write `toHaveValue(25)`, the type check fails. Check what the page really holds, not what you hope it holds.

### How it shows up in real QA automation work

Look at the four tests. Each begins with the same three lines: go to the list, wait for the row, click Edit. A candidate for **DRY** (Don't Repeat Yourself) is a method on the Page Object:

```ts
// Add to the ProductsPage class in lib/pages/products.page.ts
async openEdit(id: number) {
  await this.goto()
  // waitFor is a wait, not an assertion, so the Page Object stays assertion-free.
  await this.row(id).waitFor()
  await this.page.getByTestId(`products-edit-${id}`).click()
}
```

Now a test says `await products.openEdit(product.id)`. If the way to reach the form changes, you fix one place. But note the cost. The test no longer shows the wait, and a new reader must open another file to see it. The lesson keeps the three lines visible on purpose, because this is a learning suite. A real team may decide either way. The rule is: remove repetition when it helps the reader, not just to make the code shorter.

The opposite rule is **YAGNI** (You Aren't Gonna Need It): do not build for needs you only imagine. Do not write a method `editProduct(id, { name, price, stock, status })` with five options "because we may need it". Write it when the second test needs it. **KISS** (keep it simple) says the same: the simple version that works today is better than the flexible version that nobody uses.

### The trade-off of API set-up

Preparing data with `createProduct` is fast. But it has a risk: if the API breaks, every test that uses it fails, even tests about the edit form. For this reason, keep one test that creates a product through the form (the suite has it in `products.spec.ts`). Then you know the UI path works, and the others only reuse the shortcut.

## Practice

1. Create `products/product-edit.spec.ts` with the code above.
2. Run it: `pnpm --filter practice-shop e2e e2e/products/product-edit.spec.ts`.
3. Prove that the fourth test can fail: in `product-edit.spec.ts`, change the cancel test so it clicks `product-save` instead of `product-cancel`. Run it. Read the failure. Undo.
4. Update `COVERAGE.md`.
5. Choose one gap from your list. Write its scenarios in plain words in a text file.

## Challenge

Close the **pagination** gap. Create the file `apps/practice-shop/e2e/products/product-pagination.spec.ts`. The list shows 10 products on a page. The seed has 24 products, and other tests add more, so the number of pages is not fixed. Your tests must still pass when that number grows. Choose how you prove that page 2 shows different products from page 1.

It is done when:

- Page 1 shows exactly 10 rows, the Previous button is disabled, the Next button is enabled, and the page text starts with "Page 1 of" without a fixed total.
- After one click on Next, the page text starts with "Page 2 of", Previous is enabled, and the first row is a different product from the first row of page 1.
- Another test reaches the last page without a number written in your code, and there the Next button is disabled.
- The spec passes twice in a row, and each test passes when you run it alone with `--grep`.
- You change one expected number on purpose, run the spec, read the failure, and undo the change.

You will need something this lesson did not teach: how to check that a button is disabled, how to match text with a regular expression, and how to read a number from the page to use it in your test. Search for `playwright toBeDisabled`, `playwright toHaveText regular expression` and `playwright locator textContent`.

## Think it through

1. Suppose the server has a bug. For an invalid price, it answers with the error, but it also saves the new price first. Look at the third test in this lesson. Which assertions pass and which one fails? Say why.

<details><summary>Answer</summary>

The error text passes, because the server still sends it. The URL check passes, because the form stays on screen. The last assertion fails: the API returns the new bad price, not 30. This shows that the screen can look right while the data is wrong. Only the API read can see the second part of the bug.

</details>

2. A teammate writes the end of the third test like this. The test passes, but the idea is wrong. Find the bug.

```ts
await page.getByTestId("product-save").click()
const saved = await request.get(`/api/products/${product.id}`)
expect(((await saved.json()) as { price: number }).price).toBe(30)
await expect(page.getByTestId("product-price-error")).toBeVisible()
```

<details><summary>Answer</summary>

The API read runs right after the click. The browser may not have sent the save request yet. The read then sees the old price, and the test passes even if the server would save the bad price a moment later. Check the error text first. It appears only after the server has answered, so the read that follows is safe. The order of two checks can decide whether a test proves anything.

</details>

3. Version one has the three lines (go to the list, wait for the row, click Edit) in every test. Version two moves them to `products.openEdit(id)`. Which is better in this suite, and what would make you choose the other?

<details><summary>Answer</summary>

For four tests, many teams would pick version two, because a change in the way to reach the form is then made in one place. Version one keeps each test readable alone, and a learner sees every step. If the helper grows options and hides assertions, or only two tests use it, version one is better. The choice depends on how often the path changes and who reads the tests.

</details>

4. The product team changes the list to show the oldest products first. What breaks in your four tests, and what do you change?

<details><summary>Answer</summary>

All four tests break. The new product has the highest id, so it is no longer on page 1. `products.row(product.id)` is never visible, and the test times out. Two fixes are possible: search for the unique name first with `products.search(product.name)`, or open the page by address. The first keeps the click inside the app. The cost is one more step in every test, which is a reason to move it into a helper.

</details>

5. Explain to a teammate, in three sentences, why the suite starts on the list and clicks Edit instead of opening the edit address. Do not use the word "hydration".

<details><summary>Answer</summary>

A good answer says: the server sends a finished page, and the code that makes it interactive loads a moment later. Text typed in that moment can be erased. A click inside the app happens after the code is running, so the form is ready. Any answer that names the gap between "visible" and "ready" is correct.

</details>

6. A colleague says: "The invalid price rule belongs in a small API test, not in an end-to-end test. It is faster." Do you agree?

<details><summary>Answer</summary>

There is no single right answer. An API test is faster and finds a broken rule at once. An end-to-end test also proves that the form shows the message under the right field and that the user stays on the page. Many teams do both: the rule is tested through the API, and one end-to-end test shows that the message reaches the user. The choice depends on how much the suite costs to run and on how often the form and the rule change separately.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **What is hydration in React and server-side rendering, and why can it make automated tests flaky?**
   - Search for: `react hydration server side rendering explained`
   - Try it: open the shop login page in Chrome. Open DevTools, press `Ctrl+Shift+P`, type "Disable JavaScript" and run it, then reload. Type in the fields and press Sign in. Write what you see. Turn JavaScript on again.
   - A good answer explains: what the server sends, what React does afterwards, and why input typed before hydration can be lost

2. **What is the difference between creating test data through the UI and through an API?**
   - Search for: `test data setup api vs ui automation`
   - Try it: write a throwaway test that creates 5 products with `createProduct`, and another that creates 5 through the "New product" form. Run both with the list reporter and compare the times. Delete the file.
   - A good answer explains: one advantage and one risk of each approach, and when a team chooses each

3. **What does an HTTP 201 status mean, and how is it different from 200?**
   - Search for: `http status 201 created vs 200 ok`
   - Try it: open DevTools, then the Network tab. Create a product in the shop. Find the request to `/api/products` and read its status. Then save an edit and compare the status of that request.
   - A good answer explains: what 201 says about the result of a POST request, and why the helper checks for it

## Next step

In the next lesson you test a second user, the viewer, which needs a second session.
