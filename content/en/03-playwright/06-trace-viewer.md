---
title: The trace viewer
summary: Record a trace of a failed test, open it from the HTML report, and use it to tell a wrong test from a real bug.
duration: 90 min
---

## Start with a puzzle

A test fails. The message says that `expect(locator).toContainText(expected)` failed after a timeout of 5000 ms.

The test clicks "Load report" and waits for the text `12 tests`. You have two guesses. Guess one: the app never showed the report. Guess two: the test looked at the wrong element. The error message is the same for both.

You may open one panel of a recording of the run. Which panel or panels let you decide in under a minute? What exactly do you look for in each?

Write down your guess before you read on.

## Goal

- Decide whether a failure is a bug in the test or a bug in the app, using evidence from a trace.
- Record a trace on your machine and open it from the HTML report.
- Read the panels: actions, snapshots, console, network and source.
- Choose when a project should record traces, and say what each choice costs.

## What a trace is

A **trace** is a recording of a test run. It is a file that keeps, for every step, a copy of the page, the console messages and the network calls.

With a trace, you can look at a failed test after it finished. You can click inside the page and read the details. A trace is the first thing to open when a test fails.

## When this project records a trace

Open `playwright.config.ts`. In the `use` section you find:

```ts
trace: "on-first-retry",
```

It means: record a trace only when a test is run again after a failure. A run again is a **retry**.

Retries are on in CI, the automatic server run, and off on your machine. So on your machine this setting records nothing. Before you read on, guess: how would you get a trace on your machine, without changing the config file? Then compare:

```bash
pnpm e2e e2e/playground.spec.ts --trace on
```

The option `--trace on` records a trace for every test in this run. Use it on one file, not on the whole suite.

> **Note:** The config also has `screenshot: "only-on-failure"`. A failed test always has a picture of the page at the end. A trace gives you much more.

## Open the HTML report

Each run writes an HTML report. To open it, run:

```bash
pnpm e2e:report
```

Playwright starts a small local server and opens the report in your browser. The terminal stays busy. Press Ctrl+C to stop it.

In the report, a failed test has a red mark. Click it. You see the error message, the code and the screenshot. If a trace was recorded, there is a "Traces" section. Click the trace picture to open the trace viewer.

Watch how a failed test looks in the report.

![The report lists passed and failed tests. Open the failed one to see the error and trace.](/clips/html-report.webm)

The terminal also prints a command to open a trace directly:

```text
pnpm exec playwright show-trace test-results/<test-folder>/trace.zip
```

## The trace viewer panels

**Actions.** On the left is the list of steps in order: `page.goto`, `locator.fill`, `expect.toHaveText` and so on. A step that failed is in red. Click a step to see the page at that moment.

**Before and after snapshots.** At the top you see the page. Tabs let you choose "Before" or "After" the action. A **snapshot** is a copy of the page at one moment. It is not a picture. You can open the browser developer tools on it and inspect elements. The highlighted element is the one the action used.

**Console.** Messages the page wrote to its console, and errors in the page code.

**Network.** The calls the page made to servers: address, status and time.

**Source.** Your test code, with the current step marked.

There are other tabs, such as "Call" (the locator and the time used) and "Errors" (the failure message).

Watch how each action shows the page, and how Errors tells you why the test failed.

![Click each action to see the page, then open Errors to read why the test failed.](/clips/trace-viewer.webm)

### Experiment: what does the Network tab show?

Take the test "shows the report when loading ends" from `e2e/playground.spec.ts`. The button `report-load` waits 1.5 seconds in the page code. It does not call a server.

Predict: when you click the action for `report-load`, will the Network tab show a new request? Write your answer. Run the file with `--trace on`, open the trace, and check. What does your result tell you about where the 1.5 seconds go?

## A routine to diagnose a failure

Debug like a scientist: one guess, one small experiment, one change at a time. Do not change code before you know the cause.

1. Read the error message: assertion, locator, Expected and Received.
2. Open the trace. Go to the red step.
3. Look at the "Before" snapshot. Is the page in the state you expect?
4. Look at the highlighted element. Is it the one you meant?
5. Look at the steps before. Did a step do something different from what you thought?
6. Check the Console for page errors and the Network for failed calls.
7. Decide: is it a wrong test, or a bug in the app?
8. Fix the test, or report the bug. Run the test again.

The decision in step 7 is the most important. A test can fail because the app has a bug. That is the reason the test exists.

### Back to the puzzle

Two panels answer the question. In the snapshot, look at the highlighted element. If it is the wrong element, guess two is true: your locator is wrong. If it is the right element and it still shows only `Loading…` or nothing, guess one is true. Then the Console and Network tabs can tell you why: a page error, or a request with a bad status.

The error text only tells you what the test expected. The trace shows what the page really did.

## Go deeper

### Why a trace is more than a video

A trace is a `.zip` file. Inside it Playwright keeps, for each step: a snapshot of the page, the console messages, the network calls and the line of test code. It is not a video.

A video can only show what the page looked like. A snapshot is a copy of the page content. So the viewer can highlight the element your action used, and you can open the developer tools on a past moment. The viewer works from the file only. It does not need the app to be running. You can send a `trace.zip` to a colleague, and they see the same thing.

### How it shows up in real QA work: a bug report that developers believe

A failed test can be a test problem or an app bug. The trace helps you decide, and it helps you prove it.

Suppose a test fails because a report never shows its text. In the trace you open the Network tab. The page asked the server for the report, and the server answered with status 500. A 500 means "the server had an error". The test and the locator were right. The app has a bug.

Now your bug report can say: "The report request returns 500. The trace is attached." A bug report with evidence is much faster to fix than one that says "it does not work".

In the Practice app, the report does not call a server, so this exact case does not happen here. In a real application, it does.

### A trade-off: when to record

Recording makes tests slower and creates big files. The option `trace` in the config decides when to pay.

```ts
use: {
  trace: "retain-on-failure",
},
```

- `"off"` never records.
- `"on"` records every test and keeps every trace. Use it for one file while you learn.
- `"on-first-retry"` records only when a test runs again. This project uses it. It costs little, but it needs retries.
- `"retain-on-failure"` records every test and deletes the trace of tests that pass. You get a trace for every failure, without retries. Every test is slower.

There is no best option. Ask: how often do tests fail, and how much does it cost to run them twice?

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

## Challenge

Make three tests that each fail for a different reason, then prove each cause with the trace alone.

Create the file `e2e/challenges/06-three-failures.spec.ts`. Use the Practice page. The first test must fail because the expected text is wrong. The second must fail because one locator matches more than one element. The third must fail even though the app is right and the expected text is right. Choose which part of the Practice page each test uses.

It is done when:

- Running `pnpm e2e e2e/challenges/06-three-failures.spec.ts --trace on` reports `3 failed`.
- Above each test, a comment of two lines says which trace panel showed the cause and what you saw there.
- The three error messages are different from each other.
- After you change one thing in each test, the same command reports `3 passed`.

You will need something this lesson did not teach: how Playwright reports a locator that matches many elements, and how to give one assertion a shorter time limit. Search for: `playwright strict mode violation`, `playwright expect timeout option`.

## Think it through

1. In CI, a test fails on the first run and passes on the retry. The config has `trace: "on-first-retry"` and `retries: 2`. Which run does the trace record, and what problem does this cause for you?

<details><summary>Answer</summary>

The trace records the retry, which is the second run. The first run, the one that failed, has no trace. So the trace you open shows a run that passed, and the cause of the first failure is not in it. This is one reason `retain-on-failure` is useful for tests that fail rarely. The report will also mark the test as flaky.

</details>

2. A teammate sees the red step in the trace and fixes the test like this. The test now passes. What is wrong with the fix?

```ts
await page.getByTestId("report-load").click()
await page.waitForTimeout(3000)
await expect(page.getByTestId("report-result")).toContainText("12 tests")
```

<details><summary>Answer</summary>

The test passes, but the fix hides the reason it failed. A fixed delay is either too long, so every run wastes time, or too short, so the test fails again on a slow machine. The assertion already waits and retries for a few seconds. The trace should have told the teammate whether the wait was too short or the element was wrong. The team rule forbids `waitForTimeout`.

</details>

3. Your team has 400 tests. About 2 in 100 fail on a normal day. Do you choose `on-first-retry` or `retain-on-failure`, and what would make you choose the other?

<details><summary>Answer</summary>

With `on-first-retry` you pay a little on every run, but you need retries and you only see the retry. With `retain-on-failure` every test records, so the run is slower, but each failure has a trace of the failing run. If the suite is fast and failures are rare and hard to repeat, choose `retain-on-failure`. If CI time is expensive and failures are usually easy to repeat, `on-first-retry` is enough. It depends on the cost of time and of disk space.

</details>

4. You send `trace.zip` to a colleague who does not have the app running. What breaks, and what still works?

<details><summary>Answer</summary>

Nothing in the viewer breaks. The file has the page copies, the console and the network calls, so the viewer needs only the file. What does not work is running the test again or trying a new locator on the live page. For that, the colleague needs the app.

</details>

5. Explain to a developer, in three sentences and without using the word "screenshot", why you attach a trace to a bug report.

<details><summary>Answer</summary>

Example: "The trace shows every step, so you see how the page got into the bad state. It also has the network calls and the console, so you can see the failed request. You can open it without running the app." A good answer says what the developer gets that a still picture cannot give: the steps before the failure and the hidden data.

</details>

6. A test fails on its very first action, `page.goto("/#/practice")`. You open the trace. The snapshot is blank. What can the trace still tell you?

<details><summary>Answer</summary>

The "Before" and "After" snapshots are blank because no page loaded. The Errors tab shows the message, for example that the connection was refused. The Network tab shows whether the request got any answer. A common cause is that the site is not running or that `QAA_E2E_PORT` points to another port. The trace does not give a page, but it still gives the cause.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **What do the Playwright trace modes `on-first-retry` and `retain-on-failure` do, and when would you choose each?**
   - Search for: `playwright trace retain-on-failure on-first-retry`
   - Try it: Run a file with one passing test and one failing test, first with `--trace on`, then with `--trace retain-on-failure`. Look in the `test-results` folder after each run. Which runs left a `trace.zip` for the passing test?
   - A good answer explains: when each mode records and keeps the trace, and the cost of each in time and disk space.

2. **What makes a good bug report for a developer?**
   - Search for: `good bug report steps expected actual result`
   - Try it: Write a bug report for this made-up bug: "the counter shows `NaN of 1 passed`". Give it to a classmate. Ask them to find the bug in the Practice page using only your text, without asking you anything.
   - A good answer explains: the main parts of a bug report, such as steps, expected result, actual result and evidence, and why each one saves time.

3. **What is the browser console, and what is the difference between an error and a warning there?**
   - Search for: `browser console errors warnings devtools`
   - Try it: In a scratch test, add `await page.evaluate(() => console.error("my own error"))`. Run it with `--trace on` and find the message in the Console tab of the trace.
   - A good answer explains: what kinds of messages appear in the console, and why a page error can explain a test that fails with no clear reason.

## Next step

In the next lesson you learn to group tests, share set-up steps and skip tests in a safe way.
