---
title: Describe, hooks and isolation
summary: Group tests with describe, share set-up with beforeEach, use only, skip and fixme with care, and name tests well.
duration: 45 min
---

## Goal

- Group tests with `test.describe`.
- Share steps with `beforeEach` and `afterEach`.
- Use `test.only`, `test.skip` and `test.fixme`, and know why `only` must never be committed.
- Explain test isolation and write test names that read as behaviours.

## test.describe: group tests

`test.describe` puts related tests in a group. The group has a name.

```ts
test.describe("login", () => {
  test("rejects wrong credentials", async ({ page }) => {
    // ...
  })

  test("accepts the test credentials", async ({ page }) => {
    // ...
  })
})
```

The report shows the group name before the test name, as in `login › rejects wrong credentials`. Use one group for one feature. You can see this in `e2e/playground.spec.ts`: it has the groups `login`, `test case list` and `slow loading`.

## beforeEach: steps every test needs

Almost every test in the Practice app starts with `page.goto("/#/practice")`. To avoid writing it again and again, use a **hook**. A hook is code that Playwright runs at a fixed moment.

`test.beforeEach` runs before every test:

```ts
test.beforeEach(async ({ page }) => {
  await page.goto("/#/practice")
})
```

Inside a group, the hook applies only to the tests of that group. At the top of a file, it applies to all tests in the file.

`test.afterEach` runs after every test, even when the test fails. Its function gets the fixtures first (here `{}`, because it needs none) and a second value, `testInfo`, with facts about the test.

```ts
test.afterEach(async ({}, testInfo) => {
  console.log(`${testInfo.title}: ${testInfo.status}`)
})
```

This prints the test name and its result, for example `starts empty: passed`. You rarely need `afterEach`, because a new page is thrown away for you.

> **Tip:** Put only set-up steps in a hook. Do not put assertions or the main actions of a test there. A reader must see what a test does when they read the test.

## Isolation: every test starts clean

Each test gets a new `page` in a new **browser context**. A browser context is like a fresh browser profile: no cookies, no saved data, no open tabs from other tests.

This is called **isolation**. It has two results.

- A test cannot be broken by what another test did.
- Tests can run in parallel, at the same time, and in any order.

You can see it in the Practice app. One test adds a case. The next test opens the page and the list is empty again.

The team rule follows from this: each test creates its own data and does not depend on test order. Never write a test that needs "the case from the previous test".

## test.only, test.skip and test.fixme

Three tools change which tests run.

`test.only` runs only this test in the run. Other tests are not run. It is useful to focus on one test while you work.

```ts
test.only("starts empty", async ({ page }) => {
  // ...
})
```

`test.skip` does not run a test. The report shows it as skipped. Use it for a test that does not apply now.

`test.fixme` also skips a test, but it says: "this should work, and it is broken or not finished". The exercise files in this course use `test.fixme`.

```ts
test.fixme("known bug: counter after delete", async ({ page }) => {
  // ...
})
```

> **Careful:** Never commit `test.only`. All other tests would be silently left out, and the build would look green. This project uses `forbidOnly` in `playwright.config.ts`. In CI, a forgotten `only` makes the whole run fail with the message `item focused with '.only' is not allowed due to the 'forbidOnly' option` and the name of the test.

For skipped tests, write a reason in the test name or in a comment, so someone can fix it later.

## Name tests as behaviours

The report is a list of what the app does. Write names so that the list reads as documentation.

- Good: `rejects wrong credentials`, `adds a case and updates the counter`.
- Not good: `test 1`, `login test`, `check button`.

A good name says the situation and the result. Use the name of the group for the feature. Then you do not repeat it in the test name.

One test checks one behaviour. If the name needs the word "and" many times, split the test.

## Go deeper

### Why hooks run in a fixed order

Playwright runs hooks in a clear order. A `beforeEach` outside a group runs first. Then the `beforeEach` inside the group runs. Then the test.

```ts
import { test } from "./lib/test"

test.beforeEach(async () => {
  console.log("outer beforeEach")
})

test.describe("login", () => {
  test.beforeEach(async () => {
    console.log("inner beforeEach")
  })

  test("shows the form", async () => {
    console.log("test body")
  })
})
```

The terminal shows the three lines in this order: `outer beforeEach`, `inner beforeEach`, `test body`. So the outer hook is the right place for steps that every test needs, such as opening the page.

### A common wrong idea: "I can share a variable between tests"

A beginner writes this to avoid repeating a step. It is a bad example:

```ts
let caseWasAdded = false

test("adds a case", async ({ page }) => {
  // ...adds a case in the page
  caseWasAdded = true
})

test("uses the added case", async ({ page }) => {
  expect(caseWasAdded).toBe(true)
})
```

This works only by luck. With `fullyParallel`, Playwright runs tests in several workers. Each worker is a separate process with its own copy of the file and its own variables. The second test can run in a worker where the first test never ran. It can also run first. The variable is `false`, and the test fails.

Isolation is not a rule to annoy you. It is the reason tests can run in parallel. A test that needs data creates it for itself.

### A trade-off: do not hide the story in a hook

`beforeEach` is DRY: the steps are written once. But a hook that does too much hides what the test is about. Compare:

```ts
import { expect, test, type Page } from "./lib/test"

async function addCase(page: Page, title: string): Promise<void> {
  await page.getByTestId("cases-input").fill(title)
  await page.getByTestId("cases-add").click()
}

test.beforeEach(async ({ page }) => {
  await page.goto("/#/practice")
})

test("deleting a case updates the counter", async ({ page }) => {
  await addCase(page, "Check the login")
  await page.getByTestId("cases-delete-1").click()

  await expect(page.getByTestId("cases-counter")).toHaveText("0 of 0 passed")
})
```

Opening the page is the same for every test, so it goes in the hook. Adding a case is a step of this test, so it stays in the test, as a call to a function with a clear name. The reader sees the full story without scrolling up.

Use a hook for things every test in the group needs. Use a function for steps that only some tests need. Fixtures, in module 4, are the next step for shared set-up.

## Practice

1. Open `e2e/exercises/03-playwright/07-describe-and-hooks.spec.ts`. The groups and hooks are already there.
2. Change `test.fixme` to `test` in one test at a time. Write the steps from the comments.
3. Run your file:

```bash
pnpm e2e e2e/exercises/03-playwright/07-describe-and-hooks.spec.ts
```

4. Look at the last test in the file. Why does it pass even though another test adds a case?
5. Add `.only` to one test and run the file. Then remove it. Count how many tests ran.

Compare with `e2e/exercises/03-playwright/solutions/07-describe-and-hooks.spec.ts` when you finish.

## Check what you know

1. What does `beforeEach` do?

<details><summary>Answer</summary>

It runs its code before every test in its scope. It is used for shared set-up, such as opening the page.

</details>

2. What is isolation?

<details><summary>Answer</summary>

Each test gets a new page in a new browser context. Tests do not share data, so they can run in any order.

</details>

3. Why must `test.only` never be committed?

<details><summary>Answer</summary>

It makes the run skip all other tests, and the result looks green. In CI, `forbidOnly` makes the run fail.

</details>

4. What is the difference between `test.skip` and `test.fixme`?

<details><summary>Answer</summary>

Both skip the test. `fixme` says the test should work but is broken or not finished.

</details>

5. The `beforeEach` of a group fails because `page.goto` cannot reach the site. What happens to the tests in that group?

<details><summary>Answer</summary>

Each test in the group fails, and the body of the test does not run. A failed hook counts as a failure of the test. This is useful: you see one clear error, and not many confusing ones. It also shows that a hook must only contain set-up steps that really must work.

</details>

6. This hook has a bug. What is it, and why can it be hard to see?

```ts
test.beforeEach(async ({ page }) => {
  page.goto("/#/practice")
})
```

<details><summary>Answer</summary>

There is no `await` before `page.goto`. The hook ends before the page is open. The navigation runs on its own, and later steps can start too early. The test often still works, because later steps wait for their elements, but that is luck. If the address is wrong, the test can fail with a navigation error, but it can also fail later with a message about a missing element, not about the real cause.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **What do "setup" and "teardown" mean in automated testing?**
   - Search for: `test setup teardown pattern`
   - A good answer explains: what each one does and why a test should leave things as it found them, and how this compares to `beforeEach` and `afterEach`.

2. **Why are order-dependent tests a problem for a QA team?**
   - Search for: `order dependent tests flaky test independence`
   - A good answer explains: what an order-dependent test is, how it breaks when tests run in parallel or in another order, and how to fix it.

3. **What does `test.describe.configure({ mode: "serial" })` do in Playwright, and why does the documentation recommend against it?**
   - Search for: `playwright serial mode describe configure`
   - A good answer explains: how serial mode changes the way tests run, what happens when one test fails, and why independent tests are better.

## Next step

In the next lesson you read `playwright.config.ts` line by line.
