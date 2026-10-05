---
title: Git basics
summary: Use Git to save your work, work on a branch, and share changes through a pull request.
duration: 45 min
---

## Goal

- Explain what version control is and why QA Automation needs it.
- Set up Git on your computer.
- Use the daily Git loop.
- Know what you must never commit.

## What is version control?

**Version control** is a system that records the history of your files. You can see what changed, when, and why. You can go back to an older version.

QA Automation needs it for three reasons:

- Test code changes often, and you need to undo mistakes.
- Many people work on the same tests.
- Developers and testers review each other's changes before they are accepted.

**Git** is the version control tool that almost every team uses.

## Four words to know

- A **repository** is a folder whose history Git records.
- A **commit** is one saved snapshot of your changes, with a short message.
- A **branch** is a separate line of work, so your changes do not affect the main code.
- A **remote** is a copy of the repository on a server, such as GitHub, which you share with your team.

## First-time setup

Tell Git who you are. Do this once on your computer. Use your real name and work email:

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

Git writes this information in each commit you make. Check the values:

```bash
git config --global user.name
```

```text
Your Name
```

## The daily loop

You repeat the same steps every day.

**1. Check the state.** `git status` shows which files you changed.

```bash
git status
```

```text
On branch main
nothing to commit, working tree clean
```

**2. Create a branch.** Never work directly on `main`. `git switch -c` creates a new branch and moves you to it.

```bash
git switch -c add-login-test
```

```text
Switched to a new branch 'add-login-test'
```

**3. Make your changes.** Edit files in VS Code. Run `git status` again. It lists the changed files.

**4. Stage the changes.** `git add` chooses what goes into the next commit.

```bash
git add exercises/login-test.ts
```

You can use `git add .` to stage every changed file in the current folder.

**5. Commit.** `git commit -m` saves the snapshot with a message.

```bash
git commit -m "Add login test for valid user"
```

Write a short message that says what you did.

**6. Push.** `git push` sends your branch to the remote.

```bash
git push -u origin add-login-test
```

The `-u origin add-login-test` part is needed only the first time you push a new branch.

**7. Open a pull request.** A **pull request** (PR) is a request to add your branch to `main`. You create it on the website of the remote, for example GitHub. A teammate reads your changes and approves them. Then the branch is merged into `main`.

To get the latest changes from the team, run:

```bash
git pull
```

## Read a diff

A **diff** shows exactly what changed in a file. Run:

```bash
git diff
```

The output looks like this:

```text
-  const status = "failed";
+  const status = "passed";
```

A line that starts with `-` was removed. A line that starts with `+` was added. Read the diff before every commit. It helps you find mistakes and files you did not mean to change.

## The .gitignore file

A file named `.gitignore` lists files and folders that Git must ignore. Each line is one name:

```text
node_modules
test-results
.env
```

Git will not track these. Most projects already have a `.gitignore`. Do not delete it.

## What you must never commit

- **Passwords and secrets.** This includes API keys, tokens, and `.env` files. Anyone who can see the repository can see the history, even after you delete the file.
- **`node_modules`.** It is large and anyone can recreate it with `pnpm install`.
- **`test-results`.** It holds reports and screenshots made by test runs. They are output, not source code.

> **Careful:** If you commit a password by mistake, tell your team at once. The password must be changed.

## Go deeper

### Why it works this way: snapshots and labels

Git does not store a list of edits. A commit stores a snapshot of your files at one moment. Each commit has a long unique ID and points to the commit before it. The IDs are shortened in `git log --oneline`:

```text
a1b2c3d Add login test for valid user
9f8e7d6 Add exercises folder
```

Your IDs will be different. A **branch** is only a small label that points to one commit. When you commit, the label moves forward. Because a branch is just a label, making one is instant and costs almost nothing. That is why the team asks you to make a new branch for every task.

### A common wrong idea: "I deleted the file, so the secret is gone"

A beginner commits a file `.env` with a password. They see the mistake, delete the file, and commit again. Now the file is gone from the folder. It is not gone from the history.

```text
commit 2: Remove .env file      (the file is gone here)
commit 1: Add login test        (the file, and the password, are still here)
```

Anyone can go back to commit 1 and read the password. This is why the lesson says the password must be changed. Deleting a file does not delete history.

A second wrong idea is about `.gitignore`. It only affects files that Git does not track yet. If a file was committed before, adding its name to `.gitignore` does not stop Git from tracking it.

### How it shows up in real QA work: small commits

A pull request is read by a person who has little time. Compare two histories:

```text
Update tests
Fix stuff
```

```text
Add a failing test for the wrong-password error
Use data-testid for the sign-in button
```

The second history tells a story. A reviewer can read one commit at a time. If one commit causes a problem, the team can undo only that commit. A good rule: one commit, one idea.

### A trade-off: many commits or few

Very small commits, such as one for each line, are also hard to read. Commit when one idea is finished and the tests still run.

## Practice

1. Run `git config --global user.name "Your Name"` with your own name.
2. Run `git config --global user.email "you@example.com"` with your email.
3. In the course project, run `git status`. Read the output.
4. Run `git switch -c my-notes`.
5. Create a file `exercises/notes.txt` and write one line in it.
6. Run `git status`. Find your new file in the list.
7. Run `git add exercises/notes.txt`, then `git commit -m "Add my notes"`.
8. Run `git log --oneline`. Find your commit at the top.
9. Change the line in `notes.txt`, then run `git diff`. Find the `-` and `+` lines.

## Check what you know

1. What is a commit?

<details>
<summary>Answer</summary>

It is a saved snapshot of your changes, with a short message.

</details>

2. Why do you work on a branch and not on `main`?

<details>
<summary>Answer</summary>

A branch keeps your work separate, so you do not break the main code before a teammate reviews it.

</details>

3. What does a line that starts with `+` mean in a diff?

<details>
<summary>Answer</summary>

It means the line was added.

</details>

4. Name two things you must never commit.

<details>
<summary>Answer</summary>

Passwords or secrets, `node_modules`, or `test-results`. Any two are correct.

</details>

5. You add `secrets.txt` to `.gitignore`, but you committed `secrets.txt` last week. You change the file and run `git status`. Does Git show the file as changed? Why?

<details>
<summary>Answer</summary>

Yes. `.gitignore` only works for files that Git does not track yet. This file is already tracked, so Git still watches it. To stop tracking it, you must remove it from Git, and you must change any password inside it, because the old commits still hold it.

</details>

6. Which way is better? A) One commit with a new login test, a renamed folder and a changed config. B) Three commits, one for each of these. Why?

<details>
<summary>Answer</summary>

B is better. A reviewer can read each commit alone and understand it. If the config change causes a problem, the team can undo that one commit and keep the test. In A, everything is mixed, so the reviewer must check all of it at once, and the team cannot undo one part.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **What is a merge conflict, and how do you solve one?**
   - Search for: `git merge conflict markers resolve`
   - A good answer explains: what causes a conflict, what the marker lines in the file mean, and the steps to fix the file and finish.
2. **What can you write in a `.gitignore` file besides a plain name, such as `*` and `!`?**
   - Search for: `gitignore pattern format`
   - A good answer explains: how to ignore all files with one ending, how to ignore a folder, and how to make an exception.
3. **Why do teams review test code in pull requests, and what should a reviewer look for in a test?**
   - Search for: `code review checklist test automation`
   - A good answer explains: at least three things a reviewer checks in a test change, such as clear names, stable selectors and independent data.

## Next step

Next, you will learn how the web works, so that you know what your tests will control.
