---
title: Your first pull request
duration: 75 min
---

## Goal

You will bring the tests from the previous lessons into a pull request and prepare the work for a teammate to review.

- Split changes into commits that can be reviewed by topic.
- Run the local checks and identify which one CI leaves out.
- Write a description with the coverage, commands and data the tests use.
- Answer review comments and detect problems a merge without conflicts can miss.

## 1. Create a branch

Start from an up-to-date `main`. Give the branch a name that says what it does.

```bash
git switch main
git pull
git switch -c tests/close-coverage-gaps
```

Good names: `tests/cancel-pending-order`, `tests/edit-product`. In this lesson, the cancellation, product editing and viewer tests share one goal: close coverage gaps.

## 2. Small commits

Make one commit for each finished piece, together with its change to `COVERAGE.md`.

Because each commit is separate, Git can undo one without touching the others. With one big commit, you cannot undo only the bad part.

```bash
git add apps/practice-shop/e2e/orders/orders.spec.ts apps/practice-shop/e2e/COVERAGE.md
git commit -m "Test that an admin cancels a pending order"
```

Write the message in the present tense and say what the commit adds. Add files by name to include only those that belong to that piece.

This command shows what Git would stage from the current folder, without staging anything:

```bash
git add --dry-run .
```

Before each commit, review the staged files and their changes:

```bash
git status
git diff --staged
```

`git diff --staged` shows the lines that go into the commit. If you see a file that does not belong, remove it from the staging area:

```bash
git restore --staged path/to/file
```

You must never see `.auth/`, `playwright-report/` or `test-results/` in the list. They are ignored.

> **Careful:** `git commit -am "message"` stages only changes to files Git already tracks. A new spec stays out of the commit until you add it with `git add`.

## 3. Run the checks

Run these three commands from the root of the repository. All must pass.

```bash
pnpm typecheck
pnpm --filter practice-shop typecheck
pnpm shop:e2e
```

- `pnpm typecheck` checks the types in the course site, its tests and the exercises.
- `pnpm --filter practice-shop typecheck` checks the types in the shop and its tests. A wrong type in a spec fails here.
- `pnpm shop:e2e` runs the shop suite. Run it at least twice if you changed data setup.

The workflow `.github/workflows/e2e.yml` runs the first and third commands, but not `pnpm --filter practice-shop typecheck`. So CI will not catch a wrong type in a shop spec. You must run that check locally.

If you touched the course site, run `pnpm e2e` as well. CI runs both suites.

## 4. Push

The first time, set the upstream to link your local branch to the remote one.

```bash
git push -u origin tests/close-coverage-gaps
```

Here `origin` is your fork on GitHub, the copy you made in module 0. The output prints a link to open a pull request. Open it in your browser.

> **Careful:** GitHub may offer to send the pull request to the original course repository. Change the **base repository** to your own fork, so the pull request stays in your copy. Then share its link with the person who reviews your work.

## 5. Write the description

Describe what the tests cover, how to run them and what data they use. Use this template:

```text
## What is covered
- An admin cancels a pending order (order 1001).
- Editing a product: four scenarios.

## How to run
pnpm --filter practice-shop e2e e2e/orders/orders.spec.ts
pnpm --filter practice-shop e2e e2e/products/product-edit.spec.ts

## Notes
- COVERAGE.md is updated: two gaps removed.
- Product tests create their own data. The cancel test uses the seeded order 1001, and only that test uses it.
```

Check that the description matches the changes in the pull request. The note about order 1001 lets the reviewer search for another test using the same record.

### A merge without conflicts can bring incompatible tests together

Ana's test cancels pending order 1001. Ben's test marks that same order as paid. Each test passes separately on a fresh seed.

Git combines the changes in different files without a conflict, but both tests modify the same order. If the cancel test runs first, the server rejects the change from cancelled to paid. If the paid test runs first, the cancel test's guard fails because it expects a pending order. The two tests cannot share order 1001.

- Before the merge, update your branch with the latest `main` and run the suite again.
- Write in the description which seeded data your test uses so reviewers can search for the same id.
- Better still, create the order your test needs. Then no test owns a shared record.

## 6. Answer the review

Read each comment fully before you answer.

- If you agree, change the code, commit and push. GitHub updates the same pull request with the branch's new commits.
- If you disagree, ask a question or explain your reason.
- Reply "Done" when you fix a comment.
- Consult the team's conventions in `e2e/README.md` to resolve style comments.

## The checklist

Before opening the pull request, apply the checklist from "Reviewing a spec" to your changes:

- Specs import `test` and `expect` from `lib/test`.
- Each interactive element is selected with `getByTestId`.
- No `page.waitForTimeout`. Waits are web-first assertions.
- Product tests create their own data. Order tests use their own seeded order. No test depends on the order of the files.
- No `test.only` left in the code.
- The test name says what the user sees.
- `COVERAGE.md` is updated.
- Typecheck and both suites pass.

> **Careful:** A forgotten `test.only` fails the CI build, because `forbidOnly` is on there. Search for `.only` before you push.

## Go deeper

### The commit range

`git log --oneline main..HEAD` shows the commits that `HEAD` can reach and `main` cannot. With `main` as the base, that is the list of commits in your pull request.

### Pull request size

A large pull request takes more work to review and makes bugs easier to miss. A separate pull request for every line also has a cost: running CI, waiting for review and switching tasks.

The three commits in this lesson belong together because they close coverage gaps. If they covered unrelated topics, separate pull requests would be a better choice.

## Practice

1. Create a branch named `tests/close-coverage-gaps`.
2. Commit the cancel-order test with `COVERAGE.md` in one commit.
3. Commit `product-edit.spec.ts` and its `COVERAGE.md` change in a second commit.
4. Commit the viewer spec and its `COVERAGE.md` change in a third commit.
5. Run the three checks. Push. Open the pull request with the template.
6. Ask a teammate or your mentor to review it.

## Challenge

Split two mixed changes into separate commits. Create the branch `tests/challenge-split-commits` from `main` and do not push it.

In `apps/practice-shop/e2e/COVERAGE.md`, make two nearby edits without committing between them: reword the sentence "These gaps are left on purpose." and delete one line from the gaps list.

Create `exercises/challenges/pr-description.md` with a description of these changes using the template. Include a risk a reviewer could ask about.

It is done when:

- `git log --oneline main..HEAD` shows exactly three commits, with messages that start with a verb and say what each commit changes.
- `git show --stat` for the first two commits lists only `COVERAGE.md`, and each changes one line only: the first commit holds the rewording, the second holds the deletion.
- The third commit adds only `exercises/challenges/pr-description.md`.
- `git status` shows a clean working tree, and the branch was never pushed.

Search for how to stage part of a file and split two nearby edits: `git add patch mode`, `git add -p split hunk` and `git show --stat`.

## Think it through

1. You are on `main` with 20 commits. You run `git switch -c tests/a`, make two commits, then run `git log --oneline main..HEAD`. How many lines does it print, and in which order?

<details><summary>Answer</summary>

It prints two lines, with the newest commit first. The 20 earlier commits are reachable from `main`, so they are outside the range `main..HEAD`.

</details>

2. A teammate writes a new spec `product-edit.spec.ts` and runs `git commit -am "Add edit spec"`. The tests pass on their computer. In the pull request, you see only a change to `COVERAGE.md`. Find the bug.

<details><summary>Answer</summary>

The `-a` flag stages changes only to files Git already tracks. The new spec was left out of the commit, although Playwright runs it locally because it exists on disk. Add the file with `git add` and review `git status` before committing.

</details>

3. Ana and Ben each add a new row at the same place at the end of the table in `COVERAGE.md`. Ana's pull request is merged first. What does Ben see, and what does he do?

<details><summary>Answer</summary>

Ben sees a conflict. Git cannot decide how to order two new lines added at the same place. The file gets markers (`<<<<<<<`, `=======`, `>>>>>>>`) around the two versions. Ben keeps both rows, removes the markers, runs the tests again, commits and pushes.

</details>

## Next step

In the next lesson you see what happens to your pull request in CI.
