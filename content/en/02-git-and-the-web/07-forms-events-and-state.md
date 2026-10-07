---
title: Forms, events and state
duration: 60 min
---

## Goal

In this lesson, you read a field's current value and follow the events that update a page's state. You also distinguish which data survives a reload and where it is stored.

- Distinguish the `value` property from the HTML attribute.
- Connect an action to its event and handler.
- Identify state in memory, in the URL, in `localStorage` and in a cookie.
- Check what changes when you reload a page.

## The value of a field

An input's `value` property contains the field's current text. The Practice app login form has two inputs and a submit button. After typing the email, you can read it in the Console:

```text
> document.querySelector('[data-testid="login-email"]').value
'qa@example.com'
```

The HTML attribute and the property can have different values. This example creates an input with an initial value, then changes its property:

```text
> const dog = document.createElement("input")
> dog.setAttribute("value", "Rex")
> dog.value = "Luna"
> [dog.value, dog.getAttribute("value")]
(2) ['Luna', 'Rex']
```

The property contains "Luna", while the attribute keeps "Rex". To read what the user typed, use the `value` property.

The Practice app is built with React, and React keeps the attribute in step with the value on inputs that it controls. On the Practice page, after you type, both readings show the typed text.

## Events and handlers

The browser generates **events** when you interact with the page. Code can register a function to respond to an event; that function is an **event handler**.

| Event | When it happens |
| --- | --- |
| `click` | The user clicks an element |
| `input` | The user changes the text of a field, on every key |
| `change` | The user finishes a change, such as choosing an option in a `select` or ticking a checkbox |
| `submit` | The user sends a form, by clicking the submit button or pressing `Enter` |

In the Practice app, the `submit` handler checks the email and password. The case filter responds to `change`, and the Delete button to `click`.

Changing a property from a script does not generate the event that the user's interaction would produce:

```text
> let n = 0
> const box = document.createElement("input")
> box.addEventListener("input", () => n++)
> box.value = "hello"
> n
0
```

`addEventListener` registers a function that increments `n` when the browser generates an `input` event. The assignment changes the field's text, but does not generate that event, so `n` stays at 0.

## Where state lives

**State** is the data the page uses right now: the text in its fields, the case list or whether the user is signed in. Where the page stores that data determines how long it lasts.

| Place | Lives until | Example |
| --- | --- | --- |
| Memory | You reload or close the page | The case list in the Practice app |
| URL | You change the address | The address `#/practice`, or `?next=%2Fproducts` in the shop |
| `localStorage` | You clear it. It stays after a reload and after you close the browser | The lessons you marked as completed |
| Cookie | It expires or you delete it. The browser sends it with every request to the server | The shop sign-in |

The Practice app keeps the case list, filter and login in variables in **memory**. On reload, the browser runs the page code again with its initial values.

The course saves completed lessons as text in `localStorage`, under the key `qaa-academy:completed`. When the page loads again, the code reads that text and restores the marks. Another browser or another computer does not have that data.

The shop uses a cookie named `shop_session` to know who you are. The browser sends it back with every request.

> **Note:** The shop cookie is marked `HttpOnly`. Page code cannot read it, but you can see it in DevTools, in the **Application** panel.

## State when testing

A test can produce a different result depending on its initial state. If a cookie keeps you signed in, reopening the shop takes you to a different starting point than opening it without a session.

Before reproducing a bug, identify the data the case needs. A reload resets the data in memory, but keeps `localStorage` and cookies. If you need to test without that data, delete it in DevTools.

## Practice

1. Start the course site with `pnpm dev`. Open `http://localhost:5180/#/practice`, and press `F12`.
2. Type `qa@example.com` in the Email field, but do not submit. In the Console run this, and read the result:

```text
document.querySelector('[data-testid="login-email"]').value
```

3. Run this and compare the attribute with the property:

```text
document.querySelector('[data-testid="login-email"]').getAttribute("value")
```

4. In section 2, add the cases "One" and "Two". Press `F5` to check that the list becomes empty.
5. Open this lesson in the course. Click **Mark as completed**.
6. In DevTools, open the **Application** panel. Open **Local storage**, then `http://localhost:5180`. Find the key `qaa-academy:completed` and read the list of lesson paths.
7. Press `F5` and check that the button still says **Completed**. Click it again to undo.
8. Start the shop with `pnpm shop:dev`. Open `http://localhost:5190` and sign in as `admin@qa-shop.test` with `Admin123!`.
9. In the **Application** panel, open **Cookies**, then `http://localhost:5190`. Find `shop_session`. Press `F5` and check that you are still signed in.
10. Delete the `shop_session` cookie in DevTools. Press `F5` and check that the shop asks you to sign in.
11. Stop the shop with `Ctrl + C`.

## Challenge

Create the folder `exercises/challenges` if it does not exist. Create `exercises/challenges/07-forms-events-and-state.ts`. The program takes an item from the command line and adds it to a list in memory and another saved in a file. It then prints both counts. Each run starts a new list in memory and restores the list from the file.

It is done when:

- You run `node exercises/challenges/07-forms-events-and-state.ts "Blue Moon"` and the program prints `memory: 1 | file: 1`.
- You run it with another item and it prints `memory: 1 | file: 2`.
- If you delete the data file, the next run starts at `file: 1`. If it contains `not json`, the program reports that it is damaged and starts again without crashing.
- With no item, the program prints how to use it and does not change the file.

Do not use `enum` or parameter properties, because Node runs the file directly. To read arguments and files, search for: `node process.argv` and `node fs readFileSync writeFileSync`. For the damaged file, search for: `JSON.parse try catch`.

## Think it through

1. You do four things, and then press `F5`. Which survive? (a) You add two cases to the Practice app list. (b) You choose "Passed" in its **Show** filter. (c) You mark a lesson as completed in the course. (d) You are signed in to the shop. Say where each piece of data lived.

<details>
<summary>Answer</summary>

(a) and (b) are lost because they live in the page's memory. (c) survives because the course restores the marks from `localStorage`. (d) survives because the browser keeps the cookie and sends it with the page request.

</details>

## Next step

In the next module you start Playwright and write your first tests with the ideas you learned here.
