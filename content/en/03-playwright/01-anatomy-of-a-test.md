---
title: Anatomy of a test
summary: Read a real Playwright test line by line, run it, and see what a failure looks like.
duration: 30 min
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

## Next step

In the next lesson you learn locators: how a test finds an element on the page.
