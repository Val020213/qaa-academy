---
title: The config file
summary: Read playwright.config.ts line by line, predict how it behaves on your machine and in CI, and change it safely.
duration: 90 min
---

## Start with a puzzle

A teammate is tired of retries on her laptop. She reads the config:

```ts
retries: process.env.CI ? 2 : 0,
```

She thinks: "I will switch CI off." In PowerShell she runs `$env:CI="false"` and then `pnpm e2e`.

She expects zero retries and no check for `test.only`. A failing test is still run three times in total, and a forgotten `test.only` stops the run.

Why does the value `"false"` not switch anything off? What would you change in her command to get what she wants?

Write down your guess before you read on.

## Goal

- Predict how the config behaves on your machine and in CI.
- Explain what each setting protects you from.
- Choose where a setting belongs: in the config, in the command or in the test.
- Run the tests on another port, and explain why you would do it.

## What the config file is

The file `playwright.config.ts` is in the root of the project. Playwright reads it each time you run `pnpm e2e`. It says where the tests are, how to run them and how to report them.

You do not write it often. But you must be able to read it, because it explains a lot of what you see when tests run. Open the file and follow this lesson.

Reading documentation is a skill. When you meet a new setting, open the Playwright page about test options. Scan for three things: the signature (the type of the value), the example, and the notes about edge cases. You do not need to read the whole page.

## The port and the address

```ts
const PORT = process.env.QAA_E2E_PORT ?? "5180"
const BASE_URL = `http://localhost:${PORT}`
```

`process.env` holds **environment variables**. These are named values that the terminal passes to a program. `QAA_E2E_PORT` is one we made up for this project.

The `??` sign means: use the value on the left, and if it does not exist, use the one on the right. So the port is `5180` unless you set `QAA_E2E_PORT`.

`BASE_URL` joins the address. Backticks and `${PORT}` put the port inside the text.

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

Playwright runs tests at the same time, in several **workers**. A worker is one process that runs tests. With `true`, even tests in the same file run in parallel. This is fast. It only works because tests are isolated, as you saw in the last lesson.

## forbidOnly and retries

```ts
forbidOnly: !!process.env.CI,
retries: process.env.CI ? 2 : 0,
```

`CI` is a variable that CI servers set. The `!!` turns a value into `true` or `false`. The `? :` sign is a short `if / else`. In CI, a forgotten `test.only` makes the run fail, and a failed test is run again, up to two times. On your machine you want to see the failure at once.

### Experiment: what does the config really ask?

Before you read the output, predict `retries` and `forbidOnly` for each value of `CI`: not set, `""` (empty text), `"0"`, `"false"`. Write four pairs. Then run this file with `node`.

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

An environment variable is always text. The text `"0"` and the text `"false"` are not empty, so they count as `true`. Only a missing variable or an empty text counts as `false`. The check means "the variable exists", not "the variable says yes".

> **Careful:** Retries can hide a flaky test: it fails, then passes, and the run is green. If the report says "flaky", fix the test.

### Back to the puzzle

Her command sets `CI` to the text `"false"`. That text is not empty, so `process.env.CI` counts as true. She gets two retries and `forbidOnly` on, which is the opposite of what she wanted. She must remove the variable (`Remove-Item Env:CI`) or set it to an empty text. Better: she does not touch `CI` at all. If she wants no retries for one run, she can use `--retries=0` in the command.

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

You could add more projects, such as Firefox or a phone. Each project runs all the tests again.

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

> **Careful:** On your machine, with `reuseExistingServer`, Playwright tests whatever runs on that port. If another app uses port 5180, you test the wrong app and see no error about it. Use `QAA_E2E_PORT` to avoid this.

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

This also makes the config a good place for DRY, "Don't Repeat Yourself". The `baseURL` is written once. If the config did not have it, each test would need the full address. When the port changes, you would edit every test. Now you edit one line, or set one variable.

### A common wrong idea: "`??` and `||` are the same"

The `??` sign replaces only a missing value. An empty text is kept:

```ts
process.env.QAA_E2E_PORT = ""
console.log(`http://localhost:${process.env.QAA_E2E_PORT ?? "5180"}`)
console.log(`http://localhost:${process.env.QAA_E2E_PORT || "5180"}`)
```

This prints `http://localhost:` first, and `http://localhost:5180` second. The sign `||` also replaces an empty text. It replaces the number `0` too. For a setting where `0` is a real choice, this matters:

```ts
process.env.WORKERS = "0"
console.log(Number(process.env.WORKERS) || 4)
console.log(Number(process.env.WORKERS) ?? 4)
```

It prints `4` and then `0`. Here `||` throws away a value that the person typed on purpose. Choose the sign by asking: which values mean "nothing was given"?

### A trade-off: more workers is not always faster

`fullyParallel` runs tests in several workers. By default, Playwright uses about half of the processor cores of the machine. But the app and the browsers also need the processor. On a small CI machine, too many workers make every test slower. Then timeouts appear, and tests look flaky when nothing is wrong with them.

When you debug a strange failure, run with one worker:

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

## Challenge

Build a second config for a different question, without changing `playwright.config.ts`. The question: "Do the Practice page tests also pass in a small window, and one at a time?"

Create the file `playwright.challenge.config.ts` in the root of the project. It must run only the tests in `e2e/playground.spec.ts`, in two projects. The first project is a desktop browser. The second is a small-screen project of your choice: a phone from the Playwright device list, or a window size you pick. It must use one worker and one retry, and it must start the site on port 5186, with the port written once in the file.

It is done when:

- `pnpm exec playwright test --config playwright.challenge.config.ts --list` shows 8 tests, each with a project name in square brackets, and no test from another file.
- `pnpm exec playwright test --config playwright.challenge.config.ts` prints `Running 8 tests using 1 worker` and all 8 pass.
- `playwright.config.ts` is not changed, and the port number appears only once in your file.
- `pnpm exec playwright test --config playwright.challenge.config.ts --project=<your second project name>` runs only 4 tests.

You will need something this lesson did not teach: how to point Playwright to another config file, how to select only some spec files in a config, and how to set a window size. Search for: `playwright test --config option`, `playwright testMatch`, `playwright viewport emulation`.

## Think it through

1. Predict `retries` and `forbidOnly` for each of these cases, and say why: `CI` is not set; `CI` is set to `""`; `CI` is set to `"0"`.

<details><summary>Answer</summary>

Not set: 0 retries and `forbidOnly` false, because the variable does not exist. Empty text: the same, because an empty text counts as false. The text `"0"`: 2 retries and `forbidOnly` true, because any text that is not empty counts as true, also when it looks like "no". The config tests whether the variable has a value, not what the value means.

</details>

2. This config runs without any error message at the start, but the run fails after about one minute. Find the bug.

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

<details><summary>Answer</summary>

The command has the port written as `5180`, but the `url` follows `QAA_E2E_PORT`. If you set `QAA_E2E_PORT=5185`, Playwright starts the site on 5180 and waits for a site on 5185. Nothing answers there, so after 60 seconds it stops with a timeout. The port is in two places and the places can disagree. The fix is to use `${PORT}` in the command too.

</details>

3. Two versions of one setting. Version A: `reuseExistingServer: true` always. Version B: `reuseExistingServer: !process.env.CI`. Which is better for this team, and what would make you choose the other?

<details><summary>Answer</summary>

Version B is better. On your machine, reusing a running site saves time, because you often have `pnpm dev` open already. In CI a site running on that port is not expected, so an error warns you that the environment is not clean. Version A would be fine if the CI machine always starts clean and nobody can leave a site running. The choice depends on how much you trust the environment.

</details>

4. The team adds two projects to the config: Firefox and a phone. What changes in the run, and what could break?

<details><summary>Answer</summary>

Every test now runs three times, so the run is about three times longer, and the report shows names like `[firefox]` and `[phone]`. Tests that use `data-testid` and roles should still pass. Tests that depend on a screen size or on hover can fail on the phone, for example when a menu moves below the content on a small window. Each failure then tells you something about the app, not only about the test.

</details>

5. A new colleague asks why the tests use `page.goto("/#/practice")` and not the full address. Explain it in three sentences without using the words "DRY" or "variable".

<details><summary>Answer</summary>

Example: "The start of the address is written once, in the config file. If the port or the server changes, we edit one line and every test still works. The same tests can also run against another address." A good answer says where the address lives and what that makes easy.

</details>

6. Another app already runs on port 5180 on your machine, and you run `pnpm e2e` without setting `QAA_E2E_PORT`. What happens, and how would you notice?

<details><summary>Answer</summary>

`reuseExistingServer` is true on your machine, and the other app answers at the `url`. So Playwright does not start the course site and runs the tests against the other app. You would not see a message about it. You would see failures such as elements that cannot be found. The first clue is that nearly every test fails at once, and the screenshot shows a page you do not know.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **What is an environment variable, and how do you set one in PowerShell and in a Unix shell?**
   - Search for: `environment variables powershell $env bash export`
   - Try it: In PowerShell, run `$env:MY_NAME="Rex"; node -e "console.log(process.env.MY_NAME)"`. Open a second terminal window and run only the `node` part. Compare the results.
   - A good answer explains: what an environment variable is, how long it lasts in each shell, and why programs read settings from them.

2. **What is the difference between `??` and `||` in JavaScript?**
   - Search for: `nullish coalescing vs logical or javascript`
   - Try it: In a scratch file, test both signs with `0`, `""`, `false`, `null` and `undefined` on the left. Run it with `node` and write the results in a small table.
   - A good answer explains: which values each sign replaces, with examples for `0`, an empty text and `undefined`.

3. **What is continuous integration, and why do teams run automated tests on every pull request?**
   - Search for: `continuous integration automated tests pull request`
   - Try it: Open the file `.github/workflows/e2e.yml` in this project. Find the step that runs the tests, and list two things that are different there from your laptop.
   - A good answer explains: what CI does, why tests run there with different settings from a laptop, and what a team gains from it.

## Next step

You now know the main tools of Playwright. In the next module you learn the good practices of QAA: how to write tests that stay easy to read and to fix.
