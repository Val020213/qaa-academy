---
title: HTML and the DOM
summary: Read HTML tags, attributes and nesting, and understand the DOM tree that a test uses to find elements.
duration: 40 min
---

## Goal

- Explain what HTML is and read a small piece of it.
- Name the parts of an element: tag, attributes and content.
- Explain what the DOM is and how it differs from the HTML file.
- Say why a test needs the DOM.

## What is HTML?

**HTML** is the language that describes what is on a web page. It says "here is a heading", "here is a button", "here is a text field".

HTML is not a programming language. It does not make decisions. It only describes the page.

## Tags, attributes and content

HTML is made of **elements**. An element usually has an opening tag, content and a closing tag.

```html
<button type="submit" data-testid="login-submit">Sign in</button>
```

Read it in parts:

- `<button>` is the opening **tag**. It says what kind of element this is.
- `Sign in` is the **content**. It is the text the user sees.
- `</button>` is the closing tag. It has a slash.
- `type="submit"` and `data-testid="login-submit"` are **attributes**. An attribute is extra information about the element. It has a name and a value in quotes.

Some elements have no content and no closing tag. The text field is one of them:

```html
<input type="email" name="email" data-testid="login-email" />
```

## Nesting

Elements can be inside other elements. This is called **nesting**. The outer element is the **parent**. The inner elements are its **children**.

This is the login form of the Practice app. It is copied from `src/views/playground.ts`:

```html
<form class="form" data-testid="login-form" novalidate>
  <label>Email
    <input type="email" name="email" autocomplete="off" data-testid="login-email" />
  </label>
  <label>Password
    <input type="password" name="password" data-testid="login-password" />
  </label>
  <button type="submit" class="button" data-testid="login-submit">Sign in</button>
</form>
```

The `form` is the parent. It has three children: two `label` elements and one `button`. Each `label` has one child: an `input`.

The indentation helps you see the nesting. The browser does not need it.

## From HTML to the DOM

The browser reads the HTML and builds a **tree** in memory. A tree is a structure where each element has a parent and children, like a family tree. This tree is the **DOM**. DOM means Document Object Model.

For the form above, the tree looks like this:

```text
form
├── label
│   └── input (email)
├── label
│   └── input (password)
└── button
```

The DOM is not the same as the HTML file. The HTML file is the starting point. After the page loads, code can add, remove and change elements. The DOM changes, and the HTML file does not.

The Practice app shows this well. When you add a test case to the list, the app creates a new `li` element in the DOM. You will not find that `li` in the HTML file. It exists only in the DOM.

> **Note:** The course site builds its pages with code. If you use "View page source" in the browser, you see an almost empty page. The real page is in the DOM. Use the Elements panel of DevTools to see it. The next lessons explain DevTools.

## Hidden elements

The Practice app has an error message that is not visible at first:

```html
<p class="message message-error" role="alert" data-testid="login-error" hidden></p>
```

The `hidden` attribute has no value. It tells the browser not to show the element. The element is still in the DOM. When you type a wrong password, the app removes `hidden` and the message appears.

A test must know this difference. An element can be in the DOM and not be visible.

## Why testers care

A user finds a button with their eyes. A test cannot see. A test finds an element by searching the DOM tree.

Playwright asks questions like these:

- Find the element with `data-testid="login-submit"`.
- Find the button with the text "Sign in".
- Find the input with the label "Email".

If the HTML is clear, these questions are easy. If the HTML is messy, the test is hard to write. When you understand the DOM, you can explain why a test cannot find an element.

## Go deeper

### Why it works this way: the DOM is live

The HTML file is text. The DOM is a set of live objects in the memory of the browser. Code in the page can change these objects at any time. Playwright does not read your HTML file. It asks the browser about the live DOM. So a test sees what the page looks like now, not what the file said at the start.

### A common wrong idea: "if the element exists, the user can see it"

The error message in the Practice app is in the DOM from the first moment, with the `hidden` attribute. A test that only checks "does it exist" proves nothing about what the user sees. Here is the right check, as it will look in the Playwright module:

```ts
await expect(page.getByTestId("login-error")).toBeHidden()
await page.getByTestId("login-submit").click()
await expect(page.getByTestId("login-error")).toBeVisible()
```

The form is empty when we click, so the app shows "Enter your email and password." Visible and hidden are states of an element that is in the DOM. Test the state the user can see.

### How it shows up in real QA work: elements that are replaced

Open the Practice app, add one case, and run this in the Console:

```text
> const first = document.querySelector('[data-testid="cases-item"]')
> document.querySelector('[data-testid="cases-toggle-1"]').click()
> first.isConnected
false
```

`isConnected` tells you if an element is still in the page. It is `false`. When you tick the checkbox, the app redraws the whole list. It removes the old `li` elements and creates new ones that look the same. Your variable `first` still points to the old element, which is no longer on the page.

This is a real problem in test code. A test must not keep a reference to one element and use it later. Playwright solves this: a **locator** is not an element. It is a description, such as "the element with this `data-testid`". Playwright searches the DOM again each time you use it. You will learn locators in module 3.

Remember: the page can replace elements while a user looks at them, and they look the same. Your test should describe what to find, and not hold one element.

## Practice

1. Start the course site in a terminal inside VS Code:

```bash
pnpm dev
```

2. Open `http://localhost:5180/#/practice` in Chrome or Edge.
3. Press `F12` to open DevTools. Click the **Elements** tab.
4. Find the line `<form class="form" data-testid="login-form" ...>`. Click the small arrow to open and close it.
5. Right-click the Email field on the page and choose **Inspect**. DevTools selects its line in the Elements tab. What are its `type` and `data-testid`?
6. In the page, type a wrong email and password, then click **Sign in**. In the Elements tab, find the line with `data-testid="login-error"`. The `hidden` attribute is now gone.
7. Add two test cases in section 2. Find the `ul` with `data-testid="cases-list"`. Open it and count its `li` children.

## Check what you know

1. What is an attribute? Give an example.

<details><summary>Answer</summary>

Extra information about an element, written as name and value. Example: `type="submit"`.

</details>

2. What is the DOM?

<details><summary>Answer</summary>

The tree of elements that the browser builds in memory from the HTML. Code can change it after the page loads.

</details>

3. A test adds a case to the list. Is the new `li` in the HTML file?

<details><summary>Answer</summary>

No. It is only in the DOM. The app created it after the page loaded.

</details>

4. Can an element be in the DOM but not visible?

<details><summary>Answer</summary>

Yes. For example, an element with the `hidden` attribute is in the DOM but the user does not see it.

</details>

5. A test opens the Practice app and checks that the element `login-error` exists in the DOM. The check passes. Does it prove that the user sees an error message? Why?

<details>
<summary>Answer</summary>

No. The element is in the DOM from the start, with the `hidden` attribute. It exists, but the user cannot see it. The check passes even when no error was shown. A good test checks that the element is visible, and checks its text.

</details>

6. Look at this HTML. How many children does the outer `ul` have? Where is `C`?

```html
<ul>
  <li>A</li>
  <li>B
    <ul>
      <li>C</li>
    </ul>
  </li>
</ul>
```

<details>
<summary>Answer</summary>

The outer `ul` has two children: the `li` with A and the `li` with B. The `li` with C is a child of the inner `ul`, so it is a great-grandchild of the outer `ul` (the path is `ul`, `li`, `ul`, `li`). Children are only the elements directly inside a parent, not the ones deeper.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **What is the difference between a DOM node and a DOM element?**
   - Search for: `DOM node vs element MDN`
   - A good answer explains: that text and comments are also nodes, and that an element is one kind of node.
2. **What is the difference between the `hidden` attribute and the CSS rule `display: none`?**
   - Search for: `hidden attribute vs display none`
   - A good answer explains: what each one does, and why a CSS rule can make a `hidden` element visible again.
3. **How does Playwright decide that an element is "visible" before it clicks it?**
   - Search for: `playwright actionability visible`
   - A good answer explains: the checks that Playwright makes before an action, and why an element that is in the DOM may still fail them.

## Next step

In the next lesson you learn that every element has a role and a name, and how tests use them to find elements.
