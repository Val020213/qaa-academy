---
title: Forms, events and state
summary: Understand inputs, events and state, and see what a reload keeps or loses in memory, localStorage and cookies.
duration: 45 min
---

## Goal

- Explain inputs, `value` and form submit.
- Name the four events you will meet most: click, input, change and submit.
- Explain what state is and where a page can keep it.
- Predict what a reload keeps and what it loses.
- Explain why this matters for independent tests.

## Forms and inputs

A **form** is a group of fields and a button that sends them. An **input** is one field where the user types or chooses something.

The text inside an input is its **value**. The value is a property of the element. A **property** is a piece of information that an element holds, and code can read or change it.

The login form of the Practice app has two inputs and a submit button. You can read a value in the Console:

```text
> document.querySelector('[data-testid="login-email"]').value
'qa@example.com'
```

The `value` changes while the user types. The HTML attribute does not change. The attribute only holds the starting value. A test reads the live value, not the attribute.

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

## State

**State** is what the page remembers right now. Examples are the list of cases, the text in a field, and whether the user is signed in.

State has to live somewhere. The place decides how long it lasts.

## Where state lives

| Place | Lives until | Example |
| --- | --- | --- |
| Memory | You reload or close the page | The case list in the Practice app |
| URL | You change the address | The address `#/practice`, or `?next=%2Fproducts` in the shop |
| `localStorage` | You clear it. It stays after a reload and after you close the browser | The lessons you marked as completed |
| Cookie | It expires or you delete it. The browser sends it with every request to the server | The shop sign-in |

**Memory** means variables inside the running page code. They disappear on reload.

**`localStorage`** is a small store in your browser. It keeps text under a name. Only this browser has it. Another browser or another computer does not see it.

A **cookie** is a small piece of data that the server asks the browser to keep. The browser sends it back with every request. The shop uses a cookie named `shop_session` to know who you are.

> **Note:** The shop cookie is marked `HttpOnly`. Page code cannot read it, but you can see it in DevTools, in the **Application** panel.

## What a reload keeps and loses

Reload the page. Then ask: where was this data?

- The case list in the Practice app is in memory. A reload loses it.
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

The function inside `page.evaluate` runs in the page, not in the test. It reads the key where this course saves completed lessons. `null` means nothing is stored.

## Practice

1. Start the course site with `pnpm dev`. Open `http://localhost:5180/#/practice`, and press `F12`.
2. Type `qa@example.com` in the Email field, but do not submit. In the Console run this, and read the result:

```text
document.querySelector('[data-testid="login-email"]').value
```

3. Run this, and compare. It reads the attribute, not the value. The result is `null`, because the HTML has no `value` attribute:

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

## Check what you know

1. What is the difference between an attribute and a value?

<details><summary>Answer</summary>

The attribute is the starting text written in the HTML. The value is the live text of the field. It changes as the user types.

</details>

2. Which event happens when a user chooses an option in a `select`?

<details><summary>Answer</summary>

The `change` event.

</details>

3. The case list is empty after a reload. Where was it kept?

<details><summary>Answer</summary>

In memory. Memory is lost on reload.

</details>

4. Why can a cookie make tests depend on each other?

<details><summary>Answer</summary>

A cookie stays in the browser. If one test leaves it behind, the next test may start already signed in.

</details>

5. In your normal browser you mark a lesson as completed. Then you run the Playwright test above. Why does it still find `null`?

<details>
<summary>Answer</summary>

Playwright does not use your normal browser profile. It opens a new, empty browser context for each test. That context has no cookies and an empty `localStorage`. So your completed lessons are not there. This is what keeps tests independent.

</details>

6. A shop test does `page.goto("/login")`, fills the two fields and clicks `login-submit` at once. Sometimes the fields are empty after the click, and the page has reloaded. What is the most likely cause?

<details>
<summary>Answer</summary>

The test acted before the page was hydrated. The server HTML was visible, but React was not listening yet. The typed text can be erased, and a click can send the form the old way, which reloads the page. The fix in the repository is to type, check the value and try again until it stays.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **What is the difference between `localStorage` and `sessionStorage`?**
   - Search for: `localStorage vs sessionStorage MDN`
   - A good answer explains: how long each one lasts, and how they behave with many tabs.
2. **What do the cookie flags `HttpOnly`, `Secure` and `SameSite` do?**
   - Search for: `cookie HttpOnly Secure SameSite MDN`
   - A good answer explains: each flag in one sentence, and what attack each one helps to prevent.
3. **Why does Playwright start every test with a new browser context, and what is `storageState` for?**
   - Search for: `playwright browser context isolation storage state`
   - A good answer explains: what a context contains, why isolation helps reliable tests, and how a saved session avoids signing in again.

## Next step

In the next module you start Playwright and write your first tests with the ideas you learned here.
