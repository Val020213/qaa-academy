---
title: Locators
summary: Find elements with getByTestId and the other locators, handle strictness, look inside a row, and choose a locator on purpose.
duration: 80 min
---

## Start with a puzzle

Open the Practice app with an empty case list. A test runs these three lines:

```ts
const rows = page.getByTestId("cases-item")
console.log(await rows.count())
await rows.click()
```

There are no rows. Not one `cases-item` exists on the page.

Which of the three lines throws an error? When does it happen: at once, after 5 seconds, or after 30 seconds? What does the second line print?

Write down your guess before you read on.

## Goal

- Predict what a locator finds, and when it looks.
- Choose between `getByTestId`, `getByRole`, `getByLabel` and `getByText`, and defend your choice.
- Fix a strictness error without hiding a bug.
- Pick one row in a list, and act inside it.

## What a locator is

A **locator** describes how to find an element on the page. It is not the element itself.

```ts
const email = page.getByTestId("login-email")
```

This line does not touch the page. It only stores a description: "the element with the test id `login-email`".

Playwright looks for the element at the moment you use the locator, for example in `fill` or in `expect`. If the page changed, the locator finds the new element. So you can create a locator once and use it many times.

Think of a street address on a letter. The address is not the house. If the house is rebuilt, the same address still leads to the new house.

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

**getByLabel** finds a form field by the text of its label. In the Practice app, each field has a real `<label>`. The label points to its field with the `for` attribute, which has the same value as the field's `id`. For example, `<label for="login-email">Email</label>` points to `<input id="login-email">`.

```ts
await page.getByLabel("Email").fill("qa@example.com")
```

**getByText** finds an element by the text it shows.

```ts
await expect(page.getByText("There are no cases yet.")).toBeVisible()
```

These locators are close to what a user sees. They break when the text changes, for example when the app is translated. This is why the team prefers test ids.

### Experiment: count the buttons

Before you run anything, answer. The Practice app, with an empty case list, has some buttons. Do you think `page.getByRole("button")` and `page.locator("button")` give the same number?

Write this scratch test in a file of your own, for example `e2e/challenges/scratch.spec.ts`:

```ts
import { expect, test } from "../lib/test"

test("counts the buttons", async ({ page }) => {
  await page.goto("/#/practice")
  await expect(page.getByTestId("login-submit")).toBeVisible()

  console.log("by role:", await page.getByRole("button").count())
  console.log("by tag:", await page.locator("button").count())
})
```

You should see `by role: 5` and `by tag: 6`. The six buttons are the language switch, the theme switch, Sign in, Sign out, Add and Load report. The Sign out button is in the page, but it has the `hidden` attribute until you sign in. `getByRole` skips hidden elements, because a user cannot use them. `locator("button")` counts every `<button>` tag.

The first `expect` is there on purpose. `count()` does not wait. Without that line, you could count before the page is drawn.

## Strictness

Add two cases in the Practice app. Each case is a row with the test id `cases-item`. Now look at this line:

```ts
await page.getByTestId("cases-item").click()
```

What do you expect to happen? Two rows match. Will Playwright click the first one?

It fails. A locator that matches more than one element is not allowed in an action. This rule is called **strict mode**. The message says:

```text
Error: locator.click: Error: strict mode violation: getByTestId('cases-item') resolved to 2 elements:
```

Playwright refuses to guess which one you mean. This protects you from clicking the wrong element.

Watch how many rows share the same test id.

![Three rows share the same test id, so one locator matches all three.](/clips/strict-mode-rows.webm)

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

Notice a trap. `hasText: "Logout"` matches any row whose text contains "Logout". It is a "contains" test, not an "is exactly" test. What happens with the rows "Login" and "Login with a blocked user" if you filter by "Login"? Work out the answer, then try it.

## Chaining: look inside a row

You can call a locator method on another locator. The second search runs only inside the first match.

```ts
const row = page.getByTestId("cases-item").filter({ hasText: "Second case" })
await row.getByRole("checkbox").check()
```

Read it as: "find the row with the text Second case, then find the checkbox inside it, then check it."

This is how you handle lists. Every row has the same buttons, so you first pick the row. Then you look inside it.

> **Tip:** In the Practice app, a row also has its id in the test id, such as `cases-toggle-1`. The team rule says row elements include the id. You can use that when you know the id.

### Back to the puzzle

Line 1 does nothing. A locator is only a description, so it does not fail when no element exists. Line 2 prints `0` at once. Counting rows that do not exist is a normal question with a normal answer. Line 3 waits. Playwright keeps looking for an element to click, and after 30 seconds (the test timeout) the test fails. The message says it was waiting for the locator.

So a locator never fails by itself. The action or the assertion that uses it fails. And "no element" and "too many elements" are two different failures.

## Go deeper

### Why a locator survives changes in the page

Each time you use a locator, Playwright searches the page again. The locator keeps the description, not the element.

This matters in the Practice app. Add one case. Then choose the filter `passed` in `cases-filter`. The page now shows only passed cases, so React removes the row of the pending case from the page. Choose `all` again, and React creates a new row with a new checkbox. The old checkbox is gone. But `page.getByTestId("cases-toggle-1")` still works, because it searches again and finds the new checkbox.

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

A good habit is to **test what the user sees, not how the code is built**. A user does not know that `cases-item` exists. A user sees a row with a title and a checkbox. Test ids are a bridge: they point at things a user sees, and they do not change when the code around them is rebuilt. A locator that depends on the structure of the page, such as "the third `div` inside the second `div`", is the opposite.

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

The function has one job and a name that says what it is for: it finds a row by its title. A page object, in module 4, takes this idea further.

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

## Challenge

Create the file `e2e/challenges/02-locators.spec.ts`. In the Practice app, add three cases: "Login", "Login with a blocked user" and "Logout". You may choose your own three titles, but one title must be the beginning of another one. Write one test that ticks only the case with the exact title "Login" (or your short title), and proves that the other two were not ticked.

It is done when:

- The test passes with `pnpm e2e e2e/challenges/02-locators.spec.ts`, and Playwright shows no strict mode error.
- The counter `cases-counter` has the text "1 of 3 passed".
- You check the `data-status` attribute of each of the three rows by its title: one `passed` and two `pending`.
- The test does not use `first()`, `last()`, `nth()`, or a test id with a number in it.
- You changed the test to tick "Logout" by mistake, and the test failed with a clear message. Then you fixed it.

You will need something this lesson did not teach: how to match a text exactly, and not as a part of a longer text. Search for: `playwright getByText exact true`, `playwright locator filter has`.

## Think it through

1. Predict the result and say why. You add "First case" and "Second case" and tick "Second case". You choose the filter `pending`, and then you choose `all` again. Does this line pass?

```ts
await expect(page.getByTestId("cases-toggle-2")).toBeChecked()
```

<details><summary>Answer</summary>

It passes. The tick is stored in the state of the app, not in the checkbox element. When the filter hides the row, React removes the element. When the row comes back, React creates a new checkbox from the stored state, and it is ticked. The locator searches again at the moment of the assertion, so it finds the new element. A saved element reference would be stale here.

</details>

2. This test passes. It also has a hidden weakness. Find it. The cases were added in this order: "Login works", "Logout works", "Reset password". The test is named "ticks Reset password".

```ts
await page.getByTestId("cases-item").last().getByRole("checkbox").check()
await expect(page.getByTestId("cases-counter")).toHaveText("1 of 3 passed")
```

<details><summary>Answer</summary>

The test never names the row it wants. It ticks the last row, and the counter says only that one case is ticked, not which one. If the order of the rows changes (for example the newest case moves to the top), the test ticks another case, and it still passes. Pick the row by its title with `filter({ hasText: "Reset password" })`. Then check that this row has `data-status` equal to `passed`.

</details>

3. Two versions both work. Version A: `page.getByLabel("Email")`. Version B: `page.getByTestId("login-email")`. Which is better in the Practice app, and what would make you choose the other?

<details><summary>Answer</summary>

For the team, B is better as the default: it does not change when the label text changes or is translated. A is better when the goal is to test what a user sees. It also fails if the label is missing or not linked to the field, which means a screen reader user could not find the field either. Choose A in a few accessibility checks, or when you test an app that has no test ids and you cannot change it.

</details>

4. What breaks if the product owner asks that the newest case is shown at the top of the list? Look at these three ways to find "Second case": `nth(1)`, `filter({ hasText: "Second case" })` and `getByTestId("cases-toggle-2")`.

<details><summary>Answer</summary>

Only the first one breaks. The position of "Second case" changes, so `nth(1)` finds another row. The text did not change, so the filter still works. The id also did not change (the id is given when the case is created), so the third one still works. This is why we prefer a locator that says what we mean over one that says where it is.

</details>

5. Explain to a teammate in three sentences why Playwright refuses to click when two elements match. Do not use the word "strict".

<details><summary>Answer</summary>

When two elements match, the test cannot know which one you want. A wrong guess would click something else, and the test could pass for the wrong reason. So Playwright stops with an error and asks you to say what you mean. The error is also a free alarm: it can show that the page has a duplicate that should not be there.

</details>

6. Edge case. A user adds a case with the title "Delete". Then your test calls `page.getByText("Delete").click()` to delete a row. What happens, and what locator would you use instead?

<details><summary>Answer</summary>

The call fails with a strict mode violation. The word "Delete" appears twice in the row: in the title of the case and in the Delete button. Text that comes from users can look like text from the interface, so `getByText` is risky in lists. Use the test id `cases-delete-1` or `getByRole("button", { name: "Delete" })`, which finds only buttons. If the list has many rows, pick the row first and look for the button inside it.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **What is a "stale element" in Selenium, and why does Playwright not have this problem?**
   - Search for: `selenium StaleElementReferenceException`
   - Try it: Open the Practice app, add a case, and in DevTools (F12) right-click its checkbox and choose Inspect. Change the filter to `passed` and back to `all`. Watch what happens to the highlighted node.
   - A good answer explains: what causes the error, with a simple example of a page that redraws, and how a locator that searches again avoids it.

2. **What is the accessibility tree, and how does `getByRole` use it?**
   - Search for: `accessibility tree roles browser`
   - Try it: In a scratch test, write `console.log(await page.getByTestId("login").ariaSnapshot())` after `goto` and read the output. Find the role and the name of the Sign in button.
   - A good answer explains: what a role and an accessible name are, and why a locator by role also checks that the page is usable with a screen reader.

3. **Why do some testers say that a locator tied to CSS classes or page structure is fragile?**
   - Search for: `fragile locators css xpath test automation`
   - Try it: In DevTools, right-click the `cases-counter` element, choose Copy, then Copy selector. Compare the result with `getByTestId("cases-counter")`. Imagine three changes a designer could make, and say which ones break each locator.
   - A good answer explains: what kinds of page changes break such locators, and what a test id or a role gives instead.

## Next step

In the next lesson you use locators to do things: click, type, choose and tick.
