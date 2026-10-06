---
title: Roles, labels and accessibility
summary: Learn that every element has a role and an accessible name, how labels connect to inputs, and why a div is not a button.
duration: 75 min
---

## Start with a puzzle

A dog shelter site has a green rounded rectangle that says "Adopt Rex". A developer built it like this:

```html
<div class="green-button" onclick="adopt('rex')">Adopt Rex</div>
```

On the page it looks perfect. Now test four ways to use it. A) Click it with the mouse. B) Press the `Tab` key until it is selected. C) Select it, then press `Enter`. D) Ask a screen reader, a program that reads the page aloud, "what is this?"

Which of the four work? What would you expect for a real `<button>` instead of the `div`?

Write down your guess before you read on.

## Goal

- Predict the role and the accessible name of an element from its HTML.
- Connect a label to an input in two ways, and find the mistake when it is not connected.
- Explain why a `div` with a click handler is not a button.
- Decide when a visible text and an `aria-label` should be the same.

## Two ways to find an element

A person finds the "Sign in" button by looking at the page. They see a button with the text "Sign in".

A screen reader cannot look at the page. It asks the browser two questions about each element: what is it, and what is it called? Think about a door in a big building. A sighted visitor sees the picture of a toilet on it. A blind visitor needs a sign in Braille, or someone who tells them.

The answers are the **role** and the **accessible name**. A tool that controls the page, such as Playwright, asks the same two questions.

## Roles

A **role** says what kind of thing an element is. The browser gives most HTML elements a role by itself. You do not write it.

| HTML | Role |
| --- | --- |
| `<button>` | button |
| `<a href="...">` | link |
| `<input type="text">` or `<input type="email">` | textbox |
| `<input type="checkbox">` | checkbox |
| `<select>` | combobox |
| `<h1>` to `<h6>` | heading |
| `<ul>` | list |
| `<li>` | listitem |

A role also says how an element works. People who use a keyboard know that a button reacts to `Enter` and `Space`. They know that a link goes to another page. Both appear on the screen as coloured text, but they are different things.

> **Note:** The password field, `<input type="password">`, is a special case. The HTML standard gives it no role, and Chrome and Edge may show it differently. A `div` or a `span` has no useful role.

### Back to the puzzle

The mouse click (A) works for the `div`, because the developer wrote a click handler. The other three do not work. A `div` is not on the `Tab` path, so B fails, and C fails too. A screen reader finds no role, so it says just "Adopt Rex" as plain text, and it does not say "button" (D). A real `<button>` passes all four tests without extra code. The browser gives it focus, key handling and the role. The `div` looks like a button but nothing else is true. This is why the rule is: use the real element first.

## The accessible name

The **accessible name** is the text that identifies an element. For a button or a link, it is usually its text. Look at these three buttons. Say the name of each one before you read on.

```html
<button>Adopt</button>
<button aria-label="Close">X</button>
<button><svg aria-hidden="true" width="16" height="16"></svg></button>
```

The first button is named "Adopt". The second is named "Close". The `aria-label` attribute gives a name by hand, and it wins over the text "X". The third has no name at all. It holds only a picture. A screen reader says "button" and nothing else. A user cannot tell what it does.

The Practice app has an icon-only button. The theme toggle has this name:

```html
<button data-slot="button" type="button" aria-label="Switch to dark theme"
        title="Switch to dark theme" data-testid="theme-toggle">...</button>
```

It shows a moon icon, and its accessible name is "Switch to dark theme". The `title` can also give a name. If you removed both `aria-label` and `title`, it would be an empty button.

For a field, the name usually comes from its label.

## Labels for inputs

A **label** is the text that says what an input is for. A good label does two things: users see it, and the browser links it to the input.

There are two ways to link them. The first way is to match the `for` value of the label with the `id` of the input. This is how the Practice app login works now:

```html
<label data-slot="label" for="login-email">Email</label>
<input data-slot="input" id="login-email" type="email" name="email"
       autocomplete="off" data-testid="login-email" />
```

The input has the role textbox and the name "Email".

The second way is to put the input inside the label. The Practice app does this for the checkbox of each case:

```html
<label>
  <input type="checkbox" data-testid="cases-toggle-1" />
  <span data-testid="cases-item-title">One</span>
</label>
```

Here the checkbox has the role checkbox and the name "One". Both ways give the same result.

Predict what happens when you click on the text "Email" on the page, and when you click on the text "One". Then try it in the Practice. Clicking a label moves the focus to its input, or ticks the checkbox. This is a visible proof that the link exists. A label that is not linked does nothing when you click it.

A placeholder is not a label. A **placeholder** is grey hint text inside an empty input. It disappears when you type. Do not use it as the only name of a field.

## Roles that are not automatic

Sometimes a developer writes a role by hand with the `role` attribute. The Practice app does this for its messages:

```html
<div data-slot="alert" role="alert" hidden data-testid="login-error"></div>
<div data-slot="alert" role="status" hidden data-testid="login-welcome">...</div>
```

A `div` has no special role. `role="alert"` tells assistive tools: "this is important, read it now". `role="status"` says: "this is information, read it when the user is not busy". An error needs the first. A "you are signed in" note fits the second.

A role does not change how an element works. It only changes what the tools are told.

## Go deeper

### Why it works this way: a second tree

The browser builds the DOM from the HTML. From the DOM, it builds another tree for assistive tools. This is the **accessibility tree**. It keeps only what matters to a user who cannot see: the role, the name and the state of each element, such as checked or disabled. A `div` that only holds layout is left out.

The Accessibility pane in DevTools shows this tree. Playwright finders such as `getByRole` use the same idea. The role and the name are computed from the HTML. Nobody types them in a test.

### A common wrong idea: "I can add `role=button` to a `div`"

You can. A finder will then see a button. But a real `button` does more:

```html
<div role="button">Sign in</div>
<button type="button">Sign in</button>
```

The real `button` can be reached with the `Tab` key, and works with `Enter` and `Space`. The `div` does none of this unless a developer writes extra code. A role only changes what the tool is told. It does not change how the element works. A good rule is: use the real HTML element first.

### A trade-off: role and name, or `data-testid`

A finder by role and name tests what the user sees. It also has a cost, because the name is text:

```ts
await page.getByRole("button", { name: "Sign in" }).click()
await page.getByTestId("login-submit").click()
```

If the button text changes to "Log in", the first line fails. If the site gets another language, it fails again. The second line keeps working, because `data-testid` does not change with the text.

This is why the team puts `data-testid` on every interactive element, and uses `getByTestId` as the normal way to find it. A role finder is a good choice when the name is the thing you want to check. For example, you can check that a field has the right label, because a test with `getByLabel("Email")` fails when the label is removed.

By default, a name matches a part of the text, and does not care about capital letters. So `{ name: "sign" }` also finds "Sign in". This can find too many elements. You will learn how to be exact in module 3.

## Practice

1. Make sure `pnpm dev` is running. Open `http://localhost:5180/#/practice` in Chrome or Edge.
2. Press `F12`. In the Elements tab, right-click the **Sign in** button on the page and choose **Inspect**.
3. Look for the **Accessibility** pane. It is in the right side of the Elements tab, and it can be behind a `>>` menu. Open it.
4. Read the **Name** and **Role** of the button. You should see "Sign in" and "button".
5. Do the same for the Email field. What are its name and role? Click the text "Email" on the page. What happens?
6. Do the same for the Password field. What role do you see? It may differ from Email, or be empty.
7. Inspect the checkbox of a test case. Add a case in section 2 first. What is its name? Click the text of the case. What happens?
8. Inspect the round icon button in the top bar that has the moon or sun. What are its name and role? It shows no text. Where does the name come from?
9. Write a short list: five elements on the page, with role and name.

## Challenge

Build a sign-up form for a world you choose: a library card, a pet adoption request, a pizza order, a football club. It must be a form that a person using only a keyboard and a screen reader can use.

Create the file `exercises/challenges/roles-and-labels.html`. The form needs: two text fields, one `select`, one checkbox, a group of three radio buttons that answer one question, a submit button, and a small icon-only button that closes the form (a plain "✕" is enough). Open the file in Chrome or Edge.

It is done when:

- Each text field, the `select` and the checkbox has a visible label. When you click the label text, the focus moves to the control.
- In the Accessibility pane, the "✕" button has the name "Close", and the other controls show the name of their label.
- You can fill and send the whole form using only `Tab`, `Space`, the arrow keys and `Enter`. You never touch the mouse.
- Inspect the group of radio buttons. The question is its name, not only the text of each answer.
- The first lines of your file are a comment that lists each control with the role and the name that DevTools shows.

You will need something this lesson did not teach: how to name a group of radio buttons. Name the "✕" button the way the theme toggle above is named. Search for: `fieldset legend radio group`, `chrome devtools accessibility pane computed properties`.

## Think it through

1. What do you expect as the role and the name of each of these three elements? Predict, then explain where each name comes from.

```html
<label for="age">Age</label>
<input id="age" type="number" />

<button aria-label="Close">X</button>

<a href="/dogs">See all dogs</a>
```

<details>
<summary>Answer</summary>

The number field is a spinbutton (a number field with up and down steps) with the name "Age". The name comes from the label, because `for="age"` matches `id="age"`. The button is a button with the name "Close", from `aria-label`. The `aria-label` wins over the visible "X". The link is a link with the name "See all dogs", from its own text. If you wrote "textbox" for the first one, remember that the role depends on the input type.

</details>

2. This form looks correct. Clicking on the text "Pet name" does nothing, and a screen reader says only "edit text". Find the bug.

```html
<label for="pet-name">Pet name</label>
<input id="petname" type="text" />
```

<details>
<summary>Answer</summary>

The `for` value is `pet-name`, but the `id` is `petname`. They differ by one hyphen, so the browser finds no input for the label. The label is only text next to a field. There is no error message, because HTML does not complain. The fix is to make both values identical. You can find this kind of mistake by clicking on the label text, or by reading the name in the Accessibility pane.

</details>

3. A close button can be `<button aria-label="Close">X</button>` or `<button>Close</button>`. Both give the accessible name "Close". Which is better here, and what would make you choose the other?

<details>
<summary>Answer</summary>

The second is better when there is room for the word. Everybody sees "Close", and a person who controls the computer by voice can say "click Close". With the first one, the visible text is "X" and the name is "Close", so the voice command may fail. The `aria-label` is the right choice when the design allows only an icon. Then the visible picture and the name must still mean the same thing.

</details>

4. A page has two inputs by mistake, both with `id="email"`. Each has its own label with `for="email"`. What breaks, and for whom?

<details>
<summary>Answer</summary>

An `id` must be unique. The browser links each `for="email"` to the first element with that id. The label of the second field then points to the first field. A click on it moves the focus to the wrong input, and a screen reader gives the second field the wrong name or none. A user who types in it is confused, and nothing shows an error. Fixing it means using two different ids.

</details>

5. Explain to a teammate what an accessible name is. Use three sentences. Do not use the word "label".

<details>
<summary>Answer</summary>

A good answer could be: "The accessible name is the short text that a tool uses to say what an element is called. It comes from the text inside a button, from a text next to a field, or from an attribute written by hand. A person who cannot see the page hears it, and a test can search for it." The reasoning is that a name is the answer to "what is it called?" for someone who does not see the page. It is not a style or a tag name.

</details>

6. A list shows three dogs. Each row has a button that says only "Delete". A screen reader user moves from button to button and hears "Delete, button" three times. What is the problem, and what are two ways to solve it?

<details>
<summary>Answer</summary>

The user cannot tell which dog each button deletes. All three have the same name. One solution is to give each button a more exact name with `aria-label`, such as "Delete Rex". Another is to put the dog's name in the visible text of the button. For a test, a `data-testid` with the id of the row, such as `products-delete-5` in the shop, also tells the buttons apart. The best choice depends on who must tell them apart: a person, a tool, or both.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **What is the accessibility tree, and how is it different from the DOM?**
   - Search for: `accessibility tree MDN`
   - Try it: in DevTools, select a `div` that only holds layout, and a `button`. Look at both in the Accessibility pane. Which one is missing from the tree or has no role?
   - A good answer explains: what the tree contains, who uses it, and one example of an element that appears in the DOM but not in this tree.
2. **What is the first rule of ARIA?**
   - Search for: `first rule of ARIA use native HTML`
   - Try it: write a `div role="button"` in a small file. Try to reach it with `Tab` and press `Enter`. Count how many lines of code you need to make it behave like a real button.
   - A good answer explains: the rule in your own words, and why a real `button` is better than a `div` with `role="button"`.
3. **Which accessibility problems can an automated test find, and which problems need a person?**
   - Search for: `automated accessibility testing limitations axe`
   - Try it: in Chrome DevTools, open the **Lighthouse** panel and run an Accessibility audit on the Practice page. Write down three results. For each, say if a tool or a person must judge it.
   - A good answer explains: one problem a tool finds easily, such as a missing label, and one problem it cannot judge, such as whether a label is clear.

## Next step

In the next lesson you learn CSS selectors and the `data-testid` attribute, the other way to find an element.
