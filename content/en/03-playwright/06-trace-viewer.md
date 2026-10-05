---
title: The trace viewer
summary: Record a trace of a failed test, open it from the HTML report, and follow a routine to find the cause.
duration: 45 min
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

## Go deeper

### Why a trace is more than a video

A trace is a `.zip` file. Inside it Playwright keeps, for each step: a snapshot of the page, the console messages, the network calls and the test code line. It is not a video.

A video can only show you what the page looked like. A snapshot is a copy of the page content. So the trace viewer can highlight the element that your action used, and you can open the developer tools on a past moment. 
The viewer works from the file only. It does not need the app to be running. You can send a `trace.zip` to a colleague, and they see the same thing.

### How it shows up in real QA work: a bug report that developers believe

A failed test can be a test problem or an app bug. The trace helps you decide, and it helps you prove it.

Suppose a test fails because a report never shows its text. In the trace you open the Network tab. You see that the page asked the server for the report, and the server answered with status 500. A 500 means "the server had an error". The test and the locator were right. The app has a bug.

Now your bug report can say: "The report request returns 500. The trace is attached." The developer opens the trace and sees the same request. You did not need a long explanation. A bug report with evidence is much faster to fix than one that says "it does not work".

In the Practice app, the report does not call a server, so this exact case does not happen here. In a real application, it does.

### A trade-off: when to record

Recording has a cost. It makes tests slower and creates big files. The option `trace` in the config decides when to pay.

```ts
use: {
  trace: "retain-on-failure",
},
```

- `"off"` never records.
- `"on"` records every test and keeps every trace. Use it for one file while you learn.
- `"on-first-retry"` records only when a test runs again. This project uses it. It costs little, but it needs retries. On your machine retries are off, so you get no trace.
- `"retain-on-failure"` records every test and deletes the trace of tests that pass. You get a trace for every failure, without retries. The price is that every test is slower.

There is no best option. Choose by asking: how often do tests fail, and how much does it cost to run them twice?

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

5. In a real application, a test expects a table with 5 rows. It fails: `Received` is 0 rows. In the trace, the Network tab shows the request for the table data with status 500, and the screenshot shows the message "Something went wrong". Is this a test bug or an app bug? What do you do?

<details><summary>Answer</summary>

Most likely an app bug. The test looked for the right element and expected a reasonable result. The page failed because the server returned an error. You report the bug with the trace and the request. You should not change the test to hide the failure. You can run the test again to see if the error is rare or always there.

</details>

6. You run `pnpm e2e` on your machine. A test fails. You open the report, and there is no trace. A teammate says: "Change `trace` in the config to `on`." Why is this a poor first step, and what is a better one?

<details><summary>Answer</summary>

Changing the config affects everyone and makes every test slower from now on. A better step is to run only the failing test with `--trace on` in the command. This records one trace and changes nothing in the project. If the failure does not come back, the test may be flaky, and `retain-on-failure` can help catch it later.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **What do the Playwright trace modes `on-first-retry` and `retain-on-failure` do, and when would you choose each?**
   - Search for: `playwright trace retain-on-failure on-first-retry`
   - A good answer explains: when each mode records and keeps the trace, and the cost of each in time and disk space.

2. **What makes a good bug report for a developer?**
   - Search for: `good bug report steps expected actual result`
   - A good answer explains: the main parts of a bug report, such as steps, expected result, actual result and evidence, and why each one saves time.

3. **What is the browser console, and what is the difference between an error and a warning there?**
   - Search for: `browser console errors warnings devtools`
   - A good answer explains: what kinds of messages appear in the console, and why a page error can explain a test that fails with no clear reason.

## Next step

In the next lesson you learn to group tests, share set-up steps and skip tests in a safe way.
