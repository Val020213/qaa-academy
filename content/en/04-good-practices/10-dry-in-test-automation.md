---
title: DRY in test automation
duration: 65 min
---

## Goal

In this lesson you reduce the places you need to edit when the shop changes, while keeping each test's purpose visible.

- Find repeated knowledge in a spec and count the edits a change requires.
- Choose between config, helpers, fixtures, Page Objects and data tables.
- Keep steps and assertions readable with DAMP.
- Decide when to extract code and when to keep a copy.

## A spec that repeats itself

These three tests create a product through the form first, although only the first checks creation through that route.

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

If the developer renames `product-save` to `product-submit`, you must edit all three tests. Adding a required field, "Category", also takes three edits. With 30 tests that copy the form steps, each change takes 30 edits.

## Where each piece of knowledge lives

The config holds values that tests share. `playwright.config.ts` defines `baseURL`, which Playwright uses to resolve `page.goto("/products")`. Credentials are in a constant in `e2e/lib/fixtures/api-client.ts`:

```ts
export const ADMIN = { email: "admin@qa-shop.test", password: "Admin123!", name: "Ada Admin" }
```

Use `beforeEach` for setup that tests in one file share. A fixture lets you share that setup across files and keep it together with its cleanup.

The API helper `createProduct(request, overrides)` creates a product in one request. The search and filter tests only need the product to exist; they can use this helper to prepare it.

`ProductsPage`, in `e2e/lib/pages/products.page.ts`, holds the locators and actions for the products list. The spec calls `products.search(name)` and the Page Object holds the search box id.

`uniqueName` and `uniqueSku`, in `e2e/lib/helpers.ts`, hold the logic for generating unique data. Tests call those functions instead of maintaining their own version.

## One test body for several inputs

A data table lets you share a test body when the inputs and expected result change. These four cases check field validation. The rules and messages are in `lib/validation.ts`; the error ids are in `components/product-form.tsx`.

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

The loop calls `test` for each row when Playwright loads the file. The runner then executes the registered tests and reports each result separately. A title such as "the price is zero" identifies the failing case; `row 3` makes you count rows.

## The rewritten spec

Only the first test keeps the form steps, because it checks creation through the UI. The other two prepare the product through the API and keep the search, filter and assertions visible.

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

In this spec, renaming `product-save` takes one edit. A new required field takes two: one line in the form test and one default in `createProduct`. Tests that use the helper share that default.

## Keeping the test readable

When a test fails, the reviewer needs to see which actions it took and what result it expected. **DAMP**, "descriptive and meaningful phrases", accepts some repetition when it makes that easier to read.

Keep the steps of the behaviour under test and the assertions in the test. Helpers can hold setup, navigation and locators. In the rewritten spec, each test keeps the calls that show the behaviour it checks.

This call hides the actions and the check behind flags:

```ts
await runProductScenario(page, request, {
  create: "api",
  openForm: false,
  search: true,
  filter: "draft",
  expectRows: 0,
})
```

To reconstruct the steps, you must open the helper and follow its conditions. If each new scenario needs another flag and another `if`, the helper can become harder to read than the copies. In that case, put the code back into the tests and find which steps actually change together.

## Criteria for extracting code

Before creating a helper, check three things:

1. Identify the shared knowledge that should change in one place. Two identical lines can belong to different behaviours.
2. Separate setup from the behaviour under test. Keep the actions and assertions that explain that behaviour in the test.
3. Look for a real pattern. Two copies may stay; a third is a reason to consider extraction. You can extract earlier if the steps form an action with a clear name.

If the only name you can find for the helper is vague, check whether you are combining more than one idea.

## Go deeper

### KISS and YAGNI

**KISS** means "keep it simple": choose the version that is easy to read and maintain. **YAGNI** means "you are not going to need it": implement what the current tests need.

A flag for a scenario you might test someday adds a condition that no test needs yet. Wait until you have that case before extending the helper.

### Expectations independent of the app

The message `"Price must be greater than 0."` appears in both the app and the test. The copy in the test states the text the user should see.

If you import the message from the app, an accidental change alters both the displayed text and the expectation, and the test still passes. Keep the expectation separate from the code it checks.

## Practice

1. Create `apps/practice-shop/e2e/products/dry-practice.spec.ts` and paste the first spec from this lesson.
2. Start the shop with `pnpm shop:dev` in one terminal. In another, run the file and check that all three tests pass:

```bash
pnpm shop:e2e products/dry-practice.spec.ts
```

3. Create a `ProductsPage` in each test. Replace `page.getByTestId("products-table")`, `products-new`, `products-search` and `products-status-filter` with the Page Object. Run the file again.
4. In tests two and three, replace the form steps with `createProduct(request, { ... })`. Create the product before opening the page and run the file. Compare the result with the rewritten spec.
5. Add the `Values` type, the table and the loop from this lesson at the end. The imports are already there. Run the file and check that four more tests appear.
6. Count the places you would need to edit if `product-save` were renamed.
7. Delete the file when you finish, or keep it for your notes.

## Challenge

Write a spec for order moves with one test body and a table of cases. The page and API allow pending orders to become paid or cancelled, and paid orders to become shipped or cancelled. Shipped and cancelled are final statuses.

Create `apps/practice-shop/e2e/challenges/order-moves.spec.ts`. Use seeded orders: the shop does not allow you to create orders. Each row needs a different order because the moves are one-way. Reserve orders 1003 and 1005 for the existing `orders.spec.ts`.

It is done when:

- The table has at least 4 rows with different orders, the button to click and the expected status. A loop registers one test per row with a unique title that describes the move.
- Each test checks the new status in `orders-status-<id>` and that buttons forbidden by the new status disappear. From pending to paid, "Mark as paid" disappears, "Cancel" stays and "Mark as shipped" appears. At least one row reaches a final status with no action buttons.
- `pnpm shop:e2e challenges/order-moves.spec.ts` passes twice as separate normal commands; setup resets the seed on each run.
- A comment explains why repeating the tests with `--repeat-each 2` or running them with `--no-deps` against the same server fails, and how to get a fresh start.

Check the initial statuses in `apps/practice-shop/lib/store.ts` and the allowed moves in `app/(dashboard)/orders/page.tsx`. Search for: `javascript remainder operator modulo`, `typescript array of objects type`, `playwright toHaveCount 0`.

## Think it through

1. Two rows have the same `title` and the loop registers one test per row. What happens when you run the file?

<details><summary>Answer</summary>

Playwright rejects the file because of a duplicate test title. Each title must identify the case its row represents.

</details>

2. This version of the loop runs and every row passes. Why is it still wrong?

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

The object `values` is created once and shared by all tests. `Object.assign` changes it, so each row keeps the faults of the rows before it. The third row sends a bad name, a bad SKU and a bad price, but it only checks the price message, so it passes.

Each test must build its own values, as the lesson does with `{ ...base, ...row.change }` inside the test. Also, the SKU is the same for all tests, because it is made only once.

</details>

3. A developer changes the message to "Name is too short." by mistake. Version A of the test writes the expected message as text. Version B imports it from the app. Which version catches the mistake, and why?

<details><summary>Answer</summary>

Version A catches the difference between the expected text and the displayed text. Version B still passes because it imports the same message the app displays.

</details>

## Next step

In the next lesson, "From test cases to test data", you turn the test cases you already design as a manual tester into a table of rows and a loop.
