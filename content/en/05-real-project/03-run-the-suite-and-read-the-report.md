---
title: Run the suite and read the report
duration: 55 min
---

## Goal

In this lesson you run the QA Shop suite and cause a failure to investigate it with the report and the trace.

- Run the whole suite, one file, or one test.
- Use the shop's UI mode and headed mode scripts.
- Read the error, screenshot, and trace of a failed test.
- Recognize unexpected state and undo your test changes.

## Run everything

From the root of the repository, run:

```bash
pnpm shop:e2e
```

Playwright uses port 5190 by default; `SHOP_E2E_PORT` can change it. If the shop does not answer, it starts it. If it answers, Playwright reuses it only with `CI` absent or empty; with nonempty `CI`, it fails. This abbreviated example shows how each test is listed:

```text
  ✓  1 [setup] › e2e/global.setup.ts:6:5 › sign in as admin (2.0s)
  ✓  2 [chromium] › e2e/dashboard.spec.ts:7:7 › Dashboard › shows a loading message first (1.4s)
  ...
  17 passed (23.2s)
```

The original suite has 17 tests, including setup. Specs you added increase that total. Your timings will differ.

## Run one file

`pnpm --filter practice-shop e2e` runs the shop's `e2e` script. Add a path after it to choose a file:

```bash
pnpm --filter practice-shop e2e e2e/orders/orders.spec.ts
```

The path starts at `apps/practice-shop`. The setup test also runs because the `chromium` project depends on setup.

## Run one test

Use `-g` (grep): Playwright treats the value as a regular expression and matches it against the full name, including the project, file and test groups.

```bash
pnpm --filter practice-shop e2e -g "marks a pending order as paid"
```

Combine the path and name filter to select the test within a file:

```bash
pnpm --filter practice-shop e2e e2e/orders/orders.spec.ts -g "paid"
```

## UI mode and headed mode

These scripts open UI mode and run the suite with a visible browser, respectively:

```bash
pnpm shop:e2e:ui
pnpm --filter practice-shop e2e:headed
```

Use UI mode to review a test's actions. Run the plain command before you push.

## The HTML report

Playwright writes the report in `apps/practice-shop/playwright-report`. The config sets `open: "never"`, so you need to open it from the shop folder:

```bash
cd apps/practice-shop
pnpm exec playwright show-report
```

The report lists each test with its result. Click a failed test to see the error, the code line, and the screenshot.

![The real report shows the failed expectation: payed instead of the actual paid.](/clips/05-order-report.webm)

Press `Ctrl+C` in the terminal to stop the report server. Then return to the root with `cd ../..`.

## Traces

The shop keeps traces of failures with this configuration in `playwright.config.ts`:

```ts
use: {
  baseURL,
  // Keep the trace and the screenshot only when a test fails.
  trace: "retain-on-failure",
  screenshot: "only-on-failure",
```

With `retain-on-failure`, Playwright records each test and deletes the trace if it passes. The config sets `retries: process.env.CI ? 2 : 0`, so a local run keeps the failure's trace without needing a retry.

## Break a test on purpose

Cause a failure to inspect the evidence:

1. Open `apps/practice-shop/e2e/orders/orders.spec.ts`.
2. In the test "an admin marks a pending order as paid", change `toHaveText("paid")` to `toHaveText("payed")`.
3. Run it:

```bash
pnpm --filter practice-shop e2e e2e/orders/orders.spec.ts -g "paid"
```

The assertion has a five-second timeout, set by `expect: { timeout: 5_000 }`. Playwright finds the element again with the locator and compares its text until it matches or the timeout expires. Since the status is `paid`, the assertion fails:

```text
Expected: "payed"
Received: "paid"
```

The end of the output prints the trace path and a command like this:

```bash
pnpm exec playwright show-trace test-results/<folder-name>/trace.zip
```

Run it from `apps/practice-shop` (use `cd apps/practice-shop` first). Copy the real path from your output. In the trace, select the failed assertion in the list on the left. The snapshot shows `paid`: the error is in the expected text you wrote.

Undo the change and check with `git status` that `orders.spec.ts` is not listed as changed.

## Unexpected state

If the initial assertion for order 1005 fails, you might see:

```text
Expected: "pending"
Received: "paid"
```

Setup resets the data at the start of each run, but someone else can change it while the tests run. If a colleague marks order 1005 as paid in the same shop, the test finds `paid` where it expects `pending`.

The message alone does not prove the cause. Check the page state and network calls in the trace before deciding whether the failure comes from the app, the test, the data, or the environment.

![The report and trace connect the incorrect expectation to the actual order status.](/images/05-failure-evidence.en.svg)

## Practice

1. Run `pnpm shop:e2e` and check that all pass: `17 passed` for the original suite, or more if you added specs.
2. Run only `e2e/dashboard.spec.ts`.
3. Run only the test "shows the numbers when they arrive" with `-g`.
4. Open the HTML report: go to `apps/practice-shop` and run `pnpm exec playwright show-report`.
5. Break the assertion as described above, open the trace, then undo the change.

## Challenge

Create `apps/practice-shop/e2e/orders/repeat-me.spec.ts` with a test that checks order 1009 is `pending`, clicks **Mark as paid**, and checks that it becomes `paid`.

Select only `e2e/orders/repeat-me.spec.ts` and run the test three times in one command. Setup then runs once, without resetting the data between repetitions. Open the trace of a failure. Delete the file when you finish.

It is done when:

- The test passes when you run it once.
- When repeated, one repetition passes and the others fail with `Expected: "pending"` and `Received: "paid"`.
- In the trace of a failed repetition, you can point to the step where the page already shows `paid` before your click.
- You wrote a comment at the top of the file explaining why the normal suite does not show this failure. You then deleted the file and checked that `git status` does not list it.

Search for the option that repeats each test: `playwright test command line options repeat-each`, `playwright cli reference`.

## Think it through

1. You run the paid test twice, one after the other, with an option that skips the setup project (`--no-deps`). What happens in each run if the shop stays running, the saved session is valid and order 1005 was pending at the start?

<details><summary>Answer</summary>

The first passes and leaves the order paid. The second fails at the initial assertion with `Expected: "pending"` and `Received: "paid"`, because without setup nobody resets the data between runs.

</details>

2. What breaks if you lower `expect: { timeout: 5_000 }` to `500` in the config?

<details><summary>Answer</summary>

The assertion waiting for the numbers can fail if they are still pending when its 500 ms expires. The API takes 1.2 seconds, but the timeout starts when the assertion begins, not when the request is sent. If the numbers arrive within that deadline, it passes.

</details>

3. You run the suite with a nonempty environment variable `CI`, but the shop is already running on port 5190 in another terminal. What happens, and why?

<details><summary>Answer</summary>

Playwright stops with an error that the address is already in use. The config says `reuseExistingServer: !process.env.CI`, so with nonempty `CI` it will not reuse a running server.

</details>

## Next step

In the next lesson you read a spec closely and add your first test to it.
