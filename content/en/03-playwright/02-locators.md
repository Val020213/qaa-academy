---
title: Locators
summary: Find elements with getByTestId and the other locators, handle strictness, and look inside a row.
duration: 50 min
---

## Goal

- Explain what a locator is and when it runs.
- Find elements with `getByTestId`, and read `getByRole`, `getByLabel` and `getByText`.
- Fix a strictness error with `first()`, `nth()` or `filter()`.
- Chain locators to look inside one row.

## What a locator is

A **locator** describes how to find an element on the page. It is not the element itself.

```ts
const email = page.getByTestId("login-email")
```

This line does not touch the page. It only stores a description: "the element with the test id `login-email`".

Playwright looks for the element at the moment you use the locator, for example in `fill` or in `expect`. If the page changed, the locator finds the new element. So you can create a locator once and use it many times.

## getByTestId: the team default

Every interactive element in our apps has an attribute called `data-testid`. Its value follows the rule `<feature>-<element>`. For example, `login-email` or `cases-add`.

```ts
await page.getByTestId("login-email").fill("qa@example.com")
await page.getByTestId("login-submit").click()
```

We use `getByTestId` by default. The test id does not change when a designer changes the text or the colours. The test stays stable.

## Other locators you will read

Other people write tests in other styles. You must be able to read them.

**getByRole** finds an element by its role: what it is for a user. A button, a link, a checkbox. You add the visible name.

```ts
await page.getByRole("button", { name: "Sign in" }).click()
```

**getByLabel** finds a form field by the text of its label.

```ts
await page.getByLabel("Email").fill("qa@example.com")
```

**getByText** finds an element by the text it shows.

```ts
await expect(page.getByText("There are no cases yet.")).toBeVisible()
```

These locators are close to what a user sees. They break when the text changes, for example when the app is translated. This is why the team prefers test ids.

## Strictness

Add two cases in the Practice app. Each case is a row with the test id `cases-item`. Now look at this line:

```ts
await page.getByTestId("cases-item").click()
```

It fails. A locator that matches more than one element is not allowed in an action. This rule is called **strict mode**. The message says:

```text
Error: locator.click: Error: strict mode violation: getByTestId('cases-item') resolved to 2 elements:
```

Playwright refuses to guess which one you mean. This protects you from clicking the wrong element.

> **Note:** `toHaveCount` is the exception. It is made to count many elements, so it accepts a locator with many matches.

## Choose one element

You have three tools.

`first()` takes the first match. `nth()` takes a match by position. The count starts at 0, so `nth(1)` is the second.

```ts
await expect(page.getByTestId("cases-item-title").first()).toHaveText("First case")
await expect(page.getByTestId("cases-item-title").nth(1)).toHaveText("Second case")
```

`filter()` keeps only the matches that fit a rule. Here the rule is the text inside the element:

```ts
const rows = page.getByTestId("cases-item")
await expect(rows.filter({ hasText: "Logout" })).toHaveCount(1)
```

Prefer `filter()`. Position can change. Text says what you mean.

## Chaining: look inside a row

You can call a locator method on another locator. The second search runs only inside the first match.

```ts
const row = page.getByTestId("cases-item").filter({ hasText: "Second case" })
await row.getByRole("checkbox").check()
```

Read it as: "find the row with the text Second case, then find the checkbox inside it, then check it."

This is how you handle lists. Every row has the same buttons, so you first pick the row. Then you look inside it.

> **Tip:** In the Practice app, a row also has its id in the test id, such as `cases-toggle-1`. The team rule says row elements include the id. You can use that when you know the id.

## Go deeper

### Why a locator survives changes in the page

Each time you use a locator, Playwright searches the page again. The locator keeps the description, not the element.

This matters in the Practice app. When you tick a checkbox, the code calls `paint()`. This function replaces every row of the list with new elements. The old elements are gone. But `page.getByTestId("cases-toggle-1")` still works after that, because it searches again and finds the new checkbox.

Some other tools give you the element itself. After a page update, that saved element can point to something that was removed. Selenium calls this a "stale element". Locators avoid the problem.

### A common wrong idea: "first() fixes the strict mode error"

The error is annoying, so a beginner adds `first()`. The error goes away. But look at what happened:

```ts
// The app should show one row for this case. It shows two. This line does not notice.
await page.getByTestId("cases-item").first().click()
```

The strict mode error was a warning. Maybe the app has a bug, and the list shows a case twice. `first()` hides the bug. First ask what you expect. If you expect one row, say so:

```ts
await expect(page.getByTestId("cases-item")).toHaveCount(1)
```

Use `first()` or `nth()` only when many matches are normal.

### A trade-off: test id or role?

The team default is `getByTestId`. It is stable. But it has a cost. A test id is invisible to the user. A test with `getByTestId` can pass when the button has no readable name, which is a problem for a person who uses a screen reader.

`getByRole("button", { name: "Sign in" })` is stricter. It uses what the user and assistive tools see. It breaks when the text changes, for example in another language.

Neither is always right. We choose test ids for stable tests. We can add a few role-based checks where accessibility is the goal.

When you use the same row many times, write the search once. This is DRY, "Don't Repeat Yourself", applied to locators:

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

A page object, in module 4, takes this idea further.

## Practice

1. Start the site with `pnpm dev`. Open `http://localhost:5180/#/practice`.
2. Add two cases by hand. Look at the page in the browser developer tools (F12). Find `data-testid="cases-item"`.
3. Open `e2e/exercises/03-playwright/02-locators.spec.ts`.
4. Change `test.fixme` to `test` in one test at a time. Write the steps from the comments.
5. Run your file:

```bash
pnpm e2e e2e/exercises/03-playwright/02-locators.spec.ts
```

6. On purpose, remove `.first()` from a locator that matches two rows and use it in `click()`. Read the strict mode message. Put `.first()` back.

Compare with `e2e/exercises/03-playwright/solutions/02-locators.spec.ts` when you finish.

## Check what you know

1. When does Playwright look for the element?

<details><summary>Answer</summary>

When you use the locator in an action or an assertion. Creating the locator does not touch the page.

</details>

2. Why does the team prefer `getByTestId`?

<details><summary>Answer</summary>

The test id does not change when the text or the design changes. The test stays stable.

</details>

3. What is a strict mode violation?

<details><summary>Answer</summary>

An action used a locator that matches more than one element. Playwright refuses to choose.

</details>

4. How do you click the checkbox inside one row?

<details><summary>Answer</summary>

Pick the row first, for example with `filter({ hasText })`. Then chain `getByRole("checkbox")` and act on it.

</details>

5. The Practice app has two cases: "Login" and "Login with a blocked user". Your test uses `page.getByTestId("cases-item").filter({ hasText: "Login" })` and then clicks the checkbox inside it. What happens, and why?

<details><summary>Answer</summary>

The test fails with a strict mode violation. `hasText` matches a part of the text, so both rows contain "Login". The filter keeps two rows, and an action needs exactly one. Use a more exact text, such as "Login with a blocked user", or use the row's id in the test id.

</details>

6. You add the cases "First case" and "Second case" and tick "Second case". Then you choose the filter `passed` in `cases-filter`. What does `page.getByTestId("cases-item-title").nth(1)` find?

<details><summary>Answer</summary>

Nothing. The filter shows only passed cases, so only one row is left. `nth(0)` is "Second case". `nth(1)` is the second match, and there is none. An assertion on it waits 5 seconds and then fails. Position-based locators break when the list changes.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **What is a "stale element" in Selenium, and why does Playwright not have this problem?**
   - Search for: `selenium StaleElementReferenceException`
   - A good answer explains: what causes the error, with a simple example of a page that redraws, and how a locator that searches again avoids it.

2. **What is the accessibility tree, and how does `getByRole` use it?**
   - Search for: `accessibility tree roles browser`
   - A good answer explains: what a role and an accessible name are, and why a locator by role also checks that the page is usable with a screen reader.

3. **Why do some testers say that a locator tied to CSS classes or page structure is fragile?**
   - Search for: `fragile locators css xpath test automation`
   - A good answer explains: what kinds of page changes break such locators, and what a test id or a role gives instead.

## Next step

In the next lesson you use locators to do things: click, type, choose and tick.
