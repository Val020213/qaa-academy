---
title: The config file
summary: Read playwright.config.ts line by line and learn how to change the port with QAA_E2E_PORT.
duration: 45 min
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

## Go deeper

### Why the config can contain code

`playwright.config.ts` is a normal TypeScript file. Playwright loads it and reads what it exports. This is why you can use `process.env`, `??` and `? :` inside it. The config is code that returns settings.

This also makes the config a good place for DRY, "Don't Repeat Yourself". Think about `baseURL`. It is written once. Every test uses `page.goto("/#/practice")`. If the config did not have it, each test would need the full address. When the port changes, you would edit every test. Now you edit one line, or set one variable.

The same is true for `trace`, `screenshot` and `projects`: one setting, all tests.

### A common wrong idea: "`!!process.env.CI` is true only in CI"

The config has `forbidOnly: !!process.env.CI`. The `!!` turns a value into `true` or `false`. A beginner thinks that `CI=false` gives `false`. Test it in plain TypeScript:

```ts
process.env.CI = "false"
console.log(!!process.env.CI)
delete process.env.CI
console.log(!!process.env.CI)
```

It prints:

```text
true
false
```

An environment variable is always text. The text `"false"` is not empty, so it counts as `true`. Only a missing variable or an empty text gives `false`. The check means "the variable exists", not "the variable says yes".

The `??` sign has a similar detail. It replaces only a missing value. An empty text is kept:

```ts
process.env.QAA_E2E_PORT = ""
console.log(`http://localhost:${process.env.QAA_E2E_PORT ?? "5180"}`)
console.log(`http://localhost:${process.env.QAA_E2E_PORT || "5180"}`)
```

This prints `http://localhost:` first, and `http://localhost:5180` second. The sign `||` also replaces an empty text.

### A trade-off: more workers is not always faster

`fullyParallel` runs tests in several workers. By default, Playwright uses about half of the processor cores of the machine. More workers means more tests at the same time.

But the app and the browsers also need the processor. On a small CI machine, too many workers make every test slower. Then timeouts appear, and tests look flaky when nothing is wrong with them.

When you debug a strange failure, run with one worker. The option is `--workers=1`:

```bash
pnpm e2e e2e/playground.spec.ts --workers=1
```

If the failure disappears, the cause may be load or shared data. Then check isolation and the machine, not only the test.

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

5. In plain TypeScript, `const PORT = process.env.QAA_E2E_PORT ?? "5180"` runs when `QAA_E2E_PORT` is set to the empty text `""`. What is the final address in `BASE_URL`, and what happens in the tests?

<details><summary>Answer</summary>

It is `http://localhost:` with no port. The sign `??` replaces only `undefined` or `null`, and an empty text is neither. A browser accepts this address and uses the default HTTP port 80, but the app does not run there. Also, the command that starts the app gets `--port` with no value and stops with an error, so the run fails before the tests can pass. The sign `||` would have used `5180`.

</details>

6. Which setup is better, and why? Version A has `baseURL` in the config and tests use `page.goto("/#/practice")`. Version B has no `baseURL`, and each test uses `page.goto("http://localhost:5180/#/practice")`. The team now needs to run the same tests on another port.

<details><summary>Answer</summary>

Version A is better. The address is in one place, so you change one line or set `QAA_E2E_PORT`. In Version B you must edit every `goto` in every test, and one missed line tests the wrong address. Version A also lets the same test run on other environments.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **What is an environment variable, and how do you set one in PowerShell and in a Unix shell?**
   - Search for: `environment variables powershell $env bash export`
   - A good answer explains: what an environment variable is, how long it lasts in each shell, and why programs read settings from them.

2. **What is the difference between `??` and `||` in JavaScript?**
   - Search for: `nullish coalescing vs logical or javascript`
   - A good answer explains: which values each sign replaces, with examples for `0`, an empty text and `undefined`.

3. **What is continuous integration, and why do teams run automated tests on every pull request?**
   - Search for: `continuous integration automated tests pull request`
   - A good answer explains: what CI does, why tests run there with different settings from a laptop, and what a team gains from it.

## Next step

You now know the main tools of Playwright. In the next module you learn the good practices of QAA: how to write tests that stay easy to read and to fix.
