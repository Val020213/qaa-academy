---
title: Roles, labels and accessibility
duration: 60 min
---

## Goal

In this lesson you identify the role and accessible name of controls on a page. You also check that their labels are connected and that the controls work with a keyboard.

- Recognize an element's role and accessible name from its HTML.
- Connect a label to an input in two ways and detect an incorrect connection.
- Distinguish an HTML button's behavior from a `div` with a role or a click handler.
- Choose between visible text and `aria-label` to name a button.

## Roles

A **role** identifies the type of element: button, link, text field or checkbox. The browser derives the role from the HTML and communicates it to assistive tools, such as screen readers that read the page aloud.

The browser assigns these roles without you having to write them:

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

The role helps users recognize how a control works. A button responds to `Enter` and `Space`; a link takes users to another page.

> **Note:** The password field, `<input type="password">`, is a special case. It has no implicit ARIA role in HTML, but Chromium exposes it as textbox in its accessibility tree. A layout `div` or `span` can appear as generic, without a control's function.

## Use the HTML button

This element has a click handler and can look like a button:

```html
<div class="green-button" onclick="adopt('rex')">Adopt Rex</div>
```

A mouse click works because it runs the handler. The browser does not include this `div` in the `Tab` sequence or activate it with `Enter` or `Space`. The element contains the text "Adopt Rex", but has no button role.

Adding a role does not add button behavior either:

```html
<div role="button">Sign in</div>
<button type="button">Sign in</button>
```

The browser lets users reach the `button` with `Tab` and activate it with `Enter` and `Space`. The `div` with `role="button"` communicates the role, but needs extra code to receive focus and respond to the keyboard. Use the native HTML element first.

## The accessible name

The **accessible name** is the text that identifies an element for assistive tools. For a button or a link, it usually comes from the element's text:

```html
<button>Adopt</button>
<button aria-label="Close">X</button>
<button><svg aria-hidden="true" width="16" height="16"></svg></button>
```

The first button is named "Adopt". The second is named "Close": `aria-label` gives an explicit name that takes priority over the text "X". The third has no name because its only content is a picture hidden from assistive tools. Assistive tools receive the button role without a name that says what it does.

When there is room, `<button>Close</button>` shows the same name a screen reader user hears. With `<button aria-label="Close">X</button>`, the visible text and name differ, so a voice command may fail. Use `aria-label` when the design allows only an icon, and make the picture and name mean the same thing.

With the site in English and the light theme active, the theme toggle button has this HTML:

```html
<button data-slot="button" type="button" aria-label="Switch to dark theme"
        title="Switch to dark theme" data-testid="theme-toggle">...</button>
```

It shows a moon icon and its accessible name is "Switch to dark theme". The `title` can also give a name. If you removed both `aria-label` and `title`, it would still show the icon, but have no accessible name.

The name should also help users tell controls apart. If three dog rows have buttons that say "Delete", a screen reader announces the same name three times. You can include the dog's name in the visible text or give a more precise name with `aria-label`, such as "Delete Rex".

## Labels for inputs

A **label** says what an input is for. As well as displaying the text, the browser must connect the label to the control to give it an accessible name.

The first way is to match the label's `for` value with the input's `id`. The Practice app login does this:

```html
<label data-slot="label" for="login-email">Email</label>
<input data-slot="input" id="login-email" type="email" name="email"
       autocomplete="off" data-testid="login-email" />
```

The input has the role textbox and the name "Email".

The second way is to put the input inside the label. The Practice app does this for each case's checkbox:

```html
<label>
  <input type="checkbox" data-testid="cases-toggle-1" />
  <span data-testid="cases-item-title">One</span>
</label>
```

The checkbox has the role checkbox and the name "One". Clicking a connected label moves focus to the input or ticks the checkbox. Clicking an unconnected label does nothing.

A **placeholder** is hint text inside an empty input. It disappears when you type, so do not use it as a field's only name.

## Explicit roles

The `role` attribute lets developers write a role when the element does not have it automatically. The Practice app uses it for messages:

```html
<div data-slot="alert" role="alert" hidden data-testid="login-error"></div>
<div data-slot="alert" role="status" hidden data-testid="login-welcome">...</div>
```

`role="alert"` gives message updates urgent announcement priority; `role="status"` requests announcements without interrupting current speech. The app uses the first for the login error and the second to confirm sign-in. Choose the priority by urgency, rather than simply because a message is an error.

## Go deeper

### The accessibility tree

From the DOM, the browser builds the **accessibility tree** for assistive tools. It exposes roles, names and states, such as checked or disabled, to screen readers and other assistive tools. It can include generic containers; it does not reproduce every DOM node.

![Three HTML controls and the roles, names and state the browser exposes to assistive tools.](/images/02-dom-accessibility.en.svg)

The Accessibility pane in DevTools shows this tree. The browser computes the role and name from the HTML.

## Practice

1. Make sure `pnpm dev` is running. Open `http://localhost:5180/#/practice` in Chrome or Edge.
2. Press `F12`. Right-click the **Sign in** button on the page and choose **Inspect** to see it in the Elements tab.
3. Open the **Accessibility** pane on the right side of Elements. It may be behind the `>>` menu.
4. Read the button's **Name** and **Role**. You should see "Sign in" and "button".
5. Inspect the Email field and read its name and role. Click the text "Email" and check that the field receives focus.
6. Inspect the Password field and read its role. In Chromium it appears as textbox, with the name "Password"; other browsers may expose it differently.
7. Add a case in section 2 and inspect its checkbox. Read its name and click the case text to check that the checkbox changes.
8. Inspect the moon or sun button in the top bar. Read its name and role, and find the attribute that gives it a name.
9. Write a list of five elements on the page with their role and name.

## Challenge

Build a sign-up form that works with a keyboard and a screen reader. Choose the subject: a library card, pet adoption, a pizza order or a football club.

Create `exercises/challenges/roles-and-labels.html` with two text fields, one `select`, one checkbox, three radio buttons that answer one question, a submit button and a button with the "✕" icon to close the form. Open it in Chrome or Edge.

It is done when:

- Each text field, the `select` and the checkbox has a visible label that moves focus to the control when clicked.
- In Accessibility, the "✕" button is named "Close" and the other controls show their label's name. The radio group has the question as its name.
- You can fill and submit the form using only `Tab`, `Space`, the arrow keys and `Enter`.
- A comment at the start of the file lists each control with the role and name DevTools shows.

You will need something this lesson did not teach: how to name a group of radio buttons. Name the "✕" button the way the theme toggle above is named. Search for: `fieldset legend radio group`, `chrome devtools accessibility pane computed properties`.

## Think it through

1. What role and name does each element have, and where does each name come from?

```html
<label for="age">Age</label>
<input id="age" type="number" />

<button aria-label="Close">X</button>

<a href="/dogs">See all dogs</a>
```

<details>
<summary>Answer</summary>

The number field has the role spinbutton and the name "Age", because `for="age"` matches `id="age"`. The button has the role button and the name "Close", from `aria-label`. The link has the role link and the name "See all dogs", from its text. The input type determines its role.

</details>

2. Clicking "Pet name" does nothing and the field has no accessible name. Find the bug.

```html
<label for="pet-name">Pet name</label>
<input id="petname" type="text" />
```

<details>
<summary>Answer</summary>

The `for` value is `pet-name`, but the `id` is `petname`. The browser cannot find the input for the label because the values differ by one hyphen. Make both values identical. You can detect the error by clicking the label or reading the name in Accessibility.

</details>

3. A page has two inputs with `id="email"`. Each has its own label with `for="email"`. What breaks, and for whom?

<details>
<summary>Answer</summary>

The browser connects both labels to the first element with that id. Clicking the second label moves focus to the wrong field, and the second field receives an incorrect name or none. Use two distinct ids so each label points to its own field.

</details>

## Next step

In the next lesson you learn CSS selectors and the `data-testid` attribute, the other way to find an element.
