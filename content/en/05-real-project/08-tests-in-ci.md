---
title: Tests in CI
summary: Read the CI workflow, learn what changes when tests run in CI, download a report from a failed run, and plan what comes next.
duration: 50 min
---

## Goal

- Explain what CI is and when it runs.
- Read `.github/workflows/e2e.yml` step by step.
- Name what changes in the Playwright configs when the `CI` variable is set.
- Open the report and trace of a failed CI run.

## What CI is

**CI** means continuous integration. A server runs your tests automatically on every pull request. It uses a clean machine, so a result there does not depend on your computer.

CI protects the team. A change that breaks a test cannot be merged by mistake.

## Read the workflow

Open `.github/workflows/e2e.yml`. It is a **workflow**: a list of steps that GitHub runs.

```yaml
on:
  pull_request:
  push:
    branches: [main]
```

`on` says when it runs: on every pull request, and on every push to `main`.

```yaml
jobs:
  e2e:
    runs-on: ubuntu-latest
    timeout-minutes: 15
```

A **job** is a group of steps on one machine. This machine runs Linux, not Windows. The job stops after 15 minutes.

The steps run in order:

1. `actions/checkout@v4` downloads your code.
2. `pnpm/action-setup@v4` installs pnpm. It reads the version from the `packageManager` line of `package.json`.
3. `actions/setup-node@v4` installs Node 24 and caches the pnpm downloads.
4. `pnpm install --frozen-lockfile` installs the packages. It fails if `pnpm-lock.yaml` does not match `package.json`.
5. `pnpm typecheck` checks the types.
6. `pnpm exec playwright install --with-deps chromium` downloads the browser and the system libraries it needs.
7. `pnpm e2e` runs the course site suite.
8. `pnpm shop:e2e` runs the shop suite.
9. `actions/upload-artifact@v4` saves the reports.

If a step fails, the next steps do not run. The upload step has `if: ${{ !cancelled() }}`. It runs even after a failure, because you need the report most when something fails.

## What changes with the CI variable

GitHub sets the environment variable `CI`. Both `playwright.config.ts` files read it.

| Setting | On your machine | In CI |
| --- | --- | --- |
| `forbidOnly` | off | on: a `test.only` fails the run |
| `retries` | 0 | 2: a failed test runs again up to 2 times |
| `reuseExistingServer` | on | off: Playwright always starts its own server |

A test that fails and then passes on a retry is marked **flaky** in the report. It is a warning. Fix it.

The shop config keeps the trace of every failed test (`retain-on-failure`). The course site config records a trace on the first retry (`on-first-retry`). In CI it also swaps the `list` reporter for `github`, which prints errors on the pull request page.

## Download the report

1. Open your pull request. Click the failed check, then **Details**.
2. Open the run **Summary**. Scroll to **Artifacts**.
3. Download `playwright-reports`. It is a zip file. Unzip it.
4. The zip holds two folders: one for the course site suite and one for the shop suite. If the course site suite failed, the shop suite did not run, so the shop folder is missing.
5. Open a report with the folder path:

```bash
pnpm exec playwright show-report path\to\apps\practice-shop\playwright-report
```

Replace the path with your real one. Click the failed test. Open its trace. It is the same trace you read in lesson 3, recorded on the CI machine. Reports are kept for 7 days.

## A test fails only in CI

First, do not re-run until it passes. Read the trace. Then check the usual causes.

- **Speed.** The CI machine is slower. A fixed wait or a short timeout fails there. Use web-first assertions.
- **Order and data.** CI starts clean. A test that relied on leftover data fails.
- **Operating system.** CI runs Linux. File names there are case-sensitive: `Products.page.ts` is not `products.page.ts`.
- **Server reuse.** On your machine an old server may hide a problem. CI always starts a fresh one.

To copy the CI conditions, set the variable. Stop the shop first, because CI mode does not reuse a running server. In PowerShell:

```bash
$env:CI = "1"
pnpm shop:e2e
Remove-Item Env:CI
```

The last line removes the variable again.

## After the course

You now know how a test project is built, run and reviewed. Your next step is a real one: ask for access to a team project. Before you read any test, read its `e2e/README.md`, then its coverage notes. Run the suite. Then pick a small gap and open your first pull request there.

## Go deeper

### Why CI starts from a clean machine

"It works on my machine" is a famous sentence. Your computer has old files, old servers and settings that you forgot. CI starts from nothing every time: it downloads the code, installs the packages, starts a new server. If the tests pass there, they do not depend on your computer.

`--frozen-lockfile` follows the same idea. The lock file lists the exact version of every package. With this flag, CI refuses to guess new versions. Everyone gets the same packages.

### A wrong idea: "retries make tests reliable"

Retries do not fix a flaky test. They hide it. The shop uses 2 retries in CI because a small delay should not stop the team. But a test that passes only on the second try is a warning. Playwright marks it **flaky** in the report. Treat that mark as a task to fix.

### How it shows up in real QA automation work

The config reads the `CI` variable like this:

```ts
retries: process.env.CI ? 2 : 0
forbidOnly: !!process.env.CI
```

The `!!` turns any value into `true` or `false`. This small script shows the result for different values:

```ts
for (const value of [undefined, "", "1", "0", "false"]) {
  console.log(JSON.stringify(value), !!value)
}
```

It prints:

```text
undefined false
"" false
"1" true
"0" true
"false" true
```

Notice that the text `"0"` and the text `"false"` give `true`. Only an empty value or no value gives `false`. If a teammate sets `CI=0` to switch CI mode off, it will switch it on. That is a real trap in environment variables, because they are always text.

### DRY in the workflow

Both Playwright configs read one variable, `CI`. One switch changes several settings. The workflow file also lives in one place and runs for every pull request, so nobody has to remember to run both suites. That is **DRY**: Don't Repeat Yourself. The rule is written once and applied every time.

### The trade-off of one big job

The workflow runs both suites in one job, one after the other. It is simple. The cost is time: the shop suite waits for the course suite. Teams with slow suites split them into separate jobs that run at the same time. That is faster, but each job must install everything again. For a small project, one job is the better choice.

## Practice

1. Open `.github/workflows/e2e.yml`. Find the step that installs the browser.
2. Open both `playwright.config.ts` files. Find `forbidOnly`, `retries` and `reuseExistingServer`.
3. Stop the shop. Run the shop suite with `CI` set, as shown above. Check that it starts its own server.
4. Remove the variable. Check with `echo $env:CI` that it is empty.

## Check what you know

1. When does the workflow run?

<details><summary>Answer</summary>

On every pull request and on every push to `main`.

</details>

2. What does `retries: 2` in CI do, and why not locally?

<details><summary>Answer</summary>

A failed test runs again up to two times. Locally you want to see a failure at once, so retries are off.

</details>

3. Why does the upload step run after a failure?

<details><summary>Answer</summary>

`if: ${{ !cancelled() }}` makes it run even when earlier steps fail. You need the report when tests fail.

</details>

4. A test fails only in CI. What do you open first?

<details><summary>Answer</summary>

The trace from the downloaded report.

</details>

5. A teammate sets the variable `CI` to `0` to turn off CI mode. What does `!!process.env.CI` give, and what is the result for `forbidOnly`?

<details><summary>Answer</summary>

It gives `true`. The value is the text "0", and any text that is not empty is true. So `forbidOnly` stays on, and `retries` is 2. To switch CI mode off, remove the variable, as the lesson shows with `Remove-Item Env:CI`.

</details>

6. A test fails on its first run in CI, passes on the second, and the job is green. Is there a problem?

<details><summary>Answer</summary>

Yes, a hidden one. The job passes because of the retry, but the report marks the test as flaky. Something is unstable: timing, data or the environment. If nobody fixes it, the team will slowly stop trusting red builds.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **What is continuous integration (CI), and what problem does it solve?**
   - Search for: `continuous integration explained benefits`
   - A good answer explains: that CI runs checks automatically on every change, and how it finds problems early

2. **What are GitHub Actions workflows, jobs and steps?**
   - Search for: `github actions workflow job step explained`
   - A good answer explains: how the three words relate and how a workflow file is triggered

3. **Why do teams use a lock file such as pnpm-lock.yaml?**
   - Search for: `lockfile package manager reproducible installs`
   - A good answer explains: what a lock file stores and why it makes installs the same on every machine

## Next step

You finished the course. Open the References module when you need a link, and ask for a real project to continue.
