---
title: Authentication with storage state
duration: 60 min
---

## Goal

Save a session at the start of a run and use it in tests that need authentication. Distinguish the browser's state from the session the server maintains.

- Read the dependency between the `setup` and `chromium` projects.
- Save and load a session with storage state.
- Start tests signed out or with their own session.
- Recognize when a saved token becomes invalid.

## Reusing authentication

If every test signs in through the UI, it repeats the login steps even when testing another page. A saved session lets product tests skip those steps. `auth.spec.ts` still tests the login form with an empty session.

After login, the shop's server returns a cookie containing a session token. The browser stores the cookie and sends it with requests to the shop. The server looks up that token to identify the user.

Playwright can save a browser context's cookies to a **storage state** file. Each test gets a new context that loads those values: the contexts are separate, but they use the same session token.

![Two contexts load the same token; logout invalidates its server session while the file remains.](/images/04-session-token.en.svg)

The shop's cookie is called `shop_session`. The server creates it in `app/api/auth/login/route.ts` with `httpOnly: true`, which prevents JavaScript on the page from reading it. Playwright can save it because it accesses the browser from outside the page.

Storage state can also save `localStorage`. The shop does not use it to authenticate users, so `origins` is empty in its session file.

## The setup project

Open `apps/practice-shop/playwright.config.ts`:

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

The `setup` project runs `global.setup.ts`. The `dependencies: ["setup"]` dependency makes the runner execute that project before the `chromium` tests.

If you remove the dependency and run a single file, such as `pnpm shop:e2e products/products.spec.ts`, the runner selects tests matching that file. `global.setup.ts` does not match. On a fresh checkout `e2e/.auth/admin.json` does not exist, so tests loading that state fail while creating the browser context or API client because they cannot read the file.

Empty storage in `setup` prevents it from inheriting `storageState: "e2e/.auth/admin.json"` from the general config. Without that option, setup would try to read the file before it could create it.

## Saving the session in setup

Open `apps/practice-shop/e2e/global.setup.ts`. After filling in the form, the test ends with:

```ts
await page.getByTestId("login-submit").click()
await expect(page).toHaveURL(/\/dashboard/)

// Save the cookies for tests that keep the default storageState.
await page.context().storageState({ path: AUTH_FILE })
```

The assertion waits for the dashboard URL before saving the state. The file `e2e/.auth/admin.json` therefore contains the cookie the browser received after login.

The general `use` setting loads that file:

```ts
// Tests using this default start signed in as admin (saved by setup).
storageState: "e2e/.auth/admin.json",
```

Tests that keep this setting start with the admin session. They can open `/products` directly, without going through the login form.

## Protecting the session file

The file `e2e/.auth/admin.json` contains an active session cookie. Anyone with the file can use that session as admin while the server accepts it. Treat it like a password.

The folder is listed in `apps/practice-shop/e2e/.gitignore`:

```text
.auth/
```

Git skips untracked ignored files when adding changes normally. An already tracked or force-added file can still enter a commit; do not add the session. Each person and each CI run makes a new one when the setup runs.

## Testing signed out

To test a visitor's access, change the setting with `test.use`. `auth.spec.ts` uses empty storage at the top of the file:

```ts
// These tests start signed out: an empty session instead of the saved admin one.
test.use({ storageState: { cookies: [], origins: [] } })
```

Each test in that file starts signed out. The first test checks the redirect to login:

```ts
await page.goto("/products")

await expect(page).toHaveURL(/\/login\?next=%2Fproducts/)
await expect(page.getByTestId("login-card")).toBeVisible()
```

You can also apply the setting inside a `test.describe` group, as in the practice.

## Giving the logout test its own session

Signing out deletes the token on the server through `app/api/auth/logout/route.ts`. If a test signs out the shared session, other contexts keep the cookie, but the server no longer recognizes its token. The file `admin.json` does not change: the change is in the server's session list.

Tests that sign out or invalidate a session need their own. The shop's logout test signs in again before opening the dashboard:

```ts
// Log in with a NEW session just for this test. Signing out deletes the
// session on the server, so we must not use the shared admin one.
await loginViaApi(page.request, ADMIN)
await page.goto("/dashboard")
```

`loginViaApi` calls the login API. The server returns a new cookie. Since `page.request` shares cookies with the page, that test's browser receives the new session.

The `request` fixture has its own cookies, separate from the page. Signing in with that fixture does not replace the browser's cookie.

## Go deeper

### A saved file can contain an invalid session

The shop keeps the mapping between each token and a user in memory. `lib/session.ts` looks up that mapping:

```ts
const token = (await cookies()).get(SESSION_COOKIE)?.value
if (!token) return undefined

const userId = store().sessions.get(token)
```

If the server restarts and loses its sessions in memory, the file still exists, but its token becomes invalid. That is why setup signs in again on each run.

Resetting test data preserves sessions. The comment in `lib/store.ts` states this: "Sessions are kept, so logged-in tests stay logged in."

## Practice

1. Open `apps/practice-shop/playwright.config.ts` and find the `chromium` project's dependency.
2. Create `apps/practice-shop/e2e/auth/storage-practice.spec.ts` with this code:

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

3. Start the shop with `pnpm shop:dev`. In another terminal run:

```bash
pnpm shop:e2e auth/storage-practice.spec.ts
```

4. Check that both tests pass and that the second uses `test.use` inside its group. In PowerShell, check that setup created the session file. Do not share it or paste it anywhere.

```bash
Test-Path apps/practice-shop/e2e/.auth/admin.json
```

5. In the `Signed out` group, replace the empty session with a file that does not exist: `test.use({ storageState: "e2e/.auth/nothing.json" })`. Run the spec, read the missing-file error, and undo the change.

## Challenge

Write a test that signs in as viewer, saves that session, and opens a browser context from the file. The viewer can read products but cannot create them. Preserve the shared admin session.

Create `apps/practice-shop/e2e/challenges/viewer-session.spec.ts`. The account is `VIEWER` in `e2e/lib/fixtures/api-client.ts`.

It is done when:

- The test writes `e2e/.auth/viewer.json` and passes even if you delete that file before running it.
- It opens `/products` as viewer: `user-role` says `viewer` and there is no `products-new` link.
- In the same browser context, a `POST` to `/api/products` receives status 403.
- The test never clicks sign out and `pnpm shop:e2e auth/auth.spec.ts` still passes after running your spec.

Search for how to create an API client without the config's saved session, save its cookies, and create a browser context from that file: `playwright request.newContext`, `playwright APIRequestContext storageState path`, `playwright browser.newContext storageState`, `playwright test.beforeAll`.

## Think it through

1. You remove `dependencies: ["setup"]` from the `chromium` project and run `pnpm shop:e2e products/products.spec.ts` on a fresh checkout. What fails before the products page opens?

<details>
<summary>Answer</summary>

The runner does not select `global.setup.ts`, because it does not match the requested file and is no longer a dependency. Tests that load `e2e/.auth/admin.json` fail while creating the browser context or API client: the file does not exist yet.

</details>

2. This test uses the general config with the saved admin session. It passes, but can make other tests fail. Find the bug.

```ts
test("signing out returns to the login page", async ({ page, request }) => {
  await loginViaApi(request, ADMIN)
  await page.goto("/dashboard")
  await expect(page.getByTestId("dashboard-stats")).toBeVisible()

  await page.getByTestId("logout-button").click()

  await expect(page).toHaveURL(/\/login/)
})
```

<details>
<summary>Answer</summary>

`loginViaApi` creates a session in the `request` fixture, which does not share cookies with the page. The browser keeps the shared admin session, and logout deletes it on the server. Use `loginViaApi(page.request, ADMIN)` so the browser receives its own session before signing out.

</details>

3. A requirement changes: the shop must end every session after 5 minutes. Your suite takes 20 minutes. Which tests fail, and what are two ways to fix it?

<details>
<summary>Answer</summary>

The saved token is made once at the start. After 5 minutes the server rejects requests with that token, including requests from a test already running. Protected navigation redirects to login and the API returns `401`. One fix is a duration longer than the entire run, only in tests. Another is an API login for each test’s own session, provided it finishes within 5 minutes; longer tests need to renew the session.

</details>

## Next step

In the next lesson you prepare test data through the API instead of the UI.
