---
title: Flaky tests
summary: Recognise flaky tests, fix their common causes, and investigate with repeat runs and traces.
duration: 50 min
---

## Goal

- Define a flaky test.
- Name the common causes and the fix for each.
- Investigate with `--repeat-each` and the trace.
- Explain why retries hide flakiness.

## What is flaky

A **flaky** test passes and fails without any change in the code. You run it twice and get two results.

Flaky tests are harmful. The team stops trusting a red result. A flaky test always has a cause. Find it.

## Cause 1: fixed waits

A fixed wait stops the test for a set time:

```ts
await page.waitForTimeout(2000)
```

The page may need three seconds on a slow day. Then the test fails. Or it needs one second, and the test wastes time. The team never uses `waitForTimeout`.

**Fix:** wait for what you need. A web-first assertion waits until the condition is true. Look at `e2e/dashboard.spec.ts`:

```ts
// The numbers come from a slow endpoint (about 1 second).
// We never sleep: the assertions wait for us.
await expect(page.getByTestId("dashboard-stats")).toBeVisible()
```

## Cause 2: typing before the page is ready

The shop renders the page on the server first. Then React starts in the browser. This start is called **hydration**. Text typed before hydration can be erased.

The fix is in `e2e/global.setup.ts`. It uses the `toPass` pattern:

```ts
await expect(async () => {
  await page.getByTestId("login-email").fill(ADMIN.email)
  await page.getByTestId("login-password").fill(ADMIN.password)
  await expect(page.getByTestId("login-email")).toHaveValue(ADMIN.email)
  await expect(page.getByTestId("login-password")).toHaveValue(ADMIN.password)
}).toPass()
```

`toPass` runs the block again and again until every line passes. The block types, then checks the value stuck. If React erased it, the block tries again.

**Fix:** use `toPass` only for this case. In other tests, the team waits for something visible instead. For example, `products.spec.ts` waits for a product row before typing in the search box.

## Cause 3: shared data

Two tests change the same record. One passes only when the other did not run first.

**Fix:** each test makes its own data with `createProduct`, `uniqueName` and `uniqueSku`. Lesson 2 explains this.

## Cause 4: order dependence

Test B uses a product that test A made. In the usual order it passes. Run it alone, or after a different test, and it fails.

**Fix:** run the test alone. If it fails, move the missing setup into the test.

## Cause 5: values that are still loading

A page may show a placeholder, then the real value. A check that reads the value too early sees the placeholder.

Here the number is read once, with no waiting:

```ts
const text = await page.getByTestId("stat-products").textContent()
```

`textContent` returns what is there now. It may be empty or a loading text.

**Fix:** use an assertion that waits, as the real dashboard test does:

```ts
await expect(page.getByTestId("stat-products")).toHaveText(/^\d+$/)
```

The same applies to `locator.count()`. It reads once. Use `toHaveCount` instead.

## Cause 6: a selector matching more than one element

Playwright is strict. If a locator matches many elements and you click it, the test fails with an error about a **strict mode violation**.

The products table has 10 rows. `page.getByTestId(/^products-row-/)` matches all of them. That is correct for `toHaveCount(10)`. It is wrong for a click.

**Fix:** be specific. Use the row id, such as `products.row(product.id)`. Or narrow the list with a unique name, as `rowByName` does. Do not hide the problem with `.first()`, unless the order is the thing you test.

## How to investigate

1. **Repeat the test.** Run one test many times:

```bash
pnpm shop:e2e products/products.spec.ts --repeat-each 5
```

`--repeat-each 5` runs every test five times. If one run fails, the test is flaky.

2. **Run it alone.** If it passes alone but fails in the group, look for shared data.
3. **Read the trace.** The config saves a trace for failed tests (`trace: "retain-on-failure"`). A trace is a recording of the test: each step, the page, and the network. Open the HTML report:

```bash
pnpm --filter practice-shop exec playwright show-report
```

Click the failed test, then open its trace. Find the first step that differs from what you expected.

## Retries hide flakiness

A **retry** runs a failed test again. The config says:

```ts
// Retry only on CI, so a flaky test is never hidden on your machine.
retries: process.env.CI ? 2 : 0,
```

A retry makes the build green. It does not fix the cause. A flaky test that passes on the second try is still flaky. Playwright reports it as "flaky" in the output. Treat that word as a bug to fix.

## Go deeper

### Why flaky tests are a race

A browser test is two programs that run at the same time: your test and the application. Each has its own speed. A test passes when the application is ready before the test looks. It fails when the test looks first. This is a **race**. The result changes from run to run.

The numbers are worse than they feel. Say each test fails by chance 1 time in 100. This code shows what that does to a suite:

```ts
const chance = 0.01
for (const tests of [10, 50, 100, 200]) {
  console.log(tests, ((1 - (1 - chance) ** tests) * 100).toFixed(1) + "%")
}
```

It prints `10 9.6%`, `50 39.5%`, `100 63.4%` and `200 86.6%`. With 100 tests that are each 99 percent steady, the suite fails about 63 times out of 100 runs. Small flakiness adds up fast.

### A common wrong idea: a longer timeout fixes it

When a test is flaky, a beginner raises the timeout. Sometimes that helps. But a longer wait cannot fix a wrong condition. Look at this check:

```ts
await expect(products.count).toHaveText("24 products")
```

Other tests add products, so the text becomes `25 products`. The assertion will never be true. Waiting 60 seconds only makes the failure slower. Find out why the test fails before you change a number.

### How it shows up in QA work: quarantine, then fix

Sometimes you cannot fix a flaky test today. Do not delete it, and do not let it turn the build red for everyone. Mark it, and write down who will fix it:

```ts
test.fixme("the status filter shows only archived products", async ({ page }) => {
  // TODO: flaky on CI, see ticket. Fix the cause, then change this to test(...).
})
```

`test.fixme` tells Playwright to skip the test. The report lists it, so the team sees it. A quarantine must have a short end date. A test that stays in quarantine for months is a hidden hole in your coverage.

### DRY here, and an honest limit

The `toPass` block that types the login form appears twice: in `global.setup.ts` and in `fillLoginForm` in `auth.spec.ts`. The comment in `auth.spec.ts` says it is "the same idea". This is repeated knowledge. The team lives with two copies, because there are only two, and the setup file is a different kind of file. Lesson 10 explains the rule of three.

## Practice

1. Create the file `apps/practice-shop/e2e/flaky-practice.spec.ts` with this code. It has a fixed wait on purpose:

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

3. Count how many runs fail. The numbers arrive after about 1.2 seconds, and that time starts only when the page has loaded. The test waits 1.2 seconds from the page load, so it is almost always too early. Expect most or all runs to fail. The exact number depends on your machine.
4. Replace the last line (the `expect(...)` line) with one web-first assertion:

```ts
await expect(page.getByTestId("dashboard-stats")).toBeVisible()
```

5. Remove the `waitForTimeout` line. Run it ten times again. It should pass every time.
6. Run the whole products spec five times with `--repeat-each 5`.

## Check what you know

1. What is a flaky test?

<details><summary>Answer</summary>

A test that passes and fails without a change in the code.

</details>

2. Why is `page.waitForTimeout(2000)` a bad fix?

<details><summary>Answer</summary>

The right time changes from run to run. The test is too slow on good days and fails on bad days.

</details>

3. What does `--repeat-each 5` do?

<details><summary>Answer</summary>

It runs every selected test five times, so you can see if a result changes.

</details>

4. Why do retries not fix a flaky test?

<details><summary>Answer</summary>

A retry only runs the test again until it passes. The cause stays, and the test still fails some of the time.

</details>

5. A suite has 50 tests. Each one fails by chance 2 times in 100, for no reason in the code. How likely is it that at least one test fails in a run? About 6 percent, 36 percent or 64 percent?

<details><summary>Answer</summary>

About 64 percent. The chance that one test passes is 0.98. The chance that all 50 pass is 0.98 multiplied by itself 50 times, which is about 0.36. So the chance that at least one fails is about 0.64. A small flake rate in each test makes the whole suite fail most runs.

</details>

6. Which version of this check is better, and why?

```ts
// Version A
await page.waitForTimeout(10_000)
await expect(page.getByTestId("dashboard-stats")).toBeVisible()

// Version B
await expect(page.getByTestId("dashboard-stats")).toBeVisible({ timeout: 10_000 })
```

<details><summary>Answer</summary>

Version B. The number in `timeout` is only a limit. The assertion ends as soon as the element is visible, which takes about 1.2 seconds in the shop. Version A always waits the full 10 seconds, and the test is slow every time. The two versions also wait a different total time. Version A waits 10 seconds and then gets another 5 seconds from the default `expect` timeout, so it can still pass if the page needs 11 seconds. Version B stops after 10 seconds. B is still the better choice, because it does not add a fixed delay.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **What checks does Playwright do before it clicks an element?**
   - Search for: `playwright auto-waiting actionability checks`
   - A good answer explains: the list of checks, such as visible, stable and enabled, and why they reduce flaky tests.

2. **What are the most common causes of flaky tests in large projects?**
   - Search for: `flaky tests causes async wait order dependency`
   - A good answer explains: at least three causes, and which of them match the six causes in this lesson.

3. **How do teams quarantine flaky tests without forgetting them?**
   - Search for: `quarantine flaky tests CI policy`
   - A good answer explains: how a quarantined test is tracked, who owns it and when it must be fixed or removed.

## Next step

In the next lesson you learn a checklist to review your own spec before you ask someone else to read it.
