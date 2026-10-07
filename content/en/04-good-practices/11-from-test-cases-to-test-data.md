---
title: From test cases to test data
duration: 60 min
---

## Goal

Choose inputs for a case table from validation rules and requirements. Use the table to generate one test per row.

- Choose equivalence classes and boundary values.
- Cover accepted and rejected inputs with a data table.
- Separate API checks from form checks.
- Review tests with FIRST.

## Choosing the rows

You have already used an array of objects and a loop to generate tests. Now the work is choosing the inputs and expected results for the rows.

An **equivalence class** groups inputs that the app treats in the same way. If the names "Mouse" and "Keyboard" pass the same length check, one row can represent that class.

**Boundary values** lie at the edge where a decision changes. To check a comparison, choose the boundary, one step below it and one step above it. For the name rule, `name.length < 3`, lengths 2, 3 and 4 let you check where the result changes.

## Read the rules in the code

Open `apps/practice-shop/lib/validation.ts`. The function trims spaces from the ends of the name before checking its length. It converts price and stock to numbers before checking them.

The form sends the values to the API. The server validates them and returns errors; the form displays those errors beside the fields:

![An empty form shows four errors. After fixing the name, three errors remain.](/clips/shop-form-validation.webm)

| Field | Rule in the code | Classes | Boundary values |
| --- | --- | --- | --- |
| Name | trimmed, at least 3 characters | too short; long enough | `""`, `"ab"` rejected; `"abc"` accepted; `"  ab  "` rejected, because spaces are trimmed first |
| Price | a finite number, greater than 0 | not a number; infinite (`Infinity`, `1e309`); zero or less; above zero | `"abc"`, `"0"`, `"-1"` rejected; `"0.01"` accepted |
| Stock | a whole number, 0 or more | not a number; negative; not whole; whole and 0 or more | `"-1"`, `"1.5"`, `""` rejected; `"0"` accepted |

The code sets no maximum name length or business price maximum, but requires a finite price. A row with a 10000 character name needs a purpose based on requirements or risk; it can reveal a missing maximum.

> **Careful:** The code is not the requirement. If the requirement says "name: 3 to 50 characters" and the code has no maximum, a validation check is missing. Compare the rules with the requirements and discuss the difference with the product owner.

## One table, one loop

The form is at `/products/new`. Each row changes one field of an otherwise valid form. Accepted rows check the return to the list; rejected rows check the message and that the form stays open.

```ts
import { expect, test } from "../lib/test"
import { uniqueName, uniqueSku } from "../lib/helpers"

type Values = { name: string; sku: string; price: string; stock: string }

type Case = {
  title: string
  change: Partial<Values>
  // No "rejected" means the form must accept the input.
  rejected?: { field: "name" | "price" | "stock"; message: string }
}

const NAME_ERROR = "Name must have at least 3 characters."
const PRICE_ERROR = "Price must be greater than 0."
const STOCK_ERROR = "Stock must be a whole number, 0 or more."

const cases: Case[] = [
  { title: "name of 2 characters", change: { name: "ab" }, rejected: { field: "name", message: NAME_ERROR } },
  { title: "name of 3 characters", change: { name: "abc" } },
  { title: "name of spaces only", change: { name: "     " }, rejected: { field: "name", message: NAME_ERROR } },
  { title: "price 0", change: { price: "0" }, rejected: { field: "price", message: PRICE_ERROR } },
  { title: "price 0.01", change: { price: "0.01" } },
  { title: "price with letters", change: { price: "abc" }, rejected: { field: "price", message: PRICE_ERROR } },
  { title: "stock -1", change: { stock: "-1" }, rejected: { field: "stock", message: STOCK_ERROR } },
  { title: "stock 0", change: { stock: "0" } },
  { title: "stock 1.5", change: { stock: "1.5" }, rejected: { field: "stock", message: STOCK_ERROR } },
]

for (const row of cases) {
  test(`product form: ${row.title} is ${row.rejected ? "rejected" : "accepted"}`, async ({ page }) => {
    // Arrange: a valid form, with only the field of this row changed.
    const values: Values = {
      name: uniqueName("Boundary"),
      sku: uniqueSku(),
      price: "12.50",
      stock: "7",
      ...row.change,
    }
    await page.goto("/products/new")

    // Act: fill in the form and save it.
    await page.getByTestId("product-name").fill(values.name)
    await page.getByTestId("product-sku").fill(values.sku)
    await page.getByTestId("product-price").fill(values.price)
    await page.getByTestId("product-stock").fill(values.stock)
    await page.getByTestId("product-save").click()

    // Assert: what the user sees.
    if (row.rejected) {
      await expect(page.getByTestId(`product-${row.rejected.field}-error`)).toHaveText(row.rejected.message)
      await expect(page).toHaveURL(/\/products\/new$/)
    } else {
      await expect(page).toHaveURL(/\/products$/)
    }
  })
}
```

The loop calls `test` once per row, and Playwright's test runner registers nine tests with distinct titles. If one fails, the report identifies its input.

Each test creates its own SKU inside its body. The setup builds valid values and applies the row's change. The actions fill and save the form; the assertions check the result. One test checks one behavior, which may require several actions, such as filling fields and saving.

## Rows for the API and the browser

Use the browser to check how the form displays an error and what happens when you save. To check only a server rule, send the data directly to the API.

This test uses `page.request`, which shares cookies with the browser context. The shop configuration loads the saved admin session:

```ts
import { expect, test } from "../lib/test"
import { uniqueName, uniqueSku } from "../lib/helpers"

test("the API rejects a price of 0", async ({ page }) => {
  const response = await page.request.post("/api/products", {
    data: { name: uniqueName("Api"), sku: uniqueSku(), price: 0, stock: 1, status: "draft" },
  })

  expect(response.status()).toBe(422)
  expect(await response.json()).toEqual({ errors: { price: "Price must be greater than 0." } })
})
```

With price 0 and the other fields valid, the server returns status 422 and the price error. The test checks both the status and the response body.

This request avoids opening the form and filling its fields, although the test asks for `page` and creates a browser context. Test rules through the API and choose browser rows that cover each field’s messages and what happens on saving.

## Review a test with FIRST

Use **FIRST** as a review checklist:

1. **Fast:** does it do only what it needs and prepare data through the API when the UI is not under test?
2. **Independent:** can it run alone and in any order?
3. **Repeatable:** does it give the same result with controlled starting state and dependencies, its own data and condition-based waits?
4. **Self-checking:** does it contain an assertion that decides whether it passes or fails?
5. **Timely:** was it written together with the feature, while the rules were fresh?

Each row needs a coverage purpose: a class, boundary or interaction. Identify the defect it can detect, including a missing validation. Several rows may detect the same defect; remove one only if it adds no useful coverage.

## Go deeper

### Combinations of invalid fields

Changing one field per row makes a failure's cause easier to identify, but leaves combinations of invalid fields untested. Add a few combined rows when you suspect fields affect each other.

## Practice

1. Open `apps/practice-shop/lib/validation.ts`. For each of the five fields, write the rule and its classes.
2. Create `apps/practice-shop/e2e/products/product-form-boundaries.spec.ts` and write the table spec above.
3. Run it with `pnpm shop:e2e products/product-form-boundaries.spec.ts` and read the nine titles in the report.
4. In your copy, change `name.length < 3` to `name.length < 4`. Run the spec again and check which row fails. Restore the original line.
5. Add the API check as a second file and run it.

## Challenge

Write a table-driven SKU spec in `apps/practice-shop/e2e/products/sku-boundaries.spec.ts`. A SKU must look like `SKU-0001`. The server converts the text to upper case before checking it and rejects duplicates.

It is done when:

- The table has at least 8 rows, with a comment naming each equivalence class, and covers the accepted and rejected sides of every boundary you found.
- The duplicate-SKU row creates its first product through the API.
- You can explain each row’s purpose and which defect or missing validation it can detect.
- `pnpm shop:e2e products/sku-boundaries.spec.ts` passes.

To read the pattern `^SKU-\d{4}$` and find its boundaries, search for `regular expression anchors` and `regex digit quantifier`.

## Think it through

1. A tester types a single space into Stock and saves a product with the other fields valid. According to `validation.ts`, what happens and why?

<details><summary>Answer</summary>

The form saves the product with stock 0. The check `data.stock === ""` does not reject the space. Then `Number(" ")` gives 0, which passes the whole-number and non-negative checks. `""` and `" "` need separate rows because the validator treats them differently.

</details>

2. A teammate writes `const sku = uniqueSku()` once at the top of the file and uses `sku` in every row. Why do accepted rows fail after the first product is saved?

<details><summary>Answer</summary>

Accepted rows try to save the same SKU. After the first product, the server rejects that SKU with "This SKU is already used by another product.". Rejected rows do not save products, so they can hide the problem. Call `uniqueSku()` inside each test.

</details>

3. The product owner adds a maximum name length of 50 characters. Which rows stay valid and which should you add?

<details><summary>Answer</summary>

The expected results of the 2 and 3 character rows stay the same. Names from `uniqueName("Boundary")` have fewer than 50 characters, so the other rows do not change either. Add 50 characters as an accepted input and 51 as a rejected input, with the message from the new validation check.

</details>

## Next step

In module 5, "Real project", you apply these skills to the two real apps and send your first pull request.
