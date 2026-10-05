# End-to-end tests for QA Shop

These tests use Playwright and TypeScript. Read them as a model, then add your own.

## Layout

```
playwright.config.ts        settings: projects, timeouts, web server
e2e/
  global.setup.ts           resets the data and signs in as admin
  auth/auth.spec.ts         login, wrong password, sign out
  dashboard.spec.ts         slow stats: loading text, then numbers
  products/products.spec.ts list, search, filter, create, delete
  orders/orders.spec.ts     status filter, mark as paid
  lib/
    test.ts                 every spec imports test and expect from here
    helpers.ts              uniqueName() and uniqueSku()
    fixtures/api-client.ts  create and delete data through the API
    pages/products.page.ts  Page Object for the products list
  .auth/                    saved admin session (ignored by git)
```

## How to run

From the repo root:

```
pnpm --filter practice-shop e2e
pnpm --filter practice-shop e2e:ui
pnpm --filter practice-shop e2e:headed
```

Or inside `apps/practice-shop`:

```
pnpm e2e
pnpm e2e:ui
pnpm e2e:headed
```

The config uses the dev server on port 5190 if it is already running. If not, it starts one. To use another port, set `SHOP_E2E_PORT`.

## How authentication works

1. The `setup` project runs first. It runs `global.setup.ts`.
2. That test signs in through the real login page and saves the cookies to `e2e/.auth/admin.json`.
3. The `chromium` project loads this file. Every test starts already signed in as admin.
4. Tests that need to be signed out use `test.use({ storageState: { cookies: [], origins: [] } })`.

Never sign out in a test that uses the shared admin session. Signing out deletes the session on the server, and every later test would fail. Log in again with `loginViaApi` first, as the sign out test does.

## How data stays independent

- The app keeps its data in memory. The setup test calls `POST /api/test/reset`, so each run starts with the seed data.
- Tests run one by one (`workers: 1`) because they share that memory.
- Each test creates what it needs, with `uniqueName()` and `uniqueSku()`.
- When the UI is not the thing under test, we create data through the API (`createProduct`).
- Order changes are one-way, so each test uses its own seeded order.

## Conventions

- Import `test` and `expect` from `lib/test`, never from `@playwright/test`.
- Select with `page.getByTestId(...)`. No CSS, no XPath, no text selectors for things you click.
- Never use `page.waitForTimeout`. Use web-first assertions: `await expect(locator)...`.
- One behaviour per test. The test name says what the user sees.
- Each test makes its own data and never depends on another test or on the order.
- Page Objects hold locators and actions. Assertions stay in the specs.
- Style: double quotes, no semicolons, 2 spaces, trailing commas.
- If React may not be ready when you type, wrap the typing in `expect(async () => {...}).toPass()`.
