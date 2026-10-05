---
title: Tour of the e2e folder
summary: Learn what every file in the shop's test suite is for, and how one test run flows from the config to the report.
duration: 45 min
---

## Goal

- Name every file and folder of the shop's test suite and say what it is for.
- Describe the order of a run: config, server, setup, specs.
- Find the report and the traces after a run.

## Open the folder

In VS Code, open `apps/practice-shop/e2e`. A real team project looks like this. When you join one, you will do this tour first.

```text
apps/practice-shop/
  playwright.config.ts
  e2e/
    README.md
    COVERAGE.md
    global.setup.ts
    dashboard.spec.ts
    auth/auth.spec.ts
    products/products.spec.ts
    orders/orders.spec.ts
    lib/
      test.ts
      helpers.ts
      fixtures/api-client.ts
      pages/products.page.ts
    .auth/
    .gitignore
```

## The documents

`README.md` explains how to run the suite and lists the team rules. Read it first in any project.

`COVERAGE.md` lists what the tests cover and what is still missing. Your pull request in this module will close some of those gaps.

## The specs

A **spec** is a file that ends in `.spec.ts`. It holds tests. The suite has four:

- `auth/auth.spec.ts`: login, wrong password, sign out.
- `dashboard.spec.ts`: loading text, then the numbers.
- `products/products.spec.ts`: list, search, filter, create, delete.
- `orders/orders.spec.ts`: status filter, mark as paid.

Specs are grouped in folders by feature. Put a new spec in the folder of its feature.

## The setup file

`global.setup.ts` is not a normal spec. It runs first, before all others. It does two things:

1. It calls `POST /api/test/reset` to put the data back to its first state.
2. It signs in as admin through the login page and saves the session.

## The lib folder

`lib` holds code that specs share.

- `test.ts` exports `test` and `expect`. Specs import from here, never from `@playwright/test`.
- `helpers.ts` has `uniqueName()` and `uniqueSku()`. They make data that no other test uses.
- `fixtures/api-client.ts` has `loginViaApi`, `createProduct` and `deleteProduct`. They prepare data through the API. It also has the users `ADMIN` and `VIEWER`.
- `pages/products.page.ts` is a **Page Object**: a class that knows where the elements of the products page are. It never asserts.

## The .auth folder

`.auth/admin.json` is the saved admin session. The setup file writes it. The file `e2e/.gitignore` tells Git to ignore this folder, because a session is private and changes on every run.

## The config

`playwright.config.ts` is in `apps/practice-shop`, outside `e2e`. These settings matter most:

- `testDir: "./e2e"` tells Playwright where to look for specs.
- `workers: 1` runs tests one at a time, because they share the app's memory.
- `use.baseURL` lets tests write `page.goto("/products")`.
- `use.storageState: "e2e/.auth/admin.json"` starts every test signed in.
- `projects` has two entries: `setup` and `chromium`.
- `webServer` starts the app.

## How a run flows

When you run the suite, this happens in order:

1. Playwright reads `playwright.config.ts`.
2. It checks `webServer.url`. If the shop already answers on port 5190, it reuses it. If not, it starts `pnpm dev --port 5190` and waits.
3. The `setup` project runs `global.setup.ts`. It resets the data and saves `.auth/admin.json`.
4. The `chromium` project has `dependencies: ["setup"]`, so it starts only after setup passes. If setup fails, no spec runs.
5. The specs run one by one, each starting signed in as admin.
6. Playwright writes the results.

## Where results go

Two folders appear in `apps/practice-shop`:

- `playwright-report/` holds the HTML report.
- `test-results/` holds screenshots and traces of failed tests.

Both are ignored by Git. Each new run replaces them.

## Go deeper

### Why setup is a project, not a normal test

The `chromium` project says `dependencies: ["setup"]`. Playwright runs the `setup` project first and waits. If it fails, Playwright skips the rest and tells you so. You see one clear failure, not seventeen confusing ones.

The setup test must start with an empty session. The config shows `storageState: { cookies: [], origins: [] }` for `setup`. If it loaded `admin.json`, it would look for a file that its own run is about to create.

### A wrong idea: "the Page Object should check things too"

Beginners often put assertions inside a Page Object, such as `expectRowVisible()`. It looks tidy. But then the Page Object decides what is correct, and one page cannot serve two tests that expect different results. In this suite, `ProductsPage` only knows where things are and how to click them. The spec says what must be true. The test still reads like a story.

### How it shows up in real QA automation work

Without saved sessions, each test would sign in through the page:

```ts
import { test } from "../lib/test"
import { ADMIN } from "../lib/fixtures/api-client"

test.use({ storageState: { cookies: [], origins: [] } })

test("a test that signs in by itself", async ({ page }) => {
  await page.goto("/login")
  await page.getByTestId("login-email").fill(ADMIN.email)
  await page.getByTestId("login-password").fill(ADMIN.password)
  await page.getByTestId("login-submit").click()
  // ... now the real test starts
})
```

The `test.use` line starts the test signed out. Without it, the saved admin session would send `/login` to the dashboard, and the form would never appear.

With 17 tests, you would repeat these four lines 17 times, and add a few seconds to each test. The suite writes the login once in `global.setup.ts` and saves the cookies. This is the idea called **DRY**: Don't Repeat Yourself. A fact lives in one place. If the login page changes, you fix the setup file for all these tests. The auth spec tests the login page itself, so it has its own login steps and needs the same update. You studied DRY earlier in the course. The same idea applies to `baseURL` in the config: the address of the shop is written once, so tests write `page.goto("/products")`.

### The trade-off of `workers: 1`

A **worker** is a process that runs tests. With one worker, tests run one after another. That is slower. The reason is shared state: all tests change the same in-memory data. With many workers, two tests could mark order 1005 as paid at the same time and break each other.

Teams that need speed solve it differently. Each worker gets its own data or its own server. That costs more set-up. For a small shop, slow and stable is the better choice.

Also remember that readability still matters more than removing every repetition. A test that shows its own steps is easier to read than one that hides them.

## Practice

1. Open `apps/practice-shop/e2e/README.md` and read the "Conventions" section.
2. Open `global.setup.ts`. Find the line that resets the data.
3. Open `playwright.config.ts`. Find `dependencies`, `workers` and `reuseExistingServer`.
4. Open `orders/orders.spec.ts`. Check that it imports from `../lib/test`.
5. Draw the run flow from memory on paper. Compare it with the list above.

## Check what you know

1. Why does `global.setup.ts` run before the specs?

<details><summary>Answer</summary>

The `chromium` project depends on `setup`. Setup resets the data and saves the admin session that every test uses.

</details>

2. What does `uniqueSku()` give you?

<details><summary>Answer</summary>

A valid SKU, such as `SKU-4821`, that the seed data and other tests do not use.

</details>

3. Where do you put a new spec about orders?

<details><summary>Answer</summary>

In the `orders` folder, for example `e2e/orders/`.

</details>

4. Why is `.auth` ignored by Git?

<details><summary>Answer</summary>

It holds a private session that changes on every run. It must not be shared.

</details>

5. Suppose you change `workers: 1` to `workers: 4`. Two tests use order 1005: one marks it paid, one checks it is pending. What could happen, and why?

<details><summary>Answer</summary>

The tests could run at the same moment. If the first one marks the order paid before the second one checks, the second fails with `paid` instead of `pending`. The failure would not happen every time. It depends on timing, so it is a flaky test. The cause is shared data, not a bug in the app.

</details>

6. You delete the file `e2e/.auth/admin.json` and run `pnpm shop:e2e`. Does the suite fail? Why?

<details><summary>Answer</summary>

No. The `setup` project runs first and signs in again, and it saves a new `admin.json`. Only then do the other tests start. The file is created by the run, so it is safe to delete.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **What is a Page Object in test automation, and what should it not contain?**
   - Search for: `page object model pattern playwright`
   - A good answer explains: that a Page Object holds locators and actions for a page, and why many teams keep assertions in the test

2. **How does Playwright reuse a signed-in session between tests?**
   - Search for: `playwright authentication storageState`
   - A good answer explains: what is saved in the storage state file, and why it makes tests faster

3. **What is a cookie, and how does a website use it to remember that you are signed in?**
   - Search for: `http cookie session login how it works`
   - A good answer explains: what the browser stores and sends back, and why a saved cookie can sign a test in

## Next step

In the next lesson you run the suite and read the report of a failing test.
