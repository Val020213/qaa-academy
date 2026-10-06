---
title: Forms, events and state
summary: Understand inputs, events and state, and predict what a reload keeps or loses in memory, localStorage and cookies.
duration: 80 min
---

## Start with a puzzle

A form has one field for the name of your dog. The HTML says `<input id="dog" value="Rex">`. You delete "Rex" and type "Luna". Then you run two lines of code:

```text
dog.value
dog.getAttribute("value")
```

What does each line give? Maybe both say "Luna". Maybe both say "Rex". Or maybe they are different. And a second puzzle: your code sets `dog.value = "Max"` from a script. Does any code that listens for typing know about it?

You can guess without knowing the answers. Think about what the browser must remember: the text you started with, and the text that is in the field now.

Write down your guess before you read on.

## Goal

- Predict what `value` and the HTML attribute give after the user types.
- Choose the event that fits an action: click, input, change or submit.
- Explain what state is and decide where a page should keep each piece of it.
- Predict what a reload keeps and what it loses.
- Explain why this matters for independent tests.

## Forms and inputs

A **form** is a group of fields and a button that sends them. An **input** is one field where the user types or chooses something. A form can be a dog registration, a recipe search or a login.

The text inside an input is its **value**. The value is a property of the element. A **property** is a piece of information that an element holds, and code can read or change it.

The login form of the Practice app has two inputs and a submit button. You can read a value in the Console:

```text
> document.querySelector('[data-testid="login-email"]').value
'qa@example.com'
```

Now try the puzzle yourself. Open the Console on any page and run these lines. Guess the last result first.

```text
> const dog = document.createElement("input")
> dog.setAttribute("value", "Rex")
> dog.value = "Luna"
> [dog.value, dog.getAttribute("value")]
(2) ['Luna', 'Rex']
```

The `value` is the live text. The attribute is only the starting text written in the HTML. When the user (or code) changes the value, the attribute stays.

## Events

An **event** is something that happens on the page, such as a click. Code can listen for an event and react. The code that reacts is called an **event handler**.

Four events matter most for testers:

| Event | When it happens |
| --- | --- |
| `click` | The user clicks an element |
| `input` | The user changes the text of a field, on every key |
| `change` | The user finishes a change, such as choosing an option in a `select` or ticking a checkbox |
| `submit` | The user sends a form, by clicking the submit button or pressing `Enter` |

In the Practice app, the login form reacts to `submit`, the case filter to `change`, and the Delete button to `click`. When Playwright clicks or fills, the real events happen, and the page reacts as it does for a person.

Now the case that breaks the rule "the page always knows the value". Guess what `n` is at the end:

```text
> let n = 0
> const box = document.createElement("input")
> box.addEventListener("input", () => n++)
> box.value = "hello"
> n
0
```

The text is in the field, but nobody fired the `input` event. Code that waits for the event never ran. A real person typing fires the event on every key. This is the second part of the puzzle.

## State

**State** is what the page remembers right now. Examples are the list of cases, the text in a field, and whether the user is signed in. In a video game, the state is your score, your life and your place on the map.

State has to live somewhere. The place decides how long it lasts. In the game, the score on the screen is gone when you switch off the console. The saved game is on the disk. The ticket stub in your pocket proves who you are when you come back to the park.

## Where state lives

| Place | Lives until | Example |
| --- | --- | --- |
| Memory | You reload or close the page | The case list in the Practice app |
| URL | You change the address | The address `#/practice`, or `?next=%2Fproducts` in the shop |
| `localStorage` | You clear it. It stays after a reload and after you close the browser | The lessons you marked as completed |
| Cookie | It expires or you delete it. The browser sends it with every request to the server | The shop sign-in |

**Memory** means variables inside the running page code. They are the score on the screen. They disappear on reload.

**`localStorage`** is a small store in your browser. It keeps text under a name. It is the saved game. Only this browser has it. Another browser or another computer does not see it.

A **cookie** is a small piece of data that the server asks the browser to keep. The browser sends it back with every request. It is the ticket stub. The shop uses a cookie named `shop_session` to know who you are.

> **Note:** The shop cookie is marked `HttpOnly`. Page code cannot read it, but you can see it in DevTools, in the **Application** panel.

## What a reload keeps and loses

Before you read the list, predict it. You do these things, and then press `F5`:

- In the Practice app, you add the cases "One" and "Two", and tick "One".
- In the Practice app, you sign in with the valid account.
- On the course site, you mark a lesson as completed.
- In the shop, you sign in as admin.

What stays? For each one, ask: where was this data? Then check:

- The case list in the Practice app is in memory. A reload loses it, and the tick with it.
- The Practice app login is also only in memory. A reload shows the login form again.
- The completed marks are in `localStorage`. They stay.
- The shop sign-in is in a cookie. A reload keeps you signed in.

## Why this matters for tests

A test should not depend on what an earlier test left behind. State is the reason.

- Memory state starts empty on each new page.
- `localStorage` and cookies stay in the browser. If a test leaves a cookie behind, the next test may start already signed in. It may pass or fail for the wrong reason.
- Each test creates its own data and does not depend on test order. This is a team rule.

Playwright gives each test a fresh browser context, with no cookies and an empty `localStorage`. A context is like a new private browser window. When a test needs a signed-in user, a setup step signs in on purpose and saves the session to a file. The shop suite does this in `apps/practice-shop/e2e/global.setup.ts`.

When you test by hand, your browser keeps state. If a bug appears only for you, clear cookies and `localStorage` and try again.

### Back to the puzzle

`dog.value` gives "Luna", and `dog.getAttribute("value")` gives "Rex". The attribute is the starting text and the value is the live text. Setting `value` from a script does not fire an event, so listeners know nothing about "Max".

One more surprise. The Practice app is built with React, and React keeps the attribute in step with the value on inputs that it controls. On the Practice page, after you type, both lines show the typed text. Plain HTML does not do this. The lesson: do not use the attribute to read what the user typed. Use the value, and let the tool decide.

## Go deeper

### Why it works this way: events need a listener

An event does nothing by itself. It only does something if code is listening. The code is attached after the page loads. In the shop, the server first sends plain HTML, and then the React code "wakes up" in the browser. This is called **hydration**. Before it ends, the page looks ready, but no code listens to the click.

That is why `auth.spec.ts` in the shop has a comment: a click before React is ready sends the form the old way, and the page reloads. A test that is too fast does the right action at the wrong moment.

### A common wrong idea: "setting a value is the same as typing"

In the Console you can write `input.value = "a@b.test"`. The text appears in the field. But the browser does not fire the `input` event, so code that listens for it does not know. A real user typing fires the event on every key. Playwright `fill` does fire the right events, and this is why you use it, and not a script that sets the value.

### How it shows up in real QA work: a retry loop written once

The shop tests have a problem from hydration: text typed too early can be erased. The team solved it with a loop that types, checks the value, and tries again:

```ts
import { expect } from "../lib/test"
import type { Page } from "../lib/test"

async function fillLoginForm(page: Page, email: string, password: string) {
  await expect(async () => {
    await page.getByTestId("login-email").fill(email)
    await page.getByTestId("login-password").fill(password)
    await expect(page.getByTestId("login-email")).toHaveValue(email)
    await expect(page.getByTestId("login-password")).toHaveValue(password)
  }).toPass()
}
```

This is the function from `apps/practice-shop/e2e/auth/auth.spec.ts`. It is an example of **DRY**: the five steps are written once, and each test calls `fillLoginForm`. The same loop also appears in `global.setup.ts`. Two copies is a small cost. A reviewer could ask if both should use one shared helper. That is fair. But the test itself must still read as a clear story: "fill the form, click, see the error".

This is also **KISS** (keep it simple) at work. The loop does one job and has a name that says it. **YAGNI** (do not build for needs you only imagine) says: do not build a big shared login library before a third place needs it.

### A check you can write: a clean start

Playwright gives every test a new context. You can prove it:

```ts
import { expect, test } from "./lib/test"

test("a new test starts with an empty localStorage", async ({ page }) => {
  await page.goto("/")

  const saved = await page.evaluate(() =>
    localStorage.getItem("qaa-academy:completed")
  )

  expect(saved).toBeNull()
})
```

You could save it as `e2e/clean-start.spec.ts` in the course repository. The function inside `page.evaluate` runs in the page, not in the test. It reads the key where this course saves completed lessons. `null` means nothing is stored.

## Practice

1. Start the course site with `pnpm dev`. Open `http://localhost:5180/#/practice`, and press `F12`.
2. Type `qa@example.com` in the Email field, but do not submit. In the Console run this, and read the result:

```text
document.querySelector('[data-testid="login-email"]').value
```

3. Run this, and compare. It reads the attribute, not the value. The Practice app is built with React, which keeps the attribute in step, so you see the same text. Plain HTML would not do this, as the puzzle showed:

```text
document.querySelector('[data-testid="login-email"]').getAttribute("value")
```

4. In section 2, add the cases "One" and "Two". Press `F5` to reload. The list is empty. The data was in memory.
5. Open this lesson in the course. Click **Mark as completed**.
6. In DevTools, open the **Application** panel. Open **Local storage**, then `http://localhost:5180`. Find the key `qaa-academy:completed`. Read its value. It is a list of lesson paths.
7. Press `F5`. The button still says **Completed**. Click it again to undo.
8. Start the shop with `pnpm shop:dev`. Open `http://localhost:5190` and sign in as `admin@qa-shop.test` with `Admin123!`.
9. In the **Application** panel, open **Cookies**, then `http://localhost:5190`. Find `shop_session`. Press `F5`. You are still signed in.
10. Delete the `shop_session` cookie in DevTools. Press `F5`. What happens?
11. Stop the shop with `Ctrl + C`.

## Challenge

Build a small program that proves the difference between memory and saved state. Choose your own world: a playlist, a shopping list, a pet shelter, a football table. Each time you run the program with one new item, it keeps a list in memory and also a saved list in a file. The program prints both counts. A "reload" is simply running the program again.

**It is done when:**

1. You run `node exercises/challenges/07-forms-events-and-state.ts "Blue Moon"` (or an item from your world) and it prints `memory: 1 | file: 1`.
2. You run it again with another item. It prints `memory: 1 | file: 2`. The memory forgot, and the file remembered.
3. You delete the data file and run the program. It starts again at `file: 1` and does not crash.
4. You write the text `not json` into the data file and run the program. It prints one line that says the file is damaged, starts again, and does not crash.
5. You run it with no item. It prints how to use it and does not change the file.

You will need something this lesson did not teach: how to read command line words, and how to read and write a file in Node.js. Search for `node process.argv` and `node fs readFileSync writeFileSync`. For the damaged file, search for `JSON.parse try catch`.

Create the folder `exercises/challenges` if it does not exist, and then create the file `exercises/challenges/07-forms-events-and-state.ts` yourself. Do not use `enum` or parameter properties, because Node runs the file directly.

## Think it through

1. You do four things, and then press `F5`. Which survive? (a) You add two cases to the Practice app list. (b) You choose "Passed" in its **Show** filter. (c) You mark a lesson as completed in the course. (d) You are signed in to the shop. Say where each piece of data lived.

<details>
<summary>Answer</summary>

(a) and (b) are lost. Both live in the memory of the page, and a reload builds the page again from nothing. (c) survives, because the course saves completed lessons in `localStorage`, which stays in the browser. (d) survives, because the sign-in is a cookie, and the browser sends it again with the next request. The rule: ask where the data lived, and the answer follows.

</details>

2. A test sets the field with a script, then clicks **Sign in** on the Practice page:

```ts
await page.evaluate(() => {
  const email = document.querySelector('[data-testid="login-email"]') as HTMLInputElement
  email.value = "qa@example.com"
})
await page.getByTestId("login-submit").click()
```

The test runs with no error, but the page shows "Enter your email and password." Why?

<details>
<summary>Answer</summary>

The script changed the value of the field, but it did not fire an `input` event. The page code keeps its own copy of the text, in its state, and updates it from the event. The state is still empty, so the form is sent with an empty email. `fill` fires the events, and that is the fix. The test is "green" in the sense that it ran, and wrong in what it did.

</details>

3. For a test that needs a signed-in user, you can fill the login form in every test (version A), or sign in once and save the session (version B). Both work. Which is better here, and what would make you choose the other?

<details>
<summary>Answer</summary>

Version B is faster and each test stays about its own subject. Version A is slow, and one broken login page would fail every test. But version A is right for the tests whose subject is the login itself, because they must use the real form. The two versions are not enemies: save the session for most tests and use the form in the few that test it.

</details>

4. In the shop suite, every test starts with the saved admin session. A test clicks **Sign out** using that shared session. What breaks, and for whom?

<details>
<summary>Answer</summary>

Signing out deletes the session on the server. The saved cookie in the file now points to a session that does not exist. Later tests that start with it are treated as signed out, so they are sent to the login page or get a 401. The failure appears far from the cause. The shop test avoids this by signing in with a new session just for that test.

</details>

5. Explain to a teammate, in three sentences and without the words "memory" or "localStorage", why a reload empties the case list but keeps the completed lessons.

<details>
<summary>Answer</summary>

A model answer: The case list exists only inside the running page, like a score on a game screen, so a reload throws it away. The completed lessons are written in a small store in the browser, like a saved game, so they are still there when the page loads again. The two pieces of data are in different places, and only one place survives a reload.

</details>

6. A web shop keeps the cart in the page's memory, in `localStorage`, in a cookie or on the server. Which place would you choose? Think of a visitor who is not signed in, a visitor who changes phone, and a visitor with two tabs.

<details>
<summary>Answer</summary>

There is no single answer. Memory loses the cart on reload, so it is the worst for a cart. `localStorage` survives and works for a visitor who is not signed in, but it is only on one browser, and two tabs may disagree. The server survives a change of phone, but needs the visitor to be known, for example by a cookie. A common design: keep the cart on the server and use a cookie to know the visitor. It depends on whether the cart must follow the person or only the browser.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **What is the difference between `localStorage` and `sessionStorage`?**
   - Search for: `localStorage vs sessionStorage MDN`
   - Try it: in the Console run `sessionStorage.setItem("dog", "Rex")` and `localStorage.setItem("dog", "Rex")`. Open the same address in a new tab by typing it. Read both values with `getItem("dog")`.
   - A good answer explains: how long each one lasts, how they behave with many tabs, and what you saw in the new tab.
2. **What do the cookie flags `HttpOnly`, `Secure` and `SameSite` do?**
   - Search for: `cookie HttpOnly Secure SameSite MDN`
   - Try it: sign in to the shop. In the **Application** panel, read the flags of `shop_session`. Then run `document.cookie` in the Console and look for the name.
   - A good answer explains: each flag in one sentence, what attack each one helps to prevent, and why `shop_session` is missing from `document.cookie`.
3. **Why does Playwright start every test with a new browser context, and what is `storageState` for?**
   - Search for: `playwright browser context isolation storage state`
   - Try it: run `pnpm shop:e2e` once. Then open the file `apps/practice-shop/e2e/.auth/admin.json` and find the cookie `shop_session`.
   - A good answer explains: what a context contains, why isolation helps reliable tests, how a saved session avoids signing in again, and what the file holds.

## Next step

In the next module you start Playwright and write your first tests with the ideas you learned here.
