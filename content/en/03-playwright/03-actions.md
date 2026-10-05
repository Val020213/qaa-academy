---
title: Actions
summary: Do what a user does with goto, click, fill, press, check, selectOption and clear, and learn how Playwright waits.
duration: 30 min
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

## Next step

In the next lesson you learn assertions that wait, so your test can check results that take time.
