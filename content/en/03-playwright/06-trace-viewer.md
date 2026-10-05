---
title: The trace viewer
summary: Record a trace of a failed test, open it from the HTML report, and follow a routine to find the cause.
duration: 30 min
---

## Goal

- Explain what a trace is.
- Record a trace on your machine and open it from the HTML report.
- Use the panels: actions, snapshots, console, network and source.
- Follow a routine to diagnose a failed test.

## What a trace is

A **trace** is a recording of a test run. It is a file that keeps, for every step, a picture of the page, the console messages and the network calls.

With a trace, you can look at a failed test after it finished. You see what the page looked like at each step. It is like the replay of a video, but you can also click inside the page and read the details.

A trace is the first thing to open when a test fails.

## When this project records a trace

Open `playwright.config.ts`. In the `use` section you find this line:

```ts
trace: "on-first-retry",
```

It means: record a trace only when a test is run again after a failure. A run again is called a **retry**.

Retries are on in CI, the automatic server run, and off on your machine. So on your machine this setting records nothing. This is on purpose: traces make tests slower.

To get a trace locally, ask for it in the command:

```bash
pnpm e2e e2e/playground.spec.ts --trace on
```

The option `--trace on` records a trace for every test in this run. Use it on one file, not on the whole suite.

> **Note:** The config also has `screenshot: "only-on-failure"`. A failed test always has a picture of the page at the end. A trace gives you much more than that picture.

## Open the HTML report

Each run also writes an HTML report. To open it, run:

```bash
pnpm e2e:report
```

Playwright starts a small local server and opens the report in your browser. The terminal stays busy. Press Ctrl+C in the terminal to stop it.

In the report you see a list of tests. A failed test has a red mark. Click it. You see the error message, the code and the screenshot. If a trace was recorded, there is a "Traces" section. Click the trace picture to open the trace viewer.

The terminal also prints the command to open a trace directly. It looks like this:

```text
pnpm exec playwright show-trace test-results/<test-folder>/trace.zip
```

## The trace viewer panels

The window has a few areas.

**Actions.** On the left is the list of steps, in order: `page.goto`, `locator.fill`, `expect.toHaveText` and so on. The time of each step is next to it. A step that failed is in red. Click a step to see the page at that moment.

**Before and after snapshots.** At the top you see the page. Tabs let you choose "Before" or "After" the action. A **snapshot** is a copy of the page at one moment. It is not a picture. You can open the browser developer tools on it and inspect the elements.

The highlighted element in the snapshot is the element the action used. If the wrong element is highlighted, your locator is wrong.

**Console.** The messages the page wrote to its console, and errors in the page code.

**Network.** The calls the page made to servers: address, status and time. A call with a failed status can explain an empty page.

**Source.** Your test code, with the current step marked. You see which line of your spec made this action.

There are other tabs, such as "Call" and "Errors". "Call" shows the locator and the time used. "Errors" shows the failure message.

## A routine to diagnose a failure

Follow the same steps each time. Do not change code before you know the cause.

1. Read the error message: assertion, locator, Expected and Received.
2. Open the trace. Go to the red step.
3. Look at the "Before" snapshot. Is the page in the state you expect?
4. Look at the highlighted element. Is it the one you meant?
5. Look back at the steps before. Did a step do something different from what you thought?
6. Check the Console for page errors and the Network for failed calls.
7. Decide: is it a wrong test, or a bug in the app?
8. Fix the test, or report the bug. Run the test again.

The decision in step 7 is the most important. A test can fail because the app has a bug. That is the reason the test exists.

## Practice

1. Make a copy of the test "rejects wrong credentials" in a new file `e2e/exercises/03-playwright/trace-practice.spec.ts`. Import from `../../lib/test`.
2. Change the expected text to `"Wrong password."` so the test fails.
3. Run it with a trace:

```bash
pnpm e2e e2e/exercises/03-playwright/trace-practice.spec.ts --trace on
```

4. Run `pnpm e2e:report`. Open the failed test and open its trace.
5. Click each action. Find the "Before" snapshot of the failing assertion. Open the Source tab.
6. Stop the report with Ctrl+C. Delete `trace-practice.spec.ts`.

## Check what you know

1. What is a trace?

<details><summary>Answer</summary>

A recording of a test run. It keeps snapshots of the page, the console and the network for each step.

</details>

2. Why does your local run not produce a trace by default?

<details><summary>Answer</summary>

The config has `trace: "on-first-retry"`. Retries are off on your machine, so no trace is recorded.

</details>

3. How do you record a trace on your machine?

<details><summary>Answer</summary>

Add `--trace on` to the command, for example `pnpm e2e e2e/playground.spec.ts --trace on`.

</details>

4. What does the highlighted element in a snapshot tell you?

<details><summary>Answer</summary>

It shows which element the action used. If it is the wrong one, the locator is wrong.

</details>

## Next step

In the next lesson you learn to group tests, share set-up steps and skip tests in a safe way.
