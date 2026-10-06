---
title: Read a spec and extend it
summary: Read the orders spec line by line, predict what the page offers, add the test "an admin cancels a pending order", and update COVERAGE.md.
duration: 90 min
---

## Start with a puzzle

A teammate wrote a test last week for the dashboard: "the card Pending orders shows 3". In the seed data, orders 1001, 1005 and 1009 are pending, so the test passes.

Today the suite already contains a test that marks order 1005 as paid. You are about to add a test that cancels order 1001. You add it, run it, and it passes.

Now think about the dashboard test. Will it still pass? Does it depend on which file runs first? And who is responsible if it fails: you, because you added the new test, or your teammate, because the test was fragile?

Write down your guess before you read on.

## Goal

- Read an existing spec and explain each part.
- Predict which controls a page offers from its code, before you run anything.
- Pick data that no other test uses, and say why.
- Add one new test next to the existing ones, and update `COVERAGE.md`.

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

The first test (the status filter) follows the same shape. Look at the shape of this one: **Arrange, Act, Assert**.

- Arrange: open `/orders` and check the order is `pending`.
- Act: click the button.
- Assert: the status is `paid` and the button is gone.

The first assertion is a **guard**. It proves the data is what you expect before you act.

Notice what the test does not say. It does not say which CSS class the button has, or which component draws the table. It describes what a user sees: a status, a button, a changed status. This is the rule **test what the user sees, not how the code is built**. The page was rebuilt with new components, and these tests did not change, because the test ids and the texts stayed the same.

## Where the buttons come from

Before you write the new test, predict: what actions does a pending order have? A paid order? A shipped one? Write your answers down. Now read the real rule in `apps/practice-shop/app/(dashboard)/orders/page.tsx`:

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

Each button gets the test id `${step.testId}-${order.id}`. So the cancel button of order 1001 is `orders-cancel-1001`. A pending order has two buttons, a paid one has two, and shipped or cancelled orders have none. Reading code like this is a skill: you find the rule in one place and your tests will not guess.

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

Plan the test in plain words first, before you code. This is **pseudocode**: steps in your own language.

**Step 1.** Write the test name as a sentence a user would say: "an admin cancels a pending order".

**Step 2.** Open the page and guard. Order 1001 must be `pending`.

**Step 3.** Click the button. The test id is `orders-cancel-1001`.

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

### Back to the puzzle

The dashboard test is fragile. The card `stat-pending-orders` counts the orders that are pending. Each order test lowers it by one: 3 in the seed, 2 after 1005 is paid, 1 after 1001 is cancelled. The test "the dashboard shows 3" passes only if it runs before the order tests. Playwright runs files in a fixed order, so it may pass for months and then fail the day someone renames a folder.

So who is responsible? Nobody has to be blamed. The real lesson is that a test that reads shared data depends on every test that writes it. The better test checks what it controls: for example, that the card shows a number, as `dashboard.spec.ts` does with `/^\d+$/`. If you must check an exact number, create the data in the test.

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

This is **DRY**: Don't Repeat Yourself. One test body, many inputs. The loop is the idea you learned as "loops and arrays of data". Each test needs a different name, so the name uses `status`. These orders are never changed by other tests, so they are safe. The rows of data come from **equivalence classes**: one example for each group of inputs that should behave the same.

### The limit of DRY

In a test, a clear story matters more than the shortest code. If the loop body grows many `if` lines, stop. Two plain tests are better than one clever test that nobody can read. Use a loop when the steps are the same and only the data changes. This is **KISS** at work: keep it simple.

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

## Challenge

The shop says that a viewer is read only. You know two places where this rule must hold: the page and the API. Your task: write a test that proves both for the orders page.

Create `apps/practice-shop/e2e/orders/orders-viewer.spec.ts` with one test. The test signs in as the viewer and opens `/orders`. It checks that order 1009 is visible, that it has no **Mark as paid** and no **Cancel** button, and that a direct request to change this order is refused by the server with the status the shop uses for "known user, not allowed". The test must not sign out of the shared admin session, and it must not change any data.

It is done when:

- The test passes, and it passes when you run the file twice in a row.
- The test never signs out. The text `logout-button` does not appear in your file.
- The refused request is sent from inside the test, and the test checks both the status code and that order 1009 is still `pending` on the page afterwards.
- You ran the same test once as admin on purpose, saw it fail, and then put the viewer back. A test you have never seen fail is a test you cannot trust.
- You used order 1009 and not 1005 or 1001, and you can say why in one sentence in a comment.

You will need something this lesson did not teach: how to be a different user inside one test, and how to send a request from the test itself. Search for: `playwright override storageState in a test`, `playwright page.request patch`, `playwright apirequestcontext cookies shared with page`. Look at `loginViaApi` in `lib/fixtures/api-client.ts` and at the sign out test in `auth/auth.spec.ts` for hints.

> **Tip:** You may ask an AI assistant for help. But you must run the code, and you must be able to explain every line to a teammate. Never keep code you cannot explain. Ask the assistant to explain what it wrote, then check that against the documentation.

## Think it through

1. Find the bug. This cancel test runs and passes, but it does not check anything.

```ts
test("an admin cancels a pending order", async ({ page }) => {
  await page.goto("/orders")
  await page.getByTestId("orders-cancel-1001").click()
  expect(page.getByTestId("orders-status-1001")).toHaveText("cancelled")
})
```

<details><summary>Answer</summary>

The `await` is missing before `expect`. The assertion returns a promise that nobody waits for. Without `await`, the check is not joined to the test. It may start to poll, but the test does not wait for it. The check then fails when the test ends and the test is cleaned up, or it is simply not reported at the right place. So a wrong status may not fail the test in a clear way. A lint rule can catch this mistake, but only if the team turns it on. Always write `await expect(...)` for web-first assertions. The code looks right, which is why this bug is dangerous.

</details>

2. Version A: three separate tests for the filter (paid, shipped, cancelled). Version B: one loop over a list. Which is better here, and what would make you choose A?

<details><summary>Answer</summary>

B is better here because the steps are the same and only the data changes, and a new status needs one new line. You would choose A if the three cases needed different steps, for example if `cancelled` needed a check for an empty message. Then the loop would grow `if` lines, and plain tests are easier to read. The test names in the report also matter: with B, each name must carry the data, or you cannot tell which row failed.

</details>

3. What breaks if the business changes the rule: "a cancelled order can be reopened as pending"?

<details><summary>Answer</summary>

The comment at the top of the spec becomes false. The table of orders is still a good starting point, but the rule "each test needs its own order" is no longer needed for the cancel test, because the test could reopen the order at the end. The assertion `toHaveCount(0)` for the buttons of a cancelled order would fail, since a new button would exist. The guard line would still be useful. When a rule changes, tests that describe the old rule must change first, and a failing test is how you find them.

</details>

4. Two admins press **Cancel** for order 1001 at nearly the same time, in two browser windows. Predict what the second admin sees, and why.

<details><summary>Answer</summary>

The first request changes the order to `cancelled`. The second request arrives for an order that is already cancelled, and the server answers 409 with the message "An order that is cancelled cannot become cancelled." The page catches this error and shows it in the red message with the test id `orders-error`. Nothing breaks, but the second admin sees an error for something that already did what they wanted. This is a good edge case for a new test, since it uses the API to cancel first and the page second.

</details>

5. Explain the guard line to a teammate in three sentences. Do not use the words "check" or "verify".

<details><summary>Answer</summary>

Before the test acts, it reads the status of the order and compares it to what it needs. If the data is already different, the test stops with a message that names the real problem. Without it, the click would fail later with a vague message about a missing element. The line costs one row of code and saves minutes of searching.

</details>

6. Should the cancel test also read the order from the API after the click, to confirm the server saved it? There is no single right answer.

<details><summary>Answer</summary>

If the page re-reads the data from the server after the change, the new status on the screen already proves that the server saved it. In the shop, `load()` runs again after the PATCH, so the UI is enough. An extra API read would test the same thing twice and tie the test to the API shape. It would be useful if the page showed the new status without asking the server, because then the screen could be wrong. The choice depends on what the page really does, and on how much a missed save costs.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **What is the Arrange, Act, Assert pattern in testing?**
   - Search for: `arrange act assert pattern unit testing`
   - Try it: open `e2e/products/products.spec.ts`. Choose one test and add the comments `// Arrange`, `// Act` and `// Assert` before the matching lines. Find one test where the Arrange part is hidden inside a helper.
   - A good answer explains: the three parts of a test and why keeping them separate makes a test easier to read.

2. **What is data-driven testing, and when is it better than writing separate tests?**
   - Search for: `data-driven testing parameterized tests`
   - Try it: copy the loop example from this lesson into a temporary file `e2e/orders/filter-loop.spec.ts`. Run it, read the test names in the report, then add a fourth row of your own and run again. Delete the file when you finish.
   - A good answer explains: how one test body runs with many inputs, and one case where separate tests are clearer.

3. **Why do testers say each test should be independent of the others?**
   - Search for: `test independence isolation automation`
   - Try it: run your cancel test, then open `/dashboard` and read the Pending orders card. Run `fetch("/api/test/reset", { method: "POST" }).then((r) => r.json())` in the browser Console, reload the dashboard, and compare the two numbers.
   - A good answer explains: what can go wrong when tests depend on each other, and one way to make a test independent.

## Next step

In the next lesson you plan a whole new spec from a gap: editing a product.
