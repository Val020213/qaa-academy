---
title: CSS selectors and data-testid
summary: Write simple CSS selectors, see why class names break tests, and use the team data-testid convention.
duration: 30 min
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

## Next step

In the next lesson you take a full tour of DevTools: the Elements, Console and Network panels.
