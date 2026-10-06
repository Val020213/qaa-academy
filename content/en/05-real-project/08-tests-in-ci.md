---
title: Tests in CI
summary: Read the CI workflow, learn what changes when tests run in CI, download a report from a failed run, and write a safer way to read a switch from the environment.
duration: 90 min
---

## Start with a puzzle

Both Playwright configs of the course contain these two lines:

```ts
forbidOnly: !!process.env.CI,
// ...
retries: process.env.CI ? 2 : 0,
```

A teammate wants to run the shop suite in the normal way on their computer, with no retries. They are told to set the variable to something that means "off". In PowerShell they type:

```bash
$env:CI = "false"
pnpm shop:e2e
```

One test has a typo and fails. They expect to see one failure at once.

What does the run do? Does it retry the failed test? Does `forbidOnly` stay off? Think about what kind of value an environment variable holds.

Write down your guess before you read on.

## Goal

- Explain what CI is, when it runs, and why it starts from a clean machine.
- Read `.github/workflows/e2e.yml` step by step, and say what it does not check.
- Predict how the config reads the `CI` variable for any value.
- Open the report and trace of a failed CI run and find the cause.

## What CI is

**CI** means continuous integration. A server runs your tests automatically on every pull request. It uses a clean machine, so a result there does not depend on your computer.

CI protects the team. A change that breaks a test cannot be merged by mistake. It is also the place where one of the **FIRST** traits is proven. A test must be **R**epeatable: it gives the same result on every machine. Your computer cannot prove that. A clean machine can.

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
5. `pnpm typecheck` checks the types of the course site, its tests and the exercises.
6. `pnpm exec playwright install --with-deps chromium` downloads the browser and the system libraries it needs.
7. `pnpm e2e` runs the course site suite.
8. `pnpm shop:e2e` runs the shop suite.
9. `actions/upload-artifact@v4` saves the reports.

Look at the order. The type check is before the browser download, and the browser download is before the tests. Why? The cheap checks come first. If a type is wrong, the job fails in seconds, and does not wait for a slow download. This idea is called **failing fast**. Try to write the order you would choose for a new step "check the code style". Where does it go, and why?

If a step fails, the next steps do not run. The upload step has `if: ${{ !cancelled() }}`. It runs even after a failure, because you need the report most when something fails.

Look for what is missing. The workflow does not run `pnpm --filter practice-shop typecheck`. A wrong type in a shop spec is not caught in CI. You must run that command yourself, as lesson 7 says.

## What changes with the CI variable

GitHub sets the environment variable `CI`. Both `playwright.config.ts` files read it.

| Setting | On your machine | In CI |
| --- | --- | --- |
| `forbidOnly` | off | on: a `test.only` fails the run |
| `retries` | 0 | 2: a failed test runs again up to 2 times |
| `reuseExistingServer` | on | off: Playwright always starts its own server |

A test that fails and then passes on a retry is marked **flaky** in the report. It is a warning. Fix it.

The shop config keeps the trace of every failed test (`retain-on-failure`). The course site config records a trace on the first retry (`on-first-retry`). The course site config also swaps the `list` reporter for `github` in CI, which prints errors on the pull request page. The shop config runs one worker (`workers: 1`) all the time, because its data lives in memory and every test shares it. The course site config runs tests in parallel.

### Back to the puzzle

An environment variable is always text. The text `"false"` is a text with five letters, and JavaScript treats any text that is not empty as true. So `process.env.CI` is true, `retries` is 2, and `forbidOnly` is on. The teammate sees the failing test run three times in a row, and then the run reports it as failed. The setting `reuseExistingServer` is off too, so a shop that is already running gets in the way: stop it first. To switch CI mode off, remove the variable. The script in "Go deeper" shows the values side by side.

## Download the report

1. Open your pull request. Click the failed check, then **Details**.
2. Open the run **Summary**. Scroll to **Artifacts**.
3. Download `playwright-reports`. It is a zip file. Unzip it.
4. The zip holds two folders: one for the course site suite and one for the shop suite. If the course site suite failed, the shop suite did not run, so the shop folder is missing.
5. Open a report with the folder path:

```bash
pnpm exec playwright show-report path\to\apps\practice-shop\playwright-report
```

Replace the path with your real one. Click the failed test. Open its trace. It is the same trace you read in the Trace viewer lesson, recorded on the CI machine. Reports are kept for 7 days.

## A test fails only in CI

First, do not re-run until it passes. Read the trace. Then follow the method of a scientist. Make one guess from the list below. Run one small experiment to test it. Change one thing at a time.

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
forbidOnly: !!process.env.CI,
// ...
retries: process.env.CI ? 2 : 0,
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

Both Playwright configs read one variable, `CI`. One switch changes several settings. The workflow file also lives in one place and runs for every pull request, so nobody has to remember to run both suites. That is **DRY**: Don't Repeat Yourself. The rule is written once and applied every time. **KISS** is the balance: the workflow has one job and nine plain steps. It does not need matrices, templates or custom actions.

### The trade-off of one big job

The workflow runs both suites in one job, one after the other. It is simple. The cost is time: the shop suite waits for the course suite. Teams with slow suites split them into separate jobs that run at the same time. That is faster, but each job must install everything again. For a small project, one job is the better choice. **YAGNI** says: split the job when the wait really hurts, not before.

## Practice

1. Open `.github/workflows/e2e.yml`. Find the step that installs the browser.
2. Open both `playwright.config.ts` files. Find `forbidOnly`, `retries` and `reuseExistingServer`.
3. Stop the shop. Run the shop suite with `CI` set, as shown above. Check that it starts its own server.
4. Remove the variable. Check with `echo $env:CI` that it is empty.

## Challenge

Write a safer way to read a switch from the environment. Create the file `exercises/challenges/ci-flag.ts`. The file defines a function `isCiOn(value)` that takes a text or nothing and answers `true` or `false`. Choose your own rule for which texts mean "off". Write that rule in a comment at the top of the file, in one or two sentences. Your rule must be written for people, not only for the machine: a teammate who writes `CI=0` or `CI=false` should get what they expect.

It is done when:

- Running `node exercises/challenges/ci-flag.ts` prints one line for each of at least eight sample values, such as `"false" -> off`. The samples include nothing at all (`undefined`), an empty text, `"1"`, `"0"`, `"false"` and a text with spaces and capital letters such as `" FALSE "`.
- The file holds a table of expected answers, compares your function with it, and prints `all cases match` at the end. If a case does not match, it prints the case.
- The last line prints `CI mode from the environment: on` or `off`, read from the real `CI` variable. It prints `on` after `$env:CI = "1"`, and `off` after `$env:CI = "0"` and when the variable is removed.
- `pnpm typecheck` passes with your file in place.

You will need something this lesson did not teach: how to read an environment variable in a Node script, and how to clean a text before you compare it. Search for `node process.env`, `javascript string trim toLowerCase` and `javascript Set has`.

## Think it through

1. Predict the output. A teammate sets `CI` to one space, to the text `"null"`, and to the text `"undefined"`. What does `!!process.env.CI` give in each case, and why?

<details><summary>Answer</summary>

It gives `true` in all three cases. An environment variable is text, and every text that is not empty is true, even a single space or the word "null". Only a variable that does not exist (value `undefined`) or an empty text gives `false`. This is why a safe reader of switches names the "off" values it accepts, and does not rely on the truth of a text.

</details>

2. A job runs both suites. The course site suite is green. The shop suite fails on its first run, passes on retry 1, and the job is green. Nobody looks at the report for a month. Find what is wrong in the way the team works.

<details><summary>Answer</summary>

The job is green, but the report marks the test as flaky. The signal is in the report, and nobody reads it. Something is unstable: timing, shared data or the environment. After a while the retry hides more and more of these tests, and the team stops trusting red builds. A team needs a rule, such as "a flaky mark opens a task". A retry is a tool for the pipeline, not a fix for the test.

</details>

3. Version one: one job that runs both suites in order. Version two: two jobs that run at the same time. Which is better for this course, and what would make you choose the other?

<details><summary>Answer</summary>

Version one is better for a small project. It is simple, and there is one install. Version two is faster, but every job installs everything again, and you must collect two sets of reports. If the suites grow so long that people wait too much for a pull request, or if one suite often fails and blocks the other, split them. The wait time of the team decides.

</details>

4. What breaks if `--frozen-lockfile` is removed from the install step, and a teammate adds a package but forgets to commit `pnpm-lock.yaml`?

<details><summary>Answer</summary>

In CI, pnpm is frozen by default when a lock file exists, so removing the flag would not change much. The flag `--no-frozen-lockfile` is what turns that behavior off, and then pnpm may pick versions by itself, maybe newer than the ones the teammate tested. A test may then fail in CI for a reason that nobody can reproduce on a computer. With the flag, the job fails at once with a clear message that the lock file does not match. A fast, clear failure is better than a hidden difference.

</details>

5. Explain to a teammate, in three sentences and without the word "server", why the CI machine can find bugs that your computer cannot.

<details><summary>Answer</summary>

A good answer says that CI starts from nothing every time: new files, new packages, a new copy of the app. Your computer keeps old data, old settings and old programs that can hide a problem. The CI machine also has a different operating system and a slower speed, so timing and file-name problems show up. Any answer that names "clean start" and "different conditions" is correct.

</details>

6. The team wants to replace `!!process.env.CI` in both configs with your safer function from the challenge. Is it a good idea? Decide, and say what it depends on.

<details><summary>Answer</summary>

There is no single right answer. The gain is that `CI=0` and `CI=false` work as people expect, so fewer surprises. The cost is a shared helper that both configs must import, and a new rule to explain, while GitHub always sets `CI=true`. If people often set the variable by hand, the helper pays off. If only GitHub sets it, the change is more code than the problem needs, and keeping the one-line version is better.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **What is continuous integration (CI), and what problem does it solve?**
   - Search for: `continuous integration explained benefits`
   - Try it: open the Actions tab of your fork on GitHub. Open one finished run. Write the time of each step, and say which step takes the most time and why.
   - A good answer explains: that CI runs checks automatically on every change, and how it finds problems early

2. **What are GitHub Actions workflows, jobs and steps?**
   - Search for: `github actions workflow job step explained`
   - Try it: copy `.github/workflows/e2e.yml` to a text file outside the repository. Draw the file as a tree: workflow, job, steps. Mark which part says when it runs, and which part says on what machine it runs.
   - A good answer explains: how the three words relate and how a workflow file is triggered

3. **Why do teams use a lock file such as pnpm-lock.yaml?**
   - Search for: `lockfile package manager reproducible installs`
   - Try it: open `pnpm-lock.yaml` and find the entry of `marked`. Then open `package.json` and compare the version written in both files. One has a range with `^` and the other has one exact version. Write why the lock file needs the exact one.
   - A good answer explains: what a lock file stores and why it makes installs the same on every machine

## Next step

You finished the course. Open the References module when you need a link, and ask for a real project to continue.
