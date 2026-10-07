---
title: HTML and the DOM
duration: 60 min
---

## Goal

You will read a page's structure and inspect how it changes in the browser when code adds, removes or hides elements.

- Identify tags, attributes and content.
- Distinguish direct children from elements nested further down.
- Explain why the HTML file and the DOM can differ.
- Distinguish a hidden element from one that is no longer in the DOM.

## Tags, attributes and content

**HTML** describes the elements on a web page: headings, buttons, text fields. An element usually has an opening tag, content and a closing tag. This is a link:

```html
<a href="/dogs/rex" class="more">See Rex</a>
```

- `<a>` is the opening **tag**. It identifies the element's type; here, a link.
- `See Rex` is the **content**: the text the user sees.
- `</a>` is the closing tag.
- `href="/dogs/rex"` and `class="more"` are **attributes**. An attribute is extra information about the element. In these examples it has a name and a value in quotes; other attributes, such as `hidden`, can be written without a value.

Some elements have no content and no closing tag. A field for a number is one of them:

```html
<input type="number" name="age" min="0" />
```

## Nesting

Elements can be inside other elements. This is called **nesting**. An element that directly contains another is its **parent**; the contained element is its **child**.

```html
<ol>
  <li>Boil the water</li>
  <li>
    Add the pasta and
    <ul>
      <li>Salt</li>
      <li>Oil</li>
    </ul>
  </li>
</ol>
```

The `ol` has two direct children: the two `li` elements. The parent of the `li` with "Salt" is the inner `ul`, which sits inside the second `li`. A child is only one level down.

Indentation helps you read the nesting; the browser determines it from the tags.

This is the Practice app's login form, with the long style classes left out. It is in `src/practice/LoginPanel.tsx`:

```html
<form data-testid="login-form" novalidate>
  <div>
    <label data-slot="label" for="login-email">Email</label>
    <input data-slot="input" id="login-email" type="email" name="email"
           autocomplete="off" data-testid="login-email" />
  </div>
  <div>
    <label data-slot="label" for="login-password">Password</label>
    <input data-slot="input" id="login-password" type="password" name="password"
           data-testid="login-password" />
  </div>
  <button data-slot="button" type="submit" data-testid="login-submit">Sign in</button>
</form>
```

The `form` has three children: two `div` elements and one `button`. Each `div` contains a `label` and an `input`.

## From HTML to the DOM

The browser parses HTML and builds the **DOM** (Document Object Model): objects in memory organized into a tree according to the nesting. The page's code can change those objects.

The form's element tree looks like this:

```text
form
├── div
│   ├── label
│   └── input (email)
├── div
│   ├── label
│   └── input (password)
└── button
```

The HTML file is the starting point. Code can add, remove or change DOM elements without modifying that file:

```html
<ul id="dogs">
  <li>Rex</li>
</ul>
<script>
  const li = document.createElement("li")
  li.textContent = "Luna"
  document.querySelector("#dogs").append(li)
</script>
```

The script creates a list item, assigns it the text "Luna", finds the list and appends the item. The page shows Rex and Luna. "View page source" shows only Rex inside the `ul`, plus the script. The browser runs this script when it reaches its tag, while parsing the HTML. The second `li` exists only in the DOM.

![The browser builds the DOM and runs the script during parsing; the source keeps only Rex in the list.](/images/02-html-dom.en.svg)

The course site builds its pages with code. "View page source" shows a file with a `div` and scripts; the **Elements** panel in DevTools shows the current DOM.

## Hiding or removing elements

A page can keep a message in the DOM and hide it until it is needed:

```html
<p hidden>Adopted! Thank you.</p>
```

Here the `hidden` attribute is written without a value. It tells the browser not to show the element. When the user adopts a dog, code removes `hidden` and the message appears.

Another option is to add the element to the DOM when needed and remove it afterward. Hiding lets code read or change the element while it is out of view. Removing disconnects the element from the document, although a variable can still point to it.

The Practice app keeps its login error in the DOM:

```html
<div data-slot="alert" role="alert" hidden data-testid="login-error"></div>
```

At first it has the `hidden` attribute and no text. When you submit incorrect credentials, the app writes the message and removes `hidden`. An element's presence in the DOM does not mean it is visible.

## Go deeper

### Elements that are replaced

Code can remove an element and create another that looks the same. A variable that pointed to the original element still points to it.

Open the Practice app and add the case "One". Run this in the **Console**:

```text
> const first = document.querySelector('[data-testid="cases-item"]')
> first.isConnected
true
```

`isConnected` tells you whether the element is still in the page. Choose **Passed** in the **Show** list. The case is pending, so the app removes its row. Choose **All** again and run this:

```text
> first.isConnected
false
> document.querySelector('[data-testid="cases-item"]') === first
false
```

The row that returns is a different element. The variable `first` points to the previous row, which is no longer in the page. If you tick the checkbox without filtering, the row stays and `first.isConnected` remains `true`: the result depends on how the code updates the DOM.

## Practice

1. Start the course site in a terminal inside VS Code:

```bash
pnpm dev
```

2. Open `http://localhost:5180/#/practice` in Chrome or Edge.
3. Press `F12` to open DevTools. Click the **Elements** tab.
4. Find the line `<form ... data-testid="login-form" ...>`. Expand it with the arrow and count its direct children.
5. Right-click the Email field and choose **Inspect**. Read its `type` and `data-testid` in Elements. Identify the element that contains the text "Email".
6. Enter an incorrect email and password and click **Sign in**. In Elements, find `data-testid="login-error"`. Check that it has text and no longer has `hidden`.
7. Add two test cases in section 2. Find the `ul` with `data-testid="cases-list"`, expand it and count its `li` children.
8. Press `Ctrl + U` to open "View page source". Search for `login-error` and compare the result with the DOM you saw in Elements.

## Challenge

Create `exercises/challenges/html-and-the-dom.html` with a heading, a list of three items, a button and a hidden message. Clicking the button must reveal the message and add an item to the list. Open the file by double-clicking it or with "Open with" Chrome or Edge.

It is done when:

- Elements shows an element nested at least three levels deep, for example `html`, `body`, `ul`, `li`.
- The message has `hidden` before the click and loses it afterward.
- After the click, Elements shows four list items. "View page source" (`Ctrl + U`) keeps the three original items.
- A one-line comment in the file says why the new item does not appear in the source.

Search for how to run code on a click and show an element: `addEventListener click`, `element hidden property javascript`, `script tag at end of body`.

## Think it through

1. What does the Console print, and why?

```html
<ul id="dogs">
  <li>Rex</li>
  <li>Luna</li>
  <li>Bo</li>
</ul>
<script>
  const list = document.querySelector("#dogs")
  console.log(list.children.length)
  list.firstElementChild.remove()
  console.log(list.children.length)
  console.log(list.children[0].textContent)
</script>
```

<details>
<summary>Answer</summary>

It prints `3`, then `2`, then `Luna`. `firstElementChild` is the `li` with Rex and `remove()` takes it out of the DOM. Two children remain, and the first is Luna.

</details>

2. The text "Age: 4" appears in bold even though it should not. Find the bug.

```html
<p>Name: <b>Rex</p>
<p>Age: 4</p>
```

<details>
<summary>Answer</summary>

The `<b>` tag is never closed. The browser ends the first paragraph and reapplies bold in the second as it repairs the HTML. The DOM has two `b` elements. The fix is to write `<b>Rex</b>`.

</details>

3. The list is `<ul id="dogs"></ul>`. A script runs `document.querySelector("#dogs").firstElementChild.remove()`. What happens?

<details>
<summary>Answer</summary>

The script stops with `Cannot read properties of null (reading 'remove')`. Because the list has no children, `firstElementChild` is `null`. Check that the element exists before calling `remove`.

</details>

## Next step

In the next lesson you identify controls' roles and accessible names, and how tools use them.
