---
title: Codegen, UI mode and headed mode
duration: 60 min
---

## Goal

In this lesson you use Playwright's visual tools to run tests, inspect actions, and review generated code.

- Choose between headed mode, UI mode, codegen and headless mode for the task at hand.
- Inspect the page before and after an action in UI mode.
- Turn a codegen draft into a test with the project's conventions and assertions about the result.

## Headed mode: watch the browser

By default, Playwright runs tests in *headless* mode, without showing a browser window. *Headed* mode shows the window during the run:

```bash
pnpm e2e:headed e2e/playground.spec.ts
```

Words after the script name go to Playwright. This lets you specify a file path just as you do with `pnpm e2e`.

The file has four tests and the config enables `fullyParallel`. Playwright can run them in parallel, so you may see several windows at once. Headed mode helps you watch a test's flow; following several at the same time is harder.

In this project, both modes use Chromium, but Playwright selects different binaries: `chromium` for headed and `chromium-headless-shell` for headless. Launch options also differ; if a failure appears in only one mode, investigate it in that mode.

## UI mode: run and inspect

UI mode brings the test list and the details of each run into one window:

```bash
pnpm e2e:ui
```

The tests appear on the left. Press the triangle next to one to run it. Select an action to see the page at that moment.

![In UI mode you run one test, then click each action to see the page at that moment.](/clips/ui-mode.webm)

- **Watch mode.** Click the eye icon next to a test or a file to run it again when you save changes.
- **Snapshots.** Playwright saves copies of the DOM during actions. When you select an action, UI mode shows the saved content and lets you inspect its elements.
- **Pick locator.** Press "Pick locator", then click an element on the page to get a locator.
- **Filters.** Use the search box to show tests by name or the status filters to hide passed tests.

Run "adds a case and updates the counter" and select the `click` action on `cases-add`. The "Before" and "After" tabs show the page before and after the click: the new row and updated counter appear afterwards.

Use "Pick locator" on the Add button. Compare the locator it shows with `getByTestId("cases-add")`. A role locator such as `getByRole('button', { name: 'Add' })` also finds one element on this page. If another panel adds a button named "Add", the role locator matches both; the test id still identifies the list's button.

UI mode uses the project config. Close the window when you finish or press Ctrl+C in the terminal.

## Codegen: record a first draft

**Codegen** writes test code while you click and type on a page. It needs the site to be running. Open two terminals. In the first one:

```bash
pnpm dev
```

In the second one:

```bash
pnpm exec playwright codegen http://localhost:5180/#/practice
```

The browser and the Playwright Inspector open, with the Inspector showing the generated code. The Inspector has buttons to record assertions; codegen adds one when you choose it.

## Clean up the generated code

A draft for adding a case and ticking it can look like this. Yours may differ with the Playwright version and the actions you record.

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

Review the draft before using it as a project test:

1. Change the import from `@playwright/test` to use `test` and `expect` from `e2e/lib/test`, with the relative path for your file.
2. Replace the name `"test"` with one that describes the behaviour.
3. Use `"/#/practice"` instead of the full address, because the config has `baseURL`.
4. Remove the `click` before `fill`: `fill` already focuses the field.
5. Use `getByTestId` where a test id exists, following the project's convention. The checkbox locator depends on the title `"Buy milk"`; if you change that data, review the locator too.
6. There is no assertion about the result. Actions can fail, but they do not detect an incorrect counter on their own.
7. Check that the test creates its own data and does not need another test.

The draft never reads the counter, so it can pass even if the counter shows `NaN of 1 passed`. If its actions finish without an error, this test passes without checking the counter's value.

Add a check for the text the counter should show:

```ts
await expect(page.getByTestId("cases-counter")).toHaveText("1 of 1 passed")
```

With this assertion, an incorrect counter makes the test fail.

## The VS Code extension

The Playwright extension lets you run tests from the editor. To install it, search for "Playwright Test for VSCode" in the Extensions panel.

A triangle next to each `test(...)` lets you run it. Tick "Show browser" to see the browser. The extension also includes "Pick locator" and "Record new test". It uses the same tests and config as the terminal.

## Go deeper

### Shared steps in the draft

If you record several tests with the same login steps, you can put those steps in a function and call it from each test:

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

The `signIn` function contains the login steps. Each test keeps the actions and assertions for the behaviour it checks.

## Practice

1. Run `pnpm e2e:headed e2e/playground.spec.ts`. Watch the browser.
2. Run `pnpm e2e:ui`. Run the test "adds a case and updates the counter". Select the action that adds the case and compare the "Before" and "After" tabs.
3. In UI mode, use "Pick locator" and click the "Add" button of the case list. Compare the locator with `getByTestId("cases-add")`.
4. Close UI mode. Start `pnpm dev` in one terminal. In another terminal, run `pnpm exec playwright codegen http://localhost:5180/#/practice`.
5. Record yourself adding a case and ticking it.
6. Copy the code into a new file `e2e/exercises/03-playwright/my-codegen.spec.ts`. Clean it up with the list above. Add an assertion for the counter text. Run it with `pnpm e2e e2e/exercises/03-playwright/my-codegen.spec.ts`.
7. Delete the file when you finish. If you keep it, `pnpm e2e` will run it.

## Challenge

Create `e2e/challenges/05-codegen-filter.spec.ts` from a codegen draft. On the Practice page, add three cases with distinct titles, tick only the second one, and filter for passed cases. Check that the list shows only that case and the counter still says `1 of 3 passed`.

It is done when:

- The test imports from `../lib/test` and has no full address in the code.
- The test has at least two assertions: one about the visible rows and one about the counter.
- `pnpm e2e e2e/challenges/05-codegen-filter.spec.ts --repeat-each=5` passes all five runs.
- If you change one expected title in the test, the test fails. Try it, then change it back.

For the filter, use `selectOption`, which you saw in the actions lesson. Look up how to check the text of several visible rows. Search for: `playwright selectOption`, `playwright toHaveText array of strings`.

## Think it through

1. A draft contains `await page.getByRole("button", { name: "Delete" }).click()`, recorded when there was one case. You run it with three cases in the list. What happens?

<details><summary>Answer</summary>

It fails because the locator matches three "Delete" buttons and Playwright requires one element for the click. A test id with the case id, such as `cases-delete-2`, identifies the row you want to delete.

</details>

2. This test passes even when the counter shows an incorrect number. Find the bug.

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

The visibility assertion only checks that the counter is visible. To detect an incorrect number, the assertion must check the text `"1 of 1 passed"`.

</details>

3. What would you lose if UI mode saved only a video of the run instead of DOM snapshots?

<details><summary>Answer</summary>

You could watch the run, but you could not inspect the page's elements at that moment. A video saves pixels; a snapshot keeps the DOM structure.

</details>

## Next step

In the next lesson you learn the trace viewer, the tool you use when a test fails and you do not know why.
