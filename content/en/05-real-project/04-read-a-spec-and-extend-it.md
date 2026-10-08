---
title: Read a spec and extend it
duration: 75 min
---

## Goal

You will extend the orders spec with a cancellation test and record the new coverage.

- Read the setup, action and assertions in an existing test.
- Identify the available actions from the page code.
- Choose an order that no other test changes.
- Add the test and update `COVERAGE.md`.

## Read the spec

Open `apps/practice-shop/e2e/orders/orders.spec.ts`. It has two tests; the second is shown here.

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

In this test, **Arrange, Act, Assert** breaks down as follows:

- Arrange: open `/orders` and check the order is `pending`.
- Act: click the button.
- Assert: the status is `paid` and the button is gone.

The first assertion is a **guard**: it checks the status the test needs before the click. If an earlier run left the order paid, the test fails there and shows the unexpected status.

Without the guard, Playwright would wait for the missing button until the action timeout expired; the click would fail with a timeout error.

The assertions check visible behavior: the status changes and the action that is no longer allowed disappears. A component change can preserve these tests if it keeps the test ids and texts.

## Where the buttons come from

Read the rule in `apps/practice-shop/app/(dashboard)/orders/page.tsx`:

```tsx
const NEXT_STEPS: Record<OrderStatus, { status: OrderStatus; label: string; testId: string }[]> = {
  pending: [
    { status: "paid", label: "Mark as paid", testId: "orders-mark-paid" },
    { status: "cancelled", label: "Cancel", testId: "orders-cancel" },
  ],
  paid: [
    { status: "shipped", label: "Mark as shipped", testId: "orders-mark-shipped" },
    { status: "cancelled", label: "Cancel", testId: "orders-cancel" },
  ],
  shipped: [],
  cancelled: [],
}
```

The page loops over the list for each order's status to show the admin's actions. A pending order has two buttons, a paid one has two, and shipped or cancelled orders have none.

Each button gets the test id `${step.testId}-${order.id}`. The cancel button for order 1001 is `orders-cancel-1001`.

After the click, the page sends the change to the server with PATCH and fetches the orders again with `load()`. The status the test checks comes from that new read.

![Pending and paid orders can be cancelled; shipped and cancelled orders are final.](/images/05-order-transitions.en.svg)

## Choose the order

An order status only moves forward. After marking it as paid, the API does not allow it to return to pending. Reserve a different order for each test that changes its status.

The seed data contains orders 1001 to 1012:

| Status | Order ids |
| --- | --- |
| pending | 1001, 1005, 1009 |
| paid | 1002, 1006, 1010 |
| shipped | 1003, 1007, 1011 |
| cancelled | 1004, 1008, 1012 |

The existing tests use 1003 and 1004 for the filter and 1005 for marking as paid. Order 1001 is pending and available for cancellation.

Before choosing it, search all specs for `1001` with `Ctrl+Shift+F` in VS Code. The spec comment should record which test uses it.

### The effect on the dashboard

The card `stat-pending-orders` counts pending orders: 3 in the seed data, 2 after 1005 is paid and 1 after 1001 is cancelled. A test that always expects 3 depends on running before those changes.

This suite uses one worker and discovers files sorted by name. A test that relies on that order can pass until the names or configuration change.

`dashboard.spec.ts` checks that the card shows a number with `/^\d+$/`. If you need to check an exact total, prepare the data that determines that total inside the test.

## Step by step

Write the test's pseudocode before adding it to the file.

**Step 1.** Use the name "an admin cancels a pending order".

**Step 2.** Open the page and check that order 1001 is `pending`.

**Step 3.** Click `orders-cancel-1001`.

**Step 4.** Check that the status is `cancelled` and both buttons are gone. The test should check the cancellation rule; the badge colour and table header are outside that behavior.

![Cancelling order 1001 changes pending to cancelled and removes both action buttons.](/clips/05-order-cancel.webm)

**Step 5.** Update the opening comment to reserve order 1001.

## The full spec

This is the file after adding the test:

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

Open `apps/practice-shop/e2e/COVERAGE.md` to record the behavior the suite now tests.

In the table, change the Orders row so it says: "Status filter, admin marks a pending order as paid, admin cancels a pending order".

In "Not covered yet", delete the line "Cancelling an order."

## Go deeper

### Extend the filter with a data table

You can extend filter coverage using the same steps for several statuses. This example uses orders that the existing tests and the new cancellation test do not change:

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

Each row gives the selected status, an order that should stay visible and one that should disappear. The name includes `status` to identify the case in the report.

### Keep the shared steps

Use a loop while only the data changes. If the cases need different actions and the body fills with `if` lines, write separate tests so each sequence can be read in full.

## Practice

1. Search all specs for `1001`. Confirm that no test uses it.
2. Add the test to `orders/orders.spec.ts`. Update the comment.
3. Run only your test:

```bash
pnpm --filter practice-shop e2e e2e/orders/orders.spec.ts -g "cancels"
```

4. Run the whole file. Then run the whole suite twice. Both runs must pass; the setup resets the data at the start of each run.
5. Update `COVERAGE.md` as described.

## Challenge

Check that a viewer cannot change orders through either the page or the API.

Create `apps/practice-shop/e2e/orders/orders-viewer.spec.ts` with one test. Sign in as the viewer and open `/orders`. Check that order 1009 is visible, with no **Mark as paid** or **Cancel** buttons. First check that `user-role` shows `viewer`; then send a request to change it and check that the server refuses it for lack of permission. The test must not change data or sign out of the shared admin session.

It is done when:

- The test passes when you run the file twice in a row.
- The test never signs out. The text `logout-button` does not appear in your file.
- The request is sent from the test, which checks the status code and that order 1009 is still `pending` on the page afterwards. A comment explains why you use 1009 rather than 1005 or 1001.
- You ran the same test once as admin on purpose and it failed at the role check before sending the request. You then put the viewer back.

Search for: `playwright override storageState in a test`, `playwright page.request patch`, `playwright apirequestcontext cookies shared with page`. Look at `loginViaApi` in `lib/fixtures/api-client.ts` and the sign out test in `auth/auth.spec.ts`.

## Think it through

1. Find the bug. This test starts an asynchronous assertion but does not wait for its result.

```ts
test("an admin cancels a pending order", async ({ page }) => {
  await page.goto("/orders")
  await page.getByTestId("orders-cancel-1001").click()
  expect(page.getByTestId("orders-status-1001")).toHaveText("cancelled")
})
```

<details>
<summary>Answer</summary>

The `await` is missing before `expect`. The assertion starts and returns a promise that nobody waits for. The test body can finish and Playwright can close the page while the assertion is still pending. Neither passing nor completing the status check is guaranteed. Always write `await expect(...)` for web-first assertions.

</details>

2. Two admins press **Cancel** for order 1001 at nearly the same time, in two browser windows. Predict what the second admin sees, and why.

<details>
<summary>Answer</summary>

The first request changes the order to `cancelled`. The second request arrives for an order that is already cancelled, and the server answers 409 with the message "An order that is cancelled cannot become cancelled." The page catches this error and shows it in the red message with the test id `orders-error`.

</details>

## Next step

In the next lesson you plan a whole new spec from a gap: editing a product.
