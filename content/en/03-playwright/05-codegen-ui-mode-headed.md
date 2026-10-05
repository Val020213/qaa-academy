---
title: Codegen, UI mode and headed mode
summary: Watch tests run in a real browser, debug them in UI mode, and record steps with codegen, then clean the code up.
duration: 30 min
---

## Goal

- Run tests with a visible browser using `pnpm e2e:headed`.
- Use UI mode to watch, replay and pick locators.
- Record a first draft with codegen, and clean it up to follow the team rules.
- Know what the VS Code Playwright extension does.

## Headed mode: watch the browser

By default, tests run in a **headless** browser. Headless means the browser window is not shown. It is fast, but you see nothing.

**Headed** mode shows the real browser window. Run:

```bash
pnpm e2e:headed
```

You see the browser open, type and click. It is useful when you want to understand what a test does. It is also slow to watch, so use it with one file:

```bash
pnpm e2e:headed e2e/playground.spec.ts
```

> **Tip:** Extra words after a script name go to Playwright. So the file path works here as it does with `pnpm e2e`.

## UI mode: the best tool for learning

UI mode is a window made by Playwright. You open it with:

```bash
pnpm e2e:ui
```

On the left you see all tests. Press the triangle next to a test to run it. On the right you see the page while the test runs.

These parts help you most.

- **Watch mode.** Click the eye icon next to a test or a file. The test runs again each time you save the file.
- **Time travel.** The list of actions is below the test. Click any action. The page on the right goes back to how it looked at that step. You see the state before and after.
- **Pick locator.** Press the "Pick locator" button, then click an element on the page. Playwright shows a locator for it. You can copy it. Check that it follows the team rule, as the next section explains.
- **Filters.** Type a name in the search box to show only some tests. You can also hide passed tests.

> **Careful:** UI mode runs the tests with the project config. Close the window with the close button, or press Ctrl+C in the terminal when you finish.

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

Two windows open. One is the browser. The other is the Playwright Inspector, which shows the code. Do a login with a wrong password. Copy the code from the Inspector.

## Clean up the generated code

Codegen is a draft, not a result. It does not know your team rules. Generated code can look like this:

```ts
import { test, expect } from "@playwright/test"

test("test", async ({ page }) => {
  await page.goto("http://localhost:5180/#/practice")
  await page.getByTestId("login-email").click()
  await page.getByTestId("login-email").fill("qa@example.com")
  await page.getByRole("button", { name: "Sign in" }).click()
})
```

The exact lines depend on what you click and on the Playwright version. Always change these things.

1. Import `test` and `expect` from the project file `e2e/lib/test`, not from `@playwright/test`.
2. Give the test a name that describes a behaviour. `"test"` says nothing.
3. Use a path like `"/#/practice"`, not the full address. The config has the start.
4. Use `getByTestId` where the element has a test id. Codegen often finds the test id, but not always. Here it wrote `getByRole` for the button.
5. Delete extra steps, such as a `click` before a `fill`. `fill` already focuses the field.
6. Add assertions. Codegen records what you did. It does not know what you want to check.
7. Make sure the test creates its own data and does not depend on other tests.

After this, the test follows the same conventions as every other test in the project.

## The VS Code extension

The Playwright extension for VS Code lets you run tests without the terminal. Next to each `test(...)` you see a green triangle. Click it to run that test. You can also tick "Show browser" to watch the run.

The extension also has "Pick locator" and "Record new test", the same tools you used above. Failed tests show the error in the editor, at the failing line. To install it, open the Extensions panel in VS Code and search for "Playwright Test for VSCode".

Use the extension or the terminal, whichever you like. The tests and the config are the same.

## Practice

1. Run `pnpm e2e:headed e2e/playground.spec.ts`. Watch the browser.
2. Run `pnpm e2e:ui`. Run the test "adds a case and updates the counter". Click each action and watch the page.
3. In UI mode, use "Pick locator" and click the "Add" button of the case list. Compare the locator with `getByTestId("cases-add")`.
4. Start `pnpm dev` in one terminal. In another terminal, run `pnpm exec playwright codegen http://localhost:5180/#/practice`.
5. Record this: add a case, then tick it.
6. Copy the code into a new file `e2e/exercises/03-playwright/my-codegen.spec.ts`. Clean it up with the list above. Add an assertion for the counter text. Run it with `pnpm e2e e2e/exercises/03-playwright/my-codegen.spec.ts`.
7. Delete the file when you finish. If you keep it, `pnpm e2e` will run it.

## Check what you know

1. What does headed mode show?

<details><summary>Answer</summary>

The real browser window, so you can watch the test click and type.

</details>

2. Name two things UI mode gives you.

<details><summary>Answer</summary>

Any two of: watch mode, time travel through the actions, pick locator, and filters.

</details>

3. Why do you clean up generated code?

<details><summary>Answer</summary>

Codegen does not know the team rules. You must fix the import, the name, the locators and the address, and add assertions.

</details>

4. What must be running before you use codegen on the Practice app?

<details><summary>Answer</summary>

The site, with `pnpm dev`, in another terminal.

</details>

## Next step

In the next lesson you learn the trace viewer, the tool you use when a test fails and you do not know why.
