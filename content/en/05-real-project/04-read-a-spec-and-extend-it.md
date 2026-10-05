---
title: Read a spec and extend it
summary: Read the orders spec line by line, then add the test "an admin cancels a pending order" and update COVERAGE.md.
duration: 55 min
---

## Goal

- Read an existing spec and explain each part.
- Pick data that no other test uses.
- Add one new test next to the existing ones.
- Update `COVERAGE.md` as part of the work.

## Read the spec

Open `apps/practice-shop/e2e/orders/orders.spec.ts`. It has two tests. Read the second one first. Here the first test is left out.

```ts
import { expect, test } from "../lib/test"

// Seeded orders 1001 to 1012 cycle: pending, paid, shipped, cancelled.
// A status change is one-way, so each test uses its own order:
//   1003 (shipped) for the filter, 1005 (pending) for "mark as paid".
test.describe("Orders", () => {
  // ... the status filter test is here ...
  test("an admin marks a pending order as paid", async ({ page }) => {
    await page.goto("/orders")
    await expect(page.getByTestId("orders-status-1005")).toHaveText("pending")

    await page.getByTestId("orders-mark-paid-1005").click()

    await expect(page.getByTestId("orders-status-1005")).toHaveText("paid")
    await expect(page.getByTestId("orders-mark-paid-1005")).toHaveCount(0)
  })
})
```

The first test (the status filter) follows the same shape. Look at the shape of this one: **arrange, act, assert**.

- Arrange: open `/orders` and check the order is `pending`.
- Act: click the button.
- Assert: the status is `paid` and the button is gone.

The first assertion is a **guard**. It proves the data is what you expect before you act.

## Why the order ids matter

An order status only moves forward. After a test marks an order as paid, it cannot be pending again. So each test needs its own order. The comment at the top of the spec says so.

The seed data has orders 1001 to 1012. They cycle: pending, paid, shipped, cancelled.

| Status | Order ids |
| --- | --- |
| pending | 1001, 1005, 1009 |
| paid | 1002, 1006, 1010 |
| shipped | 1003, 1007, 1011 |
| cancelled | 1004, 1008, 1012 |

The existing tests use 1003 and 1004 (the filter test) and 1005 (mark as paid). Search the spec for `1001`. It does not appear. Order 1001 is pending and free, so your test will use it.

> **Tip:** Before you pick data, search all specs for the id. Press `Ctrl+Shift+F` in VS Code.

## Step by step

**Step 1.** Write the test name as a sentence a user would say: "an admin cancels a pending order".

**Step 2.** Open the page and guard. Order 1001 must be `pending`.

**Step 3.** Click the button. The test id is `orders-cancel-1001`. The page builds it as `orders-cancel-` plus the order id.

**Step 4.** Assert the result. The status is `cancelled`. Both buttons are gone, because a cancelled order is final.

**Step 5.** Update the comment at the top, so the next person knows 1001 is taken.

## The full spec

This is the whole file after your change.

```ts
import { expect, test } from "../lib/test"

// Seeded orders 1001 to 1012 cycle: pending, paid, shipped, cancelled.
// A status change is one-way, so each test uses its own order:
//   1003 (shipped) for the filter, 1005 (pending) for "mark as paid",
//   1001 (pending) for "cancel".
test.describe("Orders", () => {
  test("the status filter shows only orders with that status", async ({ page }) => {
    await page.goto("/orders")
    await expect(page.getByTestId("orders-row-1003")).toBeVisible()
    await expect(page.getByTestId("orders-row-1004")).toBeVisible()

    await page.getByTestId("orders-status-filter").selectOption("shipped")

    await expect(page.getByTestId("orders-row-1003")).toBeVisible()
    await expect(page.getByTestId("orders-row-1004")).toHaveCount(0)
    await expect(page.getByTestId("orders-status-1003")).toHaveText("shipped")
  })

  test("an admin marks a pending order as paid", async ({ page }) => {
    await page.goto("/orders")
    await expect(page.getByTestId("orders-status-1005")).toHaveText("pending")

    await page.getByTestId("orders-mark-paid-1005").click()

    await expect(page.getByTestId("orders-status-1005")).toHaveText("paid")
    await expect(page.getByTestId("orders-mark-paid-1005")).toHaveCount(0)
  })

  test("an admin cancels a pending order", async ({ page }) => {
    await page.goto("/orders")
    await expect(page.getByTestId("orders-status-1001")).toHaveText("pending")

    await page.getByTestId("orders-cancel-1001").click()

    await expect(page.getByTestId("orders-status-1001")).toHaveText("cancelled")
    await expect(page.getByTestId("orders-cancel-1001")).toHaveCount(0)
    await expect(page.getByTestId("orders-mark-paid-1001")).toHaveCount(0)
  })
})
```

## Update COVERAGE.md

A test without a coverage note is half done. Open `apps/practice-shop/e2e/COVERAGE.md`.

In the table, change the Orders row so it says: "Status filter, admin marks a pending order as paid, admin cancels a pending order".

In "Not covered yet", delete the line "Cancelling an order." The gap is now closed.

## Go deeper

### Why the guard line exists

Look at the first assertion in the cancel test: the status of 1001 is `pending`. Imagine you removed it. If an earlier run left 1001 cancelled, the click would fail with "element not found" for `orders-cancel-1001`. That error does not say why. The guard turns it into a clear message: expected `pending`, received `cancelled`. A good test tells you what is wrong, not only that something is wrong.

### A wrong idea: "more assertions make a better test"

Beginners often assert everything they can see. Then a small, harmless change breaks ten tests. Assert what the test is about. The cancel test checks the status, and that both buttons are gone, because that is the rule. It does not check the colour of the badge, or the table header.

### How it shows up in real QA automation work

The filter test checks one status. You may want to check all of them. You could copy the test three times. Instead, write the test body once and loop over a list of data:

```ts
import { expect, test } from "../lib/test"

// status to filter by, one order that must stay, one that must go
const cases = [
  { status: "paid", shown: 1002, hidden: 1003 },
  { status: "shipped", shown: 1003, hidden: 1002 },
  { status: "cancelled", shown: 1004, hidden: 1003 },
]

test.describe("Orders filter by status", () => {
  for (const { status, shown, hidden } of cases) {
    test(`filtering by ${status} keeps order ${shown} and hides ${hidden}`, async ({ page }) => {
      await page.goto("/orders")
      await expect(page.getByTestId(`orders-row-${hidden}`)).toBeVisible()

      await page.getByTestId("orders-status-filter").selectOption(status)

      await expect(page.getByTestId(`orders-row-${shown}`)).toBeVisible()
      await expect(page.getByTestId(`orders-row-${hidden}`)).toHaveCount(0)
    })
  }
})
```

This is **DRY**: Don't Repeat Yourself. One test body, many inputs. The loop is the idea you learned as "loops and arrays of data". Each test needs a different name, so the name uses `status`. These orders are never changed by other tests, so they are safe.

### The limit of DRY

In a test, a clear story matters more than the shortest code. If the loop body grows many `if` lines, stop. Two plain tests are better than one clever test that nobody can read. Use a loop when the steps are the same and only the data changes.

## Practice

1. Search all specs for `1001`. Confirm that no test uses it.
2. Add the test to `orders/orders.spec.ts`. Update the comment.
3. Run only your test:

```bash
pnpm --filter practice-shop e2e e2e/orders/orders.spec.ts -g "cancels"
```

4. Run the whole file. Then run the whole suite twice. Both runs must pass.
5. Update `COVERAGE.md` as described.

> **Careful:** Run the file twice. Each run resets the data, so the test must pass again with fresh data.

## Check what you know

1. Why can two tests not use the same pending order?

<details><summary>Answer</summary>

A status change is one-way. After the first test, the order is no longer pending.

</details>

2. What is the guard line for?

<details><summary>Answer</summary>

It proves the order is `pending` before you click. If the data is wrong, the failure points to the cause.

</details>

3. Which test id cancels order 1009?

<details><summary>Answer</summary>

`orders-cancel-1009`.

</details>

4. What do you change in `COVERAGE.md`?

<details><summary>Answer</summary>

Add the new test to the Orders row and remove "Cancelling an order." from the gaps.

</details>

5. Two tests both start with `expect(page.getByTestId("orders-status-1005")).toHaveText("pending")` and then mark 1005 as paid. Both pass when run alone. What happens when you run both in one run, and why?

<details><summary>Answer</summary>

The second test fails at the guard. It receives `paid`, because the first test already changed the order, and a status only moves forward. The guard makes the cause easy to see. The fix is to give each test its own order.

</details>

6. Which cancel test is better? Version A has no guard line. Version B checks that 1001 is `pending` first. The data is reset before every run.

<details><summary>Answer</summary>

Version B is better. With reset data both pass today. But if the data or another test changes later, version A fails with a vague "element not found". Version B fails with "expected pending, received cancelled", which points to the cause at once. One extra line costs little.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **What is the Arrange, Act, Assert pattern in testing?**
   - Search for: `arrange act assert pattern unit testing`
   - A good answer explains: the three parts of a test and why keeping them separate makes a test easier to read

2. **What is data-driven testing, and when is it better than writing separate tests?**
   - Search for: `data-driven testing parameterized tests`
   - A good answer explains: how one test body runs with many inputs, and one case where separate tests are clearer

3. **Why do testers say each test should be independent of the others?**
   - Search for: `test independence isolation automation`
   - A good answer explains: what can go wrong when tests depend on each other, and one way to make a test independent

## Next step

In the next lesson you plan a whole new spec from a gap: editing a product.
