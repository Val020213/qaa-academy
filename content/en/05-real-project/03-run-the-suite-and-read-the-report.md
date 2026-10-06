---
title: Run the suite and read the report
summary: Run all tests, one file or one test, use UI mode, then investigate a failed test with the report and the trace like a scientist.
duration: 80 min
---

## Start with a puzzle

On Monday at 10:00 you run the whole suite. Result: `17 passed`. At 10:20, with the same code, the same config and the same command, one test fails:

```text
Expected: "pending"
Received: "paid"
```

It is the test about order 1005. Nobody changed the app or the test. You run the suite again. Now all 17 pass.

Which is most likely: a bug in the app, a wrong test, wrong data, or a slow computer? And what could someone have done on the same running shop while your suite was running?

Write down your guess before you read on.

## Goal

- Run the whole suite, one file, or one test.
- Use UI mode and headed mode to watch a test.
- Open the HTML report and the trace, and find the cause of a failure from them.
- Debug in a disciplined way: one guess, one small experiment, one change at a time.

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

Before you run the second command, predict: how many tests will run in the `chromium` project, and which one? Look at the test names in the file. Then run it and compare with the list.

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

You will cause a failure to practise reading it. First write your prediction: how long will it take to fail, and what will the error say?

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

### Back to the puzzle

The most likely cause is the data. Setup resets the data at the start of every run, but the shop is one shared program. If a colleague used the same running shop during your run, for example marked order 1005 as paid by hand in the browser, your test would meet a state it did not expect. After that person stops, a new run resets everything, so the failure disappears.

The key is the clue in the message: `Received: "paid"` for an order that must be `pending`. A wrong test would fail every time. A bug in the app would fail every time. A failure that appears once and disappears after a new run points to state. You cannot prove it from the message alone. The trace shows the page, the network calls and the time, and these are the evidence you need.

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

### Debug like a scientist

When a test fails, do not change five things and run again. Follow this loop:

1. Make **one guess** about the cause. Say it in a sentence.
2. Design **one small experiment** that can prove the guess wrong.
3. Run it, and change **one thing** at a time.
4. If you can, **shrink the failing case**: run one test instead of the whole suite, one file instead of all files.

For example, a teammate says: "the test passes on my machine but fails when I run the whole suite." Guess: another test changes the data first. Experiment: run the test alone, then the whole file.

```bash
pnpm --filter practice-shop e2e e2e/orders/orders.spec.ts -g "paid"
pnpm --filter practice-shop e2e e2e/orders/orders.spec.ts
```

If it passes alone and fails with the others, tests share data. That is not random. It is a clue.

### The trade-off of recording traces

A trace helps a lot, but it uses disk space and time. The config uses `retain-on-failure`: record always, keep only failures. Another option is `on-first-retry`, which records only when a test runs again. That is cheaper, but you see nothing from the first failure. The shop is small, so it chooses more information.

The config also has `retries: process.env.CI ? 2 : 0`. On your machine a failing test is not run again, so a flaky test cannot hide.

### Why repeatable runs matter

A good test suite is **FIRST**: Fast, Independent, Repeatable, Self-checking, Timely. The puzzle test broke "Repeatable": the same command gave two answers. A test that is not repeatable teaches the team to ignore red results. That is more costly than a slow test.

## Practice

1. Run `pnpm shop:e2e` and check that you see `17 passed`.
2. Run only `e2e/dashboard.spec.ts`.
3. Run only the test "shows the numbers when they arrive" with `-g`.
4. Open the HTML report: go to `apps/practice-shop` and run `pnpm exec playwright show-report`.
5. Break the assertion as described above, open the trace, then undo the change.

## Challenge

A test that works once is not always a good test. Your task: build a test that passes the first time and fails the second time, find out why with the tools of this lesson, and then remove it.

Write a new spec with one test. It uses the pending order 1009. It checks that the order is `pending`, clicks **Mark as paid** for it, and checks that the status is `paid`. Then run it so that Playwright repeats the same test three times in one command, without any reset between the repetitions. Read the result, open the trace of a failure, and write a note in your own words about what you saw.

Create the file `apps/practice-shop/e2e/orders/repeat-me.spec.ts`. When you finish, delete it.

It is done when:

- The test passes when you run it once.
- When you run it with Playwright's repeat option, one repetition passes and the others fail, and the error says `Expected: "pending"` and `Received: "paid"`.
- In the trace of a failed repetition, you can point to the step where the page already shows `paid` before your click.
- You can explain in one sentence why the normal suite does not show this failure. Write it as a comment at the top of the file.
- The file is deleted, and `git status` does not list it.

You will need something this lesson did not teach: the command-line option that repeats every test several times. Reading the list of options of the test runner is a skill of its own: scan for the option name, the example, and the limits. Search for: `playwright test command line options repeat-each`, `playwright cli reference`.

## Think it through

1. You run the paid test twice, one after the other, with an option that skips the setup project (`--no-deps`). Predict what you see in each run, and why.

<details><summary>Answer</summary>

The first run passes if the data was fresh, because order 1005 is pending. The second run fails at the guard line with `Expected: "pending"` and `Received: "paid"`. Without the setup, nothing resets the data between the runs, and a status only moves forward. This is why the normal command always runs setup first. It also shows that `pending` is a state of the shop, not a fact of the test.

</details>

2. A teammate says: "The suite was flaky, so I set `retries: 3` for every run on my machine. Now it is always green." Find the problem.

<details><summary>Answer</summary>

The suite is not fixed. A test that fails and then passes is still flaky, and now nobody sees it. The config in the shop retries only on CI, so a failure on your machine is visible when it happens. Retries are a way to keep a build moving, not a cure. When a test passes on retry, the report marks it as flaky, and that mark should lead to an investigation.

</details>

3. Version A records every test and keeps the trace only for failures (`retain-on-failure`). Version B records only when a test runs again (`on-first-retry`). Which is better for the shop, and what would make you choose B?

<details><summary>Answer</summary>

A is better for the shop, because there are no retries on a local machine and you want a trace of the first failure. B would be cheaper for a suite with thousands of tests where recording every test slows the run and fills the disk. B only works if retries are on. The choice depends on the size of the suite, the speed of the computers, and whether you can live without a trace of the first failure.

</details>

4. What breaks if you lower `expect: { timeout: 5_000 }` to `500` in the config?

<details><summary>Answer</summary>

The dashboard test "shows the numbers when they arrive" would fail. The numbers come from an endpoint that waits 1.2 seconds on purpose, and a limit of half a second ends before they appear. Tests that wait for slow things need a long enough limit. A short limit makes failures show faster, but it creates false alarms. The right value is a little longer than the slowest normal wait.

</details>

5. You run the suite with the environment variable `CI` set, but the shop is already running on port 5190 in another terminal. What do you expect, and why?

<details><summary>Answer</summary>

Playwright stops with an error that the address is already in use. The config says `reuseExistingServer: !process.env.CI`, so with `CI` set it will not reuse a running server. On a CI machine this is intended: every run should start a clean server. On your own computer, the fix is to stop the shop in the other terminal, or to unset `CI`. It is a good example of a setting that behaves differently in two places.

</details>

6. A test fails twice a week for no clear reason. The team lead says: "Mark it as skipped so the build stays green." Is this a good idea? There is no single right answer.

<details><summary>Answer</summary>

Skipping keeps the build green, but it hides a risk. If the test checks something important, you now have no check for it. A better path is to skip it for a short time, write down the cause you suspect, and set a date to fix it. The answer depends on how important the checked feature is, how much the team trusts the other tests, and how long the skip will last. A skip with no owner and no date often becomes permanent.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **What is a flaky test, and what are the most common causes?**
   - Search for: `flaky tests causes test automation`
   - Try it: run `pnpm --filter practice-shop e2e e2e/dashboard.spec.ts --repeat-each=5` and note the result. Then explain why this file repeats well, while the orders file does not.
   - A good answer explains: at least three causes, such as timing, shared data and environment, and why flaky tests hurt a team.

2. **What does the Playwright trace viewer show in its Actions, Network and Console tabs?**
   - Search for: `playwright trace viewer actions network console`
   - Try it: break the paid test as in this lesson and open its trace. In the Network tab, find the request to `/api/orders`. Write down its method and status code.
   - A good answer explains: what each tab shows and how to use them to find the cause of a failure.

3. **What is a process exit code, and how does a CI system use it to decide pass or fail?**
   - Search for: `process exit code 0 non-zero ci powershell lastexitcode`
   - Try it: in PowerShell, run `pnpm --filter practice-shop e2e e2e/dashboard.spec.ts`, then type `$LASTEXITCODE`. Repeat with a test you broke on purpose. Compare the two numbers.
   - A good answer explains: that 0 means success and other numbers mean failure, and that the test command returns a non-zero code when tests fail.

## Next step

In the next lesson you read a spec closely and add your first test to it.
