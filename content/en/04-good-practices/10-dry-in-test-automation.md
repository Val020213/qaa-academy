---
title: DRY in test automation
summary: Remove repeated knowledge from a spec with constants, helpers, Page Objects and data tables, and keep each test readable.
duration: 45 min
---

## Goal

- Find repeated knowledge in a spec and count what one change costs.
- Move each piece of knowledge to the right home: config, helper, fixture, Page Object or data table.
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

It works. Now a change request arrives: the developer renames `product-save` to `product-submit`. Count the edits. The id appears in 3 tests, so you make 3 edits. The next request adds a required field, "Category". That is 3 more edits. A suite with 30 such tests needs 30 edits each time, and you may miss one.

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

## Go deeper

### The cost of a wrong abstraction

In the programming lesson "Don't repeat yourself (DRY)", you saw that a wrong abstraction costs more than a copy. In tests it looks like `runProductScenario` above. It starts with two flags. Every new test adds one more flag and one more `if`. Soon the helper is harder to read than the copies it replaced. If this happens, copy the code back into the tests and start again.

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

## Check what you know

1. Name four places where test knowledge can live, instead of being repeated in each test.

<details><summary>Answer</summary>

The config or a constant, an API helper such as `createProduct`, a Page Object such as `ProductsPage`, and a data table with a loop. Also fixtures and `beforeEach` for repeated setup.

</details>

2. Where does the shop address live, and why does `page.goto("/products")` work?

<details><summary>Answer</summary>

It lives in `playwright.config.ts` as `baseURL`. Playwright adds it to a path that starts with a slash.

</details>

3. What does DAMP mean?

<details><summary>Answer</summary>

"Descriptive and meaningful phrases". It means a test may repeat a little if that makes the story clear to a reader.

</details>

4. What stays in the test, and what goes into helpers?

<details><summary>Answer</summary>

The behaviour under test and the assertions stay in the test. Setup, navigation, data creation and locators go into helpers.

</details>

5. A developer changes the message to "Name is too short." by mistake. Version A of the test writes the expected message as text. Version B imports the message from the app code. Which version catches the mistake, and why?

<details><summary>Answer</summary>

Version A catches it. It has its own copy of what the user should read, so the text on screen no longer matches. Version B reads the same source as the app, so both change together and the test passes. Test expectations must stay independent from the code they check.

</details>

6. Two tests share the same four setup lines. A teammate wants a helper right now. Another says to wait. Who is right?

<details><summary>Answer</summary>

It depends, and both can be right. Two copies are cheap, so waiting is safe. A third copy shows a real pattern, and then you extract. But if the four lines are one clear step that you can name well, such as "open the new product form", extracting early is fine. Do not extract when the only name you can find is a vague one.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **What did the authors of The Pragmatic Programmer mean by DRY, and why is it about knowledge and not only lines of code?**
   - Search for: `DRY principle pragmatic programmer duplication of knowledge`
   - A good answer explains: the original definition, and an example of repeated knowledge in two different forms.

2. **What is the difference between DRY and DAMP in tests, and when does each win?**
   - Search for: `DAMP vs DRY tests descriptive and meaningful phrases`
   - A good answer explains: why test code is judged on readability, and one case where repetition is better.

3. **How do you generate several tests from one table of data in Playwright?**
   - Search for: `playwright parameterize tests loop test.describe`
   - A good answer explains: the loop pattern, how to give each test a clear title, and how a failing row appears in the report.

## Next step

You finished the good practices. In the next module, "Real project", you use these skills on the full QA Shop suite, run it, read a report and close a coverage gap.
