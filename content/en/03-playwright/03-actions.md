---
title: Actions
summary: Do what a user does with goto, click, fill, press, check, selectOption and clear, learn how Playwright waits, and choose the action that says what you mean.
duration: 75 min
---

## Start with a puzzle

A test needs the first case in the Practice app to be ticked. The case list has one case. A teammate writes a small helper, and the test calls it in two places, because two steps both need a ticked case:

```ts
async function markAsPassed(page: Page) {
  await page.getByTestId("cases-toggle-1").click()
}

await markAsPassed(page)
await markAsPassed(page)
await expect(page.getByTestId("cases-counter")).toHaveText("1 of 1 passed")
```

The test fails. Nobody changed the app. Then the teammate replaces `click()` with `check()` and the test passes.

What does the counter show after the first version? Why does one word make the difference?

Write down your guess before you read on.

## Goal

- Choose the action that says what you mean, not only the action that works today.
- Predict how long Playwright waits before an action, and when it gives up.
- Explain what Playwright does not wait for.
- Turn one list of inputs into many tests without copying code.

## What an action is

An **action** is something a user does: open a page, type, click, tick a box. In Playwright, an action is a method on a locator or on the page.

Every action needs `await`. You learned why in the async lesson. Without it, the test moves on before the step ends. The result is a flaky test.

## goto

`goto` opens an address.

```ts
await page.goto("/#/practice")
```

The start of the address comes from `baseURL` in the config. So `/#/practice` becomes `http://localhost:5180/#/practice`.

## click

`click` clicks an element.

```ts
await page.getByTestId("login-submit").click()
```

## fill and clear

`fill` puts a text in a field. It replaces what was in the field before.

```ts
await page.getByTestId("login-email").fill("qa@example.com")
```

`clear` empties a field.

```ts
await page.getByTestId("login-email").clear()
```

What do you expect? You fill the field with "Hello", and then fill it with "World". Does the field hold "HelloWorld" or "World"? It holds "World". `fill` is a replace, not an append.

## press

`press` presses one key on the keyboard. Use it for keys like `Enter`, `Tab` or `Escape`.

```ts
await page.getByTestId("cases-input").fill("Press Enter to add")
await page.getByTestId("cases-input").press("Enter")
```

In the Practice app, `Enter` in the field sends the form, so a case is added. You did not click the Add button. This is how a user with a keyboard works, so it is a test worth having.

## check and uncheck

`check` ticks a checkbox. `uncheck` removes the tick.

```ts
await page.getByTestId("cases-toggle-1").check()
await page.getByTestId("cases-toggle-1").uncheck()
```

If the box is already ticked, `check` does nothing. This is better than `click`, because `click` would remove the tick. `check` says what you want: a ticked box.

An action can say two things. `click` says "do this movement". `check` says "make this true". When you care about the result and not about the movement, use the action that names the result.

### Back to the puzzle

`click()` is a movement. The first call ticks the box, and the second call removes the tick. The counter shows "0 of 1 passed", so the assertion fails. `check()` is a goal: "the box must be ticked". The second call finds the box already ticked and does nothing. The counter shows "1 of 1 passed".

A helper named `markAsPassed` promises a result. It should be written with the action that keeps that promise, even when it is called twice. Programmers call such a step **idempotent**: doing it twice gives the same result as doing it once.

## selectOption

`selectOption` chooses an option in a drop-down list. You give the `value` of the option.

```ts
await page.getByTestId("cases-filter").selectOption("passed")
```

In the Practice app, the options have the values `all`, `pending` and `passed`. After this step, the list shows only the passed cases.

The list in the Practice app is a native `<select>` element. `selectOption` works only on this kind of element. A drop-down made of `div` elements would need other steps: click it, then click an option.

## Playwright waits before it acts

You never write "wait until the button exists". Playwright does this for you.

Before an action, Playwright checks that the element is ready. These checks are called **actionability**. In simple words, the element must:

- exist on the page,
- be visible,
- be stable, which means it is not moving,
- be enabled, which means it is not disabled,
- not be covered by another element.

If a check fails, Playwright waits and tries again. It stops when the test timeout ends, which is 30 seconds by default. Then the test fails and the message tells you which check was not true.

Try it. In the Practice app, press "Load report". The button is disabled for about one and a half seconds. Now predict: a test clicks `report-load` twice, one line after the other, and then waits for the text "12 tests":

```ts
await page.getByTestId("report-load").click()
await page.getByTestId("report-load").click()
await expect(page.getByTestId("report-result")).toContainText("12 tests")
```

Does the second click fail because the button is disabled? No. Playwright waits until the button is enabled, about 1.5 seconds, and then clicks. The second click starts a second report. The text "12 tests" is ready about 3 seconds after the first click.

> **Careful:** Waiting before an action does not wait for the result of the action. After you click, the app may still be working. To wait for a result, use an assertion. The next lesson shows how.

## Put it together

This test uses four actions and one assertion:

```ts
import { expect, test } from "../../lib/test"

test("signs in with the test credentials", async ({ page }) => {
  await page.goto("/#/practice")

  await page.getByTestId("login-email").fill("qa@example.com")
  await page.getByTestId("login-password").fill("Playwright123")
  await page.getByTestId("login-submit").click()

  await expect(page.getByTestId("login-welcome")).toBeVisible()
})
```

Read it as a manual test case: open the page, type the email, type the password, click Sign in, check the welcome message.

## Go deeper

### Why fill is not the same as typing

When a person types, the browser gets one key event for each key. `fill` does not do this. It puts the whole text in the field at once and tells the page that the value changed.

For most forms this is enough, and it is fast. But some pages react to each key, for example a search box that shows suggestions after every letter. For such a field, use `pressSequentially`. It presses the keys one by one:

```ts
await page.getByTestId("cases-input").pressSequentially("Login", { delay: 100 })
```

The `delay` is the time in milliseconds between two keys. Use this only when `fill` does not trigger the behaviour you want to test.

### A common wrong idea: "force fixes a click that does not work"

Sometimes a click waits and then fails because another element covers the button. A beginner finds the option `force: true`:

```ts
await page.getByTestId("report-load").click({ force: true })
```

`force` skips the actionability checks. The click is sent even if the button is covered or disabled. But it does not promise that your button gets the click: an overlay may receive it, and a disabled button does nothing. The test can go green anyway. But a real user cannot click a covered button. The test now hides a real bug.

So when a click fails, read the message. It says which check was not true. Then ask: would a user have the same problem? If yes, you found a bug in the app, and the test did its job.

### How it shows up in real QA work: one body, many inputs

A QA analyst often tests the same action with many inputs. The Practice app shows an error for empty fields and another error for a wrong password. Without care, you copy the test and change two values.

DRY means "Don't Repeat Yourself". Write the steps once and loop over the data:

```ts
import { expect, test } from "./lib/test"

const invalidLogins = [
  {
    name: "empty fields",
    email: "",
    password: "",
    message: "Enter your email and password.",
  },
  {
    name: "a wrong password",
    email: "qa@example.com",
    password: "wrong",
    message: "Wrong email or password.",
  },
]

for (const { name, email, password, message } of invalidLogins) {
  test(`login rejects ${name}`, async ({ page }) => {
    await page.goto("/#/practice")
    await page.getByTestId("login-email").fill(email)
    await page.getByTestId("login-password").fill(password)
    await page.getByTestId("login-submit").click()

    await expect(page.getByTestId("login-error")).toHaveText(message)
  })
}
```

Playwright creates two tests with two names. A new case needs one new object, not a new test.

The limit: this works when the steps are the same and only the data changes. If each case needs different steps, separate tests are easier to read. Another limit is **YAGNI**, "You Aren't Going to Need It": do not build a table and a loop for a need you only imagine. With two cases, two plain tests are also fine. A table pays off when rows are many, or when you expect the list to grow.

The rows of such a table should not be random. Choose them with a method. **Equivalence classes** are groups of inputs that the app treats in the same way: "all valid emails", "all empty fields". Take one input from each group. **Boundary values** are the inputs at the edge of a group: the shortest text, the longest text, empty, just one character. Bugs live at the edges.

## Practice

1. Open `e2e/exercises/03-playwright/03-actions.spec.ts`.
2. Change `test.fixme` to `test` in one test at a time. Write the steps from the comments.
3. Run your file:

```bash
pnpm e2e e2e/exercises/03-playwright/03-actions.spec.ts
```

4. In one test, remove an `await` before an action. Run the file and look at the result. Put the `await` back.

Compare with `e2e/exercises/03-playwright/solutions/03-actions.spec.ts` when you finish.

## Challenge

Create the file `e2e/challenges/03-actions.spec.ts`. The case list of the Practice app takes a title. Test it with a table of inputs, and make one test for each row. Choose the rows with the ideas of equivalence classes and boundary values. Find out first, by hand in the browser, what the app does with each input. Then write down what you expect, and let the tests tell you if you were right.

It is done when:

- The file has a table of at least five inputs and creates one test per row, with a name that says which input it is.
- The inputs include: a normal title, a title with spaces before and after, a title with only spaces, an empty title, and a very long title of 300 characters. You do not type the long title by hand.
- Each test checks the number of rows in the list and the text of the counter `cases-counter`. When a row is added, it also checks the title that the list shows.
- All tests pass with `pnpm e2e e2e/challenges/03-actions.spec.ts`, and `pnpm e2e e2e/challenges/03-actions.spec.ts --list` shows one test name for each row.
- You changed one expected value on purpose and the failure message told you which row failed. Then you changed it back.

You will need something this lesson did not teach: how to build a long text in code, and how to check that nothing was added. Search for: `javascript string repeat`, `playwright toHaveCount 0`.

## Think it through

1. Predict the result and say why. In the Practice app with an empty list:

```ts
await page.getByTestId("cases-input").fill("Login")
await page.getByTestId("cases-input").press("Enter")
await page.getByTestId("cases-input").press("Enter")
await expect(page.getByTestId("cases-item")).toHaveCount(?)
```

What number goes in place of `?`, and what does the field hold at the end?

<details><summary>Answer</summary>

The count is 1, and the field is empty. The first Enter sends the form, the app adds the case and clears the field. The second Enter sends the form again, but now the title is empty, and the app ignores an empty title. The second action was not wrong. The app simply had nothing to do.

</details>

2. This test passes, but it can pass for the wrong reason. Find the weakness and fix it.

```ts
test("ignores a title with only spaces", async ({ page }) => {
  await page.goto("/#/practice")
  await page.getByTestId("cases-input").fill("   ")
  await page.getByTestId("cases-add").click()
  await expect(page.getByTestId("cases-item")).toHaveCount(0)
})
```

<details><summary>Answer</summary>

The assertion says that nothing exists. That is true at the start, so it can pass before the app has reacted. If the app added a row 200 milliseconds later, the test would be green and the bug would pass. To prove that the click was handled, add a second action that has a visible result. For example, add a real case after the spaces and check that the count is 1, and not 2. A check on "nothing happened" is strong only when something observable comes after it.

</details>

3. Two versions both work. Version A is a table of two login cases and a loop that makes two tests. Version B is two separate tests with the steps written twice. Which is better, and what would make you choose the other?

<details><summary>Answer</summary>

With two cases, B is fine and easier to read: the whole story is in one place, and a new reader does not need to understand a loop. This is the idea of YAGNI. A is better when there are many rows, or when the list will grow, because a new case is one new line. Choose A when only the data changes. Choose B when the cases need different steps or different checks.

</details>

4. What breaks if a developer replaces the native `<select data-testid="cases-filter">` with a drop-down made of `div` elements, with the same test id and the same visible options?

<details><summary>Answer</summary>

`selectOption` fails, because it works only on a real `<select>` element. The message says that the element is not a `select`. The user sees no change, so the app is not wrong, but the test must now click the drop-down and then click an option. Also the keyboard behaviour of a `div` is a new risk to test. A native control gives keyboard and screen reader support for free, and a custom control must build it again.

</details>

5. Explain to a teammate in three sentences what actionability does. Do not use the word "wait".

<details><summary>Answer</summary>

Before Playwright clicks or types, it asks if a real user could do it now: the element is there, you can see it, it is not moving, it is not disabled and nothing covers it. If the answer is no, it asks again and again until the answer is yes or the time is over. So you describe what to do, and Playwright takes care of when.

</details>

6. A cookie banner covers the Sign in button on a small phone screen, so `click()` fails after 30 seconds. A colleague proposes `click({ force: true })`. Another proposes to close the banner first. A third proposes a bigger screen for the test. What would you do?

<details><summary>Answer</summary>

There is no single right answer. `force: true` makes the test green but hides the problem: a real user on a phone cannot press the button either, so it may be a real bug. A bigger screen avoids the problem but also avoids the test of the phone. Closing the banner first is what a real user does, so it is the most honest test. The right choice depends on the goal of the test. If the goal is the phone layout, report the covered button as a defect. If the goal is the login logic, close the banner as a set-up step.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **What is the difference between `fill()` and `pressSequentially()` in Playwright?**
   - Search for: `playwright fill vs pressSequentially`
   - Try it: On the Practice app, open DevTools, and in the Console select the field `cases-input` in the Elements panel, then type `$0.addEventListener("keydown", (e) => console.log(e.key))`. Type three letters by hand and watch. Then write a test that uses `pressSequentially` on the same field and run it with `pnpm e2e:headed`.
   - A good answer explains: how each one enters text, which events the page receives, and one situation where `fill` is not enough.

2. **What is the difference between the HTML `disabled` attribute and `aria-disabled`?**
   - Search for: `html disabled vs aria-disabled button`
   - Try it: In DevTools, select the Load report button. Add the attribute `aria-disabled="true"` by editing the HTML, and click the button. Then remove it and add `disabled`. Compare what happens.
   - A good answer explains: what each one does for a mouse user and for a screen reader user, and why this matters when you test a button that "cannot be clicked".

3. **What is data-driven testing, and when is it a good idea?**
   - Search for: `data-driven testing parameterized tests`
   - Try it: Write a table of three rows for the login form in a new file, loop over it to make tests, and run `pnpm e2e <your file> --list`. Read how the names appear. Then rename one row and see the name change.
   - A good answer explains: how one test with a table of inputs works, what is gained, and when separate tests are clearer.

## Next step

In the next lesson you learn assertions that wait, so your test can check results that take time.
