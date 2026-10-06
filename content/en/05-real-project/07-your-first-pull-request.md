---
title: Your first pull request
summary: Take your tests from your computer to the team: branch, small commits, checks, push, pull request, and review. Learn what a merge cannot check for you.
duration: 90 min
---

## Start with a puzzle

Two teammates work on the shop tests at the same time.

Ana's pull request adds a test that cancels the pending order 1001. Ben's pull request adds a test that marks the same order 1001 as paid. Each pull request passes the CI checks alone, with a green mark.

Ana's pull request is merged. Then Ben's is merged. Git does not show any conflict. A few minutes later, the CI run on `main` is red.

Nobody changed the same line of code. What failed, and why did nobody see it before the merge? What would you change in the way the team works?

Write down your guess before you read on.

## Goal

- Follow the full loop from a new branch to a merged pull request.
- Predict what a commit range contains and what a merge cannot check.
- Run every check before you push, and say which check CI does not run for you.
- Write a pull request description that a reviewer can use, and answer review comments.

## The loop

You know the Git basics. In a team, your test code reaches the main branch only through a **pull request**: a request to merge your branch, which others review first.

The steps are:

1. Create a branch.
2. Make small commits.
3. Run the checks.
4. Push the branch.
5. Open the pull request.
6. Answer the review.

Plan the work before you start, in plain words. A pull request is a small project. Ask: what is the one topic? What are the pieces? In which order will I commit them? This is **decomposition**. The plan for this lesson is the list in the Practice section.

## 1. Create a branch

Start from an up-to-date `main`. Give the branch a name that says what it does.

```bash
git switch main
git pull
git switch -c tests/close-coverage-gaps
```

Good names: `tests/cancel-pending-order`, `tests/edit-product`. One branch should hold one topic.

## 2. Small commits

Make one commit for each finished piece. A commit that does one thing is easy to review and to undo.

```bash
git add apps/practice-shop/e2e/orders/orders.spec.ts apps/practice-shop/e2e/COVERAGE.md
git commit -m "Test that an admin cancels a pending order"
```

Write the message in the present tense. Say what the commit adds. Add the files by name. Do not use `git add .` blindly, because it may add files you did not mean to.

Try a small experiment. Before you read on, guess what this command prints in your project:

```bash
git add --dry-run .
```

`--dry-run` shows what would be added, and adds nothing. Compare the list with your guess. Is there any file that you did not mean to share?

Run `git status` before each commit. You must never see `.auth/`, `playwright-report/` or `test-results/` in the list. They are ignored.

> **Careful:** `git commit -am "message"` stages only files that Git already knows. A new spec file is not known yet, so it is left out of the commit. Always add a new file by name with `git add`.

## 3. Run the checks

Run these three commands from the root of the repository. All must pass.

```bash
pnpm typecheck
pnpm --filter practice-shop typecheck
pnpm shop:e2e
```

- `pnpm typecheck` checks the course site, its tests and the exercises.
- `pnpm --filter practice-shop typecheck` checks the shop and its tests. A wrong type in a spec fails here.
- `pnpm shop:e2e` runs the shop suite. Run it at least twice if you changed data setup.

Look at the workflow file `.github/workflows/e2e.yml`. Which of these three commands does it run? It runs the first and the third. It does not run `pnpm --filter practice-shop typecheck`. So CI will not catch a wrong type in a shop spec. For that check, you are the only gate. Know which checks the machine does for you, and which ones are yours.

If you touched the course site, run `pnpm e2e` as well. The CI runs both suites, so you should too.

## 4. Push

The first time, set the upstream. This links your local branch to the remote one.

```bash
git push -u origin tests/close-coverage-gaps
```

Here `origin` is your fork on GitHub, the copy you made in module 0. The output prints a link to open a pull request. Open it in your browser.

> **Careful:** GitHub may offer to send the pull request to the original course repository. Change the **base repository** to your own fork, so the pull request stays in your copy. Then share its link with the person who reviews your work.

## 5. Write the description

A good description answers four questions. Use this template:

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

Keep it short. State facts. Do not write "please check", write what to check.

The last note, "Order 1001 is used only by the cancel test", is a promise. Anyone can break it later. That is the lesson of the puzzle.

You may ask an AI assistant to draft a description. But run every command it writes, and check every claim, such as the order id. Never paste a sentence that you cannot explain. You will be asked about it in the review, not the assistant.

### Back to the puzzle

Git merges text, not behaviour. Ana's test and Ben's test change different files, so there is no conflict. But both tests use order 1001, and an order changes in one direction only. If the cancel test runs first, the order is cancelled, and the paid test cannot mark it as paid: the server answers that a cancelled order cannot become paid. If the paid test runs first, the cancel test still fails, because its guard expects order 1001 to be pending, and it is already paid. (It would pass only if the cancel test accepted an already paid order.) So both orders fail. The two tests cannot share order 1001. Each fails for a different reason depending on the file order, which makes the error message confusing. Each test was green alone, because each ran on a fresh seed.

Three habits would have caught this:

- Before the merge, update your branch with the latest `main` and run the suite again. Many teams make this a rule.
- Write in the description which seeded data your test uses. Reviewers can then search for the same id.
- Better still, create the order your test needs. Then no test owns a shared record.

This is the **I** of **FIRST** (a list of good test traits: Fast, Independent, Repeatable, Self-checking, Timely): tests must be independent. A merge is the moment where two independent tests meet.

## 6. Answer the review

A reviewer reads your code and leaves **comments**. A comment is not an attack. It is a free second opinion.

- Read each comment fully before you answer.
- If you agree, change the code, commit, and push. The pull request updates by itself.
- If you do not agree, ask a question or explain your reason in one or two sentences.
- Reply "Done" when you fix a comment, so the reviewer can find it.
- Do not argue about style. The team's style is in `e2e/README.md`.

## The checklist

Before you open the pull request, check each item yourself. This is the checklist from module 4 (the lesson "Reviewing a spec"), in short form.

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

### Why small commits help: what a commit really is

A **commit** is a saved snapshot of your files, with a message and an id. Git keeps the whole history of snapshots. Because each commit is separate, Git can undo one without touching the others. With one big commit, you cannot undo only the bad part.

A **branch** is only a name that points to one commit. Making a branch is cheap. That is why the advice is to make a new branch for each topic.

When you write `git log --oneline main..HEAD`, the two dots mean: the commits that `HEAD` can reach, and `main` cannot. That is the list of commits in your pull request.

### A wrong idea: "git add . is faster, so it is fine"

It is faster, but it adds everything, including files you did not mean to share. Before each commit, look at what is staged:

```bash
git status
git diff --staged
```

`git diff --staged` shows the exact lines that go into the commit. If you see a file that does not belong, remove it from the stage:

```bash
git restore --staged path/to/file
```

This check takes ten seconds. Reviewers notice a clean diff, and they trust you more.

### How it shows up in real QA automation work

A pull request is also a **conversation about risk**. A reviewer asks: "Why did you choose order 1001?" or "What happens if this runs twice?" Your answers should already be in the description. The checklist at the end of this lesson is a way to remove repetition: the same review comments do not need to be written again on every pull request. This is the idea called **DRY**, applied to the work of a team instead of code. The `COVERAGE.md` file works the same way. What is covered is written once, in one file, not in many chat messages.

### The trade-off of size

A very big pull request is hard to review. People skim it and miss bugs. A very small one for each line creates too many pull requests, and each one has a cost: waiting, running CI, switching tasks. A good size is one topic that a person can read in 15 to 20 minutes. The three commits in this lesson are one pull request because they share one goal: close coverage gaps. If they were unrelated topics, three pull requests would be better.

## Practice

1. Create a branch named `tests/close-coverage-gaps`.
2. Commit the cancel-order test with `COVERAGE.md` in one commit.
3. Commit `product-edit.spec.ts` and its `COVERAGE.md` change in a second commit.
4. Commit the viewer spec and its `COVERAGE.md` change in a third commit.
5. Run the three checks. Push. Open the pull request with the template.
6. Ask a teammate or your mentor to review it.

## Challenge

Practise a skill that real pull requests need: **split a mixed change into clean commits**. Work on a scratch branch that you do not push. Create the branch `tests/challenge-split-commits` from `main`. In `apps/practice-shop/e2e/COVERAGE.md`, make two unrelated edits in one go, a few lines apart, without committing in between. Edit one: fix or reword the sentence "These gaps are left on purpose." in a way that you choose. Edit two: delete one line from the gaps list. Then create the file `exercises/challenges/pr-description.md` and write a description for these changes with the template from this lesson. Add one line that names a risk a reviewer could ask about.

It is done when:

- `git log --oneline main..HEAD` shows exactly three commits.
- `git show --stat` for the first two commits lists only `COVERAGE.md`, and each of them changes one line only: the first commit holds edit one, the second holds edit two.
- The third commit adds only `exercises/challenges/pr-description.md`.
- `git status` shows a clean working tree, and the branch was never pushed.
- Each commit message starts with a verb and says what the commit changes.

You will need something this lesson did not teach: how to stage only a part of a file, and what to do when Git shows two nearby edits as one piece. Search for `git add patch mode`, `git add -p split hunk` and `git show --stat`.

## Think it through

1. Predict the output. You are on `main` with 20 commits. You run `git switch -c tests/a`, make two commits, and then run `git log --oneline main..HEAD`. How many lines does it print, and in which order?

<details><summary>Answer</summary>

It prints two lines. The range `main..HEAD` means the commits that `HEAD` can reach and `main` cannot. The 20 old commits are reachable from `main`, so they are left out. The newest commit is printed first, because `git log` goes from new to old.

</details>

2. A teammate writes a new spec `product-edit.spec.ts`, then runs `git commit -am "Add edit spec"`. The tests pass on their computer. In the pull request, you see only a change to `COVERAGE.md`. Find the bug.

<details><summary>Answer</summary>

The `-a` flag stages only files that Git already tracks. The new spec is not tracked, so it was left out of the commit. The tests pass locally because the file exists on the disk. `COVERAGE.md` now says that editing is covered, but the pull request holds no test for it. Add the file by name with `git add`, and read `git status` before each commit.

</details>

3. Version one is one pull request with three related commits. Version two is three separate pull requests. Which is better for the work in this lesson, and what would make you choose the other?

<details><summary>Answer</summary>

One pull request is better here, because the three commits share one goal and a reviewer can read them in one sitting. Three pull requests would cost three CI runs and three rounds of waiting. If the commits were about unrelated topics, or if one of them is risky and must be reverted alone, three pull requests are better. The size of the diff and the independence of the topics decide.

</details>

4. What breaks if the line `.auth/` is missing from the ignore file, and a teammate commits `e2e/.auth/admin.json`?

<details><summary>Answer</summary>

The file holds a session cookie, and it changes on every run. Every pull request then contains a noisy change, and two people editing it will create conflicts. In the shop, sessions live in memory, so the cookie is dead after a restart. In a real project, a saved session can give access to a real account, and anyone with the repository can use it. Files that hold secrets must be ignored before the first commit.

</details>

5. Explain to a teammate, in three sentences and without the word "copy", what a branch is.

<details><summary>Answer</summary>

A good answer says that a branch is a name that points to one commit. When you make a new commit on the branch, the name moves forward to it. Creating a branch does not duplicate files, so it is fast and cheap. Any answer that shows "a pointer, not a folder of files" is correct.

</details>

6. Ana and Ben each add one new row to the same place at the end of the table in `COVERAGE.md`. Ana's pull request is merged first. What does Ben see, and what does he do?

<details><summary>Answer</summary>

Ben sees a conflict. Git cannot decide how to order two new lines that were added at the same place. The file gets markers (`<<<<<<<`, `=======`, `>>>>>>>`) around the two versions. Ben keeps both rows, removes the markers, runs the tests again, commits, and pushes. A conflict is a question from Git that only a person can answer.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **What is the difference between a Git commit and a Git branch?**
   - Search for: `git commit vs branch explained`
   - Try it: in a scratch folder outside the course, run `git init`, and make two commits. Run `git branch second`, then make a third commit on the first branch. Run `git log --oneline --graph --all --decorate` and write which names point to which commits.
   - A good answer explains: that a commit is a snapshot and a branch is a movable name that points to a commit

2. **How do you write a good Git commit message?**
   - Search for: `git commit message best practices`
   - Try it: in the same scratch folder, write a commit with a bad message such as "fix". Rewrite it with `git commit --amend`. Compare the two with `git log --oneline`. Say which one you would like to read in six months.
   - A good answer explains: the short summary line, the present tense, and why the message should say what and why

3. **What should a reviewer look for in a pull request that adds automated tests?**
   - Search for: `code review checklist test automation pull request`
   - Try it: act as the reviewer of `e2e/orders/orders.spec.ts`. Write three comments. At least one must be a question, and at least one must be about a risk, not about style.
   - A good answer explains: at least three things such as independent tests, clear names and stable selectors

## Next step

In the next lesson you see what happens to your pull request in CI.
