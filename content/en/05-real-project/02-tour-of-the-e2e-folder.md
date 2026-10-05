---
title: Tour of the e2e folder
summary: Learn what every file in the shop's test suite is for, and how one test run flows from the config to the report.
duration: 30 min
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

## Next step

In the next lesson you run the suite and read the report of a failing test.
