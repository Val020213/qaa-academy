---
title: HTML and the DOM
summary: Read HTML tags, attributes and nesting, and understand the DOM tree that the browser builds and that code can change.
duration: 75 min
---

## Start with a puzzle

A dog shelter has a website. The page shows a card with a big name: "Rex". You right-click the page and choose "View page source". You press `Ctrl + F` and search for "Rex".

Nothing is found. The word "Rex" is not in the source. Yet it is on your screen, and you can click "Adopt Rex".

How can the page show a word that is not in its own source? Is the page lying, or is something else going on?

Write down your guess before you read on.

## Goal

- Read a small piece of HTML and say which element is the parent of which.
- Predict what the page shows after code adds or removes an element.
- Explain why the HTML file and the DOM can be different.
- Decide when to hide an element and when to remove it.

## What is HTML?

**HTML** is the language that describes what is on a web page. It says "here is a heading", "here is a button", "here is a text field".

HTML is not a programming language. It does not make decisions. It only describes the page, like a floor plan describes a house.

## Tags, attributes and content

HTML is made of **elements**. An element usually has an opening tag, content and a closing tag. This is a card for a dog:

```html
<a href="/dogs/rex" class="more">See Rex</a>
```

Read it in parts:

- `<a>` is the opening **tag**. It says what kind of element this is. The letter `a` means "anchor", which is a link.
- `See Rex` is the **content**. It is the text the user sees.
- `</a>` is the closing tag. It has a slash.
- `href="/dogs/rex"` and `class="more"` are **attributes**. An attribute is extra information about the element. It has a name and a value in quotes.

Some elements have no content and no closing tag. A field for a number is one of them:

```html
<input type="number" name="age" min="0" />
```

## Nesting

Elements can be inside other elements. This is called **nesting**. The outer element is the **parent**. The inner elements are its **children**.

Here is a recipe. Look at it and answer two questions before you read on. How many children does the `ol` have? Where is the `li` with "Salt"?

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

The `ol` has two children: the two `li` elements that are directly inside it. The `li` with "Salt" is not a child of the `ol`. Its parent is the inner `ul`. The `ul` is inside the second `li`, so "Salt" is a grandchild of that `li` and a great-grandchild of the `ol`. A child is only one level down.

The indentation helps you see the nesting. The browser does not need it.

Now a real example. This is the login form of the Practice app, with the long style classes left out. The form lives in `src/practice/LoginPanel.tsx`:

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

The `form` has three children: two `div` elements and one `button`. Each `div` has two children: a `label` and an `input`.

## From HTML to the DOM

The browser reads the HTML and builds a **tree** in memory. A tree is a structure where each element has a parent and children, like a family tree. This tree is the **DOM**. DOM means Document Object Model.

For the form above, the tree looks like this:

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

The DOM is not the same as the HTML file. The HTML file is the starting point. After the page loads, code can add, remove and change elements. The DOM changes, and the HTML file does not.

Here is a small page for the shelter. What does the page show? What does "View page source" show?

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

The page shows two dogs: Rex and Luna. The source shows only Rex in the `ul`, plus the script. The script made the second `li` after the page loaded. It exists only in the DOM.

### Back to the puzzle

The shelter page does the same, on a bigger scale. The server sends a nearly empty file and a script. The script gets the dogs from a server, builds the cards, and adds them to the DOM. "Rex" is in the DOM and on your screen. It never was in the file. The page is not lying. You looked at the file, and the screen shows the DOM.

> **Note:** The course site works like this. It builds its pages with code. If you use "View page source" on it, you see an almost empty page with one `div` and a script. The real page is in the DOM. Use the Elements panel of DevTools to see it. The next lessons explain DevTools.

## Hide it or remove it?

Sometimes a page has an element that should not be seen yet, such as the message "Adopted! Thank you." There are two ways to do it.

The first way is to keep the element in the DOM and hide it:

```html
<p hidden>Adopted! Thank you.</p>
```

The `hidden` attribute has no value. It tells the browser not to show the element. The element is still in the DOM. When the user adopts a dog, code removes `hidden` and the message appears.

The second way is to add the element to the DOM only when it is needed, and to remove it when it is not.

Which way is better? Both work. Hiding is simple and the element is always there to read or change. Removing keeps the DOM small and cannot leave old content behind. The Practice app uses the first way for its login error:

```html
<div data-slot="alert" role="alert" hidden data-testid="login-error"></div>
```

The element exists from the first moment, with the `hidden` attribute and no text. When you type a wrong password, the app writes a message in it and removes `hidden`. A tool that looks at the DOM must know this difference. An element can be in the DOM and not be visible.

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

Open the Practice app and add the case "One". Then run this in the Console:

```text
> const first = document.querySelector('[data-testid="cases-item"]')
> first.isConnected
true
```

`isConnected` tells you if an element is still in the page. Now choose **Passed** in the **Show** list. The case is pending, so the app removes its row. Choose **All** again. The row comes back and looks the same. Run this:

```text
> first.isConnected
false
> document.querySelector('[data-testid="cases-item"]') === first
false
```

The new row looks like the old one, but it is a different element. Your variable `first` still points to the old element, which is no longer on the page. (If you tick the checkbox instead, the row stays and `first.isConnected` stays `true`. Whether an element is replaced depends on how the page code is written.)

This is a real problem in test code. A test must not keep a reference to one element and use it later. Playwright solves this: a **locator** is not an element. It is a description, such as "the element with this `data-testid`". Playwright searches the DOM again each time you use it. You will learn locators in module 3.

Remember: the page can replace elements while a user looks at them, and they look the same. Your test should describe what to find, and not hold one element.

## Practice

1. Start the course site in a terminal inside VS Code:

```bash
pnpm dev
```

2. Open `http://localhost:5180/#/practice` in Chrome or Edge.
3. Press `F12` to open DevTools. Click the **Elements** tab.
4. Find the line `<form ... data-testid="login-form" ...>`. Click the small arrow to open and close it. Count its children.
5. Right-click the Email field on the page and choose **Inspect**. DevTools selects its line in the Elements tab. What are its `type` and `data-testid`? Which element holds the text "Email"?
6. In the page, type a wrong email and password, then click **Sign in**. In the Elements tab, find the line with `data-testid="login-error"`. The `hidden` attribute is now gone, and the element has text.
7. Add two test cases in section 2. Find the `ul` with `data-testid="cases-list"`. Open it and count its `li` children.
8. Press `Ctrl + U` to open "View page source" for the same page. Search for `login-error`. Is it there? Why or why not?

## Challenge

Build a small page about something you like (a pet shelter, a football league, a recipe book, a playlist: choose your own world). It must show a list that code changes after the page loads, and a message that is hidden at first.

Create the file `exercises/challenges/html-and-the-dom.html`. Open it by double-clicking it, or with a right-click and "Open with" Chrome or Edge. The page needs: a heading, a list with three items, a button, and a message that is hidden at first. When you click the button, the message appears and one new item is added to the list.

It is done when:

- The page opens in the browser, and the Elements panel shows an element nested at least three levels deep, for example `html`, `body`, `ul`, `li`.
- Before you click, the message has the `hidden` attribute in the Elements panel. After you click, the attribute is gone.
- After the click, the list has four items in the Elements panel. "View page source" (`Ctrl + U`) still shows only the three original items.
- Your file has a comment of one line that says why the new item is missing from the page source.

You will need something this lesson did not teach: how to run code when a button is clicked, and how to show an element from code. Search for: `addEventListener click`, `element hidden property javascript`, `script tag at end of body`.

## Think it through

1. This page runs. What does the Console print, and why?

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

It prints `3`, then `2`, then `Luna`. The list starts with three children. `firstElementChild` is the `li` with Rex, and `remove()` takes it out of the DOM. After that, the list has two children, and the first one is Luna. The script changes the DOM. It does not change the HTML file.

</details>

2. There is no error, yet the page looks wrong. The word "Age: 4" is bold, and nobody asked for it. Find the bug.

```html
<p>Name: <b>Rex</p>
<p>Age: 4</p>
```

<details>
<summary>Answer</summary>

The `<b>` tag is never closed. The browser does not report an error. It repairs the HTML by itself. The browser ends the first paragraph, and then opens bold again in the second paragraph. Now the DOM has two `b` elements, and "Age: 4" is bold. The fix is to write `<b>Rex</b>`. This shows that the DOM is what the browser understood, and it may differ from what you meant to write.

</details>

3. Two versions of the "Adopted!" message both work. A) The `p` is always in the page with the `hidden` attribute. B) Code adds the `p` only after the adoption. Which is better here, and what would make you choose the other?

<details>
<summary>Answer</summary>

A is simpler for this page. The element has a fixed place, the code only toggles one attribute, and it is easy to find in DevTools. B is better when the content is large or has many parts, because an unused hidden block still costs memory and is still read by some tools. It is also better when old content must never remain. The choice depends on the size of the hidden part and how often it changes.

</details>

4. A designer moves the Adopt button of each dog card into a new `div` wrapper, only for layout. Two checks exist. One finds the element with the selector `article > button`. The other finds the element with `data-testid="adopt-rex"`. Which one breaks, and why?

<details>
<summary>Answer</summary>

The first one breaks. The selector `article > button` means "a button that is a direct child of an article". After the change, the button is a grandchild, so the selector finds nothing. The `data-testid` does not depend on where the element sits in the tree, so the second check keeps working. A selector that depends on the structure is fragile when the layout changes.

</details>

5. Explain to a friend the difference between the HTML file and the DOM. Use three sentences. Do not use the word "tree".

<details>
<summary>Answer</summary>

A good answer could be: "The HTML file is the text the server sends, like a plan. The browser reads it and builds a live copy of the page in memory, and that live copy is the DOM. Code can change the live copy after the page loads, so the page you see can differ from the file." The key idea is that the file is fixed and the DOM changes. If your answer says they are the same, check the puzzle again.

</details>

6. The shelter has no dogs today, so the list is `<ul id="dogs"></ul>`. A script runs `document.querySelector("#dogs").firstElementChild.remove()`. What happens?

<details>
<summary>Answer</summary>

The script stops with an error: `Cannot read properties of null (reading 'remove')`. The list has no children, so `firstElementChild` is `null`, and `null` has no `remove` method. This is the edge case of an empty list. Code that works with three dogs can fail with zero. A careful script checks that the element exists before it uses it.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **What is the difference between a DOM node and a DOM element?**
   - Search for: `DOM node vs element MDN`
   - Try it: open any page and run `document.body.childNodes.length` and `document.body.children.length` in the Console. Compare the two numbers.
   - A good answer explains: that text and comments are also nodes, and that an element is one kind of node.
2. **What is the difference between the `hidden` attribute and the CSS rule `display: none`?**
   - Search for: `hidden attribute vs display none`
   - Try it: in the Elements panel, add `hidden` to a paragraph. Then give it the style `display: block` in the Styles pane. Does it appear again?
   - A good answer explains: what each one does, and why a CSS rule can make a `hidden` element visible again.
3. **How does a browser repair HTML that has mistakes, such as a tag that is never closed?**
   - Search for: `HTML parsing error handling browser recovers`
   - Try it: write a small file with `<p>One<p>Two` and an unclosed `<b>`, open it, and look at the result in the Elements panel. Compare it with what you wrote.
   - A good answer explains: that the browser does not stop on HTML mistakes, one rule it uses to repair them, and why this makes the DOM differ from the file.

## Next step

In the next lesson you learn that every element has a role and a name, and how tools use them to find elements.
