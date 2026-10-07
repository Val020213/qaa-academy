---
title: The trace viewer
duration: 60 min
---

## Goal

In this lesson you record a test run and review the evidence of a failure in the trace viewer.

- Record a trace on your machine and open it from the HTML report.
- Read the actions, snapshots, console, network and source code.
- Distinguish a test error from an app bug.
- Choose when to record traces based on the cost and the evidence you need.

## What a trace stores

A **trace** is a recording of a test run. The file stores actions, DOM snapshots for operations that support them, console messages and network activity from the run. Not every step has a snapshot.

The trace viewer displays those records after the test has finished, so you can review the page and the steps that led to the failure.

## When this project records a trace

Open `playwright.config.ts`. In the `use` section you find:

```ts
trace: "on-first-retry",
```

It means: record a trace only on the first **retry**, the second attempt after a failure. This mode does not record the initial attempt or the second retry.

The project enables retries in CI and disables them on your machine. With this configuration, a local run records no traces. To record them without changing the config file:

```bash
pnpm e2e e2e/playground.spec.ts --trace on
```

The option `--trace on` records a trace for every test in this run. Limit recording to the file you are reviewing.

> **Note:** The config also has `screenshot: "only-on-failure"`. Playwright tries to capture the pages of a failed test. The image can be missing if there was no page or the capture failed. A trace also provides actions and saved DOM.

## Open the HTML report

Each run writes an HTML report. To open it, run:

```bash
pnpm e2e:report
```

Playwright starts a local server and opens the report in your browser. The terminal stays busy until you press Ctrl+C to stop it.

In the report, a failed test has a red mark. Click it to see the error message, the code and the screenshot. If a trace was recorded, a "Traces" section appears. Click the trace picture to open the trace viewer.

![The report lists passed and failed tests. Open the failed one to see the error and trace.](/clips/html-report.webm)

You can also open a trace directly with this command:

```text
pnpm exec playwright show-trace test-results/<test-folder>/trace.zip
```

## The trace viewer panels

**Actions.** On the left is the list of steps in order: `page.goto`, `locator.fill`, `expect.toHaveText` and so on. A step that failed is in red. Click a step to see the page at that moment.

**Before and after snapshots.** The "Before" and "After" tabs show the page around the action. The viewer displays the saved DOM, which you can inspect with the browser developer tools. For an assertion, inspect the prior state in "Before" and the observed target in "After" and "Call"; "Before" may not highlight it because Playwright marks it while running the check.

**Console.** Shows messages the page wrote to its console and errors in the page code.

**Network.** Shows the calls the page made to servers: address, status and time.

**Source.** Shows your test code, with the current step marked.

The "Call" tab shows the locator and the time used. "Errors" shows the failure message.

![Click each action to see the page, then open Errors to read why the test failed.](/clips/trace-viewer.webm)

### A delay without a network request

The test "shows the report when loading ends" in `e2e/playground.spec.ts` clicks the `report-load` button. The page code waits 1.5 seconds before showing the result; it does not call a server. That delay produces no new request in Network.

## Diagnose a failure

Review the evidence before changing the test:

1. Read the error message: assertion, locator, Expected and Received.
2. Open the trace and select the red step.
3. Inspect the prior state in "Before"; then check "After" and "Call" for the target and observed result.
4. Review earlier steps to find an unexpected action.
5. Look for page errors in Console and failed calls in Network.
6. Compare the result with the requirement to decide whether to fix the test or report a bug. After fixing it, run the test again.

For example, a test clicks "Load report" and waits for the text `12 tests`. You have two guesses. Guess one: the app never showed the report. Guess two: the test looked at the wrong element. Both cases can cause the same assertion to fail; the locator and received value help distinguish them.

Check the target in "After" and the locator in "Call". If they point to another element, correct the locator. If the target is right but does not show `12 tests`, you only know that the check did not find that text within its deadline. Compare the final observed state and timeout with the requirement before attributing it to the app. Console can show errors; this simulated load has no report request to inspect in Network.

## Go deeper

### Share the file

Playwright saves the trace in a `.zip` file. The viewer uses the saved snapshots and records to display the run without the app running. You can send a `trace.zip` to a colleague for review.

### The cost of recording

Recording traces adds work during a run and uses disk space. The `trace` option determines when to record and which files to keep:

```ts
use: {
  trace: "retain-on-failure",
},
```

- `"off"` never records.
- `"on"` records every test and keeps every trace.
- `"on-first-retry"` records only the first retry and keeps that trace even if the retry passes. This project uses it; it needs retries.
- `"retain-on-failure"` records every test and deletes the trace of tests that pass. You get a trace for every failure, without retries.

Keeping the failed run helps when the failure is hard to reproduce. Recording only a retry reduces the work of recording, but leaves the first run without a trace.

![Three attempts of the same test: each mode records and keeps different traces.](/images/03-trace-attempts.en.svg)

## Practice

1. Make a copy of the test "rejects wrong credentials" in a new file `e2e/exercises/03-playwright/trace-practice.spec.ts`. Import from `../../lib/test`. Before filling the fields, add `await page.goto("/#/practice")`: the original file's navigation is outside the test.
2. Change the expected text to `"Wrong password."` so the test fails.
3. Run it with a trace:

```bash
pnpm e2e e2e/exercises/03-playwright/trace-practice.spec.ts --trace on
```

4. Run `pnpm e2e:report`. Open the failed test and open its trace.
5. Click each action. Find the "Before" snapshot of the failing assertion. Open the Source tab.
6. Stop the report with Ctrl+C. Delete `trace-practice.spec.ts`.

## Challenge

Create `e2e/challenges/06-three-failures.spec.ts` with three tests of the Practice page that fail for different reasons. The first must have incorrect expected text; the second, a locator that matches more than one element. The third must fail even though the app and the expected text are right. Demonstrate each cause with the trace.

It is done when:

- Running `pnpm e2e e2e/challenges/06-three-failures.spec.ts --trace on` reports `3 failed`.
- Above each test, a comment of two lines says which trace panel showed the cause and what you saw there.
- The three error messages are different from each other.
- After you change one thing in each test, the same command reports `3 passed`.

You will need to know how Playwright reports a locator that matches many elements and how to give one assertion a shorter time limit. Search for: `playwright strict mode violation`, `playwright expect timeout option`.

## Think it through

1. In CI, a test fails on the first run and passes on the retry. The config has `trace: "on-first-retry"` and `retries: 2`. Which run does the trace record, and what evidence are you missing?

<details><summary>Answer</summary>

It records the first retry, the second run. The failed run has no trace, so you cannot inspect its cause directly. The report marks the test as flaky.

</details>

2. A teammate sees the red step in the trace and adds this delay. The test now passes. What problem does the change leave?

```ts
await page.getByTestId("report-load").click()
await page.waitForTimeout(3000)
await expect(page.getByTestId("report-result")).toContainText("12 tests")
```

<details><summary>Answer</summary>

The change does not identify the cause of the failure. The fixed delay adds three seconds even if the result arrives sooner, and it may be insufficient on another run. The assertion already waits and retries; check the locator and timeout in the trace. The team rule forbids `waitForTimeout`.

</details>

3. A test fails on its first action, `page.goto("/#/practice")`. The snapshot is blank. What can the trace still show?

<details><summary>Answer</summary>

Errors shows the message, for example that the connection was refused. Network lets you check whether the request received a response. Check whether the site is running and whether `QAA_E2E_PORT` points to the correct port.

</details>

## Next step

In the next lesson you learn to group tests, share set-up steps and skip tests in a safe way.
