---
title: Authentication with storage state
summary: Sign in once, save the session, reuse it in every test, and learn which tests must never share it.
duration: 75 min
---

## Start with a puzzle

Two tests start from the same saved session file. Test A opens the dashboard and clicks "Sign out". Test B opens `/products` and checks the page title.

Run alone, each test passes. Run A first and then B, test B fails: the browser is on the login page. The code of B has no mistake. The saved file did not change on your disk. Not one byte.

What did test A change, and where does that change live?

Write down your guess before you read on.

## Goal

- Predict what happens to a test when its saved session stops being valid.
- Decide which tests may share one session and which need their own.
- Explain why a session file holds a token and not "who you are".
- Read the `setup` and `chromium` projects and say what breaks if you change them.

## The problem: the same four steps, again and again

Almost every page of the shop needs a login. Suppose every test signed in through the login page. Each test would repeat the same steps: open the page, type the email, type the password, click.

Think about two numbers before you read on. Your suite has 60 tests. Signing in takes 3 seconds. How much time goes only to signing in? And if the login page breaks, how many tests turn red? How many of them are about the login?

The answers are 3 minutes, 60 tests and one. That is waste and noise. The fix is to sign in **once** and reuse the result.

## Storage state

When you sign in, the server gives your browser a **cookie**. A cookie is a small piece of data the browser keeps. The browser sends it with each request, so the server knows who is asking.

Playwright can save the cookies of a browser to a file. This is called **storage state**. A new test can start with that file, so it is already signed in.

Look at the shop. Its session cookie is called `shop_session`. The server creates it in `app/api/auth/login/route.ts`, with `httpOnly: true`. That setting hides the cookie from JavaScript on the page. Playwright can still read it, because it talks to the browser from outside the page.

## The setup project

Open `apps/practice-shop/playwright.config.ts`. It has two **projects**. A project is a named group of tests with its own settings.

```ts
projects: [
  {
    name: "setup",
    testMatch: /global\.setup\.ts/,
    // ...
    use: { storageState: { cookies: [], origins: [] } },
  },
  {
    name: "chromium",
    use: { ...devices["Desktop Chrome"] },
    // Wait for the setup project to finish before running any test.
    dependencies: ["setup"],
  },
],
```

The `setup` project runs only `global.setup.ts`. The `chromium` project has `dependencies: ["setup"]`, so it starts only after setup finishes.

Stop and predict. Two changes, one at a time:

1. You delete the line `dependencies: ["setup"]`.
2. You put the line back, and you delete `use: { storageState: ... }` from the `setup` project.

What happens in each case? Guess, then read on.

In case 1, nothing makes Playwright run the setup first. When you run one file, such as `pnpm shop:e2e products/products.spec.ts`, only the tests that match are selected, and `global.setup.ts` does not match. On a fresh checkout `e2e/.auth/admin.json` does not exist, so every test fails because it cannot read the file.

In case 2, the setup project inherits the default `storageState: "e2e/.auth/admin.json"`. On a fresh checkout that file does not exist yet, so setup fails before it can create it. The empty session is not decoration. It breaks a circle: the setup needs the file, and the file needs the setup.

## The setup test

Open `apps/practice-shop/e2e/global.setup.ts`. After it fills the login form and clicks submit, it ends with:

```ts
await page.getByTestId("login-submit").click()
await expect(page).toHaveURL(/\/dashboard/)

// Save the cookies. Every other test starts with this session.
await page.context().storageState({ path: AUTH_FILE })
```

The test waits for the dashboard URL first. That proves the login worked. Then it saves the cookies to `e2e/.auth/admin.json`.

The default setting in `use` loads that file:

```ts
// Every test starts already signed in as admin (saved by the setup project).
storageState: "e2e/.auth/admin.json",
```

So every test in the `chromium` project starts signed in as admin. A test that visits `/products` goes straight to the list.

## Why .auth is ignored by git

The file `e2e/.auth/admin.json` holds a live session cookie. Anyone with this file can act as the admin. Treat it like a password.

So the folder is listed in `apps/practice-shop/e2e/.gitignore`:

```text
.auth/
```

Git skips ignored files, so the session is never committed. Each person and each CI run makes a new one when the setup runs.

## Testing signed-out behaviour

Some tests need a visitor who is not signed in. To remove the session, use `test.use` with an empty one. `auth.spec.ts` does this at the top of the file:

```ts
// These tests start signed out: an empty session instead of the saved admin one.
test.use({ storageState: { cookies: [], origins: [] } })
```

Every test in that file now starts signed out. The first test checks the redirect:

```ts
await page.goto("/products")

await expect(page).toHaveURL(/\/login\?next=%2Fproducts/)
await expect(page.getByTestId("login-card")).toBeVisible()
```

## Why the sign out test logs in again

Here is the second half of the puzzle. Signing out deletes the session on the server. If a test signed out the shared admin session, every later test would lose its login.

So the sign out test makes its own session first:

```ts
// Log in with a NEW session just for this test. Signing out deletes the
// session on the server, so we must not use the shared admin one.
await loginViaApi(page.request, ADMIN)
await page.goto("/dashboard")
```

`loginViaApi` calls the login API. The server sends a new cookie, and it goes into this test's own browser. The next lesson explains `page.request`.

> **Careful:** Never click sign out in a test that uses the shared admin session. The `e2e/README.md` repeats this rule.

### Back to the puzzle

Test A clicked "Sign out". The browser asks the server to delete the session token, in `app/api/auth/logout/route.ts`. The server keeps its list of tokens in memory. The file `admin.json` only holds the token, so it did not change. But the token is no longer in the server's list.

Test B sends the same token, and the server does not know it. The server treats B as a visitor and redirects to the login page. The change lives on the server, not in the file and not in B. This is why the failure looks strange: nothing in B is wrong, and the cause is a test that ran earlier.

## Go deeper

### Why a cookie file is enough to sign in

The web has no memory. Each request is separate, and the server does not know that you signed in a moment ago. A cookie fixes this. After login, the server sends back a cookie that holds a random token. The browser sends the token with every later request.

The shop keeps a list of tokens in server memory. This is the real code from `lib/session.ts`:

```ts
const token = (await cookies()).get(SESSION_COOKIE)?.value
if (!token) return undefined

const userId = store().sessions.get(token)
```

So `admin.json` stores only the token, not who you are. The server looks up the token in its own list. If the server forgets the list, for example after a restart, the file still exists, but the token means nothing. The next request is treated as signed out. This is one reason the setup project signs in again on every run, and does not reuse an old file.

One more detail. The reset endpoint puts the data back to the seed data, but it keeps the sessions. The comment in `lib/store.ts` says why: "Sessions are kept, so logged-in tests stay logged in."

### A common wrong idea: storage state skips the login test

Some beginners think that saving the session means login is never tested. It is still tested. `auth.spec.ts` signs in through the real page, with an empty session. The saved session removes the login steps from tests that are about something else. Login stays under test in one place.

Also, storage state is not only cookies. It can hold `localStorage`, the data a site keeps in the browser. The shop's file has none, so `origins` is empty. A site that keeps its token in `localStorage` needs that part saved too.

### How it shows up in QA work

Real products have many roles: admin, viewer, customer. Teams often make one setup test and one saved file for each role. A test picks its role with `test.use`. You will test the viewer role in module 5. The sign-in steps are written once in the setup, not in every test. This is DRY applied to a flow.

### When not to use it

Do not use a shared saved session for a test that changes the session itself. Signing out, changing a password and expiring a session are examples. The sign out test makes its own session with `loginViaApi`. A good question to ask: "Does this test change who is signed in?" If yes, give it its own session.

## Practice

1. Open `apps/practice-shop/playwright.config.ts`. Find the line that says which project the `chromium` project depends on.
2. In PowerShell, check that the session file exists. Do not share it or paste it anywhere.

```bash
Test-Path apps/practice-shop/e2e/.auth/admin.json
```

3. Create the file `apps/practice-shop/e2e/auth/storage-practice.spec.ts` with this code:

```ts
import { expect, test } from "../lib/test"

test.describe("Signed in by default", () => {
  test("the products page opens without a login", async ({ page }) => {
    await page.goto("/products")

    await expect(page.getByTestId("products-title")).toBeVisible()
  })
})

test.describe("Signed out", () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test("the products page sends a visitor to the login page", async ({ page }) => {
    await page.goto("/products")

    await expect(page).toHaveURL(/\/login\?next=%2Fproducts/)
  })
})
```

4. Start the shop with `pnpm shop:dev`. In another terminal run:

```bash
pnpm shop:e2e auth/storage-practice.spec.ts
```

5. Both tests should pass. Notice the second one needs `test.use` inside its group.
6. Now test your prediction about the circle. In the `Signed out` group, change the empty session to a file that does not exist: `test.use({ storageState: "e2e/.auth/nothing.json" })`. Run the file again and read the error. Then undo the change.

## Challenge

Brief: the shop has a second role, the viewer. A viewer can look at products but cannot create them. You must prove this with a test that has its own session. The test signs in as the viewer, saves that session to a file, and opens a browser from that file. The shared admin session must stay untouched.

Create the file `apps/practice-shop/e2e/challenges/viewer-session.spec.ts`. The account is `VIEWER` in `e2e/lib/fixtures/api-client.ts`.

It is done when:

- Your code, not your hands, writes the viewer session to `e2e/.auth/viewer.json`. If you delete that file and run again, the test still passes.
- The test opens `/products` as the viewer. The `user-role` badge says `viewer`, and there is no `products-new` link.
- In the same browser context, a `POST` to `/api/products` is answered with status 403.
- The test never clicks sign out, and `pnpm shop:e2e auth/auth.spec.ts` still passes after your spec ran.

You will need something this lesson did not teach: how to create an API client without the config's saved session, save its cookies to a file, and make a new browser context from that file. Search for: `playwright request.newContext`, `playwright APIRequestContext storageState path`, `playwright browser.newContext storageState`, `playwright test.beforeAll`.

## Think it through

1. **Predict.** A teammate removes `dependencies: ["setup"]` from the `chromium` project, then clones the repository on a new computer and runs the suite for the first time. Say what happens, and say what would happen on the second run on the same computer.

<details><summary>Answer</summary>

Without the dependency, Playwright does not promise that the setup runs before your tests. If you run a single spec file, the setup file is not selected at all, so `admin.json` is never written. On a new computer the file does not exist. Every test that uses the saved admin session fails with an error about a missing file, not about the shop. A test that starts with empty storage and signs in by itself can still pass. On the second run the file exists from the first full run, so the suite may pass, but with a session the server may have forgotten. The danger is that the problem comes and goes. The `dependencies` line makes the order a rule and not a matter of luck.

</details>

2. **Find the bug.** This sign out test passes. Why is it still wrong?

```ts
test("signing out returns to the login page", async ({ page, request }) => {
  await loginViaApi(request, ADMIN)
  await page.goto("/dashboard")
  await expect(page.getByTestId("dashboard-stats")).toBeVisible()

  await page.getByTestId("logout-button").click()

  await expect(page).toHaveURL(/\/login/)
})
```

<details><summary>Answer</summary>

The test logs in with the `request` fixture, which has its own cookies, separate from the page. The browser still carries the shared admin cookie from the saved file. The click on "Sign out" then deletes the shared admin session on the server, and every later test loses its login. The fix is `loginViaApi(page.request, ADMIN)`, because `page.request` shares cookies with the page. The test passes in both versions, and that is why the bug is dangerous.

</details>

3. **Two versions.** `global.setup.ts` signs in through the real login page. It could call `loginViaApi` and save the state instead. Which is better here, and what would make you choose the other?

<details><summary>Answer</summary>

The API version is faster and has no `toPass` block, so it has fewer ways to be flaky. The UI version proves once per run that a real person can sign in, which also warns you early when the login page is broken. Here the dedicated tests in `auth.spec.ts` already cover the login page, so the API version would be enough. Choose the UI version when your suite has no other login test, or when the login has steps an API call would skip, such as a code sent by email.

</details>

4. **What breaks if.** A requirement changes: the shop must end every session after 5 minutes. Your suite takes 20 minutes. What breaks, which tests fail first, and what are two ways to fix it?

<details><summary>Answer</summary>

The saved token is made once at the start. After 5 minutes the server rejects it, so every test that starts after that moment is sent to the login page. The tests fail in the second half of the run, and each one passes if you run it alone and early. One fix is to make the session last longer in the test environment only. A second fix is to sign in again through the API at the start of each test file, so no session is older than a few minutes.

</details>

5. **Explain it.** Explain storage state to a new teammate in three sentences. Do not use the words "cookie" or "token".

<details><summary>Answer</summary>

A good answer: "When you sign in, the server gives your browser a small secret that says you are allowed in. Playwright can copy that secret into a file at the start of the run. Each test then starts with a copy of the file, so it begins already signed in and skips the login screen." The key ideas are that the secret is what proves who you are, that it is saved once, and that many tests reuse it. A weak answer says only "it saves the login", because it hides what is saved.

</details>

6. **Judgement.** A teammate says the shared admin session is risky and every test should sign in on its own through the API. Do you agree?

<details><summary>Answer</summary>

There is no single right answer. One session per test removes the sign out problem, because no test can harm another, and it costs one fast request per test. A shared session is faster and simpler, and it fails only for the few tests that change the session itself. The choice depends on how many tests change the session, how many tests you have, and how costly one extra request is. In the shop only one test signs out, so a shared session plus one exception is a fair choice. If many tests changed sessions, per-test sessions would be better.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **What do the cookie attributes `HttpOnly`, `Secure` and `SameSite` do?**
   - Search for: `http cookies HttpOnly Secure SameSite MDN`
   - Try it: sign in to the shop in your browser. Open DevTools, then Application, then Cookies, and find `shop_session`. Note which boxes are ticked. Then open the Console tab and type `document.cookie`. See if the session cookie appears.
   - A good answer explains: what attack or risk each attribute reduces, and why `document.cookie` does not show an `HttpOnly` cookie.

2. **How does a server decide that a session token is not valid?**
   - Search for: `session token validation server side session store`
   - Try it: open your own `e2e/.auth/admin.json` in an editor, and do not share it. Copy the cookie object into a new spec as an inline `test.use({ storageState: { cookies: [...], origins: [] } })`, change only the `value` to `"abc"`, and open `/products`. Write down what you see.
   - A good answer explains: where the server looks up a token, why an invented value fails, and one reason a real token becomes invalid.

3. **Why must session files and passwords never be committed, and where do teams keep test secrets instead?**
   - Search for: `secrets in git repository environment variables CI`
   - Try it: in PowerShell run `git check-ignore -v apps/practice-shop/e2e/.auth/admin.json` and read which rule ignores the file. Then remove that line from a copy of the rule in your head and say what `git status` would show.
   - A good answer explains: the risk of a committed secret, and one safe place to keep it, such as CI secrets.

## Next step

In the next lesson you prepare test data through the API instead of the UI.
