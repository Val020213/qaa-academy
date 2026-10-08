---
title: What to automate
duration: 60 min
---

## Goal

In this lesson you choose which checks to automate and which test level to use. You compare their execution cost with the risks they can detect.

- Calculate the time for several checks at each level of the pyramid.
- Prioritize using risk, frequency and stability.
- Choose which checks to keep manual.
- Record coverage and its gaps.

## The test pyramid

The pyramid proposes many unit tests, fewer integration tests and few E2E tests. Each level checks a different part of the application:

- A **unit test** calls a small piece of code directly, such as a function that validates a price.
- An **integration test** checks several pieces together. An **API test** sends a request to the server and checks the response.
- An **E2E test** uses a browser to go through the application, like the tests you have already written with Playwright.

![The pyramid distributes rule checks and browser journeys across different levels.](/images/04-test-pyramid.en.svg)

### The cost of repeating a check

Suppose a unit test takes 2 milliseconds, an API test takes 40 milliseconds and a browser test takes 6 seconds. These are example times, not measurements from the shop.

For this calculation, assume 12 rules, each with 8 inputs to check: 96 checks. The following calculation adds their times if they run one after another.

Save this as `exercises/challenges/cost.ts` and run it with `node exercises/challenges/cost.ts`:

```ts
const levels = [
  { name: "unit", seconds: 0.002 },
  { name: "api", seconds: 0.04 },
  { name: "browser", seconds: 6 },
]

const rules = 12
const rows = 8

for (const level of levels) {
  const total = rules * rows * level.seconds
  console.log(`${level.name}: ${rules * rows} checks take ${total.toFixed(1)} seconds`)
}
```

It prints:

```text
unit: 96 checks take 0.2 seconds
api: 96 checks take 3.8 seconds
browser: 96 checks take 576.0 seconds
```

With these times, checking every input in the browser takes almost 10 minutes. Moving rule checks to the API reduces the wait without requiring the browser to repeat every input.

## The cost and coverage of an E2E test

In Playwright, tests in one worker share the browser; each test gets an isolated context and a new page. The test loads pages and waits for visible results. It crosses several parts of the application, so it can fail for many reasons: the page, the server, the data or the network.

Alongside execution time, account for the work of investigating failures and maintaining steps when the screen changes. Reserve E2E tests for important journeys, such as signing in, creating a product and seeing it in the list.

### The bugs each level detects

For the rule “the price must be greater than 0,” consider three tests:

- A calls the price validation function directly.
- B sends the price to the server and checks the response.
- C submits the form in the browser and checks the error message.

These tests cover different failures:

![Each test level detects a different part of the price-validation path.](/images/04-layer-failures.en.svg)

1. The function accepts 0: A, B and C fail.
2. The function is correct, but the server does not call it: B and C fail.
3. The server rejects the price, but the form does not show the error: only C fails.

The browser test covers the connection between the screen and the server. If it fails, you have more pieces to investigate than with A, which calls the function directly.

You can keep B for boundary values and C to check the form message. Consider removing A only if B covers the same cases, is fast enough and the rule lives on the server.

## Choosing what to automate

Evaluate each check using three criteria:

1. **Risk:** the damage a failure causes. Login, payments and data loss are high risk.
2. **Frequency:** how often you repeat the check. Automating a check you run every release can save work.
3. **Stability:** how much the part you test changes. Frequent screen changes can require frequent test changes.

A high-risk check that is repeated and stable is a good first choice.

### A score for ranking candidates

You can give each criterion a score from 1 (low) to 3 (high) and multiply them. Using these example ratings:

- Login with a valid account: 3 x 3 x 3 = 27.
- Status badge color: 1 x 2 x 2 = 4.
- A new CSV export, rarely used and still under development: 2 x 1 x 1 = 2.

The score puts login first, but review the risk before deciding. A check with risk 3, frequency 2 and stability 1 scores 6 and may still be the most urgent.

## What stays manual

Keep manual work when you need to explore or judge the user experience:

- In **exploratory testing**, you look for behavior that the tests do not yet account for.
- To assess **usability and visual clarity**, you review whether the page and its text are understandable.
- For a **one-time check**, compare the effort of writing and maintaining a test with checking by hand.

**YAGNI**, “You Aren't Gonna Need It,” recommends building for a real need. Before adding a test “just in case,” identify the risk it would detect and when you will need to repeat it.

## A coverage inventory

Open `apps/practice-shop/e2e/COVERAGE.md`. The "What is covered" table records covered behaviors and the file that checks them. One row looks like this:

```text
| Orders    | Status filter, admin marks a pending order as paid                                            | `orders/orders.spec.ts`       |
```

The "Not covered yet" section records gaps. This is an excerpt:

```text
- Editing a product.
- The product detail page: open it from the list, check its data, go back.
- Deleting a product from its detail page.
- Pagination: the Next and Previous buttons.
- Duplicate SKU error when creating a product.
- The viewer role: no New, Edit or Delete buttons, and the API answers 403.
```

Use those gaps to prioritize the next test. Update the inventory in the same change as the tests, so the team knows which risks remain unchecked.

## Checking a rule without a browser

A function that validates a SKU's format can receive several inputs without opening pages or filling forms:

```ts
function isValidSku(value: string): boolean {
  return /^SKU-\d{4}$/.test(value.trim().toUpperCase())
}

const rows = [
  { input: "SKU-0001", expected: true },
  { input: "sku-0001", expected: true },
  { input: "SKU-1", expected: false },
  { input: "SKU-12345", expected: false },
  { input: "", expected: false },
]

for (const row of rows) {
  const actual = isValidSku(row.input)
  console.log(`${JSON.stringify(row.input)} -> ${actual} ${actual === row.expected ? "ok" : "WRONG"}`)
}
```

It prints five lines, and each one ends with `ok`. The function trims spaces and converts the text to uppercase before checking the format.

The rows represent **equivalence classes**: valid format, incorrect digit count and empty input. `SKU-12345` has one extra digit; `SKU-1` has three too few. The immediate lower boundary would be `SKU-123`.

### Checking the API response

In the shop, the form sends the values to the server. The server validates the data and returns errors; the form displays them under the fields.

This test checks the rejection of a name that is too short without using a browser page:

```ts
import { expect, test } from "../lib/test"

test("the API rejects a name that is too short", async ({ request }) => {
  const response = await request.post("/api/products", {
    data: { name: "ab", sku: "SKU-7001", price: 5, stock: 1, status: "active" },
  })

  expect(response.status()).toBe(422)
  const body = (await response.json()) as { errors: { name: string } }
  expect(body.errors.name).toBe("Name must have at least 3 characters.")
})
```

The server returns status `422` and a message for the field. The test checks both, while an E2E test can check that the form shows that message to the user.

## Go deeper

### Test count does not demonstrate coverage

If 150 tests follow the same journey with different inputs, a broken button can make all 150 fail. The number of failures does not tell you how many distinct risks they cover.

An inventory such as `COVERAGE.md` lets you review which behaviors are checked and which are missing, even when the suite has many tests.

## Practice

1. Open `apps/practice-shop/e2e/COVERAGE.md` and review the 7 rows in "What is covered".
2. From "Not covered yet", choose one item to automate first and another to leave until last. Justify each choice using risk, frequency or stability.
3. Choose a feature from your work. Write one line for each criterion and decide whether to automate it or keep it manual.
4. Start the shop in one terminal:

```bash
pnpm shop:dev
```

5. In a second terminal, run the suite:

```bash
pnpm shop:e2e
```

6. Note the test count and total time. Identify the slowest test and review whether it checks a journey or a rule.

## Challenge

Choose one field of the product form: name, SKU, price or stock. Check at least four invalid values through the API and add one browser test for the form message.

Create the file `apps/practice-shop/e2e/challenges/pyramid-split.spec.ts`.

It is done when:

- Each invalid value is tested through `/api/products` and expects status `422` and the exact message for the chosen field.
- Each value has its own test, whose name contains the value being tested.
- The browser test checks the message under the chosen field and that no error elements exist for the other fields.
- You ran `pnpm shop:e2e challenges/pyramid-split.spec.ts`, all tests passed, and you compared the API and browser test durations in the output.

To create tests from an array and send invalid data in just one field, search for: `playwright parameterize tests for loop`, `playwright list reporter test duration`.

## Think it through

1. A team has 40 E2E tests for invalid prices. Each takes 12 seconds, and they run one after another. If the team moves 38 to the API (0.04 seconds each) and keeps 2 in the browser, how long does each run take?

<details><summary>Answer</summary>

Before: 40 x 12 = 480 seconds, or 8 minutes. After: 2 x 12 + 38 x 0.04 = 25.52 seconds, about 26 seconds. The browser tests should check that the form shows the error.

</details>

2. Your team wants one E2E test for every gap in "Not covered yet" in `COVERAGE.md`. Next month it will remove the orders area. What is wrong with the plan?

<details><summary>Answer</summary>

The new order tests would have a short useful life. Record that this area will be removed and prioritize gaps in the areas that will remain available.

</details>

3. A colleague adds the input `" SKU-0001 "` to the SKU table and expects `false`. The code prints `WRONG`. What does the function return, and what should you review before changing it?

<details><summary>Answer</summary>

It returns `true`, because `.trim()` removes the spaces before checking the format. Review the requirement to decide the expected value. In the shop, `validation.ts` also trims the SKU.

</details>

## Next step

In the next lesson you learn how to keep each test independent, so it passes alone and in any order.
