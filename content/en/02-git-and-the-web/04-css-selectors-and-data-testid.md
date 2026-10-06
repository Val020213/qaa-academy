---
title: CSS selectors and data-testid
summary: Write CSS selectors, see why class names make fragile choices, and follow the team data-testid convention.
duration: 80 min
---

## Start with a puzzle

A dog shelter page has this list:

```html
<ul>
  <li class="dog">Rex</li>
  <li class="dog old">Bo</li>
  <li class="cat">Luna</li>
</ul>
```

Three selectors will search this page. How many elements does each one match?

```text
.dog
.dog.old
.dog .old
```

The last two differ only by one space. The numbers are not all the same.

Write down your guess before you read on.

## Goal

- Predict how many elements a selector matches before you run it.
- Choose a stable selector and explain why a class or a position is fragile.
- Write a `data-testid` name that follows the team rule.
- Check a selector in the DevTools Console, and read the error when it is wrong.

## What is a selector?

A **selector** is a short piece of text that describes which elements you want in the DOM. The browser and Playwright both understand CSS selectors. CSS is the language that styles a page, such as colours and sizes. Its selectors are also used to find elements.

Think of a school. The words "all students", "all students in class 5B" and "the student with number 17" are three different selectors. Each one picks a different group of people from the same school.

## The four basic selectors

Here is one element from the shelter list:

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

Now you can answer the puzzle. Write selectors with no space to say "all of these at once":

```text
li.dog
input[type="password"]
```

The first matches an `li` that also has the class `dog`. The second matches an `input` whose type is `password`. So `.dog.old` means "an element that has both classes". It matches only Bo. The answer for `.dog` is 2 (Rex and Bo).

Write a space to say "inside":

```text
ul .dog
```

This means: an element with the class `dog` somewhere inside a `ul`. So `.dog .old` means "an element with the class `old` that is inside an element with the class `dog`". Bo has `old` itself, but it is not inside another `dog`. No element matches. The third answer is 0.

### Back to the puzzle

The answers are 2, 1 and 0. A space or no space changes the meaning from "both at once" to "inside". In a test, a wrong count is not always an error message. A selector with a mistake can match nothing, or match too many, and nothing warns you.

## Two more symbols

Two small symbols are common. The `>` means "a direct child". The `+` means "the next sibling". A sibling is an element with the same parent. Try to predict how many elements each of these matches in the shelter list:

```text
.dog + .cat
li:not(.dog)
```

The first matches `Luna`, because the cat comes right after a dog. The second matches `Luna` too, because `:not(.dog)` means "without the class `dog`". Both answers are 1. You can test these in the Console.

## Why classes break

The class names are there for styling. A designer can rename or remove a class on any day, and the page works the same for the user. The test breaks. Imagine that the designer renames `.dog` to `.pet-card`. The selector `.dog` finds nothing.

There is a second problem: classes repeat. A selector that matches many elements is not safe.

A third problem is in the real apps of this course. They use Tailwind, a tool that writes the style in the class itself. The class of the Sign in button starts like this:

```html
<button class="group/button inline-flex shrink-0 items-center ..." data-slot="button"
        type="submit" data-testid="login-submit">Sign in</button>
```

These classes are not names for a feature. They are style words such as "inline flex" and "shrink-0". They change when someone changes the look. The attribute `data-slot="button"` is also for styling. It is on links that look like buttons too, so it does not mean "this is a `button` element".

Selectors based on position are worse. A selector like "the third `div` inside the second `div`" breaks when someone adds one element.

A good selector is stable. It changes only when the feature changes, not when the design changes.

## data-testid

The **`data-testid`** attribute exists only for tests. It has no effect on how the page looks. Any name that starts with `data-` is allowed by HTML.

```html
<button type="submit" data-testid="login-submit">Sign in</button>
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

The id comes from the data, so the name follows the data and not the position on the screen.

## Try selectors in the console

The DevTools **Console** lets you run one line of JavaScript on the page. Two commands help you test selectors:

- `document.querySelector("...")` returns the first element that matches. It returns `null` if nothing matches.
- `document.querySelectorAll("...")` returns all matching elements, as a list.

```text
> document.querySelector('[data-testid="login-submit"]')
<button data-slot="button" type="submit" data-testid="login-submit">Sign in</button>

> document.querySelectorAll("button").length
6
```

The Practice page has 6 `button` elements when no case exists: the language button, the theme button, Sign in, Sign out (hidden until you sign in), Add and Load report. Every case adds one Delete button.

Put the whole selector in quotes. Use single quotes outside when the selector has double quotes inside.

There is also a pattern for "starts with". The `^=` operator matches the start of the value:

```text
document.querySelectorAll('[data-testid^="cases-delete-"]')
```

This finds every Delete button of the case list, whatever the id.

When you write a test, check the selector first. If `querySelectorAll` gives exactly one element, the selector matches one element. But "one today" is not "right for ever". Ask also why it matches.

### Read the documentation like a scanner

You do not need to read a whole documentation page. Scan it for three things. First, the **signature**: the name and the input, such as `querySelector(selectors)`. Second, the **return value**: what you get back. Third, the **edge cases**: what happens when it goes wrong.

Open the MDN page for `querySelector`. Find the three parts. Then check one edge case with an experiment:

```text
> document.querySelector("###")
Uncaught SyntaxError: Failed to execute 'querySelector' on 'Document': '###' is not a valid selector.
```

A selector that is valid but matches nothing gives `null`. A selector that is not valid is a different thing: it stops with a `SyntaxError`.

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

Be careful. DRY has a counterweight: **KISS** (Keep It Simple) and **YAGNI** ("You Aren't Gonna Need It": do not build for needs you only imagine). A generic function such as `testId(feature, element, id?, suffix?)` that can build any name is too much. You do not need it today. In tests, a clear story is more important than removing every repeat. `page.getByTestId("cases-delete-2")` in one test is easy to read. A helper is worth it when many tests use the same name, or when the name has a rule, as here.

## Practice

1. Open `http://localhost:5180/#/practice`. Press `F12` and open the **Console** tab.
2. Predict, then run each selector. Write down how many elements it matches, using `.length`. You should see 6, a number bigger than 6, 1 and 1. The page has 6 `button` elements. The second number is bigger because links in the top bar and the side menu also carry `data-slot="button"`:

```text
document.querySelectorAll("button").length
document.querySelectorAll('[data-slot="button"]').length
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
8. Run `document.querySelector("###")`. Read the error. Compare it with step 7.

## Challenge

The Practice page has a list of cases, and you can tick them. Your task is to write selectors that pick exactly the elements below, using only a selector (no counting in JavaScript, no position numbers).

First add three cases, "One", "Two" and "Three", and tick the checkbox of "Two". Then write one selector for each of these goals:

1. Only the checkboxes that are **not** ticked.
2. Only the Delete button inside the ticked row.
3. Only the row that comes **right after** the ticked row.
4. Only the title text of the ticked row.

Create the file `exercises/challenges/css-selectors.txt`. Write one line per goal: the selector, the count you expect, and the count you got.

It is done when:

- You ran each selector in the Console with `document.querySelectorAll("...").length` and you wrote down the real count. The counts are 2, 1, 1 and 1.
- No selector uses a class, an id number such as `cases-delete-2`, or a position such as `nth-child`.
- Each selector still works if the ticked case is "Three" instead of "Two" (tick another one and run them again; the counts stay right for that new state).
- Below the four lines, you wrote two sentences that explain which one of your selectors you trust least, and why.

You will need something this lesson did not teach: a way to select by a state such as ticked. Search for: `css :checked pseudo-class` and `css :not selector`. For "the row right after", use the `+` selector from earlier in this lesson.

## Think it through

1. Two cases are on the page. Predict what these two lines print, and say why.

```text
document.querySelectorAll('[data-testid="cases-delete"]').length
document.querySelectorAll('[data-testid^="cases-delete"]').length
```

<details>
<summary>Answer</summary>

The first prints `0`. The name `cases-delete` is exact, and no element has exactly this name. The real names are `cases-delete-1` and `cases-delete-2`. The second prints `2`, because `^=` means "starts with", and both names start with `cases-delete`. A small difference in the symbol changes the meaning from "equals" to "starts with".

</details>

2. A selector is written for the shelter list. It runs without error and matches one element, but it is the wrong one. Find the bug.

```html
<ul>
  <li class="dog">Rex</li>
  <li class="dog old">Bo</li>
</ul>
```

```text
.dog:first-child
```

The goal: the old dog.

<details>
<summary>Answer</summary>

The selector means "the first child that has the class `dog`". That is Rex, not Bo. The goal needed the class `old`, or the attribute `data-age="old"`. The selector `.dog.old` would find Bo. The bug is that the selector depends on position. If a new dog is added at the top, the same selector gives a different dog. A selector that matches one element is not the same as a selector that matches the right element.

</details>

3. For the Delete button of the case with id 2, which selector is better? A) `.cases li:nth-child(2) button` B) `[data-testid="cases-delete-2"]`. Say what would make you choose the other.

<details>
<summary>Answer</summary>

B is better. In A, the number 2 is a position. If the first case is deleted, or the filter hides a case, the second `li` is a different case. In B, the number 2 is the id of the case, and it does not move. A may be right when the real question is "the second row on the screen", for example in a test of sorting. The choice depends on whether you care about the data or about the place.

</details>

4. The team decides to change every `data-testid` from `login-submit` style to camelCase, such as `loginSubmit`. What breaks, and what does this show about the name?

<details>
<summary>Answer</summary>

Every test that uses the old names breaks, and nothing in the page looks different. The name is a promise between developer and tester, so changing it breaks the promise. It also shows why the team fixes the rules for names early, and why tests use a single place for names that repeat. A rename is not wrong, but it must be a decision of the team and a change in all places at once.

</details>

5. Explain to a teammate why a class such as `.button` is a bad choice for a test. Use three sentences. Do not use the word "design".

<details>
<summary>Answer</summary>

A good answer could be: "A class is there so the page looks right, and someone can change it on any day without changing what the page does. Many elements can share the same class, so the selector may match too much. A `data-testid` has no other purpose, so it changes only when the feature changes." The reasoning has two parts: the class changes for unrelated reasons, and the class is not unique.

</details>

6. A page has no case yet. What does `document.querySelector('[data-testid="cases-item"]')` return? And what does this line do: `document.querySelector('[data-testid="cases-item"]').click()`?

<details>
<summary>Answer</summary>

The first line returns `null`, because nothing matches. The second line stops with an error such as `Cannot read properties of null (reading 'click')`. The empty list is an edge case. `querySelector` does not give an error when it finds nothing. The error comes one step later, when the code uses the `null` as if it was an element. When a script breaks like this, ask first: did the selector find anything?

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **What is CSS specificity, and why does one rule win over another?**
   - Search for: `CSS specificity MDN`
   - Try it: in a small HTML file, write one rule with `p` and one with `.note`, both setting the colour. Give a paragraph the class `note`. Which colour wins? Then add `#top` to the paragraph and a rule for it. Look at the Styles pane to see the crossed-out rules.
   - A good answer explains: how id, class and tag selectors are ranked, with one small example.
2. **What is the difference between a descendant selector (a space) and a child selector (`>`)?**
   - Search for: `CSS combinators descendant child selector`
   - Try it: in a small HTML file, put a `ul` with a nested `ul`. Count the `li` elements matched by `ul li` and by `ul > li` in the Console.
   - A good answer explains: both forms with a small HTML example, and which elements each one matches.
3. **Why does the Playwright documentation recommend user-facing locators over CSS selectors, and when do teams still use `data-testid`?**
   - Search for: `playwright best practices locators`
   - Try it: on the Practice page, find the Sign in button in three ways in the Console: by `data-testid`, by its text with `[...document.querySelectorAll("button")].find((b) => b.textContent === "Sign in")`, and by `button[type="submit"]`. Change the button text in the Elements panel. Which ways still work?
   - A good answer explains: the reason for the advice, and one situation where a test id is the better choice.

## Next step

In the next lesson you take a full tour of DevTools: the Elements, Console and Network panels.
