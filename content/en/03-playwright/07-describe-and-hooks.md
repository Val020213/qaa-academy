---
title: Describe, hooks and isolation
duration: 60 min
---

## Goal

Organize related tests and share their set-up without making them depend on each other.

- Group tests with `test.describe` and name them after the behaviour they check.
- Follow the order of `beforeEach`, the test and `afterEach`.
- Distinguish browser isolation from variables shared between tests.
- Use `test.only`, `test.skip` and `test.fixme`.

## test.describe: group tests

`test.describe` brings related tests together under a name.

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

The report shows the group before the test, as in `login › rejects wrong credentials`. In `e2e/playground.spec.ts` the groups are `login`, `test case list` and `slow loading`.

## Hooks: set-up and teardown

A **hook** is a function that Playwright's test runner executes at a particular point in a test. `beforeEach` runs the set-up before each test. If every test needs to open the Practice page, put that navigation in the hook:

```ts
test.beforeEach(async ({ page }) => {
  await page.goto("/#/practice")
})
```

Inside a group, the hook applies to the tests in that group. Outside the groups, it applies to every test in the file.

### beforeEach order

With `--workers=1`, this file shows how hooks from the file and the group combine:

```ts
import { test } from "./lib/test"

test.beforeEach(async () => {
  console.log("outer")
})

test("a", async () => {
  console.log("test a")
})

test.describe("group", () => {
  test.beforeEach(async () => {
    console.log("inner")
  })

  test("b", async () => {
    console.log("test b")
  })
})
```

The terminal shows this:

```text
outer
test a
outer
inner
test b
```

Before each test, the runner executes the outer hook. For the test in the group, it then runs the inner hook followed by the test body.

### afterEach and the test result

`test.afterEach` runs after each test, even when the test fails. The function receives the data Playwright provides as its first argument (here `{}`, because it needs none), and `testInfo` as its second argument.

```ts
test.afterEach(async ({}, testInfo) => {
  console.log(`${testInfo.title}: ${testInfo.status}`)
})
```

This prints the test name and result, for example `starts empty: passed`.

## Isolation: every test starts clean

Each test gets a new `page` in a new **browser context**. A browser context is like a fresh browser profile: no cookies, no saved data, no open tabs from other tests.

This is called **isolation**. It has two results.

- A test cannot be broken by what another test did.
- Tests can run in parallel, at the same time, and in any order.

In the Practice app, the case list lives in the page's state. When another test opens its page, the list is empty. Each test must create the data it needs without depending on another test.

### Shared variables and workers

Browser isolation does not reset variables in the file. A *worker* is a process that runs tests; each process has its own copy of those variables.

```ts
import { test } from "./lib/test"

let counter = 0

test("first", async () => {
  counter++
  console.log("first sees", counter)
})

test("second", async () => {
  counter++
  console.log("second sees", counter)
})
```

With `fullyParallel: true` and `--workers=1`, the two tests run one after the other in the same process. The output is `first sees 1` and `second sees 2`. With `--workers=2`, each test usually runs in a different worker, so both print `1`.

The same dependency appears when one test writes a value that another needs:

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

If you run only the second test with `-g "uses the added case"`, the variable is still `false` and the assertion fails. It can also fail in parallel if the second test runs in a worker where the first never ran.

## test.only, test.skip and test.fixme

`test.only` selects a test so you can work on it without running the others.

```ts
test.only("starts empty", async ({ page }) => {
  // ...
})
```

`test.skip` skips a test that does not apply now. `test.fixme` also skips it, but indicates that it is broken or unfinished. The course exercises use `test.fixme`.

```ts
test.fixme("known bug: counter after delete", async ({ page }) => {
  // ...
})
```

The report shows skipped tests. Write the reason in the name or in a comment.

> **Careful:** Never commit `test.only`: it would leave out the other tests. This project uses `forbidOnly` in `playwright.config.ts`. In CI, a forgotten `only` makes the run fail with the message `item focused with '.only' is not allowed due to the 'forbidOnly' option` and the test name.

## Name tests as behaviours

A name should state the situation and the result the test checks.

- Good: `rejects wrong credentials`, `adds a case and updates the counter`.
- Not good: `test 1`, `login test`, `check button`.

Use the group name for the feature and the test name for one behaviour. If a test checks several distinct behaviours, split it.

## Go deeper

### Common set-up and test steps

Put steps that every test in the group needs in `beforeEach`. Keep the main actions and assertions in the test, so a reader can see what it checks.

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

Opening the page is common set-up. Adding and deleting a case are steps of this test. The function lets you reuse the action of adding a case when only some tests need it.

### The context does not clear server data

If the Practice app saved its cases on a shared server, a new context would no longer give a clean list. Two tests could see each other's cases and get incorrect counts. Browser isolation does not separate that data.

## Practice

1. Open `e2e/exercises/03-playwright/07-describe-and-hooks.spec.ts`. The groups and hooks are already there.
2. Change `test.fixme` to `test` in one test at a time. Write the steps from the comments.
3. Run your file:

```bash
pnpm e2e e2e/exercises/03-playwright/07-describe-and-hooks.spec.ts
```

4. Add `.only` to one test and run the file. Count how many tests ran, then remove it.

Compare with `e2e/exercises/03-playwright/solutions/07-describe-and-hooks.spec.ts` when you finish.

## Challenge

Create `e2e/challenges/07-case-list-rules.spec.ts` to check these rules of the Practice page. Find one more rule by reading `src/practice/CasesPanel.tsx`:

- A title with only spaces is not added.
- Pressing Enter in the title field adds the case, as the Add button does.
- After you delete case 1 and add a new case, the new case does not get id 1.
- The counter counts all cases, also when the filter hides some of them.

Import `test` and `expect` from `../lib/test`. Use at least two `test.describe` groups and one `beforeEach`.

It is done when:

- The file has at least five tests with names that state the behaviour they check.
- No test uses a variable written by another test.
- `pnpm e2e e2e/challenges/07-case-list-rules.spec.ts --repeat-each=5 --workers=4` passes every run, and each test also passes when run alone.
- If you break one expected value on purpose, exactly that test fails. Then you fix it.

Search for how to repeat a file's test run and choose how many workers to use: `playwright repeat-each workers command line`. To look up how to press Enter: `playwright locator press Enter`.

## Think it through

1. This hook has a bug. What could happen to the steps that follow it?

```ts
test.beforeEach(async ({ page }) => {
  page.goto("/#/practice")
})
```

<details><summary>Answer</summary>

There is no `await` before `page.goto`. The hook ends without waiting for navigation to complete, so later steps can start too early. Locator waits can hide the bug in some runs.

</details>

2. Version A adds a case in the `beforeEach` of the `test case list` group. Version B calls `addCase(page, "title")` only in tests that need a case. The group includes a test named "starts empty". Which version makes that test fail?

<details><summary>Answer</summary>

Version A, because the hook adds a case before the test checks that the list is empty. Version B leaves that set-up in the tests that need it.

</details>

3. The `beforeEach` of a group fails because `page.goto` cannot reach the site. Does the test body run?

<details><summary>Answer</summary>

No. The hook failure counts as a test failure. Each test that encounters that failure during set-up will fail without running its body.

</details>

## Next step

In the next lesson you read `playwright.config.ts` line by line.
