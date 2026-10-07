---
title: Tests in CI
duration: 60 min
---

## Goal

You will read the project's automated checks and find the cause of a test that fails in CI.

- Read `.github/workflows/e2e.yml` and identify which checks it runs and which are missing.
- Identify the settings that change with the `CI` variable.
- Download the report from a failed run and review its trace.
- Write a function that interprets an environment switch.

## CI in this project

**CI** means continuous integration. Automated checks accompany the integration of changes into the team's repository. In this project, GitHub Actions runs the type check and both suites on a new machine, without the files or servers left over on your computer.

CI reports a failing test. To block merging, the repository must require that check through its protection rules. A test must be **R**epeatable: under the same conditions, it gives the same result. A clean Ubuntu run with Chromium provides evidence in that environment.

## Read the workflow

Open `.github/workflows/e2e.yml`. The **workflow** defines when the checks run and the steps that the GitHub Actions runner executes.

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

A **job** groups steps that a runner executes. This job runs on Linux and has a 15-minute limit.

The steps run in order:

1. `actions/checkout@v4` downloads your code.
2. `pnpm/action-setup@v4` installs pnpm. It reads the version from the `packageManager` line of `package.json`.
3. `actions/setup-node@v4` installs Node 24 and caches the pnpm downloads.
4. `pnpm install --frozen-lockfile` installs the packages. It fails if `pnpm-lock.yaml` does not match `package.json`.
5. `pnpm typecheck` checks the types of the course site, its tests and the exercises.
6. `pnpm exec playwright install --with-deps chromium` downloads the browser and the system libraries it needs.
7. `pnpm e2e` runs the course site suite.
8. `pnpm shop:e2e` runs the shop suite.
9. `actions/upload-artifact@v4` saves the reports.

The type check comes before the browser download. If it finds an error, the job stops before downloading the browser and running the tests. This is **failing fast**.

If a step fails, GitHub Actions skips subsequent steps without a condition that allows them to run after a failure. The upload step has `if: ${{ !cancelled() }}`: it runs even after a failure, provided the run has not been cancelled.

![A failure skips later normal steps; upload can preserve the available reports.](/images/05-ci-failure-flow.en.svg)

The workflow does not run `pnpm --filter practice-shop typecheck`. CI does not run that shop type check; a type-related defect that affects execution can still fail a test. Run that command before pushing, as lesson 7 instructs.

## CI settings

GitHub sets the environment variable `CI`. Both `playwright.config.ts` files read it.

| Setting | On your machine | In CI |
| --- | --- | --- |
| `forbidOnly` | off | on: a `test.only` fails the run |
| `retries` | 0 | 2: a failed test runs again up to 2 times |
| `reuseExistingServer` | on | off: starts the server if the URL does not answer; fails if it already answers |

A test that fails and then passes on a retry is marked **flaky** in the report. Investigate the cause of the failure even if the retry passes.

The shop config keeps the trace of every failed test (`retain-on-failure`). The course site config records a trace on the first retry (`on-first-retry`) and swaps the `list` reporter for `github` in CI, which prints errors on the pull request page.

The shop uses one worker (`workers: 1`) because its data lives in memory and the tests share it. The course site config runs tests in parallel.

## The CI variable is read as text

Both configs contain these lines:

```ts
forbidOnly: !!process.env.CI,
// ...
retries: process.env.CI ? 2 : 0,
```

The `!!` converts the value to a boolean. This script shows the result for different values:

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

If a teammate tries to switch CI mode off like this:

```bash
$env:CI = "false"
pnpm shop:e2e
```

JavaScript treats nonempty text as true. The value of `process.env.CI` remains the string `"false"`; its boolean conversion is `true`, `retries` is 2, and `forbidOnly` is on. If a test fails on all three attempts, Playwright reports it as failed.

The setting `reuseExistingServer` is off too. Stop a shop that is already running before running the suite. To switch CI mode off, remove the variable.

## Download the report

1. Open your pull request. Click the failed check, then **Details**.
2. Open the run **Summary**. Scroll to **Artifacts**.
3. If `playwright-reports` exists, download it and unzip the file. A failure before the tests can leave the run without reports.
4. Look for `playwright-report/` for the course and `apps/practice-shop/playwright-report/` for the shop. The artifact preserves these paths from their common root. If the course suite failed, the shop did not run and did not generate its report.
5. Open a report with the folder path:

```bash
pnpm exec playwright show-report path\to\apps\practice-shop\playwright-report
```

Replace the path with your real one. Click the failed test and open its trace to review the actions and page state. Reports are kept for 7 days.

## A test fails only in CI

Read the trace and choose a hypothesis based on the failure. Test that hypothesis by changing one thing:

- A response can take longer in CI because of load or network delays. Check the timings in the trace; a fixed wait or short timeout can expire before it arrives. Use web-first assertions.
- A test may rely on data left over from a previous run. CI starts clean.
- CI runs Linux, where file names are case-sensitive: `Products.page.ts` is not `products.page.ts`.
- An old server on your machine may hide a problem. With the URL free, Playwright in CI starts a fresh one; if it already answers, it fails.

To reproduce the CI Playwright settings on your machine, set the variable. This does not change your operating system or create a clean environment. Stop the shop first, because CI mode does not reuse a running server. In PowerShell:

```bash
$env:CI = "1"
pnpm shop:e2e
Remove-Item Env:CI
```

The last line removes the variable again.

## Go deeper

### The lock file

The lock file records exact package versions. With `--frozen-lockfile`, pnpm installs those versions and fails if it needs to update the file. This detects a dependency change that was not recorded in `pnpm-lock.yaml`.

### Both suites in one job

The workflow installs the tools once and runs both suites in order. The shop waits for the course suite to finish; if that suite fails, the shop does not run.

Separate jobs can run at the same time, but each job needs to prepare its environment. The suite durations help the team decide whether repeating that setup is worthwhile.

## Practice

1. Open `.github/workflows/e2e.yml`. Find the step that installs the browser.
2. Open both `playwright.config.ts` files. Find `forbidOnly`, `retries` and `reuseExistingServer`.
3. Stop the shop. Run the shop suite with `CI` set, as shown above. Check that it starts its own server.
4. Check with `echo $env:CI` that the variable is empty after the last line of the sequence.

## Challenge

Create `exercises/challenges/ci-flag.ts` with a function `isCiOn(value)` that takes text or nothing and returns `true` or `false`. Define which texts mean "off" and write the rule in a one- or two-sentence comment at the top. The rule must treat `CI=0` and `CI=false` as off.

It is done when:

- `node exercises/challenges/ci-flag.ts` prints one line for each of at least eight values, such as `"false" -> off`. Include `undefined`, empty text, `"1"`, `"0"`, `"false"` and `" FALSE "`.
- The file compares the results with a table of expected answers and prints `all cases match` when the case checks finish, before the environment message. If a case does not match, it prints that case.
- The last line prints `CI mode from the environment: on` or `off`, read from the real `CI` variable. It prints `on` after `$env:CI = "1"`, and `off` after `$env:CI = "0"` and when the variable is removed.
- `pnpm typecheck` passes with your file in place.

Search for `node process.env`, `javascript string trim toLowerCase` and `javascript Set has`.

## Think it through

1. A teammate sets `CI` to one space, to the text `"null"`, and to the text `"undefined"`. What does `!!process.env.CI` give in each case?

<details><summary>Answer</summary>

It gives `true` in all three cases because they are nonempty text. Only a missing variable or empty text gives `false`.

</details>

2. The shop suite fails on its first run and passes on retry 1. The job is green. What problem remains unresolved if the team only looks at that mark?

<details><summary>Answer</summary>

The report marks the test as flaky. The retry passed, but the team still needs to investigate the cause of the first failure.

</details>

3. A teammate adds a package but forgets to commit `pnpm-lock.yaml`. What happens if they remove `--frozen-lockfile` from the install step?

<details><summary>Answer</summary>

In this project, pnpm enables frozen installation by default in CI because the lock file is not empty. The installation still fails because it differs from `package.json`. `--no-frozen-lockfile` is the option that allows updates during installation.

</details>

## Next step

You finished the course. Open the References module when you need a link, and ask for a real project to continue.
