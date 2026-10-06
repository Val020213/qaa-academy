---
title: Tour of the e2e folder
summary: Learn what every file in the shop's test suite is for, why each one exists, and how one test run flows from the config to the report.
duration: 75 min
---

## Start with a puzzle

A teammate runs `pnpm shop:e2e` and sees `17 passed`. She does not restart the shop. She runs the same command again. It also shows `17 passed`.

But the first run changed data that cannot be changed back. The test "an admin marks a pending order as paid" turns order 1005 from `pending` to `paid`. The shop has no "undo". The same test starts by checking that order 1005 is `pending`.

So how can the second run pass? Think about which file or which line could make it possible.

Write down your guess before you read on.

## Goal

- Explain what each file and folder of the suite is for, and what would break if it were missing.
- Predict the order of a run: config, server, setup, specs.
- Decide where a new file belongs in the folder.
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

Do not read the files in order. First look at the names and guess. Where would you look to find "how to run the tests"? Where would you look for "what is still not tested"? Then check your guess with the notes below.

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

### Back to the puzzle

The second run passes because step 1 of the setup file runs at the start of every run. Order 1005 is pending again before the first spec starts. The status change is one-way inside the app, but the test-only reset address sits outside the app's rules.

There is one more detail in `lib/store.ts`: the reset keeps the open sessions. The comment says "so logged-in tests stay logged in". Remember this when you think about what a reset does to a signed-in user.

## The lib folder

`lib` holds code that specs share.

- `test.ts` exports `test` and `expect`. Specs import from here, never from `@playwright/test`. Today the file only passes them through. That looks pointless. The reason is that one day you may add your own fixtures there, and no spec will need to change its import.
- `helpers.ts` has `uniqueName()` and `uniqueSku()`. They make data that no other test uses.
- `fixtures/api-client.ts` has `loginViaApi`, `createProduct` and `deleteProduct`. They prepare data through the API. It also has the users `ADMIN` and `VIEWER`.
- `pages/products.page.ts` is a **Page Object**: a class that knows where the elements of the products page are. It never asserts.

Look at how `ProductsPage` finds all the rows at once:

```ts
this.rows = page.getByTestId(/^products-row-/)
```

The test id is a regular expression here. It means "every id that starts with `products-row-`". One line finds all rows, however many there are. Notice what is missing: there is no Page Object for orders. The suite has only two order tests, so a class would add code and give little. This is **YAGNI**: do not build for a need you only imagine. If the orders page grows, you can add one then.

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

The `chromium` project says `dependencies: ["setup"]`. Playwright runs the `setup` project first and waits. If it fails, Playwright skips the rest and tells you so. You see one clear failure, not many confusing ones.

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

With 17 tests, you would repeat these four lines 17 times, and add a few seconds to each test. The suite writes the login once in `global.setup.ts` and saves the cookies. This is the idea called **DRY**: Don't Repeat Yourself. A fact lives in one place. If the login page changes, you fix the setup file for all these tests. The auth spec tests the login page itself, so it has its own login steps and needs the same update. The same idea applies to `baseURL` in the config: the address of the shop is written once, so tests write `page.goto("/products")`.

DRY has a counterweight: **KISS**, keep it simple. If a shared helper is harder to read than the lines it replaces, copy the lines. Both ideas serve one goal: the next person can change the suite without fear.

### The trade-off of `workers: 1`

A **worker** is a process that runs tests. With one worker, tests run one after another. That is slower. The reason is shared state: all tests change the same in-memory data. With many workers, two tests could mark order 1005 as paid at the same time and break each other.

Teams that need speed solve it differently. Each worker gets its own data or its own server. That costs more set-up. For a small shop, slow and stable is the better choice.

A good suite follows the letters of **FIRST**: tests should be Fast, Independent, Repeatable, Self-checking and Timely. This suite pays a little of "Fast" to get "Independent" and "Repeatable".

## Practice

1. Open `apps/practice-shop/e2e/README.md` and read the "Conventions" section.
2. Open `global.setup.ts`. Find the line that resets the data.
3. Open `playwright.config.ts`. Find `dependencies`, `workers` and `reuseExistingServer`.
4. Open `orders/orders.spec.ts`. Check that it imports from `../lib/test`.
5. Draw the run flow from memory on paper. Compare it with the list above.

## Challenge

The suite has a Page Object for products but none for orders. Write one, and use it in a new spec. You will practise a rule of the team: the Page Object knows where things are, and the spec decides what is true.

Create two files. The first is `apps/practice-shop/e2e/lib/pages/orders.page.ts`. It holds a class `OrdersPage` for the orders page. The second is `apps/practice-shop/e2e/orders/orders-shipped.spec.ts`. It has one test: an admin filters orders by `shipped` and sees that the shipped orders 1003, 1007 and 1011 each show the status `shipped`.

It is done when:

- `OrdersPage` can open the page, filter by a status, and give you the row and the status of an order by its id.
- The file `orders.page.ts` contains no `expect`.
- The spec imports `test` and `expect` from `../lib/test` and uses only `getByTestId`, through your class.
- `pnpm --filter practice-shop e2e e2e/orders/orders-shipped.spec.ts` passes. Run it twice in a row.
- The test only reads data. It does not change any order, so it cannot break another test.

You will need something this lesson did not teach: how to write a TypeScript class that stores locators and has methods, as `ProductsPage` does, and how to build a test id from a variable. Search for: `typescript class constructor readonly property`, `playwright locator getByTestId template string`.

> **Tip:** Read `products.page.ts` as a model. Copy its shape, not its words. Decide yourself which parts you really need. KISS and YAGNI apply: two or three methods are enough.

## Think it through

1. Remove the line `use: { storageState: { cookies: [], origins: [] } }` from the `setup` project, and delete `e2e/.auth/admin.json`. What happens on the next run, and why?

<details><summary>Answer</summary>

The setup test now inherits `storageState: "e2e/.auth/admin.json"` from the top-level `use`. That file does not exist, because setup is the test that would create it. Playwright fails when it tries to open the setup test with a file that is missing. Because `chromium` depends on `setup`, no other test runs. One small config line prevents a circle: setup needs the file, and the file needs setup.

</details>

2. A teammate is signed in through the saved session. During the run, the setup test calls `POST /api/test/reset`. Predict: is the teammate's session still valid afterwards? Why?

<details><summary>Answer</summary>

Yes. The reset code in `lib/store.ts` creates new products, orders and users, but copies the old `sessions` map into the new store. So an already signed-in browser keeps working. If the reset also cleared sessions, every saved cookie would stop working right after setup, and every test would be sent to the login page.

</details>

3. Find the problem in this test. It runs, but it is not good.

```ts
test("the products page shows 10 rows", async ({ page }) => {
  await page.goto("/products")
  const rows = await page.getByTestId(/^products-row-/).count()
  expect(rows).toBe(10)
})
```

<details><summary>Answer</summary>

`count()` reads the number once, at that moment. The page loads its list after it opens, so the count can be 0 and the test fails even though the app is right. Passing and failing then depend on speed. The web-first form `await expect(page.getByTestId(/^products-row-/)).toHaveCount(10)` retries until the number is right or the time ends. Use a plain `expect` on a plain value only when the value cannot change.

</details>

4. Two ways to sign in. Version A: every test signs in through the login page. Version B: the setup project signs in once and saves the cookies. Which is better here, and what would make you choose A?

<details><summary>Answer</summary>

B is better for the shop. It saves seconds per test and keeps the login steps in one place. You would choose A when the test is about the login itself, as `auth.spec.ts` is, or when each test needs a different user. A is also simpler to read for a tiny suite of two or three tests. The choice depends on how many tests there are and how many users they need.

</details>

5. Two developers run `pnpm shop:e2e` on the same computer at nearly the same time. Both runs find the shop on port 5190 and reuse it. What can go wrong?

<details><summary>Answer</summary>

Both runs share one memory. The setup of run B resets the data while run A is in the middle of its tests. Order 1005 turns from `paid` back to `pending`, or a product that run A just created disappears. The failures look random and cannot be repeated on request. The suite is built for one run at a time on one shop. Teams give each person or each CI job its own copy of the app.

</details>

6. Your suite has grown to 300 tests and takes 40 minutes with `workers: 1`. The team asks you to try `workers: 4`. There is no single right answer. What would you check before you agree?

<details><summary>Answer</summary>

First check whether tests share data. In the shop they do, so four workers would break each other unless each worker gets its own server and data. You would also weigh the cost: more machines and more set-up work, against 40 minutes of waiting on every change. Another path is to run the long suite less often and keep a short smoke suite for every change. The decision depends on how often the team ships and how much a late bug costs.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **What is a Page Object in test automation, and what should it not contain?**
   - Search for: `page object model pattern playwright`
   - Try it: open `products.page.ts` and imagine the test id `products-new` changes to `products-add`. Count how many files you must edit. Then do the same count for a spec that has no Page Object.
   - A good answer explains: that a Page Object holds locators and actions for a page, and why many teams keep assertions in the test.

2. **How does Playwright reuse a signed-in session between tests?**
   - Search for: `playwright authentication storageState`
   - Try it: after a run, open `e2e/.auth/admin.json`. Find the cookie called `shop_session`. Do not copy its value anywhere. Then explain in one line what the server needs to find in its memory to accept it.
   - A good answer explains: what is saved in the storage state file, and why it makes tests faster.

3. **What is a cookie, and how does a website use it to remember that you are signed in?**
   - Search for: `http cookie session login how it works httponly`
   - Try it: sign in to the shop, open DevTools, go to Application, then Cookies. Look at `shop_session` and its `HttpOnly` flag. In the Console tab, type `document.cookie` and see if the session cookie appears.
   - A good answer explains: what the browser stores and sends back, what `HttpOnly` changes, and why a saved cookie can sign a test in.

## Next step

In the next lesson you run the suite and read the report of a failing test.
