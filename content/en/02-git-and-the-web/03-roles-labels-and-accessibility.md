---
title: Roles, labels and accessibility
summary: Learn that every element has a role and an accessible name, and how Playwright uses them to find elements.
duration: 25 min
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

## Next step

In the next lesson you learn CSS selectors and the `data-testid` attribute, the other way to find an element.
