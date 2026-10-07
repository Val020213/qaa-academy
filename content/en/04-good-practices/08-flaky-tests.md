---
title: Flaky tests
duration: 60 min
---

## Goal

In this lesson you identify what makes a test pass and fail with the same code. You use evidence from its runs to find the cause and check the fix.

- Recognise six common causes of flakiness and choose a fix.
- Investigate with a trace, a hypothesis and one change at a time.
- Calculate how failures add up across a suite.
- Distinguish a fix from a retry or quarantine.

## Flaky tests and races

A **flaky** test passes and fails without any change in the code. When the team starts repeating every red run, it can overlook a real bug.

The runner executes the test while the application works in the browser. If the test checks a result before the application shows it, the outcome depends on which gets there first. This is a **race**.

## The effect on a suite

If each of 100 tests passes with probability 0.99, the probability that all pass is 0.99 multiplied by itself 100 times: about 0.37. The suite is green in about 37 runs out of 100.

This code calculates the probability of at least one failure when each test fails 1 percent of the time:

```ts
const chance = 0.01
for (const tests of [10, 50, 100, 200]) {
  console.log(tests, ((1 - (1 - chance) ** tests) * 100).toFixed(1) + "%")
}
```

It prints `10 9.6%`, `50 39.5%`, `100 63.4%` and `200 86.6%`.

## Cause 1: fixed waits

A fixed wait pauses the test for a set time:

```ts
await page.waitForTimeout(2000)
```

If the page needs three seconds, the test continues too soon. If it needs one, the test waits an extra second. The team's rule is to avoid `waitForTimeout`.

Wait for the condition you need, as `e2e/dashboard.spec.ts` does:

```ts
// The numbers come from a slow endpoint (about 1.2 seconds).
// We never sleep: the assertions wait for us.
// ...
await expect(page.getByTestId("dashboard-stats")).toBeVisible()
```

Playwright uses the locator to find the element again and checks visibility until the assertion passes or its timeout expires. The test continues when the stats appear.

## Cause 2: typing before the page is ready

The shop generates HTML on the server. React then connects the page to its code in the browser; this process is called **hydration**. Text entered before this can be erased.

In `e2e/global.setup.ts`, the login form is filled with `toPass`:

```ts
await expect(async () => {
  await page.getByTestId("login-email").fill(ADMIN.email)
  await page.getByTestId("login-password").fill(ADMIN.password)
  await expect(page.getByTestId("login-email")).toHaveValue(ADMIN.email)
  await expect(page.getByTestId("login-password")).toHaveValue(ADMIN.password)
}).toPass()
```

`toPass` repeats the block if any line fails. The block fills the fields and checks their values. If React erased the text and the check fails, Playwright fills the form again.

In this shop, use that pattern for login. In `products.spec.ts`, wait for a visible product row before typing in the search box. That row appears after React has started the request and received the products.

Repeating actions can hide a bug where a field loses text after it is ready. Prefer a visible signal that the page is ready when one exists.

## Cause 3: shared data

Two tests change the same record. One can fail because the other modified or deleted it.

Each test creates its own data with `createProduct`, `uniqueName` and `uniqueSku`, as in the lesson on independent tests and unique data.

## Cause 4: order dependence

Test B uses a product that test A created. It passes after A but fails when run alone.

Run B alone to detect that dependency. Move the missing setup into B so it creates the data it needs.

## Cause 5: values that are still loading

A page may show a temporary value before the real result. Reading it once can give different results depending on loading speed:

```ts
await page.goto("/dashboard")

const text = await page.getByTestId("stat-products").textContent()
```

`textContent` waits until the element exists, then reads its text once. On the dashboard, the element appears together with the number. On a page that shows `0` first, the same line can read that temporary value.

Use an assertion that waits for the final value, as the real dashboard test does:

```ts
await expect(page.getByTestId("stat-products")).toHaveText(/^\d+$/)
```

The same applies to `locator.count()`: it reads the number of elements once. Use `toHaveCount` so Playwright repeats the check while the list changes.

## Cause 6: a selector matching more than one element

If a locator matches several elements and you click it, Playwright fails with a **strict mode violation** error.

The first products page shows 10 rows. `page.getByTestId(/^products-row-/)` matches all of them: it works for `toHaveCount(10)`, but a click needs a single match.

Use the row id with `products.row(product.id)` or a unique name with `rowByName`. Reserve `.first()` for tests where order is part of what you check.

The list is sorted newest first. If you use `.first()` to pick an arbitrary product, another test can create a row and change which one you select.

## How to investigate

1. Repeat the runs to gather evidence:

```bash
pnpm shop:e2e products/products.spec.ts --repeat-each 5
```

`--repeat-each 5` runs each test five times. If one run fails, the test is flaky.

2. Run the test alone. If it passes alone but fails in the group, check which data the other tests change.
3. Read the trace of the failure. The config uses `trace: "retain-on-failure"`. Open the HTML report:

```bash
pnpm --filter practice-shop exec playwright show-report
```

Click the failed test and open its trace. Find the first step that differs from what you expected; check the DOM and the network at that point.

4. Form a concrete hypothesis, such as: "The test reads the number before it arrives." Remove steps until you have the shortest case that still fails.
5. Change one thing that lets you test the hypothesis, then run the test again. If you change several things together, you do not know which resolved the failure.

## Retries hide flakiness

The runner can execute a failed test again. The shop config allows two retries on CI and none locally:

```ts
// Retry only on CI, so a flaky test is never hidden on your machine.
retries: process.env.CI ? 2 : 0,
```

If a later attempt passes, the build can be green while the cause remains. Playwright reports that test as "flaky". Investigate that result just as you would a failure.

## Go deeper

### A longer timeout cannot fix a wrong condition

Look at this check:

```ts
await expect(products.count).toHaveText("24 products")
```

If other tests add products, the text becomes `25 products` and the assertion will never be true. Waiting 60 seconds only delays the failure. Before raising the timeout, check whether the expected value matches the current data.

### Quarantine with an owner and a deadline

If the team needs to set a flaky test aside temporarily, it can use `test.fixme`:

```ts
test.fixme("the status filter shows only archived products", async ({ page }) => {
  // TODO: flaky on CI, see ticket. Fix the cause, then change this to test(...).
})
```

Playwright skips the test and lists it in the report. Record an owner and a short deadline for the fix. While it is quarantined, that test does not check the application's behaviour.

## Practice

1. Create `apps/practice-shop/e2e/flaky-practice.spec.ts` with this code. It has a fixed wait on purpose:

```ts
import { expect, test } from "./lib/test"

test("the dashboard has stats after a fixed wait", async ({ page }) => {
  await page.goto("/dashboard")
  await page.waitForTimeout(1200)

  expect(await page.getByTestId("dashboard-stats").count()).toBe(1)
})
```

2. Start the shop with `pnpm shop:dev`. In another terminal run it ten times:

```bash
pnpm shop:e2e flaky-practice.spec.ts --repeat-each 10
```

3. Count how many runs fail. The numbers arrive about 1.2 seconds after React starts the request, and that moment is later than the page load. The test waits 1.2 seconds from the page load, so it is almost always too early. Expect most or all runs to fail. The exact number depends on your machine.
4. Replace only the last line (the `expect(...)` line) with this web-first assertion:

```ts
await expect(page.getByTestId("dashboard-stats")).toBeVisible()
```

5. Run it ten times again. It should pass every time, although it still has the fixed wait. Then remove the `waitForTimeout` line and run it again to check the result without that pause.
6. Run the whole products spec five times with `--repeat-each 5`.

## Challenge

Create `apps/practice-shop/e2e/challenges/retry-demo.spec.ts` with a test that fails on its first attempt and passes on the second. Run it with and without retries, then check the report.

It is done when:

- The test opens `/dashboard` and decides whether to fail based on the attempt number. It uses no `waitForTimeout` or random values.
- `pnpm shop:e2e challenges/retry-demo.spec.ts` ends red without local retries.
- The same command with 2 retries ends green and the summary says `1 flaky`.
- A two-sentence comment at the top of the file states what the team loses if nobody reviews "flaky" results.

Search for: `playwright testInfo.retry`, `playwright test --retries command line`, `playwright test.info`.

## Think it through

1. A suite has 200 tests. Each fails by chance 1 time in 200. About what percentage of runs have at least one red test?

<details><summary>Answer</summary>

About 63 percent. The probability that all pass is 0.995 multiplied by itself 200 times, about 0.37. The probability of at least one failure is the remainder, about 0.63.

</details>

2. This test is flaky. Find two causes.

```ts
test("searching by name shows one product", async ({ page, request }) => {
  const product = await createProduct(request, { name: uniqueName("Searchable") })
  await page.goto("/products")
  await page.getByTestId("products-search").fill(product.name)

  expect(await page.getByTestId(/^products-row-/).count()).toBe(1)
})
```

<details><summary>Answer</summary>

The test types before it has a signal that React is ready; first wait for `products.row(product.id)` to be visible. Also, `count()` reads once and the plain `expect` compares that number without retrying. Use `await expect(products.rows).toHaveCount(1)` to wait for the filter to be applied.

</details>

3. The stats endpoint takes 3 seconds instead of 1.2. Which fails: a fixed `waitForTimeout(1200)` before checking the stats or a `toBeVisible()` assertion? What changes if it takes 6 seconds?

<details><summary>Answer</summary>

The fixed wait continues before the stats arrive. `toBeVisible()` can wait the 3 seconds because the `expect` timeout is 5 seconds. At 6 seconds, the assertion also fails because it reaches that limit. If that duration is acceptable for the flow, increase that assertion's `timeout`.

</details>

## Next step

In the next lesson you use a checklist to review your own spec before you ask someone else to read it.
