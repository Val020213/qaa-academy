---
title: Codegen, UI mode and headed mode
summary: Watch tests in a real browser, travel back in time in UI mode, and turn a recorded draft into a test that can really fail.
duration: 90 min
---

## Start with a puzzle

You open the Practice page. You record three steps with codegen: type "Buy milk" in the case list, press Add, tick the box. Codegen gives you a test. You run it. It passes.

Now a developer makes a mistake. The counter under the list shows `NaN of 1 passed` instead of `1 of 1 passed`. Every user can see that this is wrong.

You run your recorded test again. Does it pass or fail? Think about what the test actually looks at.

Write down your guess before you read on.

## Goal

- Choose between headed mode, UI mode, codegen and headless mode for the question you have.
- Predict what a recorded test can and cannot detect.
- Turn a codegen draft into a test that follows the team rules and can fail for the right reason.
- Explain why UI mode can show the page in the past.

## Headed mode: watch the browser

By default, tests run in a **headless** browser. Headless means the browser window is not shown. It is fast, but you see nothing.

**Headed** mode shows the real browser window:

```bash
pnpm e2e:headed e2e/playground.spec.ts
```

> **Tip:** Words after a script name go to Playwright. So the file path works here as it does with `pnpm e2e`.

Before you run it, guess. The file has four tests and `fullyParallel` is on. How many browser windows do you expect to see at the same time? Run it and count. The config does not set `workers`, so Playwright chooses a number from your processor. What does this tell you about watching a whole suite?

## UI mode: the best tool for learning

UI mode is a window made by Playwright. Open it with:

```bash
pnpm e2e:ui
```

On the left you see all tests. Press the triangle next to a test to run it. On the right you see the page while the test runs.

Watch how the page changes when you click each action.

![In UI mode you run one test, then click each action to see the page at that moment.](/clips/ui-mode.webm)

These parts help you most.

- **Watch mode.** Click the eye icon next to a test or a file. The test runs again each time you save the file.
- **Time travel.** The list of actions is below the test. Click any action. The page goes back to how it looked at that step.
- **Pick locator.** Press "Pick locator", then click an element on the page. Playwright shows a locator for it.
- **Filters.** Type a name in the search box to show only some tests. You can also hide passed tests.

> **Careful:** UI mode uses the project config. Close the window when you finish, or press Ctrl+C in the terminal.

### Experiment: before and after

Run "adds a case and updates the counter" in UI mode. Click the action `click` on `cases-add`.

What do you expect to see in the "Before" tab, and what in the "After" tab? Write two short guesses. Then look. Which parts of the page changed? Which parts did not?

### Experiment: pick a locator

Use "Pick locator" on the Add button. Playwright may show `getByRole('button', { name: 'Add' })`. The test uses `getByTestId("cases-add")`. Both find one element today.

Now think: a developer adds a second button with the text "Add" in another panel. Which of the two locators still finds one element? Say why.

## Codegen: record a first draft

**Codegen** writes test code while you use a page by hand. You click and type, and Playwright writes the lines.

Codegen needs the site to be running. Open two terminals. In the first one:

```bash
pnpm dev
```

In the second one:

```bash
pnpm exec playwright codegen http://localhost:5180/#/practice
```

Two windows open. One is the browser. The other is the Playwright Inspector, which shows the code. The Inspector has buttons to record assertions too. Codegen writes an assertion only when you choose one.

## Clean up the generated code

Codegen is a draft. It does not know your team rules. A draft for "add a case, tick it" can look like this. Yours may differ, because it depends on the Playwright version and on what you click.

```ts
import { test, expect } from "@playwright/test"

test("test", async ({ page }) => {
  await page.goto("http://localhost:5180/#/practice")
  await page.getByRole("textbox", { name: "New case" }).click()
  await page.getByRole("textbox", { name: "New case" }).fill("Buy milk")
  await page.getByRole("button", { name: "Add" }).click()
  await page.getByRole("checkbox", { name: "Buy milk" }).check()
})
```

Before you read the list below, find at least four problems with this draft. Write them down. Then compare.

1. The import comes from `@playwright/test`. The team imports `test` and `expect` from `e2e/lib/test`.
2. The name `"test"` says nothing. A name must describe a behaviour.
3. The full address is in the code. The config has `baseURL`, so use `"/#/practice"`.
4. The `click` before `fill` is extra. `fill` already focuses the field.
5. The locators work, but the team uses `getByTestId` where a test id exists. The checkbox name `"Buy milk"` is also the test data. If the data changes, the locator breaks.
6. There is no assertion. The test cannot fail when the app is wrong. This is the problem in the puzzle.
7. Check that the test creates its own data and does not need another test.

### Back to the puzzle

The recorded test passes. It fills, clicks and ticks. It never reads the counter, so the text `NaN of 1 passed` does not matter to it. A test fails only for things it checks. A test with no assertion checks only that the page did not crash.

This is why you add one line, for example:

```ts
await expect(page.getByTestId("cases-counter")).toHaveText("1 of 1 passed")
```

Now the broken counter makes the test fail.

> **Tip:** Test what the user sees, not how the code is built. The counter text is what the user reads. That is a good thing to assert.

## The VS Code extension

The Playwright extension for VS Code lets you run tests without the terminal. Next to each `test(...)` you see a green triangle. You can tick "Show browser" to watch the run. It also has "Pick locator" and "Record new test", the same tools as above. To install it, search for "Playwright Test for VSCode" in the Extensions panel.

The tests and the config are the same in the extension and in the terminal.

## Go deeper

### Why UI mode can go back in time

UI mode does not play a video. While a test runs, Playwright saves a **snapshot** of the page for each action: a copy of the page content at that moment. When you click an action, UI mode shows that copy.

This is why you can inspect elements in the past, and why the trace viewer uses the same data. Headed and headless runs use the same browser engine. The only difference is the window. So a result is almost always the same in both.

### A common wrong idea: "codegen writes my tests"

Codegen records what you did. It does not know why you did it, so it does not decide what the app should show. It also repeats steps. If you record three tests, each one has the same login steps.

After recording, look for repeated steps and move them to one function:

```ts
import { expect, test, type Page } from "./lib/test"

async function signIn(page: Page): Promise<void> {
  await page.goto("/#/practice")
  await page.getByTestId("login-email").fill("qa@example.com")
  await page.getByTestId("login-password").fill("Playwright123")
  await page.getByTestId("login-submit").click()
}

test("shows the signed-in message", async ({ page }) => {
  await signIn(page)

  await expect(page.getByTestId("login-welcome")).toContainText("qa@example.com")
})

test("signing out shows the form again", async ({ page }) => {
  await signIn(page)
  await page.getByTestId("login-logout").click()

  await expect(page.getByTestId("login-form")).toBeVisible()
})
```

This is DRY, "Don't Repeat Yourself": the login steps live in one place. The limit: the name `signIn` must say exactly what it does. Do not build a helper for a step that only one test uses. That would be breaking **YAGNI**, "You Aren't Gonna Need It": do not build for needs you only imagine.

### A trade-off: choose the right tool for the moment

Each tool has a price.

- **Headed mode** is good for understanding one test. It is slow, and you must watch it.
- **UI mode** is good while you write and debug. It uses your screen and your attention. It is not for CI.
- **Codegen** is good for finding a locator or starting a draft. It is bad as a way to produce the final test.
- **Headless mode** is the default. It is fast and good for CI, where nobody watches a window.

Use the visible tools when you need to understand something, not because they are nice to see.

## Practice

1. Run `pnpm e2e:headed e2e/playground.spec.ts`. Watch the browser.
2. Run `pnpm e2e:ui`. Run the test "adds a case and updates the counter". Click each action and watch the page.
3. In UI mode, use "Pick locator" and click the "Add" button of the case list. Compare the locator with `getByTestId("cases-add")`.
4. Start `pnpm dev` in one terminal. In another terminal, run `pnpm exec playwright codegen http://localhost:5180/#/practice`.
5. Record this: add a case, then tick it.
6. Copy the code into a new file `e2e/exercises/03-playwright/my-codegen.spec.ts`. Clean it up with the list above. Add an assertion for the counter text. Run it with `pnpm e2e e2e/exercises/03-playwright/my-codegen.spec.ts`.
7. Delete the file when you finish. If you keep it, `pnpm e2e` will run it.

## Challenge

Record a longer flow and make it a test you would trust. On the Practice page, add three cases. Tick only the second one. Show only the passed cases with the filter. Check that the list shows exactly that one case, and that the counter still says `1 of 3 passed`.

Choose your own case titles. Use any world you like: a pet shelter, a football team, a recipe.

Create the file `e2e/challenges/05-codegen-filter.spec.ts`. Use codegen for the first draft. You may ask an AI assistant for help, but you must run the code and be able to explain every line. Never keep a line you cannot explain.

It is done when:

- The test imports from `../lib/test` and has no full address in the code.
- The test has at least two assertions: one about the visible rows and one about the counter.
- `pnpm e2e e2e/challenges/05-codegen-filter.spec.ts --repeat-each=5` passes all five runs.
- If you change one expected title in the test, the test fails. Try it, then change it back.

You will need something this lesson did not teach: how to check the text of the visible rows, and how to choose an option in a select. Search for: `playwright selectOption`, `playwright toHaveText array of strings`.

## Think it through

1. You record "add a case" on the Practice page and tick nothing. Later the list has three cases. The draft contains `await page.getByRole("button", { name: "Delete" }).click()`, recorded when there was one case. You run it with three cases in the list. Does it pass? Say why.

<details><summary>Answer</summary>

It fails. Each row has a button with the text "Delete", so with three cases the locator matches three elements. Playwright's strict mode refuses to pick one and reports an error. The locator was fine only because the list had one row. A test id with the case id, such as `cases-delete-2`, says exactly which row you mean.

</details>

2. This test passes, but it is not a good test. Find the bug.

```ts
test("ticking a case updates the counter", async ({ page }) => {
  await page.goto("/#/practice")
  await page.getByTestId("cases-input").fill("Buy milk")
  await page.getByTestId("cases-add").click()
  await page.getByTestId("cases-toggle-1").check()

  await expect(page.getByTestId("cases-counter")).toBeVisible()
})
```

<details><summary>Answer</summary>

The assertion cannot fail for the behaviour in the name. The counter is visible before and after ticking, and also when it shows a wrong number. The test should check the text, `"1 of 1 passed"`. A test that cannot fail gives false trust, which is worse than no test.

</details>

3. You must test a flow of 30 steps over three pages. Version A: record all of it with codegen and clean it up. Version B: write it by hand, using UI mode only to pick locators. Which do you choose, and what would make you choose the other?

<details><summary>Answer</summary>

Version A saves typing and gives you a map of the steps, but it also gives you repeated steps and weak locators in 30 places. Version B is slower, and each line is a decision you made. For a long flow, many people record, then clean and split into functions. Choose B when the flow is short or when you want to learn the page, and A when the flow is long and you will review every line.

</details>

4. What breaks if UI mode saved a video of the run instead of a snapshot for each action?

<details><summary>Answer</summary>

You could still watch what happened, but you could not click inside the past page. You could not inspect an element, copy a locator from that moment, or see which element an action used. A video shows pixels. A snapshot is a copy of the page content, so it keeps the structure.

</details>

5. A teammate asks why a recorded test is only a draft. Explain it in three sentences without using the word "record".

<details><summary>Answer</summary>

Example: "The tool writes down what I did with my hands, not what the app must do. It does not know which result matters, so it adds no checks. I still must choose the checks, the names and the data." Your words can differ. A good answer says that the tool captures actions, and the human adds the meaning.

</details>

6. A manager says: "Codegen makes bad tests, so ban it." Do you agree?

<details><summary>Answer</summary>

There is no single right answer. A ban removes a tool that is very good for finding locators and for starting from an empty file, especially for people new to the page. But if people commit the output without a clean-up, the tests are weak. A better rule may be: codegen is allowed, but the review checks the same list as for any test. It depends on how strong the review is in your team.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **What is a headless browser, and why do CI servers use one?**
   - Search for: `headless browser what is testing`
   - Try it: In a scratch spec, add `console.log(await page.evaluate(() => navigator.userAgent))` after `page.goto`. Run it once headless and once with `--headed`. Compare the two lines.
   - A good answer explains: what "headless" means, why a server with no screen needs it, and one thing that can differ from a normal window.

2. **What is the Playwright Inspector, and how does `page.pause()` help you debug a test?**
   - Search for: `playwright inspector page.pause debug`
   - Try it: Add `await page.pause()` after the `click` on `cases-add` in a scratch test. Run it with `--headed`. While it is paused, type a locator in the Inspector and see what it highlights.
   - A good answer explains: how to stop a test at one line, what you can do while it is stopped, and how it differs from UI mode.

3. **What are the weak points of record-and-playback test tools?**
   - Search for: `record and playback test automation drawbacks`
   - Try it: Record the same flow twice, with different clicks to reach the same result. Compare the two drafts line by line.
   - A good answer explains: at least three problems, such as checks you must add by hand, fragile locators and repeated steps, and when such a tool is still useful.

## Next step

In the next lesson you learn the trace viewer, the tool you use when a test fails and you do not know why.
