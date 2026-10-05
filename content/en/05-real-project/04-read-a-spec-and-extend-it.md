---
title: Read a spec and extend it
summary: Read the orders spec line by line, then add the test "an admin cancels a pending order" and update COVERAGE.md.
duration: 40 min
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

## Next step

In the next lesson you plan a whole new spec from a gap: editing a product.
