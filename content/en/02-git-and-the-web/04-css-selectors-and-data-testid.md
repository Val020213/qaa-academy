---
title: CSS selectors and data-testid
summary: Write simple CSS selectors, see why class names break tests, and use the team data-testid convention.
duration: 45 min
---

## Goal

- Read and write tag, class, id and attribute selectors.
- Explain why CSS classes make fragile test selectors.
- Follow the team rule for `data-testid` names.
- Test a selector in the DevTools console.

## What is a selector?

A **selector** is a short piece of text that describes which elements you want in the DOM. The browser and Playwright both understand CSS selectors. CSS is the language that styles a page, such as colors and sizes. Its selectors are also used to find elements.

## The four basic selectors

Here is one element from the Practice app:

```html
<button type="submit" class="button" data-testid="login-submit">Sign in</button>
```

| Selector | Meaning | Matches |
| --- | --- | --- |
| `button` | by tag | every `button` on the page |
| `.button` | by class | every element with the class `button` |
| `#login` | by id | the one element with `id="login"` |
| `[type="submit"]` | by attribute | every element with `type="submit"` |

A class starts with a dot. An id starts with `#`. An attribute goes in square brackets.

> **Note:** The Practice app has no `id` attributes. The `#` selector is shown here only so you can recognize it.

## Combining selectors

Write selectors with no space to say "all of these at once":

```text
button.button
input[type="password"]
```

The first matches a `button` that also has the class `button`. The second matches an `input` whose type is `password`.

Write a space to say "inside":

```text
[data-testid="login-form"] button
```

This means: a `button` somewhere inside the element with `data-testid="login-form"`. It uses the nesting you learned about earlier.

## Why classes break tests

The class names in the Practice app are there for styling. `class="button"` makes the button look like a button. A designer can rename or remove a class on any day, and the page works the same for the user. The test breaks.

There is a second problem: classes repeat. In the Practice app, the selector `.button` matches the Sign in button, the Add button and the Load report button. A selector that matches many elements is not safe for a test.

Selectors based on position are worse. A selector like "the third `div` inside the second `div`" breaks when someone adds one element.

A good test selector is stable. It changes only when the feature changes, not when the design changes.

## data-testid

The **`data-testid`** attribute exists only for tests. It has no effect on how the page looks. Any name that starts with `data-` is allowed by HTML.

```html
<button type="submit" class="button" data-testid="login-submit">Sign in</button>
```

The selector is:

```text
[data-testid="login-submit"]
```

Playwright has a short way to write this. You will learn it in the Playwright module:

```ts
page.getByTestId("login-submit")
```

## The team convention

The team follows these rules:

- Every interactive element has a `data-testid`. Buttons, inputs, links, checkboxes and selects are interactive.
- The name is `<feature>-<element>`. The feature comes first.
- Names are in lowercase, with words separated by hyphens.

Examples from the Practice app: `login-email`, `login-password`, `login-submit`, `cases-input`, `cases-add`, `report-load`.

Elements that repeat, such as rows, include the id of the row at the end:

- `cases-delete-1` is the Delete button of case 1.
- `cases-toggle-3` is the checkbox of case 3.
- In the practice shop, `products-row-5` is the row of product 5, and `products-delete-5` is its Delete button.

The id comes from the data, so a test can find the row it created.

## Try selectors in the console

The DevTools **Console** lets you run one line of JavaScript on the page. Two commands help you test selectors:

- `document.querySelector("...")` returns the first element that matches. It returns `null` if nothing matches.
- `document.querySelectorAll("...")` returns all matching elements, as a list.

```text
> document.querySelector('[data-testid="login-submit"]')
<button type="submit" class="button" data-testid="login-submit">Sign in</button>

> document.querySelectorAll(".button").length
3
```

Put the whole selector in quotes. Use single quotes outside when the selector has double quotes inside.

There is also a pattern for "starts with". The `^=` operator matches the start of the value:

```text
document.querySelectorAll('[data-testid^="cases-delete-"]')
```

This finds every Delete button of the case list, whatever the id.

When you write a test, check the selector first. If `querySelectorAll` gives exactly one element, the selector is safe. The number of matches is the answer.

## Go deeper

### Why it works this way: a contract between two people

A class is part of the design. The designer owns it. A `data-testid` is a promise between the developer and the tester: "this name will stay, so your test can rely on it". The attribute has no other job. This is why a test that uses it breaks only when the feature changes.

### A common wrong idea: "an id is always safe"

An `id` is meant to be unique, and a unique selector sounds perfect. But some tools create ids by themselves, with names like `:r1:`. They can change when the page gets one more element before it. A stable name that a person chose, and agreed on, is better than a name a machine made.

The second wrong idea is "one match means a good selector". Look at this selector on a page with exactly one case:

```text
[data-testid^="cases-delete-"]
```

It matches one element today. It matches two when there are two cases. The count is right only for this moment. A good selector is exact, such as `cases-delete-2`, and you know why it matches.

### How it shows up in real QA work: names written many times

A test uses the string `"cases-delete-2"`. Another test uses it too. When the same string appears in twenty places, a change means twenty edits. This is the idea called **DRY**, "Don't Repeat Yourself". You met it in module 1, and you will study it again in module 4 in "DRY in test automation". One place holds the knowledge.

You can write the rule for the name once, in a function:

```ts
function caseDelete(id: number): string {
  return `cases-delete-${id}`
}

console.log(caseDelete(3))
```

```text
cases-delete-3
```

In a test, you could then write `page.getByTestId(caseDelete(2)).click()`.

Be careful. In tests, a clear story is more important than removing every repeat. `page.getByTestId("cases-delete-2")` in one test is easy to read. A helper is worth it when many tests use the same name, or when the name has a rule, as here.

## Practice

1. Open `http://localhost:5180/#/practice`. Press `F12` and open the **Console** tab.
2. Run each selector. Write down how many elements it matches, using `.length`. You should see 6, 3, 1 and 1. The page has 6 buttons, but only 3 have the class `button`. The Sign out button is hidden and has another class. The language and theme buttons in the top bar also have their own class:

```text
document.querySelectorAll("button").length
document.querySelectorAll(".button").length
document.querySelectorAll('[data-testid="login-submit"]').length
document.querySelectorAll('input[type="password"]').length
```

3. Add three cases in section 2: "One", "Two" and "Three".
4. Run this and read the result:

```text
document.querySelectorAll('[data-testid^="cases-delete-"]').length
```

5. Select the Delete button of the second case and click it from the console:

```text
document.querySelector('[data-testid="cases-delete-2"]').click()
```

6. Look at the list. Which case disappeared?
7. Try a selector that does not exist, such as `[data-testid="cases-delete-99"]`. Read the result.

## Check what you know

1. Why is `.button` a bad selector for a test?

<details><summary>Answer</summary>

Classes are for styling, so they change often. They also repeat, so the selector can match many elements.

</details>

2. What does `[data-testid="login-form"] button` mean?

<details><summary>Answer</summary>

A `button` element anywhere inside the element with `data-testid="login-form"`.

</details>

3. What is the team rule for `data-testid` names?

<details><summary>Answer</summary>

`<feature>-<element>`, in lowercase with hyphens. Repeating elements end with the row id, for example `cases-delete-3`.

</details>

4. What does `document.querySelector` return when nothing matches?

<details><summary>Answer</summary>

`null`.

</details>

5. Two cases are on the page. What do these two lines print, and why?

```text
document.querySelectorAll('[data-testid="cases-delete"]').length
document.querySelectorAll('[data-testid^="cases-delete"]').length
```

<details>
<summary>Answer</summary>

The first prints `0`. The name `cases-delete` is exact, and no element has exactly this name. The real names are `cases-delete-1` and `cases-delete-2`. The second prints `2`, because `^=` means "starts with", and both names start with `cases-delete`.

</details>

6. Which selector is better for the Delete button of the case with id 2? A) `.cases li:nth-child(2) button` B) `[data-testid="cases-delete-2"]`

<details>
<summary>Answer</summary>

B is better. In A, the number 2 is a position. If the first case is deleted, or the filter hides a case, the second `li` is a different case. In B, the number 2 is the id of the case, and it does not move. B also says clearly what it finds.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **What is CSS specificity, and why does one rule win over another?**
   - Search for: `CSS specificity MDN`
   - A good answer explains: how id, class and tag selectors are ranked, with one small example.
2. **What is the difference between a descendant selector (a space) and a child selector (`>`)?**
   - Search for: `CSS combinators descendant child selector`
   - A good answer explains: both forms with a small HTML example, and which elements each one matches.
3. **Why does the Playwright documentation recommend user-facing locators over CSS selectors, and when do teams still use `data-testid`?**
   - Search for: `playwright best practices locators`
   - A good answer explains: the reason for the advice, and one situation where a test id is the better choice.

## Next step

In the next lesson you take a full tour of DevTools: the Elements, Console and Network panels.
