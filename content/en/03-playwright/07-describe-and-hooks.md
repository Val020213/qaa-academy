---
title: Describe, hooks and isolation
summary: Group tests, share set-up with hooks, and understand why every test must stand alone.
duration: 90 min
---

## Start with a puzzle

Look at this file. It has two tests and one shared variable.

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

The config has `fullyParallel: true`. You run the file two times: once with `--workers=1` and once with `--workers=2`. A worker is a process that runs tests.

What do you expect each run to print?

Write down your guess before you read on.

## Goal

- Predict in which order hooks and tests run.
- Decide what belongs in a hook, and what belongs in the test.
- Explain why a test that depends on another test breaks, and how to prove that your tests are independent.
- Choose between `test.only`, `test.skip` and `test.fixme`, and say why `only` must never be committed.

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

The report shows the group name before the test name, as in `login › rejects wrong credentials`. Use one group for one feature. In `e2e/playground.spec.ts` the groups are `login`, `test case list` and `slow loading`.

## beforeEach: steps every test needs

Almost every test in the Practice app starts with `page.goto("/#/practice")`. To avoid writing it again and again, use a **hook**. A hook is code that Playwright runs at a fixed moment.

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

This prints the test name and its result, for example `starts empty: passed`.

> **Tip:** Put only set-up steps in a hook. Do not put assertions or the main actions of a test there. A reader must see what a test does when they read the test.

### Experiment: the order of hooks

Read this file and write the exact lines you expect, in order, when you run it with `--workers=1`.

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

The outer hook runs before every test in the file. The inner hook runs only for the tests in its group, and after the outer one. So the outer hook is the right place for steps that every test needs, such as opening the page.

## Isolation: every test starts clean

Each test gets a new `page` in a new **browser context**. A browser context is like a fresh browser profile: no cookies, no saved data, no open tabs from other tests.

This is called **isolation**. It has two results.

- A test cannot be broken by what another test did.
- Tests can run in parallel, at the same time, and in any order.

In the Practice app, one test adds a case. The next test opens the page and the list is empty again.

The team rule follows: each test creates its own data and does not depend on test order.

### Experiment: break the rule on purpose

Here are two tests that share a variable. It is a bad example.

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

Predict: does the second test pass when you run the whole file? Does it pass when you run only the second test, with `-g "uses the added case"`? Run both and check.

### Back to the puzzle

With `--workers=1`, the two tests run one after the other in the same process. The output is `first sees 1` and `second sees 2`. With `--workers=2`, each worker is a separate process with its own copy of the file and of the variable. Usually each test runs in a different worker, so both print `1`.

The same thing breaks the shared variable above. The second test can run in a worker where the first test never ran. Isolation is the reason tests can run in parallel. A test that needs data creates it for itself.

## test.only, test.skip and test.fixme

Three tools change which tests run.

`test.only` runs only this test. It is useful to focus on one test while you work.

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

For skipped tests, write the reason in the test name or in a comment, so someone can fix it later.

## Name tests as behaviours

The report is a list of what the app does. Write names so that the list reads as documentation.

- Good: `rejects wrong credentials`, `adds a case and updates the counter`.
- Not good: `test 1`, `login test`, `check button`.

A good name says the situation and the result. Use the group name for the feature, so you do not repeat it in the test name.

Follow **one job per test**, as you follow one job per function. If the name needs the word "and" many times, split the test.

## Go deeper

### Why hooks run in a fixed order

Playwright runs hooks in a clear order. A `beforeEach` outside a group runs first. Then the `beforeEach` inside the group runs. Then the test. You saw this in the experiment above.

### A common wrong idea: "I can share a variable between tests"

A beginner writes shared variables to avoid repeating a step. It works only by luck. With `fullyParallel`, Playwright runs tests in several workers. Each worker is a separate process with its own copy of the file and its own variables. The second test can run in a worker where the first test never ran. It can also run first. The variable is `false`, and the test fails.

### A trade-off: do not hide the story in a hook

`beforeEach` is DRY, "Don't Repeat Yourself": the steps are written once. But a hook that does too much hides what the test is about. Compare:

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

## Challenge

Write a spec that tests the rules of the case list, and prove that the tests do not depend on each other.

Create the file `e2e/challenges/07-case-list-rules.spec.ts`. Test these rules of the Practice page, and find one more rule yourself by reading `src/practice/CasesPanel.tsx`:

- A title with only spaces is not added.
- Pressing Enter in the title field adds the case, as the Add button does.
- After you delete case 1 and add a new case, the new case does not get id 1.
- The counter counts all cases, also when the filter hides some of them.

Import `test` and `expect` from `../lib/test`. Use at least two `test.describe` groups and one `beforeEach`. Use your own case titles from a world you like: a zoo, a kitchen, a school.

It is done when:

- The file has at least five tests, and each test has a name that says a behaviour.
- No test uses a variable written by another test.
- `pnpm e2e e2e/challenges/07-case-list-rules.spec.ts --repeat-each=5 --workers=4` passes every run.
- Running one test alone, with `-g "<part of its name>"`, also passes.
- If you break one expected value on purpose, exactly that test fails. Then you fix it.

You will need something this lesson did not teach: how to press a key in a field, and how to run a file many times at once. Search for: `playwright locator press Enter`, `playwright repeat-each workers command line`.

## Think it through

1. Predict the output order with `--workers=1`. Say why.

```ts
test.beforeEach(async () => { console.log("outer") })

test.describe("zoo", () => {
  test.beforeEach(async () => { console.log("inner") })
  test("feeds the lion", async () => { console.log("lion") })
})

test("opens the gate", async () => { console.log("gate") })
```

<details><summary>Answer</summary>

The tests run in the order they are in the file, so the group comes first. The output is `outer`, `inner`, `lion`, `outer`, `gate`. The outer hook runs before each of the two tests. The inner hook is part of the `zoo` group, so it does not run for `gate`.

</details>

2. This hook has a bug. The code runs. What is wrong, and why can it be hard to see?

```ts
test.beforeEach(async ({ page }) => {
  page.goto("/#/practice")
})
```

<details><summary>Answer</summary>

There is no `await` before `page.goto`. The hook ends before the page is open, and the navigation runs on its own. Later steps can start too early. The test often still works, because later steps wait for their elements, but that is luck. If the address is wrong, the failure can show up later as a message about a missing element, not about the real cause.

</details>

3. Two versions. Version A: a `beforeEach` adds one case in every test of the group `test case list`. Version B: tests call `addCase(page, "title")` when they need a case. The group has a test named "starts empty". Which version is better here, and what would make you choose the other?

<details><summary>Answer</summary>

Version B is better here. In Version A, the test "starts empty" cannot be written, because the hook already added a case. Also, the reader of each test does not see where the case came from. If every test in the group needed exactly the same case, and nothing else, Version A would be shorter and fine. The choice depends on how many tests need the same data.

</details>

4. What breaks if the Practice app saved its cases on a server that all tests share, and not in the page?

<details><summary>Answer</summary>

A new browser context no longer gives a clean list, because the data is on the server. Two tests running at the same time can see each other's cases. Counts like `1 of 1 passed` become wrong, and the failures change from run to run. You must now make data unique per test, for example with a title that includes a random part, and check only your own rows. Or you must clean the data through the server before each test.

</details>

5. A teammate asks what isolation is. Explain it in three sentences without using the words "context" or "independent".

<details><summary>Answer</summary>

Example: "Each test gets a fresh browser, with no memory of the other tests. So one test cannot leave something behind that changes the result of another. This is why the tests can run at the same time and in any order." Your words can differ. A good answer says what each test starts with and what that allows.

</details>

6. The `beforeEach` of a group fails because `page.goto` cannot reach the site. What happens to the tests in that group, and what does that teach you about what to put in a hook?

<details><summary>Answer</summary>

Each test in the group fails, and the body of the test does not run. A failed hook counts as a failure of the test. This is useful: you see one clear error, and not many confusing ones. It also shows that a hook should contain only set-up steps that must work. If a hook does optional work that can fail, many tests fail for a reason that is not about them.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **What do "setup" and "teardown" mean in automated testing?**
   - Search for: `test setup teardown pattern`
   - Try it: In a scratch spec, add a `beforeEach` and an `afterEach` that print `testInfo.title`. Make one test fail on purpose. Does the `afterEach` still run for the failed test?
   - A good answer explains: what each one does, why a test should leave things as it found them, and how this compares to `beforeEach` and `afterEach`.

2. **Why are order-dependent tests a problem for a QA team?**
   - Search for: `order dependent tests flaky test independence`
   - Try it: Run the shared-variable example from this lesson with `--workers=1`, then with `--workers=4`, then only the second test with `-g`. Write down the result of each run.
   - A good answer explains: what an order-dependent test is, how it breaks when tests run in parallel or in another order, and how to fix it.

3. **What does `test.describe.configure({ mode: "serial" })` do in Playwright, and why does the documentation recommend against it?**
   - Search for: `playwright serial mode describe configure`
   - Try it: Put three tests in a serial group. Make the first one fail. Run the file. What happens to the other two? Then remove the serial line and run again.
   - A good answer explains: how serial mode changes the way tests run, what happens when one test fails, and why independent tests are better.

## Next step

In the next lesson you read `playwright.config.ts` line by line.
