---
title: Anatomy of a test
summary: Read a real Playwright test line by line, run it, see what a failure looks like, and learn why a green test can prove nothing.
duration: 75 min
---

## Start with a puzzle

Here are three tests. Each one first types a wrong password and clicks "Sign in" in the Practice app.

- Test A has no check after the click.
- Test B checks that the element `login-error` is visible.
- Test C checks that the element `login-welcome` is hidden.

Now a developer deletes one line from the app: the line that sets the message "Wrong email or password." The error never appears.

Which of the three tests turn red? Which stay green? One of your answers may surprise you.

Write down your guess before you read on.

## Goal

- Predict whether a test passes or fails from its code alone.
- Name the parts of a Playwright test: import, `test()`, `page`, an action and an assertion.
- Run one file and one test, and read the result of a passing and a failing run.
- Explain why a green test can still prove nothing.

## What an end-to-end test is

You already run manual tests. You open the app, do some steps and compare the result with what you expect.

An **end-to-end test** (also called an e2e test) does the same thing, but a program does it. It opens a real browser, uses the app like a user, and checks the result.

**Playwright** is the tool that controls the browser. Your test code gives the orders.

## The target: the Practice app

The tests in this module run against the Practice app. It is a page in this course site. Start the site in a terminal:

```bash
pnpm dev
```

Open `http://localhost:5180/#/practice` in your browser. You see a login form, a test case list and a slow report. Try them by hand first. Look for the three things a test will need: where you type, what you click, and where the result appears.

Watch how a person uses the Practice app by hand.

![Using the Practice app by hand: log in, add cases, tick one, load the report.](/clips/practice-app-tour.webm)

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

Before you read the explanation, take a pencil. Mark every word in this file that you can guess the meaning of. Then compare with the parts below.

### The import

`import { expect, test } from "./lib/test"` brings in two tools. `test` declares a test. `expect` checks a result.

The team rule: import them from the project file `e2e/lib/test.ts`, never from `@playwright/test`. Today that file only passes the two tools on. The team can add its own tools there later, and no spec has to change.

### test()

`test("rejects wrong credentials", async ({ page }) => { ... })` declares one test. It has two arguments.

- The first is the name. Write it as a behaviour: what the app does.
- The second is a function. Playwright runs it when the test runs.

### async and page

The function is `async`, because every step takes time. You learned this in the async lesson.

Playwright gives the function a `page`. It is a fresh browser tab, only for this test. You write `{ page }` to take it from the object Playwright passes in. Because every test gets its own tab, one test cannot leave a mess for the next one.

### goto

`await page.goto("/#/practice")` opens an address. The start of the address (`http://localhost:5180`) comes from the config file, so you only write the end. In this file, `test.beforeEach` runs it before every test. `test.describe` puts tests in a named group. Lesson 7 explains both.

### An action

`fill` types into a field. `click` clicks a button. These steps are **actions**: things a user does. Each one has `await`.

### An assertion

`await expect(...).toHaveText(...)` is an **assertion**: a check. If the check is false, the test fails. A test without an assertion proves nothing.

The shape of every test is the same: open, act, check.

## Run one file

Use the root script `e2e` and give a file path. First, predict. The file has four tests. How many will pass? Will the lines print in the order of the file?

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

The numbers and times change on each run. The first number on each line is not the order in the file. Tests run at the same time, in several "workers" (separate processes), and each line prints when its test ends. So a test must never depend on another test running first.

## Run one test

Add `-g` and a part of the test name. `-g` means "grep": run only tests whose name contains this text.

```bash
pnpm e2e e2e/playground.spec.ts -g "adds a case"
```

Only one test runs.

Watch the steps of the login test, with the code line shown for each step.

![The login test runs step by step, with each line of code shown below.](/clips/test-run-headed.webm)

## What a failure looks like

A failing test is not a problem. It is information. Make one on purpose. In the test above, expect a wrong text:

```ts
await expect(page.getByTestId("login-error")).toHaveText("Wrong password.")
```

Before you run it, write what you think the message will contain. Which two texts will it show? How long do you think Playwright tries before it gives up?

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
    9 × locator resolved to <div role="alert" data-slot="alert" ...>Wrong email or password.</div>
      - unexpected value "Wrong email or password."
```

Read it from the top. The assertion `toHaveText` failed. The locator is `login-error`. You expected one text and got another. Playwright tried for 5 seconds before it gave up.

The **call log** lists each try. Below it, you see the lines of your code with an arrow `>` at the failing line. The next lessons explain the rest of the message.

> **Tip:** Always read the "Expected" and "Received" lines first. They tell you what was different.

Treat a failure like a scientist. You have one guess ("the text is different"), and the message is the result of one small experiment. Change one thing, run again. If you change three things at once, you will not know which one fixed it.

### Back to the puzzle

Only test B turns red. The deleted line leaves the error element empty and hidden, so `toBeVisible` fails. Test A has no check, so it can never fail. Test C checks that the welcome message is hidden. That is also true when the app has the bug, so it stays green.

A check is useful only if it would be false when the app is wrong. Ask this about every assertion you write: "What bug would turn this red?"

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

Testers call this shape **Arrange, Act, Assert**. In `e2e/playground.spec.ts`, the `goto` is written once in `beforeEach`, not in every test. This is the idea called DRY, "Don't Repeat Yourself". You studied it at the end of the programming module. The limit is also important: a test should still read as a clear story from top to bottom.

Each test here makes its own case. It does not rely on a case from another test. A good test suite is **independent** and **repeatable**: you can run any test alone, in any order, many times, and get the same answer.

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

## Challenge

Create the file `e2e/challenges/01-anatomy-of-a-test.spec.ts`. Choose one behaviour of the Practice app that `e2e/playground.spec.ts` does not test. Good choices: signing out after a login, deleting a case, or the rule that an empty case title adds nothing. Write one test for it, in the Arrange, Act, Assert shape. Split the test into named steps. Then prove that your test can fail: break it on purpose and read the message.

It is done when:

- The file has exactly one test, and `pnpm e2e e2e/challenges/01-anatomy-of-a-test.spec.ts` shows it as passed.
- The test has three named steps for Arrange, Act and Assert, and the run output shows the step names when you make it fail.
- You changed one expected value on purpose, saw the test fail, and the failure message pointed to your Assert step. Then you changed it back.
- The test has at least one assertion that would be false if the behaviour were broken. You can say in one sentence which bug turns it red.
- The test does not use `page.waitForTimeout`.

You will need something this lesson did not teach: how to group lines of a test into named steps. Search for: `playwright test.step`.

> **Tip:** You may ask an AI assistant for help. But you must run the code, and you must be able to explain every line to a teammate. Never keep code that you cannot explain.

## Think it through

1. Predict the output and say why. Use `runTest` and `check` from "Go deeper".

```ts
await runTest("two checks", async () => {
  console.log("step 1")
  check("dog", "dog")
  console.log("step 2")
  check("cat", "bird")
  console.log("step 3")
})
```

<details><summary>Answer</summary>

It prints `step 1`, `step 2`, and then `failed: two checks (expected "bird" but got "cat")`. The text `step 3` is never printed. The second `check` throws an error, and an error stops the function at that line. Playwright works the same way: the first failed assertion ends the test, so later lines do not run.

</details>

2. This test runs and passes, but it does the wrong job. Find the bug.

```ts
test("accepts the test credentials", async ({ page }) => {
  await page.goto("/#/practice")
  await page.getByTestId("login-email").fill("qa@example.com")
  await page.getByTestId("login-password").fill("Playwright123")
  await page.getByTestId("login-submit").click()

  await expect(page.getByTestId("login-error")).toBeHidden()
})
```

<details><summary>Answer</summary>

The test checks that no error is shown. That is also true when the app does nothing at all, or when it freezes. The check would pass even before the click. Check the thing that proves success: `login-welcome` is visible and contains the email. The test name says "accepts", so the assertion must prove an acceptance.

</details>

3. Two versions of a spec both work. Version A calls `page.goto` once in `test.beforeEach`. Version B writes `page.goto` as the first line of every test. Which is better here, and what would make you choose the other?

<details><summary>Answer</summary>

In `e2e/playground.spec.ts`, A is better. Every test starts on the same page, so the repeated line is noise, and a change of address is made in one place. B is better when some tests start elsewhere, or when a reader must see the start state without scrolling to the top of the file. The test should read as a story, so choose the version where the story stays clear.

</details>

4. What breaks if a developer renames `data-testid="login-error"` to `data-testid="auth-error"`, and the message text is the same? What does the failure look like, and is it a bug in the app?

<details><summary>Answer</summary>

Every test that uses `getByTestId("login-error")` fails after about 5 seconds. The message says the locator did not find an element, so there is no `Received` text. A user sees no difference, so this is not a bug in the app. It is a change of the contract between the app and the tests. The fix is to talk with the developer, and to update the tests in the same change.

</details>

5. Explain to a teammate in three sentences why a test without checks can pass. Do not use the word "assertion".

<details><summary>Answer</summary>

A test fails only when something throws an error. Steps like typing and clicking throw an error only when the element is missing. A check is the part of the code that compares the page with what you expect, and a test with no check never compares anything, so it can never be wrong.

</details>

6. A colleague says: "One assertion per test is the rule." Another says: "Five assertions in one test is fine." Who is right?

<details><summary>Answer</summary>

There is no single right answer. One assertion per test gives a clear failure message and a precise name. But every test repeats the set-up, which is slow when the set-up is long. Several assertions on one result of one behaviour are fine, for example text, count and counter after "add a case". Several assertions about different behaviours in one test are not fine, because the first failure hides the rest. It depends on one question: if this test fails, will I know at once which behaviour is broken?

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **What is the difference between a unit test, an integration test and an end-to-end test?**
   - Search for: `test pyramid unit integration end-to-end`
   - Try it: Pick the Add button of the case list. Write one sentence for each kind of test: what you would check, and what you would need to run it.
   - A good answer explains: what each kind of test checks, which kind is fastest, and why teams usually write more fast tests than slow ones.

2. **What is a flaky test, and what are the most common causes?**
   - Search for: `flaky test causes automation`
   - Try it: Run `pnpm e2e e2e/playground.spec.ts --repeat-each=10` and look at the result. Then find in the Playwright documentation what `--repeat-each` is for.
   - A good answer explains: what "flaky" means, gives at least three causes such as timing, shared data and an unstable environment, and says why a flaky test is harmful to a team.

3. **What is mutation testing, and how does it connect to the question "what bug would turn this red?"**
   - Search for: `mutation testing explained`
   - Try it: Change one line in `src/practice/LoginPanel.tsx` on purpose, for example the error text. Run your tests and note which ones fail. Undo the change.
   - A good answer explains: how a deliberate small bug is used to measure the strength of tests, and why a test that stays green is a warning.

## Next step

In the next lesson you learn locators: how a test finds an element on the page.
