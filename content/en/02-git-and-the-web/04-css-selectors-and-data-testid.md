---
title: CSS selectors and data-testid
duration: 55 min
---

## Goal

In this lesson you select DOM elements with CSS selectors and check their matches in the browser console.

- Combine selectors by tag, class, id and attribute.
- Distinguish descendants, direct children and siblings.
- Write `data-testid` names that follow the team convention.
- Check how many elements a selector matches and distinguish a search with no results from a syntax error.

## The four basic selectors

A **CSS selector** describes which DOM elements you want to find. The browser matches its conditions against tags, attributes and relationships between elements.

This element has a tag, two classes, an id and an attribute:

```html
<li class="dog old" id="bo" data-age="old">Bo</li>
```

| Selector | Meaning | Matches |
| --- | --- | --- |
| `li` | by tag | every `li` on the page |
| `.dog` | by class | every element with the class `dog` |
| `#bo` | by id | the one element with `id="bo"` |
| `[data-age="old"]` | by attribute | every element with `data-age="old"` |

A class starts with a dot. An id starts with `#`. An attribute goes in square brackets.

## Combining selectors

We will use this list to compare matches:

```html
<ul>
  <li class="dog">Rex</li>
  <li class="dog old">Bo</li>
  <li class="cat">Luna</li>
</ul>
```

Without a space, the conditions apply to the same element:

```text
li.dog
input[type="password"]
```

The first matches an `li` that also has the class `dog`. The second matches an `input` whose type is `password`.

A space means that the element is inside another element, at any depth:

```text
ul .dog
```

It matches elements with the class `dog` inside a `ul`. Compare these three forms:

```text
.dog
.dog.old
.dog .old
```

`.dog` matches Rex and Bo: two elements. `.dog.old` matches only Bo, which has both classes. `.dog .old` matches nothing: Bo has both classes, but is not inside another element with the class `dog`.

## Children, siblings and exclusions

`>` selects a direct child, one level below its parent. A space allows any depth. `+` selects the element immediately after another element with the same parent.

```text
.dog + .cat
li:not(.dog)
```

The first matches `Luna`, because that element with the class `cat` comes immediately after one with the class `dog`. The second also matches `Luna`: `:not(.dog)` excludes elements with the class `dog`.

## Classes and positions in a selector

Classes are used for styling. If the team renames `.dog` to `.pet-card`, the selector `.dog` stops finding elements even though the feature still works the same way.

Classes also repeat. A selector that matches many elements is not safe.

The course apps use Tailwind. Their classes express styling rules, as in the Sign in button:

```html
<button class="group/button inline-flex shrink-0 items-center ..." data-slot="button"
        type="submit" data-testid="login-submit">Sign in</button>
```

These classes can change when the appearance changes. The attribute `data-slot="button"` is also on links that look like buttons, so it does not identify a `button` tag.

A selector based on position can pick a different element if someone adds a row before it. For example, "the third `div` inside the second `div`" depends on that structure.

A good selector is stable. It changes only when the feature changes, not when the design changes.

## data-testid and the team convention

The **`data-testid`** attribute exists only for tests. It has no effect on how the page looks. Any name that starts with `data-` is allowed by HTML.

```html
<button type="submit" data-testid="login-submit">Sign in</button>
```

Select it by its attribute:

```text
[data-testid="login-submit"]
```

A `data-testid` is a promise between the developer and the tester: "this name will stay, so your test can rely on it". This is why a test that uses it breaks only when the feature changes.

The team follows these rules:

- Every interactive element has a `data-testid`: buttons, inputs, links, checkboxes and selects.
- The name starts with the feature and ends with the element.
- Names are in lowercase, with words separated by hyphens.

Examples from the Practice app: `login-email`, `login-password`, `login-submit`, `cases-input`, `cases-add`, `report-load`.

Elements that repeat, such as rows, include the id of the row at the end:

- `cases-delete-1` is the Delete button of case 1.
- `cases-toggle-3` is the checkbox of case 3.
- In the practice shop, `products-row-5` is the row of product 5, and `products-delete-5` is its Delete button.

The id comes from the data, so the name follows the case or product even when its position on the screen changes.

## Try selectors in the console

In the DevTools **Console** you can run JavaScript against the page's DOM:

- `document.querySelector("...")` returns the first matching element, or `null` if there are no matches.
- `document.querySelectorAll("...")` returns a list of all matching elements.

```text
> document.querySelector('[data-testid="login-submit"]')
<button data-slot="button" type="submit" data-testid="login-submit">Sign in</button>

> document.querySelectorAll("button").length
6
```

The Practice page has 6 `button` elements when no case exists: the language button, the theme button, Sign in, Sign out (hidden until you sign in), Add and Load report. Every case adds one Delete button.

Put the whole selector in quotes. Use single quotes outside when the selector has double quotes inside.

The `^=` operator matches values that start with the specified text:

```text
document.querySelectorAll('[data-testid^="cases-delete-"]')
```

It finds all Delete buttons in the case list, whatever the id.

### Valid syntax and searches with no results

A valid selector can match zero elements. If the syntax is invalid, the browser throws an error:

```text
> document.querySelector("###")
Uncaught SyntaxError: Failed to execute 'querySelector' on 'Document': '###' is not a valid selector.
```

Consult the [MDN documentation for `querySelector`](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector). Find its input, return value and exceptions: a search with no matches returns `null`; an invalid selector throws a `SyntaxError`.

## Go deeper

### Generated ids can change

An `id` is meant to be unique. But some tools create ids by themselves, with names like `:r1:`. They can change when the page gets one more element before it. A stable name that a person chose, and agreed on, is better than a name a machine made.

### One match depends on the data present

This selector matches one element when there is one case and two when there are two cases:

```text
[data-testid^="cases-delete-"]
```

The count is right only for this moment. A good selector is exact, such as `cases-delete-2`, and you know why it matches.

## Practice

1. Open `http://localhost:5180/#/practice`. Press `F12` and open the **Console** tab.
2. Run each selector and write down how many elements it matches. You should see 6, a number bigger than 6, 1 and 1. The second number includes links in the top bar and side menu with `data-slot="button"`:

```text
document.querySelectorAll("button").length
document.querySelectorAll('[data-slot="button"]').length
document.querySelectorAll('[data-testid="login-submit"]').length
document.querySelectorAll('input[type="password"]').length
```

3. Add three cases in section 2: "One", "Two" and "Three".
4. Run this and check the number of Delete buttons:

```text
document.querySelectorAll('[data-testid^="cases-delete-"]').length
```

5. Select the Delete button of the second case, click it from the console and check that "Two" disappeared:

```text
document.querySelector('[data-testid="cases-delete-2"]').click()
```

6. Try a selector that does not exist, such as `[data-testid="cases-delete-99"]`. Read the result.
7. Run `document.querySelector("###")`. Compare the error with the result of step 6.

## Challenge

Add three cases, "One", "Two" and "Three", and tick the checkbox of "Two". Write a selector for each goal:

1. The checkboxes that are not ticked.
2. The Delete button inside the ticked row.
3. The row immediately after the ticked row.
4. The title text of the ticked row.

Create the file `exercises/challenges/css-selectors.txt`. Write one line per goal: the selector, the count you expect, and the count you got.

It is done when:

- You ran each selector in the Console with `document.querySelectorAll("...").length` and you wrote down the real count. The counts are 2, 1, 1 and 1.
- No selector uses a class, an id number such as `cases-delete-2`, or a position such as `nth-child`.
- Each selector still works if the ticked case is "Three" instead of "Two" (tick another one and run them again; the counts stay right for that new state).

You will need something this lesson did not teach: a way to select by a state such as ticked. Search for: `css :checked pseudo-class` and `css :not selector`. For "the row right after", use the `+` selector from earlier in this lesson.

## Think it through

1. Two cases are on the page. What do these lines print, and why?

```text
document.querySelectorAll('[data-testid="cases-delete"]').length
document.querySelectorAll('[data-testid^="cases-delete"]').length
```

<details>
<summary>Answer</summary>

The first prints `0`: no element has exactly the name `cases-delete`. The second prints `2`, because the names `cases-delete-1` and `cases-delete-2` start with `cases-delete`.

</details>

2. A test looks for the Delete button of the case with id 2. What breaks after deleting the first case if it uses `.cases li:nth-child(2) button` instead of `[data-testid="cases-delete-2"]`?

<details>
<summary>Answer</summary>

The position of the second `li` changes after deleting the first row, so the selector can pick another case or find nothing. The name `cases-delete-2` follows the data id. A position selector can be useful for checking which case occupies the second row after sorting.

</details>

3. The page has no cases. What does `document.querySelector('[data-testid="cases-item"]')` return, and what happens with `document.querySelector('[data-testid="cases-item"]').click()`?

<details>
<summary>Answer</summary>

The search returns `null`. The call to the click method fails with an error such as `Cannot read properties of null (reading 'click')`, because it tries to use `null` as if it were an element.

</details>

## Next step

In the next lesson you take a full tour of DevTools: the Elements, Console and Network panels.
