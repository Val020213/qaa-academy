---
title: Authentication with storage state
summary: Sign in once, save the session, reuse it in every test, and test the signed-out case.
duration: 30 min
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

## Next step

In the next lesson you learn to prepare test data through the API instead of the UI.
