---
title: Actions
duration: 60 min
---

## Goal

In this lesson you use locators to interact with the Practice app and choose the action for the result you need. You also distinguish waiting before an action from waiting for its result.

- Navigate, click, and use form controls.
- Tick a checkbox without changing it by mistake when you repeat the step.
- Understand Playwright's checks before an action.
- Create one test for each input in a data table.

## goto and click

`goto` opens an address. With the configured `baseURL`, `/#/practice` becomes `http://localhost:5180/#/practice`.

```ts
await page.goto("/#/practice")
```

`click` clicks the element that the locator finds.

```ts
await page.getByTestId("login-submit").click()
```

## fill and clear

`fill` replaces the text that was in the field.

```ts
await page.getByTestId("login-email").fill("qa@example.com")
```

`clear` empties the field.

```ts
await page.getByTestId("login-email").clear()
```

## press

`press` presses a key on the keyboard. Use it for keys like `Enter`, `Tab` or `Escape`.

```ts
await page.getByTestId("cases-input").fill("Press Enter to add")
await page.getByTestId("cases-input").press("Enter")
```

In the Practice app, the browser submits the form when you press `Enter` in the field. The app adds the case, just as it does when you click Add.

## check and uncheck

`check` ticks a checkbox. `uncheck` removes the tick.

```ts
await page.getByTestId("cases-toggle-1").check()
await page.getByTestId("cases-toggle-1").uncheck()
```

If the checkbox is already ticked, `check` leaves its state unchanged. A click toggles the tick each time you repeat it. This test calls the same helper twice with one case in the list:

```ts
async function markAsPassed(page: Page) {
  await page.getByTestId("cases-toggle-1").click()
}

await markAsPassed(page)
await markAsPassed(page)
await expect(page.getByTestId("cases-counter")).toHaveText("1 of 1 passed")
```

The first click ticks the checkbox and the second removes the tick. The counter shows "0 of 1 passed", so the assertion fails.

Replacing `click()` with `check()` leaves the checkbox ticked on the second call, and the counter shows "1 of 1 passed". The operation is **idempotent**: repeating it produces the same result as running it once.

## selectOption

`selectOption` chooses an option in a drop-down list. You give the `value` of the option.

```ts
await page.getByTestId("cases-filter").selectOption("passed")
```

In the Practice app, the options have the values `all`, `pending` and `passed`. After this step, the list shows only the passed cases.

The control is a native `<select>` element. `selectOption` works only on this kind of element. A drop-down made of `div` elements needs a click to open it and another to select an option.

## Playwright waits before it acts

Before an action, Playwright checks that the element is ready. These checks are called **actionability**. In simple words, the element must:

- exist on the page,
- be visible,
- be stable, which means it is not moving,
- be enabled, which means it is not disabled,
- not be covered by another element.

If a check fails, Playwright waits and tries again. It stops when the test timeout ends, which is 30 seconds by default. Then the test fails and the message tells you which check was not true.

In the Practice app, Load report disables the button for about one and a half seconds. This test tries to click twice in a row:

```ts
await page.getByTestId("report-load").click()
await page.getByTestId("report-load").click()
await expect(page.getByTestId("report-result")).toContainText("12 tests")
```

Playwright waits until the button is enabled, about 1.5 seconds, and then clicks. The second click starts a second report. The text "12 tests" is ready about 3 seconds after the first click.

The app may still be working after the click finishes. The assertion checks the report's result.

## A login test

This test opens the page, fills the fields, and clicks Sign in. The assertion checks that the welcome message appears.

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

## A table of inputs

The Practice app shows one error for empty fields and another for a wrong password. When the steps are the same and only the data changes, you can write the steps once and loop over the inputs:

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

When the file loads, Playwright's test runner registers one test for each call to `test`. The loop registers two tests with different names; each uses the data from its row.

If the cases need different steps, separate tests are easier to read. With two cases, two simple tests are also fine. Use a table when the rows justify sharing the steps.

Choose inputs by **equivalence classes**: groups of values that the app treats in the same way, such as empty titles or titles containing only spaces. Test one input from each group.

Also include **boundary values**, such as empty text or a single character. If the field has a length limit, test text that reaches that limit.

## Go deeper

### Keyboard events with pressSequentially

When a person types, the browser receives keyboard events for each key. `fill` replaces the field's text and tells the page that the value changed, without reproducing each key.

If the behavior you are testing depends on keyboard events, use `pressSequentially`:

```ts
await page.getByTestId("cases-input").pressSequentially("Login", { delay: 100 })
```

The `delay` is the time in milliseconds between two keys. Use this action when `fill` does not trigger the behavior you want to test.

### The limits of force

If another element covers the button, a click may wait and fail. The option `force: true` lets you force the click:

```ts
await page.getByTestId("report-load").click({ force: true })
```

`force` skips the actionability checks. The click is sent even if the button is covered or disabled. But it does not promise that your button gets the click: an overlay may receive it, and a disabled button does nothing. The test can go green anyway. But a real user cannot click a covered button. The test now hides a real bug.

Read the failure message before forcing an action. If a user cannot use the button either, investigate the problem in the app.

## Practice

1. Open `e2e/exercises/03-playwright/03-actions.spec.ts`.
2. Change `test.fixme` to `test` in one test at a time. Write the steps from the comments.
3. Run your file:

```bash
pnpm e2e e2e/exercises/03-playwright/03-actions.spec.ts
```

Compare with `e2e/exercises/03-playwright/solutions/03-actions.spec.ts` when you finish.

## Challenge

Create `e2e/challenges/03-actions.spec.ts`. Test titles in the case list with a table of inputs and one test per row. First check in the browser what the Practice app does with each input, and use that result in your assertions.

It is done when:

- The table has at least five inputs: a normal title, one with spaces before and after, one with only spaces, an empty one, and one of 300 characters generated in code.
- The file creates one test per row, with a name that identifies the input.
- Each test checks the row count and the text of `cases-counter`. If it adds a row, it also checks the title shown in the list.
- All tests pass with `pnpm e2e e2e/challenges/03-actions.spec.ts`, and `pnpm e2e e2e/challenges/03-actions.spec.ts --list` shows one test name for each row.

Search for how to build long text in code and check that nothing was added: `javascript string repeat`, `playwright toHaveCount 0`.

## Think it through

1. In the Practice app with an empty list, what number goes in place of `?`, and what does the field hold at the end?

```ts
await page.getByTestId("cases-input").fill("Login")
await page.getByTestId("cases-input").press("Enter")
await page.getByTestId("cases-input").press("Enter")
await expect(page.getByTestId("cases-item")).toHaveCount(?)
```

<details><summary>Answer</summary>

The count is 1 and the field is empty. The first Enter submits the form; the app adds the case and clears the field. The second Enter submits an empty title, which the app ignores.

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

3. What breaks if a developer replaces the native `<select data-testid="cases-filter">` with a drop-down made of `div` elements, with the same test id and the same visible options?

<details><summary>Answer</summary>

`selectOption` fails because it requires a real `<select>` element. The test must click the drop-down and then an option. The custom control also needs to implement the keyboard behavior and accessibility that the native control provides.

</details>

## Next step

In the next lesson you learn assertions that wait, so your test can check results that take time.
