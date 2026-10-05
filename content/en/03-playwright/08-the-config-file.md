---
title: The config file
summary: Read playwright.config.ts line by line and learn how to change the port with QAA_E2E_PORT.
duration: 30 min
---

## Goal

- Explain each setting in `playwright.config.ts`.
- Know why `retries`, `forbidOnly` and `reporter` change in CI.
- Explain what `webServer` and `reuseExistingServer` do.
- Run the tests on another port with `QAA_E2E_PORT`.

## What the config file is

The file `playwright.config.ts` is in the root of the project. Playwright reads it each time you run `pnpm e2e`. It says where the tests are, how to run them and how to report them.

You do not write it often. But you must be able to read it, because it explains a lot of what you see when tests run. Open the file and follow this lesson.

## The port and the address

```ts
const PORT = process.env.QAA_E2E_PORT ?? "5180"
const BASE_URL = `http://localhost:${PORT}`
```

`process.env` holds **environment variables**. These are named values that the terminal passes to a program. `QAA_E2E_PORT` is one we made up for this project.

The `??` sign means: use the value on the left, and if it does not exist, use the one on the right. So the port is `5180` unless you set `QAA_E2E_PORT`.

`BASE_URL` joins the address. Backticks and `${PORT}` put the port inside the text, as you learned in the lesson about values and variables.

## defineConfig

```ts
export default defineConfig({
```

`defineConfig` is a helper from Playwright. It checks the types of your settings, so the editor can help you. Everything below is inside it.

## testDir

```ts
testDir: "./e2e",
```

The folder where Playwright looks for specs. Every `.spec.ts` file inside `e2e`, also in sub-folders, is a spec. This is why the exercise files run with `pnpm e2e` too.

## fullyParallel

```ts
fullyParallel: true,
```

Playwright runs tests at the same time, in several **workers**. A worker is one process that runs tests. With `true`, even tests in the same file run in parallel. This is fast. It only works because tests are isolated.

## forbidOnly

```ts
forbidOnly: !!process.env.CI,
```

`CI` is a variable that CI servers set. The `!!` turns it into `true` or `false`. In CI, a forgotten `test.only` makes the run fail. On your machine, `only` is allowed.

## retries

```ts
retries: process.env.CI ? 2 : 0,
```

The `? :` sign is a short `if / else`. In CI, a failed test is run again, up to two times. On your machine there are no retries. You want to see the failure at once.

> **Careful:** Retries can hide a flaky test: it fails, then passes, and the run is green. If the report says "flaky", fix the test.

## reporter

```ts
reporter: process.env.CI
  ? [["github"], ["html", { open: "never" }]]
  : [["list"], ["html", { open: "never" }]],
```

A **reporter** decides how results are shown. On your machine you get `list`, the list of tests you saw in the terminal, and an HTML report. In CI you get `github`, which adds messages to the GitHub run, and the HTML report. `open: "never"` means the report does not open by itself. You open it with `pnpm e2e:report`.

## use

```ts
use: {
  baseURL: BASE_URL,
  trace: "on-first-retry",
  screenshot: "only-on-failure",
},
```

`use` holds options for every test.

- `baseURL` is the start of every address. This is why `page.goto("/#/practice")` works.
- `trace` records a trace only when a test is retried. Locally, add `--trace on`.
- `screenshot` takes a picture only when a test fails.

## projects

```ts
projects: [
  {
    name: "chromium",
    use: { ...devices["Desktop Chrome"] },
  },
],
```

A **project** is a set of settings to run the tests with. Here there is one project: the Chromium browser. `devices["Desktop Chrome"]` is a list of settings that copy a desktop Chrome: screen size and so on. The `...` copies those settings into the object. You see `[chromium]` in each line of the list report.

You could add more projects, such as Firefox or a phone.

## webServer

```ts
webServer: {
  command: `pnpm dev --port ${PORT}`,
  url: BASE_URL,
  reuseExistingServer: !process.env.CI,
  timeout: 60_000,
},
```

`webServer` tells Playwright to start the app before the tests and stop it at the end. That is why you do not need `pnpm dev` first.

- `command` is the command that starts the app.
- `url` is the address Playwright checks to know the app is ready.
- `timeout` is how long to wait for the app. `60_000` is 60 seconds. The `_` only makes the number easier to read.
- `reuseExistingServer` decides what happens if something already answers at the `url`. On your machine it is `true`: Playwright uses it. In CI it is `false`: Playwright stops with an error.

> **Careful:** On your machine, with `reuseExistingServer`, Playwright tests whatever runs on that port. If another app uses port 5180, you test the wrong app and do not see an error. Use `QAA_E2E_PORT` to avoid this.

## Change the port

In PowerShell, set the variable and run the tests in one line:

```bash
$env:QAA_E2E_PORT="5185"; pnpm e2e
```

Playwright starts the site on port 5185 and uses `http://localhost:5185` as the base address. The variable stays set in this terminal window until you close it or remove it:

```bash
Remove-Item Env:QAA_E2E_PORT
```

On macOS or Linux, write `QAA_E2E_PORT=5185 pnpm e2e`. There the variable lasts for that one command.

> **Note:** Do not use 5190. The practice shop uses that port.

## Practice

1. Open `playwright.config.ts`. Find each setting from this lesson.
2. Write down: how many retries do you get on your machine? How many in CI?
3. Run all tests on a different port:

```bash
$env:QAA_E2E_PORT="5185"; pnpm e2e
```

4. The output does not print the port. If the tests pass, the site answered on port 5185.
5. Remove the variable with `Remove-Item Env:QAA_E2E_PORT`. Run `pnpm e2e` again. Now the site uses port 5180.

There is no exercise file for this lesson.

## Check what you know

1. What does `testDir` do?

<details><summary>Answer</summary>

It tells Playwright which folder has the specs. Here it is `./e2e`.

</details>

2. Why are there retries only in CI?

<details><summary>Answer</summary>

On your machine you want to see a failure at once. In CI a retry can handle a rare failure, but it can also hide a flaky test.

</details>

3. What does `reuseExistingServer` do on your machine?

<details><summary>Answer</summary>

If the site is already running at the `url`, Playwright uses it. If not, it starts the site with `command`.

</details>

4. How do you run the tests on port 5185 in PowerShell?

<details><summary>Answer</summary>

Run `$env:QAA_E2E_PORT="5185"; pnpm e2e`.

</details>

## Next step

You now know the main tools of Playwright. In the next module you learn the good practices of QAA: how to write tests that stay easy to read and to fix.
