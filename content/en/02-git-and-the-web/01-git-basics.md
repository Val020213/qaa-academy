---
title: Git basics
summary: Use Git to save your work, work on a branch, and share changes through a pull request.
duration: 30 min
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

## Next step

Next, you will learn how the web works, so that you know what your tests will control.
