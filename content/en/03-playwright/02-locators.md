---
title: Locators
duration: 65 min
---

## Goal

In this lesson, you choose locators to find controls and rows in the Practice app. You learn when Playwright looks for matches and how to avoid an ambiguous search.

- Distinguish creating a locator, counting its matches and using it in an action.
- Choose between `getByTestId`, `getByRole`, `getByLabel` and `getByText`.
- Resolve a strict mode error without hiding a duplicate.
- Filter a row and find a control inside it.

## Create and use a locator

A **locator** describes how to find a DOM element. It stores the search rather than a reference to the element.

```ts
const email = page.getByTestId("login-email")
```

This line stores the search for the element with the test id `login-email`, without querying the page. Playwright looks for matches when you run an action or an assertion with the locator. If the DOM changed, it searches the current DOM.

![The same locator searches again and finds a new checkbox when React recreates the row.](/images/03-locator-resolution.en.svg)

With an empty case list, this code distinguishes creation, counting and an action:

```ts
const rows = page.getByTestId("cases-item")
console.log(await rows.count())
await rows.click()
```

The first line creates the locator even though no rows exist. The second prints `0`: `count()` returns the number of current matches without waiting for rows to appear. The third waits for Playwright to find an element to click.

The test has a default total limit of 30 seconds. The click uses the time left after earlier steps; if no row appears before that limit, the test fails while waiting for the locator.

## getByTestId: the team default

In the course apps, we use `getByTestId` by default. It looks for the value of the `data-testid` attribute, with names such as `login-email` or `cases-add`.

```ts
await page.getByTestId("login-email").fill("qa@example.com")
await page.getByTestId("login-submit").click()
```

The test id does not change when the control's text or colour changes. A translation or a style change can therefore keep the same locator.

## Other locators

**getByRole** finds an element by its role, such as a button, link or checkbox. You can add the accessible name, which Playwright computes from text or attributes such as `aria-label`. It can differ from the visible text.

```ts
await page.getByRole("button", { name: "Sign in" }).click()
```

**getByLabel** finds a form field by the text of its label. In the Practice app login, the label points to its field with the `for` attribute, which has the same value as the field's `id`. The list's checkboxes are inside their labels and do not need that association. For example, `<label for="login-email">Email</label>` points to `<input id="login-email">`.

```ts
await page.getByLabel("Email").fill("qa@example.com")
```

**getByText** finds an element by its text:

```ts
await expect(page.getByText("There are no cases yet.")).toBeVisible()
```

Locators that search for a name, label or text depend on those words. If the app translates them, the test must search for the text in the corresponding language.

### Count the buttons

A role locator and a tag selector can find different numbers of elements. To check this with an empty list while signed out, write this test in `e2e/challenges/scratch.spec.ts`:

```ts
import { expect, test } from "../lib/test"

test("counts the buttons", async ({ page }) => {
  await page.goto("/#/practice")
  await expect(page.getByTestId("login-submit")).toBeVisible()

  console.log("by role:", await page.getByRole("button").count())
  console.log("by tag:", await page.locator("button").count())
})
```

You should see `by role: 5` and `by tag: 6`. The six buttons are the language switch, the theme switch, Sign in, Sign out, Add and Load report. The Sign out button is inside an element with the `hidden` attribute until you sign in. By default, `getByRole` skips elements excluded from the accessibility tree, such as that button. `locator("button")` counts every `<button>` tag.

The initial assertion waits for the Sign in button to be visible before counting. Without it, `count()` could query the DOM before React has displayed the controls.

## Strictness

With two cases in the list, this action matches two rows:

```ts
await page.getByTestId("cases-item").click()
```

Playwright requires a single match to click. If it finds several, it throws a **strict mode** error:

```text
Error: locator.click: Error: strict mode violation: getByTestId('cases-item') resolved to 2 elements:
```

The error tells you to specify which row you want to use.

![Three rows share the same test id, so one locator matches all three.](/clips/strict-mode-rows.webm)

`toHaveCount` accepts multiple matches because it checks how many elements there are.

## Choose one element

`first()` selects the first match. `nth()` selects by position; `nth(1)` is the second.

```ts
await expect(page.getByTestId("cases-item-title").first()).toHaveText("First case")
await expect(page.getByTestId("cases-item-title").nth(1)).toHaveText("Second case")
```

These searches work when you want to check the order. To find a case by its title, use `filter()`:

```ts
const rows = page.getByTestId("cases-item")
await expect(rows.filter({ hasText: "Logout" })).toHaveCount(1)
```

`hasText: "Logout"` keeps rows whose text contains "Logout". The filter also examines the text of their descendants. Filtering by "Login" keeps both "Login" and "Login with a blocked user", so it does not guarantee a single match.

### first() can hide a duplicate

If you expect one row and the app shows two, this action can pass:

```ts
// The app should show one row for this case. It shows two. This line does not notice.
await page.getByTestId("cases-item").first().click()
```

Check the expected count before selecting by position:

```ts
await expect(page.getByTestId("cases-item")).toHaveCount(1)
```

Use `first()` or `nth()` when the position is part of what you want to check or when selecting that match is intentional.

## Chain locators inside a row

You can call a locator method on another locator. The second search runs inside all matches of the outer locator. To tick one checkbox, the filter must identify a single row.

```ts
const row = page.getByTestId("cases-item").filter({ hasText: "Second case" })
await row.getByRole("checkbox").check()
```

The filter selects the row with "Second case". Inside that row, `getByRole` finds the checkbox. This distinguishes identical controls in different rows.

When you know the case id, you can also find its checkbox with a test id such as `cases-toggle-1`.

### Reuse a search

If you use the same search in several steps, you can put it in a function that returns a `Locator`:

```ts
import { expect, test, type Locator, type Page } from "./lib/test"

function caseRow(page: Page, title: string): Locator {
  return page.getByTestId("cases-item").filter({ hasText: title })
}

test("ticks the second case", async ({ page }) => {
  await page.goto("/#/practice")
  for (const title of ["First case", "Second case"]) {
    await page.getByTestId("cases-input").fill(title)
    await page.getByTestId("cases-add").click()
  }

  await caseRow(page, "Second case").getByRole("checkbox").check()

  await expect(page.getByTestId("cases-counter")).toHaveText("1 of 2 passed")
})
```

`caseRow` keeps the criterion for finding a row by its title in one place. The test chains the checkbox search onto the locator returned by the function.

## Go deeper

### A row that disappears and returns

Add a pending case and choose `passed` in `cases-filter`. React removes its row from the DOM because it does not match the filter. When you choose `all`, React creates another row and checkbox from the app's state.

The locator `page.getByTestId("cases-toggle-1")` finds the new checkbox when you use it again. A saved reference to the previous element would still point to the node React removed.

### What the choice of locator checks

A test using `getByTestId` can pass even if the button has no readable name. The test id identifies the control without checking its name.

`getByRole("button", { name: "Sign in" })` requires the control to have that role and name. This locator adds a check on how assistive tools identify the button, but also makes the test depend on the name.

## Practice

1. Start the site with `pnpm dev`. Open `http://localhost:5180/#/practice`.
2. Add two cases by hand. In DevTools (F12), find `data-testid="cases-item"` in both rows.
3. Open `e2e/exercises/03-playwright/02-locators.spec.ts`.
4. Change `test.fixme` to `test` in one test at a time. Write the steps from the comments.
5. Run your file:

```bash
pnpm e2e e2e/exercises/03-playwright/02-locators.spec.ts
```

6. Remove `.first()` from a locator that matches two rows and use it in `click()`. Read the strict mode message. Put `.first()` back.

Compare with `e2e/exercises/03-playwright/solutions/02-locators.spec.ts` when you finish.

## Challenge

Create `e2e/challenges/02-locators.spec.ts`. Add the cases "Login", "Login with a blocked user" and "Logout". Write a test that ticks only the exact title "Login". You can choose other titles if one is the beginning of another.

It is done when:

- The test passes with `pnpm e2e e2e/challenges/02-locators.spec.ts`, with no strict mode errors, and `cases-counter` shows "1 of 3 passed".
- You check `data-status` on each row by its title: one `passed` and two `pending`.
- The test does not use `first()`, `last()`, `nth()`, or a test id with a number in it.
- Changing the action to tick "Logout" makes the test fail with a clear message. Then you restore the correct action.

You will need an exact text match. Search for: `playwright getByText exact true`, `playwright locator filter has`.

## Think it through

1. You add "First case" and "Second case" and tick "Second case". You choose the filter `pending`, then `all`. Does this assertion pass?

```ts
await expect(page.getByTestId("cases-toggle-2")).toBeChecked()
```

<details><summary>Answer</summary>

It passes. The app preserves the case's state when filtering. React creates the new checkbox already ticked, and the locator finds it when the assertion runs.

</details>

2. The cases were added in this order: "Login works", "Logout works", "Reset password". The test is named "ticks Reset password". What happens if the app starts showing the newest case at the top?

```ts
await page.getByTestId("cases-item").last().getByRole("checkbox").check()
await expect(page.getByTestId("cases-counter")).toHaveText("1 of 3 passed")
```

<details><summary>Answer</summary>

The test ticks "Login works" and still passes: the counter checks the quantity without identifying the ticked case. Select the row with `filter({ hasText: "Reset password" })` and check that its `data-status` is `passed`.

</details>

3. You add a case titled "Delete" and run `page.getByText("Delete").click()` to delete it. What happens, and which locator would you use?

<details><summary>Answer</summary>

It fails because of strict mode: both the title and the Delete button match. Use `cases-delete-1` if you know the id, or search for `getByRole("button", { name: "Delete" })` inside the selected row.

</details>

## Next step

In the next lesson you use locators to do things: click, type, choose and tick.
