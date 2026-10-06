---
title: Flaky tests
summary: Recognise flaky tests, find their cause like a scientist, fix the common causes, and see why retries hide the problem.
duration: 80 min
---

## Start with a puzzle

Your team has 100 end-to-end tests. Each test is "99 percent steady": on a normal day, it fails by pure chance 1 time in 100. The code of the tests is fine and the shop has no bug.

You run the whole suite once. How likely is it that every test is green?

Pick one before you calculate: about 99 percent, about 90 percent, or about 40 percent.

Then think about this. What does a red build mean to the team after a month of this?

Write down your guess before you read on.

## Goal

- Predict how small random failures add up in a whole suite.
- Name six common causes of flaky tests and the fix for each.
- Investigate a flaky test with one guess and one small experiment at a time.
- Explain why retries and longer timeouts hide a problem and do not solve it.

## What is flaky

A **flaky** test passes and fails without any change in the code. You run it twice and get two results.

Flaky tests are harmful. The team stops trusting a red result. A flaky test always has a cause. Find it.

### Back to the puzzle

The chance that one test is green is 0.99. All 100 must be green, so you multiply 0.99 by itself 100 times. The result is about 0.37. The suite is green in about 37 runs out of 100. The best guess was "about 40 percent", and most people guess too high.

After a month, a red build means "run it again". That is the real cost. When people stop believing red, a real bug can hide in the noise. Flakiness does not make the suite a bit worse. It makes the result worthless.

## Debug like a scientist

Before the causes, learn the method. It works for every flaky test.

1. **Look at the facts.** When does it fail? Always, or sometimes? Alone, or in the group?
2. **Make one guess.** "I think the test reads the number before it arrives."
3. **Run one small experiment** that can prove the guess wrong. Change **one thing** only.
4. **Shrink the failing case.** Delete steps until the shortest test that still fails is left. The cause is in what remains.

If you change three things and the test passes, you do not know which one helped. One change, one run.

Keep this method in mind while you read the six causes.

## Cause 1: fixed waits

A fixed wait stops the test for a set time:

```ts
await page.waitForTimeout(2000)
```

The page may need three seconds on a slow day. Then the test fails. Or it needs one second, and the test wastes time. The team never uses `waitForTimeout`.

**Fix:** wait for what you need. A web-first assertion waits until the condition is true. Look at `e2e/dashboard.spec.ts`:

```ts
// The numbers come from a slow endpoint (about 1.2 seconds).
// We never sleep: the assertions wait for us.
// ...
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

Notice what makes this cause hard: the failure depends on speed. On your fast computer, React is ready before the test types. On a slow CI machine, it is not.

## Cause 3: shared data

Two tests change the same record. One passes only when the other did not run first.

**Fix:** each test makes its own data with `createProduct`, `uniqueName` and `uniqueSku`. Lesson 2 explains this.

## Cause 4: order dependence

Test B uses a product that test A made. In the usual order it passes. Run it alone, or after a different test, and it fails.

**Fix:** run the test alone. If it fails, move the missing setup into the test.

## Cause 5: values that are still loading

A page may show a placeholder, then the real value. A check that reads the value too early sees the placeholder.

Here is a test. What do you expect?

```ts
await page.goto("/dashboard")

const text = await page.getByTestId("stat-products").textContent()
```

`textContent` waits until the element exists, then reads the text once. On the real dashboard the element appears together with the number, so this line happens to work. Now imagine a page that shows `0` first and the real number a second later. The same line reads `0`, and the test passes or fails by speed. Reading once is the risk, and a page can change at any time to make it real.

**Fix:** use an assertion that waits for the final value, as the real dashboard test does:

```ts
await expect(page.getByTestId("stat-products")).toHaveText(/^\d+$/)
```

The same applies to `locator.count()`. It reads once. Use `toHaveCount` instead.

## Cause 6: a selector matching more than one element

Playwright is strict. If a locator matches many elements and you click it, the test fails with an error about a **strict mode violation**.

The products table shows 10 rows on the first page. `page.getByTestId(/^products-row-/)` matches all of them. That is correct for `toHaveCount(10)`. It is wrong for a click.

**Fix:** be specific. Use the row id, such as `products.row(product.id)`. Or narrow the list with a unique name, as `rowByName` does. Do not hide the problem with `.first()`, unless the order is the thing you test.

Why is this a flaky cause and not only a plain error? Because of `.first()`. The list is sorted newest first, so "the first row" is whatever the last test created. A test that clicks `.first()` passes or fails depending on which test ran before it.

## How to investigate

Use the scientific method from above.

1. **Repeat the test.** Run one test many times:

```bash
pnpm shop:e2e products/products.spec.ts --repeat-each 5
```

`--repeat-each 5` runs every test five times. If one run fails, the test is flaky.

2. **Run it alone.** If it passes alone but fails in the group, look for shared data.
3. **Shrink it.** Remove steps one by one. Keep the shortest version that still fails.
4. **Read the trace.** The config saves a trace for failed tests (`trace: "retain-on-failure"`). A trace is a recording of the test: each step, the page, and the network. Open the HTML report:

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

The numbers are worse than they feel. This code shows what a 1 percent failure does to a suite:

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

2. Write your guess: out of 10 runs, how many will fail? Write the number down.
3. Start the shop with `pnpm shop:dev`. In another terminal run it ten times:

```bash
pnpm shop:e2e flaky-practice.spec.ts --repeat-each 10
```

4. Count how many runs fail. The numbers arrive about 1.2 seconds after React starts the request, and that moment is later than the page load. The test waits 1.2 seconds from the page load, so it is almost always too early. Expect most or all runs to fail. The exact number depends on your machine. Compare it with your guess.
5. Change one thing: replace the last line (the `expect(...)` line) with one web-first assertion:

```ts
await expect(page.getByTestId("dashboard-stats")).toBeVisible()
```

6. Run it ten times again. It should pass every time, and it still has the fixed wait. Now change the second thing: remove the `waitForTimeout` line and run again. Notice that the test is faster and still green.
7. Run the whole products spec five times with `--repeat-each 5`.

## Challenge

Brief: a team lead says: "We have retries on CI, so flaky tests are not a problem." You want to show the team what retries really do. Build a test that fails on its first attempt and passes on the second, on purpose, and without any random value. Then run it with and without retries, and read what the report says.

Create the file `apps/practice-shop/e2e/challenges/retry-demo.spec.ts`.

It is done when:

- The test opens `/dashboard`. It fails on attempt 1 and passes on attempt 2, decided by the attempt number and not by chance. It has no `waitForTimeout` and no random value.
- `pnpm shop:e2e challenges/retry-demo.spec.ts` (no retries on your machine) ends red.
- The same command with 2 retries ends green, and the summary line says `1 flaky`.
- At the top of the file, a comment of two sentences answers: what does a team lose when CI retries 2 times and nobody reads the word "flaky"?

You will need something this lesson did not teach: how a test can learn which attempt it is on, and how to set the number of retries from the command line. Search for: `playwright testInfo.retry`, `playwright test --retries command line`, `playwright test.info`.

## Think it through

1. **Predict.** A suite has 200 tests. Each one fails by chance 1 time in 200, for no reason in the code. About what percent of the runs have at least one red test? Say why in two sentences.

<details><summary>Answer</summary>

About 63 percent. One test is green with chance 199 in 200, which is 0.995. All 200 must be green, so you multiply 0.995 by itself 200 times, which is about 0.37. So about 37 percent of runs are fully green and about 63 percent have a red test. Each test is very steady, and the suite is still red most of the time. Size is the enemy.

</details>

2. **Find the bug.** The code runs, but the test is flaky. Name two causes in it.

```ts
test("searching by name shows one product", async ({ page, request }) => {
  const product = await createProduct(request, { name: uniqueName("Searchable") })
  await page.goto("/products")
  await page.getByTestId("products-search").fill(product.name)

  expect(await page.getByTestId(/^products-row-/).count()).toBe(1)
})
```

<details><summary>Answer</summary>

First, the test types in the search box without waiting for the page to be ready. If React is not ready, the text can be erased. Waiting for `products.row(product.id)` to be visible first solves this. Second, `count()` reads the number once and a plain `expect` does not wait. Right after typing, the list may still show all 10 rows, so the count is 10, not 1. Use `await expect(products.rows).toHaveCount(1)`, which waits until the filter has been applied.

</details>

3. **Two versions.** To avoid typing too early, version A wraps the typing in `toPass`. Version B waits for a visible product row before typing. Both work. Which is better in a products test, and what would make you choose the other?

<details><summary>Answer</summary>

Version B is better in the products tests. It waits for something the user also waits for, a loaded list, and it reads like a story. Version A repeats actions until they stick, and it can hide a real bug where the input loses text for a real user. Choose version A when there is nothing visible to wait for, as on the login page, where the form looks the same before and after React starts.

</details>

4. **What breaks if.** The developers make the stats endpoint slower, 3 seconds instead of 1.2. Which of these tests break: one with `waitForTimeout(1200)` before a check, one with `toBeVisible()`, and one with `toBeVisible()` when the endpoint takes 6 seconds?

<details><summary>Answer</summary>

The fixed wait breaks first. It looks after 1.2 seconds and nothing is there, and it would break on any value too small. The `toBeVisible()` test keeps working at 3 seconds, because the default `expect` timeout is 5 seconds and the assertion ends as soon as the stats appear. At 6 seconds it also fails, because the limit is reached. The honest fix is to give that one assertion a longer `timeout`, and not to change the global setting for all tests.

</details>

5. **Explain it.** Explain to a teammate why a green build after "the test passed on the second attempt" is not good news. Use three sentences and do not use the word "retry".

<details><summary>Answer</summary>

A good answer: "The test failed once and passed once with the same code, so something in it depends on luck. Running it again only hid the luck. Sooner or later the luck will be bad on every attempt, or the same cause will hide a real bug." The key idea is that a pass after a failure is a symptom. The cause is still there.

</details>

6. **Judgement.** A test for the checkout flow fails about 1 time in 20. The release is on Friday. You can delete the test, mark it with `test.fixme`, or keep it and let CI run it again when it fails. What do you do?

<details><summary>Answer</summary>

There is no perfect answer. Deleting removes the risk of noise and also removes the protection of the most important flow. Keeping it with attempts keeps the protection, but it teaches the team to ignore red. Marking it `fixme` with an owner and a date is honest, but the flow is unprotected until the fix. It depends on how costly a checkout bug is, how soon you can find the cause, and whether someone checks that flow by hand in the meantime. A good default is to keep it running and make finding the cause the first task after the release.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **What checks does Playwright do before it clicks an element?**
   - Search for: `playwright auto-waiting actionability checks`
   - Try it: in a scratch spec, open `/products` and try `await page.getByTestId("products-prev-page").click({ timeout: 2000 })`. The button is disabled on page 1. Read the error and the lines that say what Playwright was waiting for.
   - A good answer explains: the list of checks, such as visible, stable and enabled, and why they reduce flaky tests.

2. **What are the most common causes of flaky tests in large projects?**
   - Search for: `flaky tests causes async wait order dependency`
   - Try it: take one spec you wrote in module 3 and run it with `--repeat-each 10`. Count the failures. Say what a result of zero failures tells you, and what it does not tell you.
   - A good answer explains: at least three causes, and which of them match the six causes in this lesson.

3. **How do teams quarantine flaky tests without forgetting them?**
   - Search for: `quarantine flaky tests CI policy`
   - Try it: in your practice file, change one test to `test.fixme(...)` and run the file. Find how the report shows it. Then write the comment you would leave in the code so that the next person knows who fixes it and by when.
   - A good answer explains: how a quarantined test is tracked, who owns it and when it must be fixed or removed.

## Next step

In the next lesson you use a checklist to review your own spec before you ask someone else to read it.
