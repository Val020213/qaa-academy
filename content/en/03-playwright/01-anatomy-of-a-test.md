---
title: Anatomy of a test
duration: 60 min
---

## Goal

In this lesson you read a Playwright test, run it, and use the failure message to find which result differs from the expected one.

- Recognize the import, `test()`, `page`, actions and assertions.
- Organize a test into preparation, action and a check.
- Run a file or a single test and read its result.
- Detect a test that passes without checking the behaviour its name describes.

## End-to-end tests

An **end-to-end test** (E2E) uses a real browser to go through the app and check the result. Playwright controls the browser with your test's instructions; its test runner calls the function that contains those instructions.

## The Practice app

The tests in this module use the Practice app, a page in the course site. To try it by hand, start the site in a terminal:

```bash
pnpm dev
```

Open `http://localhost:5180/#/practice`. You will see a login form, a test case list and a slow report. Identify the fields, the buttons and where each result appears.

![Using the Practice app by hand: log in, add cases, tick one, load the report.](/clips/practice-app-tour.webm)

> **Note:** You do not need `pnpm dev` to run the tests. Playwright's test runner starts the site according to the project configuration.

## Reading a real test

Open `e2e/playground.spec.ts`. The ending `.spec.ts` identifies a *spec*, a file with tests. Here is one of them:

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

### The import

`import { expect, test } from "./lib/test"` brings in the tools to declare a test and check its result.

In this project, they are imported from `e2e/lib/test.ts`, never from `@playwright/test`. That file re-exports the tools and gives the team one place to make changes.

### test()

`test("rejects wrong credentials", async ({ page }) => { ... })` takes two arguments: the behaviour's name and the function that Playwright's test runner calls to test it.

### async and page

The function uses `async` to wait for browser operations with `await`.

Playwright gives the function a `page`. It is a fresh browser tab, only for this test. You write `{ page }` to take it from the object Playwright passes in. Because every test gets its own tab, one test cannot leave a mess for the next one.

### goto

`await page.goto("/#/practice")` opens the page. The start of the address, `http://localhost:5180`, comes from the project configuration.

In this file, `test.beforeEach` runs the navigation before every test. `test.describe` groups the tests under the login name.

### The actions

`fill` writes into a field and `click` clicks the button. Each action has `await` so it finishes before the next line runs.

### The assertion

`await expect(...).toHaveText(...)` checks the element's text. The locator finds the element by its identifier `login-error`; the assertion compares its text with the expected text.

If the text does not match yet, Playwright finds the element and checks it again until it matches or the timeout expires. In that case, the assertion throws an error and the test fails.

## Prepare, act and check

The **Arrange, Act, Assert** structure separates preparation, the action you are testing and the check of its result. In this example, adding a case prepares the state needed to test that ticking it changes the counter:

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

The test creates its own case. It does not need another test to have created it first. You should be able to run each test alone and repeat it with the same result.

## Run one file

From the project root, use the `e2e` script with the file path:

```bash
pnpm e2e e2e/playground.spec.ts
```

The output shows the results of the four tests:

```text
Running 4 tests using 4 workers

  ✓  4 [chromium] › e2e/playground.spec.ts:12:3 › login › rejects wrong credentials (1.9s)
  ✓  2 [chromium] › e2e/playground.spec.ts:22:3 › login › accepts the test credentials (2.0s)
  ✓  1 [chromium] › e2e/playground.spec.ts:34:3 › test case list › adds a case and updates the counter (2.0s)
  ✓  3 [chromium] › e2e/playground.spec.ts:44:3 › slow loading › shows the report when loading ends (3.8s)

  4 passed (5.1s)
```

The tick means the test passed. `chromium` is the browser. Next come the file, line number, group, test name and duration.

This project runs tests in parallel, in several **workers** (separate processes). Each line prints when its test ends, so the list can appear in a different order from the file. The numbers, worker count and timings can change between runs.

## Run one test

Add `-g` and part of the name to select the test:

```bash
pnpm e2e e2e/playground.spec.ts -g "adds a case"
```

This command runs only the test that adds a case. The following clip shows the steps of another test, the login test, alongside its code:

![The login test runs step by step, with each line of code shown below.](/clips/test-run-headed.webm)

## Read a failure

To cause a failure, change the expected text in the assertion of the wrong-credentials test:

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
    9 × locator resolved to <div role="alert" data-slot="alert" ...>Wrong email or password.</div>
      - unexpected value "Wrong email or password."
```

`Expected` shows the expected text and `Received` the text Playwright found. The assertion looked for the element with `getByTestId('login-error')` and checked its text for 5 seconds before failing.

The **call log** shows the attempts. Below it, the test's lines appear with an arrow `>` at the failing line. Use those details to review the expectation or the app's behaviour, then run again after changing one thing.

## Go deeper

### The test function's result

Playwright's test runner calls the test function. If it ends without an error, the test passes; if it throws an error, the test fails. An assertion throws an error when its check is not met.

This example reproduces the idea in TypeScript, without a browser:

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

The first test passes because printing a message does not check that it is the expected one. In the second, `check` compares the texts and throws the error that `runTest` catches.

Your test code runs in Node.js on your computer. The browser is another program. Each `await` sends one order to the browser and waits for the answer. So a `console.log` in a test prints in your terminal, not in the browser.

### A test without a result check

This test is named after a behaviour, but ends after the click:

```ts
import { test } from "./lib/test"

test("adds a case", async ({ page }) => {
  await page.goto("/#/practice")
  await page.getByTestId("cases-input").fill("Check the login")
  await page.getByTestId("cases-add").click()
})
```

It passes if Playwright can complete the actions. If the Add button added nothing or added the wrong text, the test would still pass. An assertion about the case count, such as `toHaveCount(1)`, would detect that no case was added.

## Practice

1. Start the site with `pnpm dev` and try the login form by hand.
2. In a second terminal, run `pnpm e2e e2e/playground.spec.ts`. Read the results.
3. Run a single test: `pnpm e2e e2e/playground.spec.ts -g "rejects wrong credentials"`.
4. In `e2e/playground.spec.ts`, change the text `"Wrong email or password."` to `"Wrong password."`. Run the file, read the failure and undo the change.
5. Open `e2e/exercises/03-playwright/01-anatomy-of-a-test.spec.ts`. Change `test.fixme` to `test` in each test and write the steps indicated in the comments.
6. Run only your file:

```bash
pnpm e2e e2e/exercises/03-playwright/01-anatomy-of-a-test.spec.ts
```

Compare your code with `e2e/exercises/03-playwright/solutions/01-anatomy-of-a-test.spec.ts`.

## Challenge

Create `e2e/challenges/01-anatomy-of-a-test.spec.ts` with one test for a behaviour that `e2e/playground.spec.ts` does not test: signing out, deleting a case or preventing an empty title from adding a case. Organize it into named steps for Arrange, Act and Assert.

It is done when:

- The file has exactly one test, `pnpm e2e e2e/challenges/01-anatomy-of-a-test.spec.ts` shows it as passed, and it does not use `page.waitForTimeout`.
- The test has three named steps for Arrange, Act and Assert.
- You changed an expected value, saw the test fail and the message pointed to the Assert step. Then you restored the value.
- At least one assertion would be false if the behaviour were broken. You can name the bug it detects.

To group test lines into named steps, search for: `playwright test.step`.

## Think it through

1. What does this code print, and which line prevents it from reaching the last message? Use `runTest` and `check` from "Go deeper".

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

It prints `step 1`, `step 2` and `failed: two checks (expected "bird" but got "cat")`. The second `check` throws an error and stops the function before it prints `step 3`.

</details>

2. This test passes even if the click does not sign the user in. What does it need to check?

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

`login-error` is also hidden before the click and when the app does nothing. To show that it accepted the credentials, check that `login-welcome` is visible and contains the email.

</details>

## Next step

In the next lesson you learn locators: how a test finds an element on the page.
