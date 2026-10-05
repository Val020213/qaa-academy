---
title: Authentication with storage state
summary: Sign in once, save the session, reuse it in every test, and test the signed-out case.
duration: 45 min
---

## Goal

- Explain why signing in through the UI in every test is a problem.
- Read `global.setup.ts` and the projects in the config.
- Test signed-out behaviour with an empty session.
- Explain why the sign out test logs in again.

## The problem

Almost every page of the shop needs a login. If every test signed in through the login page, each test would do the same steps first: open the page, type the email, type the password, click.

That costs time in every test. It also adds failures: if the login page breaks, all tests fail, and none of them is about the login.

The fix is to sign in **once** and reuse the result.

## Storage state

When you sign in, the server gives your browser a **cookie**. A cookie is a small piece of data the browser keeps. The server reads it on each request to know who you are.

Playwright can save the cookies of a browser to a file. This is called **storage state**. A new test can start with that file, so it is already signed in.

## The setup project

Open `apps/practice-shop/playwright.config.ts`. It has two **projects**. A project is a named group of tests with its own settings.

```ts
projects: [
  {
    name: "setup",
    testMatch: /global\.setup\.ts/,
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

The setup project uses an empty session on purpose. The comment in the config explains: the default session file does not exist yet, so the setup project must not load it.

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

Signing out deletes the session on the server. If a test signed out the shared admin session, every later test would lose its login.

So the sign out test makes its own session first:

```ts
// Log in with a NEW session just for this test. Signing out deletes the
// session on the server, so we must not use the shared admin one.
await loginViaApi(page.request, ADMIN)
await page.goto("/dashboard")
```

`loginViaApi` calls the login API. The cookie goes into this test's own browser context. The next lesson explains `page.request`.

> **Careful:** Never click sign out in a test that uses the shared admin session. The `e2e/README.md` repeats this rule.

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

## Check what you know

1. What is storage state?

<details><summary>Answer</summary>

The cookies of a browser saved in a file. A test can load it to start already signed in.

</details>

2. What does `dependencies: ["setup"]` do?

<details><summary>Answer</summary>

The `chromium` project waits for the `setup` project to finish before it runs.

</details>

3. Why is `.auth/` in `.gitignore`?

<details><summary>Answer</summary>

The file holds a live session. It must not be committed.

</details>

4. Why does the sign out test call `loginViaApi` first?

<details><summary>Answer</summary>

Signing out deletes the session on the server. The test needs its own session so it does not break the shared admin one.

</details>

5. You stop the shop and start it again. The file `e2e/.auth/admin.json` is still on your disk. What happens if a test uses that old file to visit `/products`? Why does a normal run still work?

<details><summary>Answer</summary>

The file holds a token, and the server kept its list of tokens in memory. After the restart, the list is empty, so the token is unknown. The server treats the visitor as signed out and redirects to the login page, and the test fails. A normal run still works because the setup project runs first. It signs in again and writes a new file.

</details>

6. A teammate adds one new test. After that, the suite passes the first tests, but from some point on every test fails and redirects to the login page. The new test passes alone. What kind of line would you look for in the new test?

<details><summary>Answer</summary>

Look for a click on the sign out button, or any call that ends the session. The new test uses the shared admin session. Signing out deletes that session on the server, so every test that runs after it loses its login. The test passes alone because nothing runs after it. The fix is to give that test its own session with `loginViaApi`.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **What do the cookie attributes `HttpOnly`, `Secure` and `SameSite` do?**
   - Search for: `http cookies HttpOnly Secure SameSite MDN`
   - A good answer explains: what attack or risk each attribute reduces.

2. **How can a Playwright project use a different saved session for each role?**
   - Search for: `playwright authentication multiple roles storage state`
   - A good answer explains: how to save one file per role and how a test or project chooses one.

3. **Why must real passwords and session files never be committed, and where do teams keep test secrets instead?**
   - Search for: `secrets in git repository environment variables CI`
   - A good answer explains: the risk of a committed secret, and one safe place to keep it, such as CI secrets.

## Next step

In the next lesson you learn to prepare test data through the API instead of the UI.
