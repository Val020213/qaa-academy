---
title: From test cases to test data
summary: Turn the test-case design skill you already have into a table of rows, derive equivalence classes and boundary values from real validation code, and generate one test per row.
duration: 90 min
---

## Start with a puzzle

A shop form says the name needs "at least 3 characters". A tester tries "ab" and sees an error. She tries "abc" and it saves. She stops there.

Another tester tries 40 names: "Mouse", "Keyboard", "Monitor 27", and so on. All of them save. He reports 40 passed tests.

Both testers ran a different number of cases. One of them found where the rule lives. The other found nothing new after the first case. Which one tested better, and why? Now think about the price field, which must be "greater than 0". Which three values would you try first?

Write down your guess before you read on.

## Goal

- Derive equivalence classes and boundary values from validation code.
- Write a table of cases as data and generate one test per row.
- Decide which rows belong in an end-to-end test and which in a cheaper API check.
- Review a test with Arrange, Act, Assert and FIRST.

## Cases are data

As a manual tester you already write test cases: a name, an input and an expected result. A table of cases in code is the same thing. It is an array of objects, and one loop turns each object into one test. You used this pattern in lessons 1.09 and 4.10. This lesson decides what goes into the rows.

Two ideas choose the rows.

An **equivalence class** is a group of inputs that the app treats in the same way. If "Mouse" and "Keyboard" both pass the same check, one of them is enough. Testing the second one gives you no new information.

A **boundary value** is an input at the edge between two classes. Bugs live there, because programmers write `<` when they mean `<=`. Try the edge, one step below it and one step above it.

## Read the rules in the code

The rules are in `apps/practice-shop/lib/validation.ts`. Read the lines for name, price and stock. Before you look at the table, guess: for the name rule `name.length < 3`, which input is the last one that fails?

Watch how many errors the empty form shows, and how many are left after the name is fixed.

![An empty form shows four errors. After fixing the name, three errors remain.](/clips/shop-form-validation.webm)

| Field | Rule in the code | Classes | Boundary values |
| --- | --- | --- | --- |
| Name | trimmed, at least 3 characters | too short; long enough | `""`, `"ab"` rejected; `"abc"` accepted; `"  ab  "` rejected, because spaces are trimmed first |
| Price | a finite number, greater than 0 | not a number; infinite (`Infinity`, `1e309`); zero or less; above zero | `"abc"`, `"0"`, `"-1"` rejected; `"0.01"` accepted |
| Stock | a whole number, 0 or more | not a number; negative; not whole; whole and 0 or more | `"-1"`, `"1.5"`, `""` rejected; `"0"` accepted |

Notice what the table does not show. The name has no upper limit. The price has no upper limit. A row such as "a 10000 character name" tests a rule that does not exist. Reading the code tells you which rows are real.

> **Careful:** The code is not the requirement. If the requirement says "name: 3 to 50 characters" and the code has no maximum, the table above finds a bug that no test of the code would show. Compare both, then ask the product owner.

## One table, one loop

The form is at `/products/new`. This spec covers name, price and stock. It has both sides: accepted rows save the product, rejected rows show the error text. The product form is the thing under test here, so the test fills it through the UI. Each row changes one field of an otherwise valid form.

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

Each row creates its own SKU inside the test. No row depends on another row. Nine rows give nine tests with nine clear titles, and a failing row names itself in the report.

### Back to the puzzle

The first tester tried the two inputs on each side of the edge. The second tester tried 40 inputs from one class. For the price, start with `0` (the edge, rejected), `0.01` (a value above the edge, accepted) and a value that is not a number. Three rows beat forty.

## The shape of each test

Each test above has three parts. This is called **Arrange, Act, Assert**. Arrange builds the starting situation. Act does the one thing under test. Assert checks what the user can see. One test, one Act. If you need two Acts, you have two tests.

## Which rows need a browser?

A row in the table is cheap to write. It is not cheap to run. A browser test opens a page, types into four fields and waits for the screen.

The browser tests above check that the form shows the error next to the field. That needs a browser, but one or two rows prove it. The rule itself, "price must be greater than 0", is checked on the server, and a server check does not need a screen. This test sends the request straight to the API and uses `page.request`, which carries the admin session from the saved login:

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

The status code 422 means "the server understood the request, but the data is not valid". The body lists one message per wrong field. This test runs in a few milliseconds. Put all the rule rows here, and keep two or three rows in the browser to show that the error reaches the user.

## Review a test with FIRST

Use these five words as a review list. Ask each question about a test you wrote.

1. **Fast:** does it do only what it needs, and does it prepare data through the API when the UI is not under test?
2. **Independent:** can it run alone and in any order?
3. **Repeatable:** does it give the same result every run, thanks to unique data and no sleeps?
4. **Self-checking:** does it contain an assertion, so nobody must read the screen to decide?
5. **Timely:** was it written together with the feature, while the rules were fresh?

## The limit

More rows are not more value. Every row must be able to find a bug that no other row finds. Ask of each row: "which wrong line of code would make only this row fail?" If you cannot name one, delete the row.

## Go deeper

Equivalence classes and boundary values are the same tools you use in manual testing. Writing them as data adds two benefits. The table is a review document: a developer or the product owner can read nine lines and say "you forgot the maximum length". The loop also stops the table from drifting away from the tests, because the table is the tests.

Rows can also hide a weakness. If every row changes one field and keeps the others valid, you never test two wrong fields together. That is a deliberate choice: when a row fails, you know the cause. Add a small number of combined rows only when you suspect fields affect each other.

## Practice

1. Open `apps/practice-shop/lib/validation.ts`. For each of the five fields, write one sentence: the rule and its classes.
2. Create `apps/practice-shop/e2e/products/product-form-boundaries.spec.ts` and type in the table spec above.
3. Run it with `pnpm shop:e2e products/product-form-boundaries.spec.ts` and read the nine test titles in the report.
4. Break one rule on purpose in your own copy: change `name.length < 3` to `name.length < 4`. Which row fails? Put the line back.
5. Add the API check as a second file and run it.

## Challenge

Write a table-driven spec for the SKU field. A SKU must look like `SKU-0001`. The server also makes the text upper case before it checks it, and it refuses a SKU that another product already uses.

It is done when:

- the table has at least 8 rows, and a comment above each group of rows names its equivalence class;
- the table has rows on both the accepted and the rejected side of every boundary you found;
- the duplicate-SKU row creates its first product through the API, not through the form;
- you can name, for every row, one wrong line of code that would make it fail;
- `pnpm shop:e2e products/sku-boundaries.spec.ts` passes.

You will need something this lesson did not teach: how to read the pattern `^SKU-\d{4}$` and find its edges. Search for `regular expression anchors` and `regex digit quantifier`.

Create the file `apps/practice-shop/e2e/products/sku-boundaries.spec.ts`. Choose your own extra rows. Is a lower case `sku-1234` in the accepted class or the rejected class?

## Think it through

1. **Predict.** A tester types a single space into the Stock field and saves a valid product. Using `validation.ts`, say what the form does and why. (Hint: read how `stock` is built before the checks.)

   <details><summary>Answer</summary>

   The form saves the product with a stock of 0. The code checks `data.stock === ""`, and a space is not an empty string. Then `Number(" ")` gives 0, which is a whole number and not negative. So every check passes. This is a bug if the requirement says stock is required. It shows why a blank-looking input is a class of its own: `""` and `" "` look the same to a person and differ in the code.
   </details>

2. **Find the bug.** A teammate writes `const sku = uniqueSku()` once at the top of the file and uses `sku` in every row. The rejected rows pass. Six months later the "accepted" rows start failing. Why?

   <details><summary>Answer</summary>

   Every accepted row saves a product with the same SKU. The first one succeeds. The second one meets the duplicate rule and shows "This SKU is already used by another product.", so it fails. The rejected rows never save, so they hide the problem. The tests were not independent: they shared data. Each test must call `uniqueSku()` inside its own body.
   </details>

3. **Two versions.** Version A has one test per row. Version B puts all rejected rows in one test: it fills the form six times in a row and checks six errors. Which is better here, and what would make you choose the other?

   <details><summary>Answer</summary>

   Version A is better. A failure names the row, rows run in isolation, and a retry repeats only one case. Version B stops at the first failing step and hides the rows after it. You would choose B only if each row costs a lot, for example a slow login for every test, and the rows do not change the state. Even then, the cheaper fix is usually to move the rows to an API check.
   </details>

4. **What breaks if...** The product owner adds a rule: the name may have at most 50 characters. Which rows of the table stay valid, which must change and which must be added?

   <details><summary>Answer</summary>

   The rows for 2 and 3 characters stay valid. The unique names made by `uniqueName("Boundary")` stay below 50, so the other rows keep working too. You must add rows at the new edge: 50 characters (accepted) and 51 characters (rejected), with an error message you get from the new code. You may also add a row for the empty name. A new rule means new rows and not new test code, which is the benefit of the table.
   </details>

5. **Explain it.** Explain to a teammate, in three sentences, why one test with the price `0` and one with `0.01` is worth more than ten tests with prices like 5, 10 and 99. Do not use the words "boundary" or "equivalence".

   <details><summary>Answer</summary>

   A good answer says that all prices above zero take the same path in the code, so after one of them the others tell you nothing new. The programmer's mistake is most likely at the edge, where the code decides between "accept" and "reject", so the two values on either side of the edge can catch a wrong comparison. Ten similar values test the same line ten times, while two well-chosen values test the decision itself.
   </details>

6. **Judgement.** Your table has 30 rows for the price field. Should all of them be browser tests?

   <details><summary>Answer</summary>

   There is no single right answer. The browser proves that the error is shown to the user, and one or two rows prove it. The other rows check the rule, and the API check does that faster and with fewer causes of failure. The decision depends on where the rule lives: if the browser also validates, as in many apps, you need browser rows for that copy too. It also depends on how long the suite may take and who must read the results.
   </details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **How many values should you test at each edge: two or three?**
   - Search for: `boundary value analysis two-value three-value`
   - Try it: add the extra rows for the price field that the three-value method asks for, and see whether any of them can find a bug the two-value rows cannot.
   - A good answer explains: when the extra value helps and what kind of coding mistake it catches.

2. **What does `Number()` do with strange text?**
   - Search for: `javascript Number conversion string whitespace empty string`
   - Try it: run `Number("")`, `Number(" ")`, `Number("1e3")` and `Number("0x10")` in a small TypeScript file or in the browser console, and write a form input for each that a user could type.
   - A good answer explains: which of the results would surprise a user and which rows they add to the table.

3. **Can a program invent the rows for you?**
   - Search for: `property-based testing fast-check`
   - Try it: write a plain function `isValidName(text)` that copies the name rule, and think of three properties that must always be true, such as "any text of 3 or more non-space characters is accepted".
   - A good answer explains: what property-based testing finds that a hand-made table does not, and what it costs.

## Next step

In module 5, "Real project", you apply these skills to the two real apps and send your first pull request.
