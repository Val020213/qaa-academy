---
title: Assertions that wait
summary: Use expect assertions that retry until they pass, avoid waitForTimeout, and read an assertion failure.
duration: 50 min
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

## Go deeper

### Why an assertion can wait

An assertion that waits does not use magic. It runs a loop: check, and if the answer is no, wait a short time and check again. It stops when the answer is yes, or when the time ends.

Here is the idea in plain TypeScript. The "app" is ready after 300 milliseconds:

```ts
async function retryUntil(check: () => boolean, timeoutMs: number): Promise<boolean> {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    if (check()) return true
    await new Promise<void>((resolve) => setTimeout(resolve, 100))
  }
  return false
}

const startedAt = Date.now()
const appIsReady = () => Date.now() - startedAt >= 300

console.log("plain check:", appIsReady())
const found = await retryUntil(appIsReady, 5000)
console.log("retrying check:", found)
console.log("waited at least 300 ms:", Date.now() - startedAt >= 300)
```

It prints:

```text
plain check: false
retrying check: true
waited at least 300 ms: true
```

The plain check looks once and says no. The retrying check says yes. Playwright is more careful: it waits longer between tries as time passes. The idea is the same. There are two timers. An assertion waits up to 5 seconds. A whole test waits up to 30 seconds.

### A common wrong idea: "toBeHidden proves the work is done"

After you click "Load report", the message "Loading..." appears and then goes away. A beginner writes this:

```ts
await expect(page.getByTestId("report-loading")).toBeHidden()
```

This passes in two cases: when the loading message went away, and when it never appeared. `toBeHidden` is also true for an element that does not exist. It does not prove that the report is ready. Check the result you want:

```ts
await expect(page.getByTestId("report-result")).toContainText("12 tests")
```

The same trap exists for errors. To prove that "no error is shown", first wait for something that happens after the action:

```ts
await page.getByTestId("login-submit").click()
await expect(page.getByTestId("login-welcome")).toBeVisible()
await expect(page.getByTestId("login-error")).toBeHidden()
```

Without the middle line, the last line could pass before the app had time to show an error.

### How it shows up in real QA work: a slow step

Some steps are really slow, such as a large report. You can give one assertion more time:

```ts
await expect(page.getByTestId("report-result")).toContainText("12 tests", {
  timeout: 10_000,
})
```

This is better than `waitForTimeout`: the test still goes on as soon as the text is there. If many assertions need 10 seconds, do not repeat the number. Set it once in the config with `expect: { timeout: 10_000 }`. This is DRY: one number in one place.

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

5. Compare two versions of a test, after a click on `report-load`. Version A: `expect(await page.getByTestId("report-result").textContent()).toContain("12 tests")`. Version B: `await expect(page.getByTestId("report-result")).toContainText("12 tests")`. Which is better, and what does A do in the Practice app?

<details><summary>Answer</summary>

B is better. In the Practice app, the element `report-result` is in the page from the start, with no text and hidden. `textContent()` reads it at once and gets an empty text, so A fails and does not wait. B retries until the text appears, about 1.5 seconds later.

</details>

6. This test has a bug. Find it.

```ts
test("report shows the result", async ({ page }) => {
  await page.goto("/#/practice")
  await page.getByTestId("report-load").click()
  expect(page.getByTestId("report-result")).toContainText("12 tests")
})
```

<details><summary>Answer</summary>

The last line has no `await`. The assertion starts, but the test function does not wait for it. The result is not predictable. In the runs we watched, the test failed at once without waiting for the text. In other situations, a test can end before the check is finished. Either way, the fix is `await`. Add `await` before `expect`.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **What are soft assertions in Playwright, and when would you use one?**
   - Search for: `playwright expect.soft soft assertions`
   - A good answer explains: how a soft assertion differs from a normal one when it fails, and one case where seeing all failures in one run helps.

2. **What does "polling" mean in programming, and how is it different from waiting a fixed time?**
   - Search for: `polling vs sleep programming`
   - A good answer explains: the loop of check and wait, why it ends as soon as the condition is true, and why a fixed sleep is a guess.

3. **What is a race condition, and how can it make a test pass on one run and fail on the next?**
   - Search for: `race condition flaky test`
   - A good answer explains: what a race condition is with a simple example, and how it connects to tests that check a result before the app is ready.

## Next step

In the next lesson you learn three ways to see your tests run: headed mode, UI mode and codegen.
