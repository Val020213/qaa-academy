---
title: Roles, labels and accessibility
summary: Learn that every element has a role and an accessible name, and how Playwright uses them to find elements.
duration: 40 min
---

## Goal

- Explain what a role is and name five common roles.
- Explain what an accessible name is.
- Connect a label to an input.
- Explain why roles and names matter for testing.

## Two ways to find an element

A person finds the "Sign in" button by looking at the page. They see a button with the text "Sign in".

A screen reader is a tool that reads the page aloud for people who cannot see it. It cannot look at the page. It asks the browser two questions about each element: what is it, and what is it called?

The answers are the **role** and the **accessible name**. Playwright asks the same two questions.

## Roles

A **role** says what kind of thing an element is. The browser gives most HTML elements a role automatically. You do not write it.

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

Roles are more useful than tag names. A tester says "the Sign in button", not "the button tag".

> **Note:** The password field, `<input type="password">`, is a special case. The HTML standard gives it no role, and Chrome and Edge may show it differently. A `div` or a `span` has no useful role. A tester cannot find such an element by role.

## The accessible name

The **accessible name** is the text that identifies an element. For a button, it is usually its text. For a link, it is its text.

```html
<button type="button" data-testid="report-load">Load report</button>
```

This element is a button with the name "Load report".

For a field, the name usually comes from its label.

## Labels for inputs

A **label** is the text that says what an input is for. A good label does two things: users see it, and the browser links it to the input.

The Practice app wraps each input inside its label:

```html
<label>Email
  <input type="email" name="email" autocomplete="off" data-testid="login-email" />
</label>
```

Because the `input` is inside the `label`, the browser links them. The input has the role textbox and the name "Email".

Another way is to use the `for` and `id` attributes. The `for` value must match the `id` of the input:

```html
<label for="email">Email</label>
<input id="email" type="email" />
```

A placeholder is not a label. A **placeholder** is grey hint text inside an empty input. It disappears when you type. Do not use it as the only name of a field.

## Why this matters for testing

When a field has no label, a screen reader user hears only "edit text". They do not know what to type. This is an accessibility bug. A test also cannot find the field by its label.

A good HTML page is easier to use, and easier to test. Playwright has finders that use roles and names. You will use them in the Playwright module:

```ts
page.getByRole("button", { name: "Sign in" })
page.getByLabel("Email")
```

The first line means: find the button called "Sign in". The second means: find the input whose label is "Email". These lines are only a preview. You do not run them now.

A finder like `getByRole` tests what the user sees. If a developer removes the label, the test fails, and it points to a real problem.

Team convention: the team also puts a `data-testid` on every interactive element. You see it in the next lesson. Roles and `data-testid` work together.

## Roles that are not automatic

Sometimes a developer writes a role by hand with the `role` attribute. The Practice app does this for the error message:

```html
<p class="message message-error" role="alert" data-testid="login-error" hidden></p>
```

A `p` normally has no special role. `role="alert"` tells assistive tools: "this message is important, read it now". It is a good way to show an error.

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
5. Do the same for the Email field. What are its name and role?
6. Do the same for the Password field. What role do you see? It may differ from Email, or be empty.
7. Inspect the checkbox of a test case. Add a case in section 2 first. What is its name?
8. Write a short list: five elements on the page, with role and name.

## Check what you know

1. What are the two questions a screen reader asks about an element?

<details><summary>Answer</summary>

What is it (the role), and what is it called (the accessible name).

</details>

2. What role does `<input type="email">` have?

<details><summary>Answer</summary>

Textbox.

</details>

3. How does the browser link a label to an input?

<details><summary>Answer</summary>

Either the input is inside the label, or the label has a `for` value that matches the `id` of the input.

</details>

4. Why is a placeholder not a good label?

<details><summary>Answer</summary>

It disappears when the user types, and it may not be a reliable name for assistive tools.

</details>

5. This field has a bug for users of a screen reader. Find it.

```html
<input type="email" placeholder="Email" data-testid="login-email" />
```

<details>
<summary>Answer</summary>

The field has no label. The placeholder disappears when the user types, and it is only a hint. A screen reader user may hear only "edit text". The fix is to add a label, for example `<label>Email <input ... /></label>`. Then `getByLabel("Email")` can also find it.

</details>

6. Which version is better, and why? A) `<label>Email</label><input id="email" />` B) `<label for="email">Email</label><input id="email" />`

<details>
<summary>Answer</summary>

B is better. The `for` value matches the `id`, so the browser links the label to the input. A click on the label text moves the cursor to the input, and the input gets the name "Email". In A, the label and the input are only two elements next to each other, and nothing links them.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **What is the accessibility tree, and how is it different from the DOM?**
   - Search for: `accessibility tree MDN`
   - A good answer explains: what the tree contains, who uses it, and one example of an element that appears in the DOM but not in this tree.
2. **What is the first rule of ARIA?**
   - Search for: `first rule of ARIA use native HTML`
   - A good answer explains: the rule in your own words, and why a real `button` is better than a `div` with `role="button"`.
3. **Which accessibility problems can an automated test find, and which problems need a person?**
   - Search for: `automated accessibility testing limitations axe`
   - A good answer explains: one problem a tool finds easily, such as a missing label, and one problem it cannot judge, such as whether a label is clear.

## Next step

In the next lesson you learn CSS selectors and the `data-testid` attribute, the other way to find an element.
