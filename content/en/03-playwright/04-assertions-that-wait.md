---
title: Assertions that wait
summary: Use expect assertions that retry until they pass, avoid waitForTimeout, read an assertion failure, and check that an assertion can really fail.
duration: 80 min
---

## Start with a puzzle

A developer makes a mistake in the code of the slow report in the Practice app. When the loading ends, the code hides the loading message, but it forgets to show the result. The report never appears. This is the broken part:

```tsx
setLoading(false)
setReady(false) // the correct line is setReady(true)
```

A tester has this test:

```ts
await page.getByTestId("report-load").click()
await expect(page.getByTestId("report-loading")).toBeHidden()
```

The report is broken. Is the test green or red? How long does it take? What does the test prove?

Write down your guess before you read on.

## Goal

- Predict when an assertion passes, when it fails, and how long it takes.
- Choose an assertion that would fail if the app were wrong.
- Explain why `page.waitForTimeout` is banned, and what to use instead.
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

Watch what the button does while the report loads.

![After the click the button is disabled and says Loading, then the result appears.](/clips/auto-wait-report.webm)

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

> **Tip:** Reading the documentation is a skill. When you meet a new assertion, scan its page in three steps. First, read the signature: what you pass in and what it returns. Second, read the first example. Third, look for the options and the notes about edge cases, such as `timeout` or `ignoreCase`. Do this for `toContainText` now, and see what you find that this lesson did not say.

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

### Experiment: the empty result

Before you run anything, answer. In the Practice app, the element `report-result` is in the page from the very start. What is the text of that element before you click "Load report"? Is it "Report ready..." or an empty text? What does `await page.getByTestId("report-result").textContent()` return if you call it right after `goto`?

It returns an empty text. The element exists, but it is hidden and has no text until the report is ready. This is why a plain read does not wait for anything, and why the retrying assertion is the right tool.

## Why waitForTimeout is banned

`page.waitForTimeout(2000)` stops the test for two seconds. It is tempting. It is also a bad idea.

- If the app needs 2.5 seconds on a slow day, the test fails.
- If the app needs 0.3 seconds, the test wastes 1.7 seconds on every run.
- With many tests, the waste becomes minutes.

An assertion that waits is as fast as the app and as patient as the timeout. The team rule is: no `page.waitForTimeout`. Wait with web-first assertions. A good suite is **fast** and **self-checking**: it needs no human to decide if the run was good. A fixed pause makes the suite slower and adds a guess.

## Reading an assertion failure

Add one case in the Practice app, then expect the wrong counter text: `"0 of 2 passed"`. Before you run it, write what you expect to see in the message. The failure looks like this:

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

The text never became `0 of 2 passed`. Playwright tried 9 times in 5 seconds and saw `0 of 1 passed` each time. This tells you the app is stable but different from your expectation.

Read it in this order.

1. The first line names the assertion that failed.
2. `Locator` is the element you looked at.
3. `Expected` is what you wrote. `Received` is what the page had at the last check.
4. `Timeout` is how long Playwright tried.
5. The **call log** is the diary of the tries. It shows what Playwright saw each time. This often shows the cause.

> **Note:** If `Received` is empty or the element was not found, the page may be in another state than you think. Open the screenshot of the failed test, or use the trace viewer. The trace lesson shows how.

### Back to the puzzle

The test is green. After the click, the loading message appears. About 1.5 seconds later it disappears, and `toBeHidden` is satisfied. The result never shows, but the test does not look at the result. It takes about 1.5 seconds and proves nothing about the report.

The test checks the side effect (a message went away) and not the goal (the report is shown). Ask yourself what bug would turn each assertion red. If you cannot name one, the assertion is too weak.

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

This is better than `waitForTimeout`: the test still goes on as soon as the text is there. If many assertions need 10 seconds, do not repeat the number. Set it once in the config with `expect: { timeout: 10_000 }`. This is DRY: one number in one place. But a large timeout also makes real failures slow to show. Give more time to the one slow step, and keep the default for the rest.

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

## Challenge

Create the file `e2e/challenges/04-assertions-that-wait.spec.ts`. The slow report in the Practice app shows a sentence with three numbers: tests, passed and failed. Write one test that loads the report and checks that the numbers are consistent: passed plus failed must equal the number of tests. Read the numbers from the page. Do not type them in your check.

It is done when:

- The test passes with `pnpm e2e e2e/challenges/04-assertions-that-wait.spec.ts`.
- The first assertion after the click is a web-first assertion that waits for the report, before you read any text.
- The three numbers are read from the page and turned into numbers in your code. Your sum check works for any numbers, not only 12, 11 and 1.
- You changed the sum check on purpose to be wrong (for example, add 1), and the failure message showed the expected and the received number. Then you changed it back.
- The test does not use `page.waitForTimeout`.

You will need something this lesson did not teach: how to take parts of a text with a regular expression, and how to turn text into a number. Search for: `javascript regex capture groups match`, `playwright locator textContent`, `javascript Number parseInt`.

## Think it through

1. Predict the output and say why. Take the code in "Why an assertion can wait", but call `retryUntil(appIsReady, 200)` and not 5000. What do the first two lines print?

<details><summary>Answer</summary>

It prints `plain check: false` and `retrying check: false`. The app is ready after 300 milliseconds, but the retry loop stops after 200. The loop gives up before the app is ready, so the answer is "no". This is what a Playwright assertion does when the timeout is shorter than the app needs. The app was fine. The time limit was too small.

</details>

2. This test has a bug. The code runs, but the check does not do its job. Find it.

```ts
test("report shows the result", async ({ page }) => {
  await page.goto("/#/practice")
  await page.getByTestId("report-load").click()
  expect(page.getByTestId("report-result")).toContainText("12 tests")
})
```

<details><summary>Answer</summary>

The last line has no `await`. The assertion starts, but the test function does not wait for it, so the test can end before the check is finished. The result is not predictable: the test may pass even if the text never appears, or it may report an error later. Whatever you see, the fix is the same. Add `await` before `expect`.

</details>

3. Compare two versions of a test, after a click on `report-load`. Version A: `expect(await page.getByTestId("report-result").textContent()).toContain("12 tests")`. Version B: `await expect(page.getByTestId("report-result")).toContainText("12 tests")`. Which is better, and what does A do in the Practice app?

<details><summary>Answer</summary>

B is better. In the Practice app, the element `report-result` is in the page from the start, with no text and hidden. `textContent()` reads it at once and gets an empty text, so A fails and does not wait. B retries until the text appears, about 1.5 seconds later.

</details>

4. What breaks if the report takes 8 seconds and not 1.5 seconds, for example on a slow server? A colleague proposes `await page.waitForTimeout(8000)` before the assertion. Another proposes a timeout of 10 seconds on that one assertion. What happens with each?

<details><summary>Answer</summary>

With the default timeout of 5 seconds, the assertion fails at 5 seconds, and the message shows an empty `Received`. The fixed wait of 8 seconds makes the test pass, but it always costs 8 seconds, and it fails again on a day when the server needs 9. The timeout of 10 seconds on one assertion passes as soon as the text appears, so it takes 8 seconds only when the app is that slow. The second way is better. But first ask the question that matters: is 8 seconds a bug in the app?

</details>

5. Explain to a teammate in three sentences why `toBeHidden` on the loading message does not prove that the report works. Do not use the word "loading".

<details><summary>Answer</summary>

A message that goes away only tells you that the app stopped showing it. It does not tell you what the app shows instead. The same check would pass if the report failed, or if the message never appeared. To prove that the report works, check the thing the user came for: the text of the result.

</details>

6. The team debates the global assertion timeout. One person says: "Raise it from 5 seconds to 30 seconds, then the flaky failures stop." Another says: "Keep 5 seconds." Who is right?

<details><summary>Answer</summary>

There is no single right answer. A big timeout hides slow, flaky behaviour, and every real failure then takes 30 seconds to appear, so a suite with many failures becomes very slow. A small timeout shows problems early but may fail on a slow machine in CI. It depends on what causes the failures. If the app is really slow in one step, give that one step more time. If the app is fast and the failures are random, a bigger timeout only hides a race that you should find.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **What are soft assertions in Playwright, and when would you use one?**
   - Search for: `playwright expect.soft soft assertions`
   - Try it: Write a test that opens the Practice app and has two `expect.soft` lines with wrong texts. Run it and count how many failures the report shows. Then change both to normal `expect` and compare.
   - A good answer explains: how a soft assertion differs from a normal one when it fails, and one case where seeing all failures in one run helps.

2. **What does "polling" mean in programming, and how is it different from waiting a fixed time?**
   - Search for: `polling vs sleep programming`
   - Try it: In a test, add two cases, and then write `await expect.poll(async () => page.getByTestId("cases-item").count()).toBe(2)`. Change the number to 3 and read the failure message.
   - A good answer explains: the loop of check and wait, why it ends as soon as the condition is true, and why a fixed sleep is a guess.

3. **What is a race condition, and how can it make a test pass on one run and fail on the next?**
   - Search for: `race condition flaky test`
   - Try it: In a plain TypeScript file, write two async functions that each read a shared number, wait a random time, and then write the number plus one. Run both at the same time, ten times, and look at the final numbers.
   - A good answer explains: what a race condition is with a simple example, and how it connects to tests that check a result before the app is ready.

## Next step

In the next lesson you learn three ways to see your tests run: headed mode, UI mode and codegen.
