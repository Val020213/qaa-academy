---
title: Locators
summary: Find elements with getByTestId and the other locators, handle strictness, and look inside a row.
duration: 35 min
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

## Next step

In the next lesson you use locators to do things: click, type, choose and tick.
