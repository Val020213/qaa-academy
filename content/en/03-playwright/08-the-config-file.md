---
title: The config file
duration: 60 min
---

## Goal

Read the project configuration to understand how Playwright runs the tests. Use its settings to change the port and run the same tests under different conditions.

- Read the execution, reporting and browser settings.
- Distinguish local behavior from behavior in CI.
- Configure site startup and avoid port conflicts.
- Run the tests with another configuration.

## Read the config file

Playwright's test runner reads `playwright.config.ts` each time you run `pnpm e2e`. The file is in the project root and defines where to find the tests, how to run them and how to show the results.

Open the file. It is TypeScript: Playwright loads it and reads what it exports. That lets it calculate settings from environment variables.

## The port and the address

```ts
const PORT = process.env.QAA_E2E_PORT ?? "5180"
const BASE_URL = `http://localhost:${PORT}`
```

Node.js exposes **environment variables** through `process.env`: named values it receives from the process that starts it. `QAA_E2E_PORT` is a variable defined for this project.

The `??` operator uses the value on the right when the value on the left is `null` or `undefined`. If you do not set `QAA_E2E_PORT`, the port is `5180`. `BASE_URL` uses that port to build the site's address.

![PORT feeds the server command; BASE_URL feeds the server check and relative URLs.](/images/03-port-consumers.en.svg)

## defineConfig

```ts
export default defineConfig({
```

`defineConfig` is a Playwright helper with a type signature that TypeScript's type checker uses to check settings in the editor. At runtime, it returns the configuration; it does not check types. Everything below is inside it.

## testDir

```ts
testDir: "./e2e",
```

The runner looks for specs in `e2e` and its subfolders. That is why exercise files with the `.spec.ts` extension also run with `pnpm e2e`.

## fullyParallel

```ts
fullyParallel: true,
```

With this setting, the runner can run even tests from the same file in parallel. Workers run the tests in separate processes; tests must not depend on another test finishing first.

## forbidOnly and retries

```ts
forbidOnly: !!process.env.CI,
retries: process.env.CI ? 2 : 0,
```

CI servers set `CI` as an environment variable. `!!` converts its value to a boolean; `? :` chooses between two values based on the condition.

When `CI` is set and nonempty, `forbidOnly` fails the run if it finds `test.only`, and `retries` allows up to two retries of a failed test. Without `CI`, the runner does not retry tests.

This example shows which values enable those settings:

```ts
for (const value of [undefined, "", "0", "false"]) {
  if (value === undefined) delete process.env.CI
  else process.env.CI = value

  console.log(JSON.stringify(value), process.env.CI ? 2 : 0, !!process.env.CI)
}
```

It prints:

```text
undefined 0 false
"" 0 false
"0" 2 true
"false" 2 true
```

Environment variable values are text. `"0"` and `"false"` count as true because they are not empty. A missing variable or an empty text counts as false. The condition checks that the variable's value is a nonempty string; it does not interpret words such as "false".

Running `$env:CI="false"` enables the CI settings. To remove the variable in PowerShell, use `Remove-Item Env:CI`. To disable only retries for one run, use `--retries=0` in the command.

> **Careful:** If a test fails and then passes on a retry, the report marks it as *flaky*. Review the failure even if the run ends without errors.

## reporter

```ts
reporter: process.env.CI
  ? [["github"], ["html", { open: "never" }]]
  : [["list"], ["html", { open: "never" }]],
```

**Reporters** show the results. Without `CI`, `list` shows the test list in the terminal; with `CI`, `github` adds messages to the GitHub run. Both options generate an HTML report.

`open: "never"` prevents the report from opening automatically. Open it with `pnpm e2e:report`.

## use

```ts
use: {
  baseURL: BASE_URL,
  trace: "on-first-retry",
  screenshot: "only-on-failure",
},
```

`use` holds options for every test.

- `baseURL` resolves relative addresses with the `URL` constructor. This is why `page.goto("/#/practice")` works. An absolute address keeps its own origin.
- `trace` records a trace only on the first retry. Locally, add `--trace on`.
- `screenshot` attempts to capture pages only when a test fails.

With `baseURL`, tests use relative paths and the start of the address is written once. A port change does not require editing each test.

## projects

```ts
projects: [
  {
    name: "chromium",
    use: { ...devices["Desktop Chrome"] },
  },
],
```

A **project** is a set of settings to run the tests with. Here there is one named `chromium`, which uses the Chromium browser and the settings from `devices["Desktop Chrome"]`, such as the window size.

The name appears as `[chromium]` in the list report. If you add a project for Firefox or a phone, the runner runs the tests again with those settings.

## webServer

```ts
webServer: {
  command: `pnpm dev --port ${PORT}`,
  url: BASE_URL,
  reuseExistingServer: !process.env.CI,
  timeout: 60_000,
},
```

`webServer` tells Playwright to check the address and, if no server is available, start the app before the tests. At the end, it stops the process it started. A reused server stays running. That is why you do not need `pnpm dev` first.

- `command` starts the app on the chosen port.
- `url` is the address Playwright checks to know the app is ready.
- `timeout` limits the wait for the app to `60_000` milliseconds, or 60 seconds.
- `reuseExistingServer` decides what happens if something already answers at the `url`. Without `CI`, Playwright reuses it; with `CI`, it stops with an error.

> **Careful:** Playwright does not check that the site answering is the course site. If another app uses port 5180, the tests may run against that app. Use `QAA_E2E_PORT` to choose another port.

## Change the port

In PowerShell, set the variable and run the tests:

```bash
$env:QAA_E2E_PORT="5185"; pnpm e2e
```

Playwright uses `http://localhost:5185` as the base address and the address to check the server. The variable stays set in that terminal window until you close it or remove it:

```bash
Remove-Item Env:QAA_E2E_PORT
```

On macOS or Linux, write `QAA_E2E_PORT=5185 pnpm e2e`. The variable lasts only for that command.

> **Note:** Do not use 5190. The practice shop uses that port.

## Go deeper

### Fallback values with `??` and `||`

`??` keeps an empty text, while `||` replaces it:

```ts
process.env.QAA_E2E_PORT = ""
console.log(`http://localhost:${process.env.QAA_E2E_PORT ?? "5180"}`)
console.log(`http://localhost:${process.env.QAA_E2E_PORT || "5180"}`)
```

It prints `http://localhost:` first and `http://localhost:5180` second. The number `0` is also falsy, so `||` replaces it:

```ts
process.env.WORKERS = "0"
console.log(Number(process.env.WORKERS) || 4)
console.log(Number(process.env.WORKERS) ?? 4)
```

It prints `4` and then `0`. When choosing the operator, distinguish values that mean a setting is missing from values that are valid for that setting.

### The worker limit

By default, Playwright uses roughly half the processor cores as the worker limit. The app and browsers also consume resources: too many workers can cause slowdowns and timeouts.

To investigate a failure with one worker:

```bash
pnpm e2e e2e/playground.spec.ts --workers=1
```

If the failure disappears, check the machine's load and shared data. The change alone does not identify the cause.

## Practice

1. Open `playwright.config.ts` and find the settings from this lesson.
2. Run all the tests on another port:

```bash
$env:QAA_E2E_PORT="5185"; pnpm e2e
```

3. Review the results. Remove the variable with `Remove-Item Env:QAA_E2E_PORT` to return to the default port.

There is no exercise file for this lesson.

## Challenge

Create `playwright.challenge.config.ts` in the project root to run the Practice tests on desktop and on a small screen. Keep `playwright.config.ts` unchanged.

Run only `e2e/playground.spec.ts` in two projects: one desktop project and another using a phone from the device list or a window size you choose. Use one worker and one retry. Start the site on port 5186 and write that number only once.

It is done when:

- `pnpm exec playwright test --config playwright.challenge.config.ts --list` shows 8 tests, each with a project name in square brackets, and no test from another file.
- `pnpm exec playwright test --config playwright.challenge.config.ts` prints `Running 8 tests using 1 worker` and all 8 pass.
- `playwright.config.ts` is not changed, and the port number appears only once in your file.
- `pnpm exec playwright test --config playwright.challenge.config.ts --project=<your second project name>` runs only 4 tests.

Search for: `playwright test --config option`, `playwright testMatch`, `playwright viewport emulation`.

## Think it through

1. You set `QAA_E2E_PORT=5185` and run the tests with this configuration. The run fails after about a minute. Find the bug.

```ts
const PORT = process.env.QAA_E2E_PORT ?? "5180"
const BASE_URL = `http://localhost:${PORT}`

export default defineConfig({
  webServer: {
    command: "pnpm dev --port 5180",
    url: BASE_URL,
    timeout: 60_000,
  },
})
```

<details>
<summary>Answer</summary>

The command starts the site on `5180`, but `url` uses the port from `QAA_E2E_PORT`. Playwright waits for a response on 5185, where there is no server, and reaches the 60-second timeout. Use `${PORT}` in the command too.

</details>

2. In CI, a site already answers at the configured address. Compare `reuseExistingServer: true` with `reuseExistingServer: !process.env.CI`. What does Playwright do in each case?

<details>
<summary>Answer</summary>

With `reuseExistingServer: true`, Playwright reuses that site. With `reuseExistingServer: !process.env.CI`, it stops with an error because `CI` has a nonempty value. That error helps detect an unexpected server in CI.

</details>

3. Another app answers on port 5180 on your machine. You run `pnpm e2e` without setting `CI` or `QAA_E2E_PORT`. Which site do the tests check, and how would you detect it?

<details>
<summary>Answer</summary>

Playwright reuses the other app because `reuseExistingServer` is true. You may see failures from elements that cannot be found and screenshots of a page other than the course site.

</details>

## Next step

You now know the main tools of Playwright. In the next module you learn the good practices of QAA: how to write tests that stay easy to read and to fix.
