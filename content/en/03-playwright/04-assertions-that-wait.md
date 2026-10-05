---
title: Assertions that wait
summary: Use expect assertions that retry until they pass, avoid waitForTimeout, and read an assertion failure.
duration: 35 min
---

## Goal

- Use the main `expect(locator)` assertions.
- Explain the difference between assertions that wait and plain value checks.
- Explain why `page.waitForTimeout` is banned.
- Read an assertion failure message: expected, received and call log.

## The problem: the app is not instant

Open the Practice app and press "Load report". The result arrives after about one and a half seconds. A real app is like this: data comes from a server, and it takes time.

If a test checks the result at once, the result is not there yet. The test fails, but the app is correct. How do you check something that is not ready?

## Assertions that wait

An assertion that starts with `expect(locator)` does not check only once. It checks again and again until it is true, or until the timeout ends. The default timeout is 5 seconds. These assertions are called **web-first assertions**.

```ts
await page.getByTestId("report-load").click()

await expect(page.getByTestId("report-result")).toContainText("12 tests")
```

The test clicks the button. Then it asks again and again: "does the result contain `12 tests`?" After about 1.5 seconds the answer is yes. The test goes on. You wrote no wait.

The assertion needs `await`, as every step does.

## The assertions you will use most

Visibility and state:

```ts
await expect(page.getByTestId("login-error")).toBeVisible()
await expect(page.getByTestId("report-loading")).toBeHidden()
await expect(page.getByTestId("report-load")).toBeDisabled()
await expect(page.getByTestId("report-load")).toBeEnabled()
await expect(page.getByTestId("cases-toggle-1")).toBeChecked()
```

Text and value:

```ts
await expect(page.getByTestId("cases-counter")).toHaveText("0 of 1 passed")
await expect(page.getByTestId("login-welcome")).toContainText("qa@example.com")
await expect(page.getByTestId("login-email")).toHaveValue("qa@example.com")
```

`toHaveText` compares the whole text. `toContainText` checks that a part of the text is there. `toHaveValue` reads what is inside an input field.

Count, attribute and address:

```ts
await expect(page.getByTestId("cases-item")).toHaveCount(2)
await expect(page.getByTestId("cases-item")).toHaveAttribute("data-status", "passed")
await expect(page).toHaveURL(/#\/practice/)
```

`toHaveURL` accepts a text or a regular expression. A **regular expression** is a pattern between two slashes. Here it means "the address contains `#/practice`".

To check the opposite, add `not`: `await expect(locator).not.toBeVisible()`.

## Plain value assertions do not wait

`expect` also works on plain values, such as numbers and strings. These assertions check once, at once.

```ts
const total = await page.getByTestId("cases-item").count()
expect(total).toBe(2)
```

The `count()` gives a number. Then `toBe` checks that number one time. If the app needs 200 milliseconds more to show the second row, the test fails.

Compare with the version that waits:

```ts
await expect(page.getByTestId("cases-item")).toHaveCount(2)
```

> **Tip:** If you can write the check on the locator, do it. Use a plain value assertion only for values that are already final.

## Why waitForTimeout is banned

`page.waitForTimeout(2000)` stops the test for two seconds. It is tempting. It is also a bad idea.

- If the app needs 2.5 seconds on a slow day, the test fails.
- If the app needs 0.3 seconds, the test wastes 1.7 seconds on every run.
- With many tests, the waste becomes minutes.

An assertion that waits is as fast as the app and as patient as the timeout. The team rule is: no `page.waitForTimeout`. Wait with web-first assertions.

## Reading an assertion failure

Add one case in the Practice app, then expect the wrong counter text: `"0 of 2 passed"`. The failure looks like this:

```text
Error: expect(locator).toHaveText(expected) failed

Locator:  getByTestId('cases-counter')
Expected: "0 of 2 passed"
Received: "0 of 1 passed"
Timeout:  5000ms

Call log:
  - Expect "toHaveText" with timeout 5000ms
  - waiting for getByTestId('cases-counter')
    9 × locator resolved to <p class="counter" data-testid="cases-counter">0 of 1 passed</p>
      - unexpected value "0 of 1 passed"
```

The text never became `0 of 2 passed`. Playwright tried 9 times in 5 seconds and saw `0 of 1 passed` each time. This tells you the app is stable but different from your expectation.

Read it in this order.

1. The first line names the assertion that failed.
2. `Locator` is the element you looked at.
3. `Expected` is what you wrote. `Received` is what the page had at the last check.
4. `Timeout` is how long Playwright tried.
5. The **call log** is the diary of the tries. It shows what Playwright saw each time. This often shows the cause.

> **Note:** If `Received` is empty or the element was not found, the page may be in another state than you think. Open the screenshot of the failed test, or use the trace viewer. The trace lesson shows how.

## Practice

1. Open `e2e/exercises/03-playwright/04-assertions-that-wait.spec.ts`.
2. Change `test.fixme` to `test` in one test at a time. Write the steps from the comments.
3. Run your file:

```bash
pnpm e2e e2e/exercises/03-playwright/04-assertions-that-wait.spec.ts
```

4. In `e2e/playground.spec.ts`, change `"0 of 1 passed"` to `"0 of 2 passed"`. Run that file and read Expected, Received and the call log. Then undo the change.
5. In a copy of the test, replace `toHaveCount(0)` with a plain `count()` and `toBe(0)`. Think about when this version could fail.

Compare with `e2e/exercises/03-playwright/solutions/04-assertions-that-wait.spec.ts` when you finish.

## Check what you know

1. What does `expect(locator).toHaveText(...)` do if the text is not right yet?

<details><summary>Answer</summary>

It checks again and again until the text is right or the timeout ends. The default timeout is 5 seconds.

</details>

2. Why is `expect(await locator.count()).toBe(2)` risky?

<details><summary>Answer</summary>

It reads the count once and checks once. It does not wait. Use `toHaveCount(2)` instead.

</details>

3. Why is `page.waitForTimeout` banned?

<details><summary>Answer</summary>

The fixed time is a guess. It is too short on a slow day and too long on a fast day. Assertions that wait are better.

</details>

4. What is in the call log?

<details><summary>Answer</summary>

The tries Playwright made: what it looked for and what it saw each time.

</details>

## Next step

In the next lesson you learn three ways to see your tests run: headed mode, UI mode and codegen.
