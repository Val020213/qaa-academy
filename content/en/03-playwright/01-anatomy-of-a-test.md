---
title: Anatomy of a test
summary: Read a real Playwright test line by line, run it, and see what a failure looks like.
duration: 45 min
---

## Goal

- Explain what an end-to-end test is.
- Name the parts of a Playwright test: import, `test()`, `page`, an action and an assertion.
- Run one file and one test.
- Read the output of a passing and a failing run.

## What an end-to-end test is

You already run manual tests. You open the app, do some steps and compare the result with what you expect.

An **end-to-end test** (also called an e2e test) does the same thing, but a program does it. It opens a real browser, uses the app like a user, and checks the result.

**Playwright** is the tool that controls the browser. Your test code gives the orders.

## The target: the Practice app

The tests in this module run against the Practice app. It is a page in this course site. Start the site in a terminal:

```bash
pnpm dev
```

Open `http://localhost:5180/#/practice` in your browser. You see a login form, a test case list and a slow report. Try them by hand first.

> **Note:** You do not need `pnpm dev` to run the tests. Playwright starts the site by itself. The lesson about the config file explains why.

## Reading a real test

Open `e2e/playground.spec.ts`. A file that ends in `.spec.ts` is a **spec**: a file with tests. This is one test from it:

```ts
import { expect, test } from "./lib/test"

test.beforeEach(async ({ page }) => {
  await page.goto("/#/practice")
})

test.describe("login", () => {
  test("rejects wrong credentials", async ({ page }) => {
    await page.getByTestId("login-email").fill("qa@example.com")
    await page.getByTestId("login-password").fill("wrong")
    await page.getByTestId("login-submit").click()

    await expect(page.getByTestId("login-error")).toHaveText(
      "Wrong email or password."
    )
  })
})
```

Go through it one part at a time.

### The import

`import { expect, test } from "./lib/test"` brings in two tools. `test` declares a test. `expect` checks a result.

The team rule: import them from the project file `e2e/lib/test.ts`, never from `@playwright/test`.

### test()

`test("rejects wrong credentials", async ({ page }) => { ... })` declares one test. It has two arguments.

- The first is the name. Write it as a behaviour: what the app does.
- The second is a function. Playwright runs it when the test runs.

### async and page

The function is `async`, because every step takes time. You learned this in the async lesson.

Playwright gives the function a `page`. It is a fresh browser tab, only for this test. You write `{ page }` to take it from the object Playwright passes in.

### goto

`await page.goto("/#/practice")` opens an address. The start of the address (`http://localhost:5180`) comes from the config file, so you only write the end. In this file, `test.beforeEach` runs it before every test. `test.describe` puts tests in a named group. Lesson 7 explains both.

### An action

`fill` types into a field. `click` clicks a button. These steps are **actions**: things a user does. Each one has `await`.

### An assertion

`await expect(...).toHaveText(...)` is an **assertion**: a check. If the check is false, the test fails. A test without an assertion proves nothing.

The shape of every test is the same: open, act, check.

## Run one file

Use the root script `e2e` and give a file path:

```bash
pnpm e2e e2e/playground.spec.ts
```

The output is a list:

```text
Running 4 tests using 4 workers

  ✓  4 [chromium] › e2e/playground.spec.ts:12:3 › login › rejects wrong credentials (1.9s)
  ✓  2 [chromium] › e2e/playground.spec.ts:22:3 › login › accepts the test credentials (2.0s)
  ✓  1 [chromium] › e2e/playground.spec.ts:34:3 › test case list › adds a case and updates the counter (2.0s)
  ✓  3 [chromium] › e2e/playground.spec.ts:44:3 › slow loading › shows the report when loading ends (3.8s)

  4 passed (5.1s)
```

Each line is one test. The tick means it passed. `chromium` is the browser. Then you see the file, the line number, the group, the test name and the time.

The numbers and times change on each run.

## Run one test

Add `-g` and a part of the test name. `-g` means "grep": run only tests whose name contains this text.

```bash
pnpm e2e e2e/playground.spec.ts -g "adds a case"
```

Only one test runs.

## What a failure looks like

A failing test is not a problem. It is information. Make one on purpose. In the test above, expect a wrong text:

```ts
await expect(page.getByTestId("login-error")).toHaveText("Wrong password.")
```

The run prints a message like this:

```text
Error: expect(locator).toHaveText(expected) failed

Locator:  getByTestId('login-error')
Expected: "Wrong password."
Received: "Wrong email or password."
Timeout:  5000ms

Call log:
  - Expect "toHaveText" with timeout 5000ms
  - waiting for getByTestId('login-error')
    9 × locator resolved to <p role="alert" data-testid="login-error" ...>Wrong email or password.</p>
      - unexpected value "Wrong email or password."
```

Read it from the top. The assertion `toHaveText` failed. The locator is `login-error`. You expected one text and got another. Playwright tried for 5 seconds before it gave up.

The **call log** lists each try. Below it, you see the lines of your code with an arrow `>` at the failing line. The next lessons explain the rest of the message.

> **Tip:** Always read the "Expected" and "Received" lines first. They tell you what was different.

## Go deeper

### Why a test passes or fails

A Playwright test is a normal function. Playwright calls it. If the function ends without an error, the test passes. If something throws an error, the test fails.

An assertion is a check that throws an error when it is false. Here is the same idea in plain TypeScript, without a browser:

```ts
async function runTest(name: string, body: () => Promise<void>): Promise<void> {
  try {
    await body()
    console.log(`passed: ${name}`)
  } catch (error) {
    console.log(`failed: ${name} (${(error as Error).message})`)
  }
}

function check(actual: string, expected: string): void {
  if (actual !== expected) {
    throw new Error(`expected "${expected}" but got "${actual}"`)
  }
}

await runTest("no check at all", async () => {
  console.log("Wrong email or password.")
})

await runTest("with a check", async () => {
  check("Wrong email or password.", "Wrong password.")
})
```

It prints:

```text
Wrong email or password.
passed: no check at all
failed: with a check (expected "Wrong password." but got "Wrong email or password.")
```

The first test passes because nothing threw an error. It proved nothing.

Your test code runs in Node.js on your computer. The browser is another program. Each `await` sends one order to the browser and waits for the answer. So a `console.log` in a test prints in your terminal, not in the browser.

### A common wrong idea: "the test is green, so the app works"

Look at this test:

```ts
import { test } from "./lib/test"

test("adds a case", async ({ page }) => {
  await page.goto("/#/practice")
  await page.getByTestId("cases-input").fill("Check the login")
  await page.getByTestId("cases-add").click()
})
```

It passes. But it only proves that the field and the button exist and can be used. If the Add button added the wrong text, or added nothing, the test would still pass. Add an assertion for the result, such as `toHaveCount(1)`. A green test is only as strong as its checks.

### How it shows up in real QA work

A good test reads like a manual test case: prepare, do, check. Here the test has three steps:

```ts
import { expect, test } from "./lib/test"

test("ticking a case updates the counter", async ({ page }) => {
  await page.goto("/#/practice")

  // Prepare: a case exists.
  await page.getByTestId("cases-input").fill("Check the login")
  await page.getByTestId("cases-add").click()

  // Do: tick it.
  await page.getByTestId("cases-toggle-1").check()

  // Check: the counter changed.
  await expect(page.getByTestId("cases-counter")).toHaveText("1 of 1 passed")
})
```

Testers call this shape Arrange, Act, Assert. In `e2e/playground.spec.ts`, the `goto` is written once in `beforeEach`, not in every test. This is the idea called DRY, "Don't Repeat Yourself". You studied it at the end of the programming module. The limit is also important: a test should still read as a clear story from top to bottom.

## Practice

1. Start the site with `pnpm dev` and try the login form by hand.
2. In a second terminal, run `pnpm e2e e2e/playground.spec.ts`. Read the list.
3. Run only one test: `pnpm e2e e2e/playground.spec.ts -g "rejects wrong credentials"`.
4. In `e2e/playground.spec.ts`, change the text `"Wrong email or password."` to `"Wrong password."`. Run the file. Read the failure. Then undo the change.
5. Open `e2e/exercises/03-playwright/01-anatomy-of-a-test.spec.ts`. Change `test.fixme` to `test` in each test and write the steps from the comments.
6. Run only your file:

```bash
pnpm e2e e2e/exercises/03-playwright/01-anatomy-of-a-test.spec.ts
```

When you finish, compare your code with `e2e/exercises/03-playwright/solutions/01-anatomy-of-a-test.spec.ts`.

## Check what you know

1. What is an assertion?

<details><summary>Answer</summary>

A check. It compares what the app shows with what you expect. If they differ, the test fails.

</details>

2. What does `-g` do?

<details><summary>Answer</summary>

It runs only the tests whose name contains the text you give.

</details>

3. Why does every step in a test have `await`?

<details><summary>Answer</summary>

Every step takes time. `await` makes the test wait for the step to finish before the next one.

</details>

4. Which lines of a failure message do you read first?

<details><summary>Answer</summary>

The "Expected" and "Received" lines. They show the difference.

</details>

5. A test opens the Practice app, fills `login-email` and `login-password` with wrong values, and clicks `login-submit`. It has no assertion. Does it pass? Is it a useful test?

<details><summary>Answer</summary>

It passes, because the fields and the button exist and nothing throws an error. It is not useful. It would also pass if the app showed no error at all, or the wrong error. The test needs an assertion on `login-error`.

</details>

6. A test uses `page.getByTestId("login-erorr")` with a typo, and expects the text `"Wrong email or password."`. The app works correctly. What does the test do, and how long does it take?

<details><summary>Answer</summary>

It fails after about 5 seconds. No element has the test id with the typo. Playwright keeps looking until the assertion timeout ends, and then reports that it did not find the element. A failed test does not always mean a bug in the app. This one is a bug in the test.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **What is the difference between a unit test, an integration test and an end-to-end test?**
   - Search for: `test pyramid unit integration end-to-end`
   - A good answer explains: what each kind of test checks, which kind is fastest, and why teams usually write more fast tests than slow ones.

2. **What is the Arrange, Act, Assert pattern, and why do testers use it?**
   - Search for: `arrange act assert pattern testing`
   - A good answer explains: the three parts of a test, with one small example, and how the pattern makes a test easier to read.

3. **What is a flaky test, and what are the most common causes?**
   - Search for: `flaky test causes automation`
   - A good answer explains: what "flaky" means, gives at least three causes such as timing, shared data and an unstable environment, and says why a flaky test is harmful to a team.

## Next step

In the next lesson you learn locators: how a test finds an element on the page.
