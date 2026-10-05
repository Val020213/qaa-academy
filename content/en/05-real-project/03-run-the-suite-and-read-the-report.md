---
title: Run the suite and read the report
summary: Run all tests, one file or one test, use UI mode, and open the report and the trace of a failed test.
duration: 50 min
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

## Go deeper

### Why the failing test waits 5 seconds

When you wrote `payed`, the test did not fail at once. Playwright checks the page again and again until the text matches or time runs out. The config sets `expect: { timeout: 5_000 }`. This is **auto-retrying**. It is why you do not need `waitForTimeout`. The page may need a moment to update, and Playwright waits only as long as needed.

The cost is that a real failure takes 5 seconds to show. That is a good trade. A fixed wait of 5 seconds would slow every passing test.

### A wrong idea: "a red test means a bug in the app"

A failing test has at least four possible causes:

1. The app has a bug. This is the one you hope to find.
2. The test is wrong. For example, a typo like `payed`.
3. The data is not what the test expects.
4. The environment is slow or broken.

Read the trace before you decide. Only cause 1 is a bug report. The others are repairs to your own work. Reporting a test mistake as an app bug costs a developer's time and your credibility.

### How it shows up in real QA automation work

A teammate says: "the test passes on my machine but fails when I run the whole suite." Run the single test, then the whole file:

```bash
pnpm --filter practice-shop e2e e2e/orders/orders.spec.ts -g "paid"
pnpm --filter practice-shop e2e e2e/orders/orders.spec.ts
```

If it passes alone and fails with the others, tests share data. Another test changed something first. That is not random. It is a clue. A good habit: when a test fails, first change one thing, such as running it alone, and watch what changes.

### The trade-off of recording traces

A trace helps a lot, but it uses disk space and time. The config uses `retain-on-failure`: record always, keep only failures. Another option is `on-first-retry`, which records only when a test runs again. That is cheaper, but you see nothing from the first failure. The shop is small, so it chooses more information.

The `-g` option is also a small DRY idea: you do not write a new script for each test. One command, one option, many uses.

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

5. You change `toHaveText("paid")` to `toHaveText("payed")` and run the test. About how long does it take to fail, and why is it not instant?

<details><summary>Answer</summary>

About 5 seconds, plus the time to open the page. The `expect` timeout in the config is 5 seconds. Playwright checks again and again during that time, in case the text changes. Only when the time ends does it report the failure.

</details>

6. A test passes when you run it alone with `-g`, but fails in the full run. Give two likely causes.

<details><summary>Answer</summary>

Another test may change the data first, for example it marks the same order as paid. The test may also depend on a state that only exists when it runs first, such as a fresh server. Both causes come from shared data or order, not from the app.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **What is a flaky test, and what are the most common causes?**
   - Search for: `flaky tests causes test automation`
   - A good answer explains: at least three causes, such as timing, shared data and environment, and why flaky tests hurt a team

2. **What does the Playwright trace viewer show in its Actions, Network and Console tabs?**
   - Search for: `playwright trace viewer actions network console`
   - A good answer explains: what each tab shows and how to use them to find the cause of a failure

3. **What is a process exit code, and how does a CI system use it to decide pass or fail?**
   - Search for: `process exit code 0 non-zero ci`
   - A good answer explains: that 0 means success and other numbers mean failure, and that the test command returns a non-zero code when tests fail

## Next step

In the next lesson you read a spec closely and add your first test to it.
