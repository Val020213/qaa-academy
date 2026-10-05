---
title: Run the suite and read the report
summary: Run all tests, one file or one test, use UI mode, and open the report and the trace of a failed test.
duration: 35 min
---

## Goal

- Run the whole suite, one file, or one test.
- Use UI mode and headed mode to watch a test.
- Open the HTML report.
- Break an assertion on purpose and read its trace.

## Run everything

From the root of the repository, run:

```bash
pnpm shop:e2e
```

If the shop is not running, Playwright starts it. If it is running on port 5190, Playwright reuses it. The output lists each test:

```text
  ✓  1 [setup] › e2e/global.setup.ts:6:5 › sign in as admin (2.0s)
  ✓  2 [chromium] › e2e/dashboard.spec.ts:7:7 › Dashboard › shows a loading message first (1.4s)
  ...
  17 passed (23.2s)
```

The suite has 17 tests, including the setup test. Your numbers for time will differ.

## Run one file

`pnpm --filter practice-shop e2e` runs the `e2e` script of the shop. Add a path after it to choose a file:

```bash
pnpm --filter practice-shop e2e e2e/orders/orders.spec.ts
```

The path starts at `apps/practice-shop`. The setup test runs too, because the specs depend on it.

## Run one test

Use `-g`. It means "grep": run only the tests whose name contains this text.

```bash
pnpm --filter practice-shop e2e -g "marks a pending order as paid"
```

Combine both to be precise:

```bash
pnpm --filter practice-shop e2e e2e/orders/orders.spec.ts -g "paid"
```

## UI mode and headed mode

**UI mode** is a window where you pick tests, run them, and step through each action. **Headed mode** runs the browser visibly, so you see the clicks.

```bash
pnpm shop:e2e:ui
pnpm --filter practice-shop e2e:headed
```

Use UI mode when you write a test. Use the plain command before you push.

## The HTML report

Every run writes a report in `apps/practice-shop/playwright-report`. The config sets `open: "never"`, so it does not open by itself. Open it from the shop folder:

```bash
cd apps/practice-shop
pnpm exec playwright show-report
```

A page opens in your browser. It lists every test with its result. Click a failed test to see the error, the code line, and the screenshot.

Press `Ctrl+C` in the terminal to stop the report server. Then go back to the root with `cd ../..`.

## Traces

A **trace** is a recording of a test. It has every action, a snapshot of the page at each step, and the network calls. You can move back and forward in time.

Look at this part of `playwright.config.ts`:

```ts
use: {
  baseURL,
  // Keep the trace and the screenshot only when a test fails.
  trace: "retain-on-failure",
  screenshot: "only-on-failure",
```

`retain-on-failure` means: record every test, but keep the file only if the test fails. Passing tests leave no trace.

## Break a test on purpose

You will cause a failure to practise reading it.

1. Open `apps/practice-shop/e2e/orders/orders.spec.ts`.
2. In the test "an admin marks a pending order as paid", change `toHaveText("paid")` to `toHaveText("payed")`.
3. Run it:

```bash
pnpm --filter practice-shop e2e e2e/orders/orders.spec.ts -g "paid"
```

The test waits 5 seconds, then fails. The error shows what Playwright expected and what it received:

```text
Expected: "payed"
Received: "paid"
```

The end of the output prints the path of the trace and the command to open it. It looks like this:

```bash
pnpm exec playwright show-trace test-results/<folder-name>/trace.zip
```

Run it from `apps/practice-shop` (use `cd apps/practice-shop` first). Copy the real path from your own output. In the trace window, click the last action on the left. The page snapshot shows the status `paid`. You see the cause without running the test again.

Now undo your change. Check with `git status` that `orders.spec.ts` is not listed as changed.

> **Careful:** Always undo a deliberate break. A forgotten change will fail the whole team's build.

## Practice

1. Run `pnpm shop:e2e` and check that you see `17 passed`.
2. Run only `e2e/dashboard.spec.ts`.
3. Run only the test "shows the numbers when they arrive" with `-g`.
4. Open the HTML report: go to `apps/practice-shop` and run `pnpm exec playwright show-report`.
5. Break the assertion as described above, open the trace, then undo the change.

## Check what you know

1. How do you run one test by its name?

<details><summary>Answer</summary>

Add `-g "part of the name"` to the command.

</details>

2. Where is the HTML report?

<details><summary>Answer</summary>

In `apps/practice-shop/playwright-report`. Open it with `pnpm exec playwright show-report` from `apps/practice-shop`.

</details>

3. What does `trace: "retain-on-failure"` do?

<details><summary>Answer</summary>

It records every test and keeps the trace only for tests that fail.

</details>

4. What two things does a failed assertion show you?

<details><summary>Answer</summary>

The value it expected and the value it received.

</details>

## Next step

In the next lesson you read a spec closely and add your first test to it.
