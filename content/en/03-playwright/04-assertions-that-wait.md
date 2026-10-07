---
title: Assertions that wait
duration: 55 min
---

## Goal

In this lesson you check results that take time to appear and choose assertions that detect the bug you want to test.

- Use web-first assertions to wait for a page state.
- Distinguish an assertion on a locator from a check on a value already read.
- Choose a timeout for a slow step without adding fixed pauses.
- Read an assertion failure and check that your test can fail.

## Assertions that wait

After an action, the page may take time to show the result. In the Practice app, the "Load report" button simulates that delay: the report appears after about 1.5 seconds.

**Web-first assertions** retry the check until the condition is met or the timeout expires. On each attempt, Playwright searches again with the locator and checks the current DOM state. The default timeout is 5 seconds.

```ts
await page.getByTestId("report-load").click()

await expect(page.getByTestId("report-result")).toContainText("12 tests")
```

After the click, Playwright checks the text of `report-result` again until it finds `12 tests`. In this app, the assertion passes after about 1.5 seconds; if the text does not appear within the timeout, it fails.

![After the click the button is disabled and says Loading, then the result appears.](/clips/auto-wait-report.webm)

These assertions are asynchronous and need `await` so the test function waits for their result.

## The assertions you will use most

The following examples show independent checks. Choose those that match the state you want to test.

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

`toHaveText` compares the whole text. `toContainText` checks that it contains a part. `toHaveValue` checks the value of an input field.

Count, attribute and address:

```ts
await expect(page.getByTestId("cases-item")).toHaveCount(2)
await expect(page.getByTestId("cases-item")).toHaveAttribute("data-status", "passed")
await expect(page).toHaveURL(/#\/practice/)
```

`toHaveCount` checks how many elements match the locator. `toHaveAttribute` checks the value of the named attribute.

`toHaveURL` accepts a string or a regular expression. A **regular expression** describes a pattern; in the example, it is written between slashes and looks for `#/practice` in the address.

To check the opposite, add `not`: `await expect(locator).not.toBeVisible()`.

## Plain value assertions do not wait

A check on a value already read does not query the page again.

```ts
const total = await page.getByTestId("cases-item").count()
expect(total).toBe(2)
```

`count()` returns the number of elements at that moment. `toBe` compares the number stored in `total` once. If the second row appears 200 milliseconds later, this check fails.

The version that waits counts again with the locator:

```ts
await expect(page.getByTestId("cases-item")).toHaveCount(2)
```

The same applies when reading text. The `report-result` element exists from the start, hidden and empty. Calling `await page.getByTestId("report-result").textContent()` right after `goto` gets that empty text; it does not wait for the report.

Use an assertion on the locator when the page value can still change. Plain value checks are useful when you already have the final result, for example to check a sum calculated from the report data.

## Wait for a condition instead of a fixed pause

`page.waitForTimeout(2000)` pauses the test for two seconds without checking the page state.

- If the result takes 2.5 seconds, the pause ends before it is ready.
- If it takes 0.3 seconds, the pause wastes 1.7 seconds.

The team rule is to avoid `page.waitForTimeout`. A web-first assertion continues when it detects the expected condition and fails if it cannot find it within the timeout.

## Check the result of the action

`toBeHidden` passes if the element is hidden or does not exist. An absent loading message therefore does not prove that the report is ready.

Suppose a developer leaves the report hidden when loading ends:

```tsx
setLoading(false)
setReady(false) // the correct line is setReady(true)
```

This test passes even though the report never appears:

```ts
await page.getByTestId("report-load").click()
await expect(page.getByTestId("report-loading")).toBeHidden()
```

The app code hides the loading message after about 1.5 seconds, which satisfies `toBeHidden`. To detect the report bug, check its result with `toContainText`, as in the first example.

To check that there is no error after signing in, first wait for the sign of success:

```ts
await page.getByTestId("login-submit").click()
await expect(page.getByTestId("login-welcome")).toBeVisible()
await expect(page.getByTestId("login-error")).toBeHidden()
```

If you omit the welcome-message check in an asynchronous login, the last line could pass before the app showed an error.

## Reading an assertion failure

If you add one case and expect the wrong counter text, `"0 of 2 passed"`, the failure looks like this:

```text
Error: expect(locator).toHaveText(expected) failed

Locator:  getByTestId('cases-counter')
Expected: "0 of 2 passed"
Received: "0 of 1 passed"
Timeout:  5000ms

Call log:
  - Expect "toHaveText" with timeout 5000ms
  - waiting for getByTestId('cases-counter')
    9 × locator resolved to <p data-testid="cases-counter" class="font-mono ...">0 of 1 passed</p>
      - unexpected value "0 of 1 passed"
```

The log shows 9 checks with the text `0 of 1 passed`; none found `0 of 2 passed`. The number of attempts can vary between runs.

1. The first line names the assertion that failed.
2. `Locator` shows the search used to find the element.
3. `Expected` is the expected value. `Received` is the value received in the check.
4. `Timeout` shows the assertion's time limit.
5. The **call log** shows the attempts and the values Playwright observed.

If `Received` is empty or Playwright did not find the element, check whether the page reached the state you expected.

## Go deeper

### A retry loop

The mechanism checks a condition, waits for an interval if it is not met yet, and checks again. This example models an app that is ready after 300 milliseconds:

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

On a run without external pauses, it prints:

```text
plain check: false
retrying check: true
waited at least 300 ms: true
```

`retryUntil` waits 100 milliseconds between checks and returns `false` if the deadline expires. Playwright also retries, but increases the interval between attempts up to a limit.

The assertion timeout and the whole-test timeout are separate limits. Their defaults are 5 and 30 seconds, respectively. The runner can stop the test if its limit expires while an assertion is still waiting.

### More time for a slow step

You can give one assertion more time:

```ts
await expect(page.getByTestId("report-result")).toContainText("12 tests", {
  timeout: 10_000,
})
```

The assertion continues as soon as it finds the text, even with a 10-second limit. If the text never appears, that limit also delays the failure. Give more time to the step that needs it and keep the default for the rest.

## Practice

1. Open `e2e/exercises/03-playwright/04-assertions-that-wait.spec.ts`.
2. Change `test.fixme` to `test` in one test at a time. Write the steps from the comments.
3. Run your file:

```bash
pnpm e2e e2e/exercises/03-playwright/04-assertions-that-wait.spec.ts
```

4. In `e2e/playground.spec.ts`, change `"0 of 1 passed"` to `"0 of 2 passed"`. Run that file and read Expected, Received and the call log. Then undo the change.

Compare with `e2e/exercises/03-playwright/solutions/04-assertions-that-wait.spec.ts` when you finish.

## Challenge

Create the file `e2e/challenges/04-assertions-that-wait.spec.ts`. Write a test that loads the Practice app report and checks that passed plus failed equals the number of tests. Read all three numbers from the page; do not type them into the check.

It is done when:

- The test passes with `pnpm e2e e2e/challenges/04-assertions-that-wait.spec.ts`.
- The first assertion after the click waits for the report with a web-first assertion, before reading text. The test does not use `page.waitForTimeout`.
- The three numbers are read from the page and converted to numbers. The check works for any numbers, not only 12, 11 and 1.
- You deliberately made the sum wrong, read the expected and received numbers in the failure, and restored the check.

You will need something this lesson did not teach: how to take parts of a text with a regular expression, and how to turn text into a number. Search for: `javascript regex capture groups match`, `playwright locator textContent`, `javascript Number parseInt`.

## Think it through

1. In the "A retry loop" example, you change the call to `retryUntil(appIsReady, 200)`. What do the first two lines print if the calls run without external pauses?

<details><summary>Answer</summary>

It prints `plain check: false` and `retrying check: false`. The 200-millisecond deadline expires before the condition becomes true at 300 milliseconds.

</details>

2. This test has a bug. The test function does not wait for the check to finish. Find it.

```ts
test("report shows the result", async ({ page }) => {
  await page.goto("/#/practice")
  await page.getByTestId("report-load").click()
  expect(page.getByTestId("report-result")).toContainText("12 tests")
})
```

<details><summary>Answer</summary>

The last line has no `await`. The test function can finish while the assertion is still waiting. Add `await` before `expect`.

</details>

3. After a click on `report-load`, version A uses `expect(await page.getByTestId("report-result").textContent()).toContain("12 tests")`. Version B uses `await expect(page.getByTestId("report-result")).toContainText("12 tests")`. What does each do if the result is still empty?

<details><summary>Answer</summary>

A compares the empty text already read and fails. B checks the text again until it contains the expected text or the timeout expires.

</details>

## Next step

In the next lesson you learn three ways to see your tests run: headed mode, UI mode and codegen.
