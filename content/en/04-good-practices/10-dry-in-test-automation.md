---
title: DRY in test automation
summary: Remove repeated knowledge from a spec with constants, helpers, Page Objects and data tables, and keep each test readable.
duration: 80 min
---

## Start with a puzzle

Your team has 30 tests that fill in the product form. Two teammates argue.

Ana wants every test to write out the 8 form steps, so each test shows what the user did.

Ben wants one helper, `fillEverything(page, flags)`, with 6 flags, so no step is ever written twice.

Next month the form gets a new required field. Later, one test fails at 3 a.m. and you must find out why. Count the edits for the new field in Ana's way and in Ben's way. Then ask which test is easier to read at 3 a.m. Is there a third way that does well in both cases?

Write down your guess before you read on.

## Goal

- Count what one change costs in a spec, and find the repeated knowledge behind it.
- Decide where each piece of knowledge lives: config, helper, fixture, Page Object or data table.
- Explain why a test must stay readable, and what DAMP means.
- Decide with three questions when to remove repetition and when to leave it.

## A spec that repeats itself

In the programming module you learned DRY: each piece of knowledge lives in one place. Now apply it to the shop suite. Here are three tests. Each one creates a product through the form first.

```ts
import { expect, test } from "../lib/test"
import { uniqueName, uniqueSku } from "../lib/helpers"

test("a new product is at the top of the list", async ({ page }) => {
  const name = uniqueName("Created")
  await page.goto("/products")
  await expect(page.getByTestId("products-table")).toBeVisible()
  await page.getByTestId("products-new").click()
  await page.getByTestId("product-name").fill(name)
  await page.getByTestId("product-sku").fill(uniqueSku())
  await page.getByTestId("product-price").fill("12.50")
  await page.getByTestId("product-stock").fill("7")
  await page.getByTestId("product-save").click()
  await expect(page).toHaveURL(/\/products$/)

  await expect(page.getByTestId(/^products-row-/).first()).toContainText(name)
})

test("a new product can be found by searching", async ({ page }) => {
  const name = uniqueName("Searchable")
  await page.goto("/products")
  await expect(page.getByTestId("products-table")).toBeVisible()
  await page.getByTestId("products-new").click()
  await page.getByTestId("product-name").fill(name)
  await page.getByTestId("product-sku").fill(uniqueSku())
  await page.getByTestId("product-price").fill("12.50")
  await page.getByTestId("product-stock").fill("7")
  await page.getByTestId("product-save").click()
  await expect(page).toHaveURL(/\/products$/)

  await page.getByTestId("products-search").fill(name)

  await expect(page.getByTestId(/^products-row-/)).toHaveCount(1)
})

test("the Active filter hides a new draft product", async ({ page }) => {
  const name = uniqueName("Draft")
  await page.goto("/products")
  await expect(page.getByTestId("products-table")).toBeVisible()
  await page.getByTestId("products-new").click()
  await page.getByTestId("product-name").fill(name)
  await page.getByTestId("product-sku").fill(uniqueSku())
  await page.getByTestId("product-price").fill("12.50")
  await page.getByTestId("product-stock").fill("7")
  await page.getByTestId("product-save").click()
  await expect(page).toHaveURL(/\/products$/)
  await page.getByTestId("products-search").fill(name)
  await expect(page.getByTestId(/^products-row-/)).toHaveCount(1)

  await page.getByTestId("products-status-filter").selectOption("active")

  await expect(page.getByTestId(/^products-row-/)).toHaveCount(0)
})
```

It works. Before you read on, answer in your head: what is the first thing you would change here, and why? Now a change request arrives: the developer renames `product-save` to `product-submit`. Count the edits. The id appears in 3 tests, so you make 3 edits. The next request adds a required field, "Category". That is 3 more edits. A suite with 30 such tests needs 30 edits each time, and you may miss one.

## Where each piece of knowledge lives

The same knowledge appears again and again. Each kind has its own home.

**A value: a constant or the config.** The address of the shop is written once, in `playwright.config.ts`, as `baseURL`. That is why tests write `page.goto("/products")` and not the full address. Credentials live in one constant in `e2e/lib/fixtures/api-client.ts`:

```ts
export const ADMIN = { email: "admin@qa-shop.test", password: "Admin123!", name: "Ada Admin" }
```

**Repeated setup: `beforeEach` or a fixture.** Use `beforeEach` for a step all tests in one file need. Use a fixture when the setup needs cleanup or many files share it. Lesson 4 explains both.

**Repeated data creation: an API helper.** `createProduct(request, overrides)` creates a product in one request. Tests two and three above do not care how the product was made. They only need it to exist.

**Repeated locators and actions for one page: a Page Object.** `ProductsPage` in `e2e/lib/pages/products.page.ts` knows the ids of the table, the rows and the search box. Tests say `products.search(name)`.

**Unique data: `uniqueName` and `uniqueSku`.** These are in `e2e/lib/helpers.ts`. Every test calls them, and none invents its own way.

**The same scenario with different inputs: a data table and a loop.** Here are four field-validation cases. (The server also checks that the status is valid and that the SKU is not used by another product, but these four are enough for the example.) Writing four copies of one test is DRY broken. Write one test body and a table of rows. These values come from `lib/validation.ts`, and the error ids from `components/product-form.tsx`:

```ts
import { expect, test } from "../lib/test"
import { uniqueName, uniqueSku } from "../lib/helpers"
import { ProductsPage } from "../lib/pages/products.page"

type Values = { name: string; sku: string; price: string; stock: string }

// Each row changes ONE field of an otherwise valid form.
// The messages are written out on purpose: they are what the user must read.
const invalidInputs: { title: string; change: Partial<Values>; field: string; message: string }[] = [
  {
    title: "the name is too short",
    change: { name: "ab" },
    field: "name",
    message: "Name must have at least 3 characters.",
  },
  {
    title: "the SKU has the wrong shape",
    change: { sku: "ABC-1" },
    field: "sku",
    message: "SKU must look like SKU-0001.",
  },
  {
    title: "the price is zero",
    change: { price: "0" },
    field: "price",
    message: "Price must be greater than 0.",
  },
  {
    title: "the stock is not a whole number",
    change: { stock: "1.5" },
    field: "stock",
    message: "Stock must be a whole number, 0 or more.",
  },
]

for (const row of invalidInputs) {
  test(`the form shows an error when ${row.title}`, async ({ page }) => {
    const values: Values = {
      name: uniqueName("Valid"),
      sku: uniqueSku(),
      price: "12.50",
      stock: "7",
      ...row.change,
    }
    const products = new ProductsPage(page)
    await products.goto()
    await expect(products.table).toBeVisible()
    await products.newButton.click()
    await page.getByTestId("product-name").fill(values.name)
    await page.getByTestId("product-sku").fill(values.sku)
    await page.getByTestId("product-price").fill(values.price)
    await page.getByTestId("product-stock").fill(values.stock)

    await page.getByTestId("product-save").click()

    await expect(page.getByTestId(`product-${row.field}-error`)).toHaveText(row.message)
  })
}
```

The `...row.change` part copies all fields, then replaces the one in the row. Each row becomes one test with its own title. A new rule is a new row, not a new test.

## The rewritten spec

Here are the same three tests after the changes. Only the first test creates a product through the form, because that test is about the form. The other two prepare the product through the API.

```ts
import { expect, test } from "../lib/test"
import { createProduct } from "../lib/fixtures/api-client"
import { uniqueName, uniqueSku } from "../lib/helpers"
import { ProductsPage } from "../lib/pages/products.page"

test("a new product is at the top of the list", async ({ page }) => {
  const name = uniqueName("Created")
  const products = new ProductsPage(page)
  await products.goto()
  await expect(products.table).toBeVisible()

  await products.newButton.click()
  await page.getByTestId("product-name").fill(name)
  await page.getByTestId("product-sku").fill(uniqueSku())
  await page.getByTestId("product-price").fill("12.50")
  await page.getByTestId("product-stock").fill("7")
  await page.getByTestId("product-save").click()

  await expect(page).toHaveURL(/\/products$/)
  await expect(products.rows.first()).toContainText(name)
})

test("a product can be found by searching", async ({ page, request }) => {
  const product = await createProduct(request, { name: uniqueName("Searchable") })
  const products = new ProductsPage(page)
  await products.goto()
  await expect(products.row(product.id)).toBeVisible()

  await products.search(product.name)

  await expect(products.rows).toHaveCount(1)
})

test("the Active filter hides a draft product", async ({ page, request }) => {
  const product = await createProduct(request, { name: uniqueName("Draft"), status: "draft" })
  const products = new ProductsPage(page)
  await products.goto()
  await expect(products.row(product.id)).toBeVisible()
  await products.search(product.name)
  await expect(products.rows).toHaveCount(1)

  await products.filterByStatus("active")

  await expect(products.rows).toHaveCount(0)
})
```

Now count again. Renaming `product-save` is 1 edit, in the one test about the form. A new required field is 2 edits: one line in the form test and one default in `createProduct`. With 30 tests, the cost is still 2.

## A test is read more than it is written

Code is written once and read many times. A test is read most when it fails. Someone opens it at a bad moment, maybe on a Friday, and must understand quickly what the user did and what was wrong.

DRY has a partner: **DAMP**, "descriptive and meaningful phrases". A DAMP test accepts a little repetition when it makes the story clear. Repetition is fine when it helps a reader. It is not fine when it only costs you edits.

So use this split.

- **Keep in the test:** the steps that are the behaviour under test, and the assertions.
- **Hide in helpers:** setup, navigation, data creation and locators.

Look at too much hiding. This test does everything in one call:

```ts
await runProductScenario(page, request, {
  create: "api",
  openForm: false,
  search: true,
  filter: "draft",
  expectRows: 0,
})
```

When it fails, you do not know what the user did. You must open the helper, read the flags and imagine the steps. The readable version is the third test above. It shows the product, the search, the filter and the check. Read it once and you know the story.

### Back to the puzzle

The third way is to split by what changes together. The form steps change together, so they live in one place: the `createProduct` helper for tests that only need a product, and one form test for the form itself. The behaviour of each test stays in the test, in plain steps: search, filter, check.

Ana's way costs 30 edits for the new field. Ben's way costs one edit, but at 3 a.m. you open a helper and read six flags to guess what the user did. The rewritten spec costs two edits and every test still reads as a short story. Remove repetition of knowledge that changes together. Keep repetition that explains the story.

## Go deeper

### The cost of a wrong abstraction

In the programming lesson "Don't repeat yourself (DRY)", you saw that a wrong abstraction costs more than a copy. In tests it looks like `runProductScenario` above. It starts with two flags. Every new test adds one more flag and one more `if`. Soon the helper is harder to read than the copies it replaced. If this happens, copy the code back into the tests and start again.

### The counterweight: KISS and YAGNI

DRY pulls toward more helpers. Two other ideas pull back. **KISS** means "keep it simple": the plain version that anyone can read is better than the clever one. **YAGNI** means "you are not going to need it": do not build for a need you only imagine. A helper with a flag for "maybe one day we will test this" is YAGNI broken. Write the helper when the third copy is real.

### A wrong idea: remove all repetition

A message such as `"Price must be greater than 0."` appears in the app and in the test. It looks repeated. Do not remove it. Imagine the test imported the message from the app. A developer breaks the text by mistake. The app and the test change together, and the test still passes. The test text is a second, independent witness of what the user must see. DRY is for knowledge you maintain. A test expectation is meant to be separate from the code it checks.

### A trade-off of loops

With a loop, one failing row shows only one failing test. That is good, if the title is clear. The title includes the reason, such as "the price is zero". A title like `row 3` would force you to count the table.

## Decide where it lives

Ask three questions when you see repetition.

1. **Where does this knowledge live?** An address goes to the config. A locator goes to a Page Object. A product goes to a helper. A list of inputs goes to a data table.
2. **Is it setup or the behaviour?** Setup moves to a helper. Behaviour stays in the test.
3. **Have I seen it three times?** Two copies may stay. At the third, extract it.

> **Tip:** If you cannot name the helper in one clear phrase, you may be hiding more than one idea.

## Practice

1. Create the file `apps/practice-shop/e2e/products/dry-practice.spec.ts`. Paste the first spec from this lesson, the repetitive one, into it.
2. Start the shop with `pnpm shop:dev` in one terminal. In a second terminal, run the file:

```bash
pnpm shop:e2e products/dry-practice.spec.ts
```

3. All three tests should pass. Note how long the run takes.
4. Make the first change: create a `ProductsPage` in each test. Replace `page.getByTestId("products-table")`, `products-new`, `products-search` and `products-status-filter` with the Page Object. Run the file again.
5. Make the second change: in tests two and three, replace the form steps with `createProduct(request, { ... })`. Remember to create the product before you open the page. Run the file again.
6. Compare your file with the rewritten spec in this lesson. Count how many lines you removed.
7. Add the `Values` type, the table and the loop from this lesson to the end of your file. The imports are already there. Run the file. You should see four more tests.
8. Pretend `product-save` is renamed. Count the places you must edit in your file.
9. Delete the file when you finish, or keep it for your notes.

## Challenge

Brief: the orders page lets an admin move an order from one status to the next. The rules are the same on the page and in the API: a pending order can become paid or cancelled, a paid order can become shipped or cancelled, and a shipped or cancelled order is final. Write one spec for these moves with one test body and one table of cases, not one copy per case.

Create the file `apps/practice-shop/e2e/challenges/order-moves.spec.ts`. The shop has no way to create an order, so you must use seeded orders. A move is one-way, so each row of your table needs its own order. The existing `orders.spec.ts` already uses orders 1003 and 1005. Do not use those two.

It is done when:

- The table has at least 4 rows, and each row names a different seeded order, the button to click and the status it should show afterwards.
- One loop makes one test per row, and each title says the move, such as "a paid order can be marked as shipped". No two titles are the same.
- Each test checks the new status in `orders-status-<id>` and that the buttons the new status no longer allows are gone. For example, after pending to paid, "Mark as paid" is gone, but "Cancel" stays and "Mark as shipped" appears.
- At least one row covers a final status: the order has no action buttons at all.
- `pnpm shop:e2e challenges/order-moves.spec.ts` passes. A comment in the file explains why running it with `--repeat-each 2` (or with `--no-deps`) against the same server fails, and how to get a fresh start. A normal second command passes, because the setup resets the seed.

You will need something this lesson did not teach: how to find out which seeded order has which status, from the seed code in `apps/practice-shop/lib/store.ts`, and which moves are legal, from `app/(dashboard)/orders/page.tsx`. Search for: `javascript remainder operator modulo`, `typescript array of objects type`, `playwright toHaveCount 0`.

## Think it through

1. **Predict.** Two rows of your data table have the same `title`. The loop creates a test from each row. What happens when you run the file, and what does that teach you about the table?

<details><summary>Answer</summary>

Playwright refuses to run the file and reports a duplicate test title. It does not run one of them silently. This is a helpful guard. Each row must say something different, because a title that is the same means two rows probably test the same thing. If the rows really differ, the difference belongs in the title.

</details>

2. **Find the bug.** This version of the loop from the lesson runs, and every row passes. Why is it still wrong?

```ts
const values = { name: uniqueName("Valid"), sku: uniqueSku(), price: "12.50", stock: "7" }

for (const row of invalidInputs) {
  test(`the form shows an error when ${row.title}`, async ({ page }) => {
    Object.assign(values, row.change)
    // ...open the form, fill it with `values`, click save
    await expect(page.getByTestId(`product-${row.field}-error`)).toHaveText(row.message)
  })
}
```

<details><summary>Answer</summary>

The object `values` is created once and shared by all tests. `Object.assign` changes it, so each row keeps the faults of the rows before it. The third row sends a bad name, a bad SKU and a bad price, but it only checks the price message, so it passes. Run alone, with `--grep`, the same row sends only the price fault, so the result depends on which tests ran before. Each test must build its own values, as the lesson does with `{ ...base, ...row.change }` inside the test. Also, the SKU is the same for all tests, because it is made only once.

</details>

3. **Two versions.** A developer changes the message to "Name is too short." by mistake. Version A of the test writes the expected message as text. Version B imports the message from the app code. Which version catches the mistake, and why?

<details><summary>Answer</summary>

Version A catches it. It has its own copy of what the user should read, so the text on screen no longer matches. Version B reads the same source as the app, so both change together and the test passes. Test expectations must stay independent from the code they check.

</details>

4. **What breaks if.** The form gets a new required field, "Category". Count the edits in the first, repetitive spec, in the rewritten spec, and in the data-table spec. What does the table spec need besides the helper?

<details><summary>Answer</summary>

The repetitive spec needs 3 edits, one per test. The rewritten spec needs 2: one line in the form test and one default in `createProduct`. The data-table spec fills the form in the same way as the form test, so it needs the same line, and it also needs a new row if "Category" has its own rule. A new rule is a new row, not a new test. The cost stays small because the knowledge is in a few places.

</details>

5. **Explain it.** Explain the difference between DRY and DAMP to a teammate in three sentences. Do not use the word "repeat" or "repetition".

<details><summary>Answer</summary>

A good answer: "DRY says one piece of knowledge should live in one place, so a change is made once. DAMP says a test should read like a clear story, even if some lines look the same in two tests. I use DRY for things like locators and data creation, and DAMP for the steps and checks that tell what the user does." The key idea is that both are about cost: DRY lowers the cost of change, and DAMP lowers the cost of reading.

</details>

6. **Judgement.** Two tests share the same four setup lines. A teammate wants a helper right now. Another says to wait. Who is right?

<details><summary>Answer</summary>

It depends, and both can be right. Two copies are cheap, so waiting is safe. A third copy shows a real pattern, and then you extract. But if the four lines are one clear step that you can name well, such as "open the new product form", extracting early is fine. Do not extract when the only name you can find is a vague one, and do not build for a need you only imagine.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **What did the authors of The Pragmatic Programmer mean by DRY, and why is it about knowledge and not only lines of code?**
   - Search for: `DRY principle pragmatic programmer duplication of knowledge`
   - Try it: in PowerShell, run `Get-ChildItem apps/practice-shop -Recurse -Include *.ts,*.tsx,*.md | Select-String "Admin123"`. Write down which file is the one home of the knowledge, which files hold a copy, and whether each copy is a mistake.
   - A good answer explains: the original definition, and an example of repeated knowledge in two different forms.

2. **What is the difference between DRY and DAMP in tests, and when does each win?**
   - Search for: `DAMP vs DRY tests descriptive and meaningful phrases`
   - Try it: take the helper-hidden version `runProductScenario(...)` from this lesson and write the same test with plain steps. Count the lines. Then show both to a friend for 30 seconds each, and ask what the test does.
   - A good answer explains: why test code is judged on readability, and one case where repetition is better.

3. **How do you generate several tests from one table of data in Playwright?**
   - Search for: `playwright parameterize tests loop test.describe`
   - Try it: in your `dry-practice.spec.ts`, add a `test.describe` around the loop and run the file. Then change one row so it passes when it should fail, and see how the report names the failing row.
   - A good answer explains: the loop pattern, how to give each test a clear title, and how a failing row appears in the report.

## Next step

In the next lesson, "From test cases to test data", you turn the test cases you already design as a manual tester into a table of rows and a loop.
