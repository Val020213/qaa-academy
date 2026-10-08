---
title: Tour of the e2e folder
duration: 50 min
---

## Goal

In this lesson you tour the shop's test suite and follow a run from configuration to results.

- Find the suite's instructions and coverage notes.
- Identify the specs, setup and shared code.
- Follow the execution order and find the results.
- Choose where a new spec and its Page Object belong.

## Open the folder

In VS Code, open `apps/practice-shop/e2e` and locate these files:

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

`README.md` explains how to run the suite and lists the team rules. Start there.

`COVERAGE.md` lists what the tests cover and what is still missing.

## The specs

The suite has four test files:

- `auth/auth.spec.ts`: login, wrong password, sign out.
- `dashboard.spec.ts`: loading text, then the numbers.
- `products/products.spec.ts`: list, search, filter, create, delete.
- `orders/orders.spec.ts`: status filter, mark as paid.

Specs are grouped in folders by feature. Put a new spec in the folder of its feature.

## The setup file

Playwright's test runner runs `global.setup.ts` in the `setup` project, before the `chromium` specs. The test does two things:

1. It calls `POST /api/test/reset` to put the data back to its initial state.
2. It signs in as admin through the login page and saves the session.

The order test changes order 1005 from `pending` to `paid`. The reset restores its initial state before each run, so the same test can pass again without restarting the server.

The reset in `lib/store.ts` keeps existing sessions: it replaces the data but preserves the sessions map.

The `setup` project uses `storageState: { cookies: [], origins: [] }`. This starts it signed out and avoids loading `admin.json`, the file it needs to create.

## The lib folder

`lib` holds code that specs share.

- `test.ts` exports `test` and `expect`. Specs import from here, never from `@playwright/test`. Today the file re-exports them; if fixtures are added there, the specs keep their imports.
- `helpers.ts` has `uniqueName()` and `uniqueSku()`. The name includes eight characters from a random UUID; the SKU cycles through 1000 to 9999 from a random starting point. They reduce collisions, but values can repeat across processes or when the range is exhausted.
- `fixtures/api-client.ts` has `loginViaApi`, `createProduct` and `deleteProduct`. They prepare data through the API. It also has the users `ADMIN` and `VIEWER`.
- `pages/products.page.ts` holds the product locators and actions in `ProductsPage`. Assertions stay in the spec.

This locator in `ProductsPage` selects rows by their test id prefix:

```ts
this.rows = page.getByTestId(/^products-row-/)
```

The regular expression matches every id that starts with `products-row-`. The two order tests use locators directly; they have no Page Object.

![The product spec uses shared code; coverage records what the spec checks.](/images/05-spec-dependencies.en.svg)

## The .auth folder

Setup writes the saved admin session to `.auth/admin.json`. The file `e2e/.gitignore` tells Git to ignore this folder because it contains a private session that changes on every run.

## The config

`playwright.config.ts` is in `apps/practice-shop`, outside `e2e`. These settings connect the pieces:

- `testDir: "./e2e"` tells Playwright where to look for specs.
- `workers: 1` runs tests one at a time, because they share the app's memory.
- `use.baseURL` lets tests write `page.goto("/products")`.
- `use.storageState: "e2e/.auth/admin.json"` loads the admin session by default. Setup and authentication tests override that state with empty cookies and origins.
- `projects` has two entries: `setup` and `chromium`.
- `webServer` starts the app.

A worker is a process that runs tests. Using one prevents tests from changing the same data at the same time, at the cost of running them one after another.

## How a run flows

When you run the suite, this happens in order:

![Configuration connects the server, setup, saved session, specs and results.](/images/05-suite-flow.en.svg)

1. Playwright reads `playwright.config.ts`.
2. It checks `webServer.url`, which uses port 5190 unless you change it with `SHOP_E2E_PORT`. If the shop answers and `CI` is absent or empty, it reuses it; with nonempty `CI`, it fails. If the shop does not answer, it starts `webServer.command` and waits.
3. The `setup` project runs `global.setup.ts`. It resets the data and saves `.auth/admin.json`.
4. The `chromium` project has `dependencies: ["setup"]`, so it starts only after setup passes. If setup fails, the `chromium` specs do not run.
5. The specs run one by one, with the admin session by default or the state declared by the spec.
6. Playwright writes the results.

## Where results go

Two folders appear in `apps/practice-shop`:

- `playwright-report/` holds the HTML report.
- `test-results/` holds screenshots and traces of failed tests.

Both are ignored by Git. Each new run replaces them.

## Practice

1. Open `apps/practice-shop/e2e/README.md` and read the "Conventions" section.
2. Open `global.setup.ts`. Find the line that resets the data.
3. Open `playwright.config.ts`. Find `dependencies`, `workers` and `reuseExistingServer`.
4. Open `orders/orders.spec.ts`. Check that it imports from `../lib/test`.
5. Draw the run flow on paper using the files you reviewed. Compare it with the list above.

## Challenge

Create `apps/practice-shop/e2e/lib/pages/orders.page.ts` with an `OrdersPage` class and use it in `apps/practice-shop/e2e/orders/orders-shipped.spec.ts`. The spec has one test: an admin filters orders by `shipped` and checks that orders 1003, 1007 and 1011 each show the status `shipped`.

It is done when:

- `OrdersPage` can open the page, filter by a status, and give you the row and status of an order by its id. The file `orders.page.ts` contains no `expect`.
- The spec imports `test` and `expect` from `../lib/test` and uses only `getByTestId`, through your class.
- `pnpm --filter practice-shop e2e e2e/orders/orders-shipped.spec.ts` passes. Run it twice in a row.
- The test only reads data. It does not change any order.

Use `products.page.ts` as a model for the class. Search for: `typescript class constructor readonly property`, `playwright locator getByTestId template string`.

## Think it through

1. Remove the line `use: { storageState: { cookies: [], origins: [] } }` from the `setup` project, and delete `e2e/.auth/admin.json`. What happens on the next run, and why?

<details><summary>Answer</summary>

The setup test inherits `storageState: "e2e/.auth/admin.json"` from the top-level `use`. Playwright fails when creating its context because the file does not exist yet. Because `chromium` depends on `setup`, no other test runs.

</details>

2. Two developers run `pnpm shop:e2e` on the same computer at nearly the same time. Both runs find the shop on port 5190 and reuse it. What can go wrong?

<details><summary>Answer</summary>

Both runs share the server's in-memory data. Run B's setup can reset it while run A is testing: order 1005 changes from `paid` back to `pending`, or a newly created product disappears. The suite needs one run at a time against that shop.

</details>

## Next step

In the next lesson you run the suite and read the report of a failing test.
