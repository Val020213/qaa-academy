---
title: Your first pull request
summary: Take your tests from your computer to the team: branch, small commits, checks, push, pull request, and review.
duration: 35 min
---

## Goal

- Follow the full loop from a new branch to a merged pull request.
- Run every check before you push.
- Write a pull request description that a reviewer can use.
- Respond to review comments.

## The loop

You know the Git basics. In a team, your test code reaches the main branch only through a **pull request**: a request to merge your branch, which others review first.

The steps are:

1. Create a branch.
2. Make small commits.
3. Run the checks.
4. Push the branch.
5. Open the pull request.
6. Answer the review.

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

Run `git status` before each commit. You must never see `.auth/`, `playwright-report/` or `test-results/` in the list. They are ignored.

## 3. Run the checks

Run these three commands from the root of the repository. All must pass.

```bash
pnpm typecheck
pnpm --filter practice-shop typecheck
pnpm shop:e2e
```

- `pnpm typecheck` checks the course site code.
- `pnpm --filter practice-shop typecheck` checks the shop and its tests. A wrong type in a spec fails here.
- `pnpm shop:e2e` runs the shop suite. Run it at least twice if you changed data setup.

If you touched the course site, run `pnpm e2e` as well. The CI runs both suites, so you should too.

## 4. Push

The first time, set the upstream. This links your local branch to the remote one.

```bash
git push -u origin tests/close-coverage-gaps
```

The output prints a link to open a pull request. Open it in your browser.

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
- Each test creates its own data. Order 1001 is used only by the cancel test.
```

Keep it short. State facts. Do not write "please check", write what to check.

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
- Each test creates its own data and does not depend on the order.
- No `test.only` left in the code.
- The test name says what the user sees.
- `COVERAGE.md` is updated.
- Typecheck and both suites pass.

> **Careful:** A forgotten `test.only` fails the CI build, because `forbidOnly` is on there. Search for `.only` before you push.

## Practice

1. Create a branch named `tests/close-coverage-gaps`.
2. Commit the cancel-order test with `COVERAGE.md` in one commit.
3. Commit `product-edit.spec.ts` and its `COVERAGE.md` change in a second commit.
4. Commit the viewer spec and its `COVERAGE.md` change in a third commit.
5. Run the three checks. Push. Open the pull request with the template.
6. Ask a teammate or your mentor to review it.

## Check what you know

1. Why make small commits?

<details><summary>Answer</summary>

They are easy to review and easy to undo. Each one does one thing.

</details>

2. Which commands do you run before you push?

<details><summary>Answer</summary>

`pnpm typecheck`, `pnpm --filter practice-shop typecheck` and `pnpm shop:e2e`.

</details>

3. What must a pull request description say?

<details><summary>Answer</summary>

What is covered, how to run it, and that `COVERAGE.md` is updated.

</details>

4. A reviewer asks for a change you agree with. What do you do?

<details><summary>Answer</summary>

Change the code, commit, push to the same branch, and reply "Done".

</details>

## Next step

In the next lesson you see what happens to your pull request in CI.
