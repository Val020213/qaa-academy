---
title: Actions
summary: Do what a user does with goto, click, fill, press, check, selectOption and clear, and learn how Playwright waits.
duration: 45 min
---

## Goal

- Use the main actions: `goto`, `click`, `fill`, `press`, `check`, `uncheck`, `selectOption` and `clear`.
- Explain in simple words how Playwright waits before an action.
- Always write `await` before an action.

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

## press

`press` presses one key on the keyboard. Use it for keys like `Enter`, `Tab` or `Escape`.

```ts
await page.getByTestId("cases-input").fill("Press Enter to add")
await page.getByTestId("cases-input").press("Enter")
```

In the Practice app, `Enter` in the field sends the form, so a case is added. You did not click the Add button.

## check and uncheck

`check` ticks a checkbox. `uncheck` removes the tick.

```ts
await page.getByTestId("cases-toggle-1").check()
await page.getByTestId("cases-toggle-1").uncheck()
```

If the box is already ticked, `check` does nothing. This is better than `click`, because `click` would remove the tick. `check` says what you want: a ticked box.

## selectOption

`selectOption` chooses an option in a drop-down list. You give the `value` of the option.

```ts
await page.getByTestId("cases-filter").selectOption("passed")
```

In the Practice app, the options have the values `all`, `pending` and `passed`. After this step, the list shows only the passed cases.

## Playwright waits before it acts

You never write "wait until the button exists". Playwright does this for you.

Before an action, Playwright checks that the element is ready. These checks are called **actionability**. In simple words, the element must:

- exist on the page,
- be visible,
- be stable, which means it is not moving,
- be enabled, which means it is not disabled,
- not be covered by another element.

If a check fails, Playwright waits and tries again. It stops when the test timeout ends, which is 30 seconds by default. Then the test fails and the message tells you which check was not true.

Try it. In the Practice app, press "Load report". The button is disabled for about one and a half seconds. If a test clicks it again, Playwright waits until the button is enabled.

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

The limit: this works when the steps are the same and only the data changes. If each case needs different steps, separate tests are easier to read.

## Practice

1. Open `e2e/exercises/03-playwright/03-actions.spec.ts`.
2. Change `test.fixme` to `test` in one test at a time. Write the steps from the comments.
3. Run your file:

```bash
pnpm e2e e2e/exercises/03-playwright/03-actions.spec.ts
```

4. In one test, remove an `await` before an action. Run the file and look at the result. Put the `await` back.

Compare with `e2e/exercises/03-playwright/solutions/03-actions.spec.ts` when you finish.

## Check what you know

1. What does `fill` do to the text that is already in the field?

<details><summary>Answer</summary>

It replaces it. The field only has the new text.

</details>

2. Why use `check` and not `click` for a checkbox?

<details><summary>Answer</summary>

`check` makes sure the box is ticked. `click` only clicks, so it can remove a tick that was already there.

</details>

3. What is actionability?

<details><summary>Answer</summary>

The checks Playwright makes before an action: the element exists, is visible, is stable, is enabled and is not covered. It waits until they are true.

</details>

4. Does Playwright wait for the result of a click?

<details><summary>Answer</summary>

No. It only waits until the element is ready to click. To wait for a result, use an assertion.

</details>

5. The Practice app has no cases. A test runs `await page.getByTestId("cases-input").press("Enter")` on the empty field and then expects `cases-item` to have a count of 1. What happens and why?

<details><summary>Answer</summary>

The test fails. Pressing Enter sends the form, but the app ignores an empty title: the code returns before it adds a case. So the count stays at 0. The assertion waits 5 seconds and then reports the difference between 1 and 0.

</details>

6. A test calls `check()` on `cases-toggle-1`, but no case was added before. Nothing in the test is wrong except this missing step. How long does the test take to fail, and what does the message say?

<details><summary>Answer</summary>

It waits for the default test timeout, 30 seconds, and then fails. Playwright cannot do the action, so it keeps waiting for the element to exist. The message says that the test timed out and that it was waiting for the locator `getByTestId('cases-toggle-1')`. A missing set-up step looks like a slow failure, not like a quick one.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **What is the difference between `fill()` and `pressSequentially()` in Playwright?**
   - Search for: `playwright fill vs pressSequentially`
   - A good answer explains: how each one enters text, which events the page receives, and one situation where `fill` is not enough.

2. **What is the difference between the HTML `disabled` attribute and `aria-disabled`?**
   - Search for: `html disabled vs aria-disabled button`
   - A good answer explains: what each one does for a mouse user and for a screen reader user, and why this matters when you test a button that "cannot be clicked".

3. **What is data-driven testing, and when is it a good idea?**
   - Search for: `data-driven testing parameterized tests`
   - A good answer explains: how one test with a table of inputs works, what is gained, and when separate tests are clearer.

## Next step

In the next lesson you learn assertions that wait, so your test can check results that take time.
