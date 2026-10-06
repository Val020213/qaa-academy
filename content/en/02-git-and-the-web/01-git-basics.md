---
title: Git basics
summary: Use Git to save snapshots of your work, try ideas on a branch, and share changes through a pull request.
duration: 75 min
---

## Start with a puzzle

You keep a cookbook in a folder. The file `soup.txt` says: "Add one spoon of salt."

You create a branch called `try-spicy`. On it, you change the file to "Add one spoon of chili." You commit. Then you switch back to the `main` branch. You do not edit anything.

You open `soup.txt` in VS Code. What does it say, "salt" or "chili"? Nobody touched the file after the switch.

Now think about a second question. If you delete `soup.txt` and commit, can a friend who copies your folder still read the old recipe?

Write down your guess before you read on.

## Goal

- Predict what a file contains after you switch branches.
- Decide when to stage one file and when to stage everything.
- Explain why a deleted secret is not gone from the history.
- Read a diff and write a commit message that tells one idea.

## What is version control?

Think about a game with save slots. Before a hard boss, you save. If you lose, you load the old slot. You never lose everything.

**Version control** is a save system for files. It records the history of a folder. You can see what changed, when, and why. You can go back to an older version.

Now think about a school essay. Without version control, you end with `essay-final.docx`, `essay-final2.docx` and `essay-final-REAL.docx`. Nobody knows which one is right. With version control, there is one file and a history of its changes.

**Git** is the version control tool that almost every team uses. It works for code, essays, recipes, and any text file.

## Four words to know

- A **repository** is a folder whose history Git records.
- A **commit** is one saved snapshot of your files, with a short message.
- A **branch** is a separate line of work. Your changes on it do not touch the main code.
- A **remote** is a copy of the repository on a server, such as GitHub. You share it with your team.

## First-time setup

Tell Git who you are. Do this once on your computer. Use your real name and email:

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

Git writes this information in each commit you make. Check the value:

```bash
git config --global user.name
```

```text
Your Name
```

## The daily loop

You repeat the same steps every day. The examples use the cookbook from the puzzle.

**1. Check the state.** `git status` shows which files you changed.

```bash
git status
```

```text
On branch main
nothing to commit, working tree clean
```

**2. Create a branch.** Do not work directly on `main`. `git switch -c` creates a new branch and moves you to it.

```bash
git switch -c try-spicy
```

```text
Switched to a new branch 'try-spicy'
```

**3. Make your changes.** Edit files in VS Code. Run `git status` again. It lists the changed files.

**4. Stage the changes.** `git add` chooses what goes into the next commit.

```bash
git add soup.txt
```

**5. Commit.** `git commit -m` saves the snapshot with a message.

```bash
git commit -m "Use chili instead of salt in the soup"
```

**6. Push.** `git push` sends your branch to the remote.

```bash
git push -u origin try-spicy
```

The `-u origin try-spicy` part is needed only the first time you push a new branch.

**7. Open a pull request.** A **pull request** (PR) is a request to add your branch to `main`. You create it on the website of the remote, for example GitHub. A teammate reads your changes and approves them. Then the branch is merged into `main`.

To get the latest changes from the team, run:

```bash
git pull
```

## The staging area: an experiment

Step 4 looks like a useless extra step. Why not save everything at once? Try to predict what happens here.

You have a clean cookbook. You do these things in this order:

1. Edit `soup.txt`: add the line "Add a little salt."
2. Run `git add soup.txt`.
3. Edit `soup.txt` again: add the line "Add black pepper."
4. Run `git commit -m "Add salt"`.

What does the commit contain: the salt line, the pepper line, or both? What does `git status` show after step 3?

Think first. Then read on.

The commit contains only the salt line. `git add` copies the file as it is at that moment into the **staging area**. This is a waiting room for the next commit. The pepper line came later, so it is not in the waiting room. `git status` after step 3 shows the same file twice:

```text
On branch main
Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
	modified:   soup.txt

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   soup.txt
```

The top part is the staged version. The bottom part is what changed after. The staging area lets you build a commit with care. You can finish two ideas in one afternoon and still save them as two commits.

> **Tip:** `git add .` stages every changed file in the current folder. It is fast. Run `git status` before it, so that you know what goes in.

## Branches change your files

Before the answer, one more look at the puzzle: Git does something to your folder that no normal program does.

### Back to the puzzle

When you switch to `main`, `soup.txt` says "salt". Git rewrites the files in your folder so that they match the snapshot of the branch you switched to. The chili version is safe in the `try-spicy` commit. If you switch back, "chili" returns.

This surprises most people. A folder looks like a fixed thing. With Git, the folder shows the branch you are on. This is why a branch costs almost nothing, and why you can try wild ideas on one.

The second question has a similar answer. A commit that deletes `soup.txt` adds a new snapshot without the file. The old snapshot still exists in the history. Your friend can go back to it and read the old recipe.

## Read a diff

A **diff** shows exactly what changed in a file. Run:

```bash
git diff
```

The output looks like this, without the header lines:

```text
-Add one spoon of salt.
+Add one spoon of chili.
```

A line that starts with `-` was removed. A line that starts with `+` was added. A changed line shows as one removal and one addition. Read the diff before every commit. It helps you find mistakes and files you did not mean to change.

## The .gitignore file

A file named `.gitignore` lists names that Git must ignore. Each line is one name:

```text
node_modules
test-results
.env
```

Git will not track these. Most projects already have a `.gitignore`. Do not delete it.

## What you must never commit

- **Passwords and secrets.** This includes API keys, tokens, and `.env` files. Anyone who can see the repository can see the history.
- **Folders you can rebuild.** `node_modules` is large and `pnpm install` recreates it.
- **Generated output.** Reports and screenshots made by a program are results, not source.

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
10. Run `git add exercises/notes.txt`. Change the line one more time. Run `git status` and find the file in both lists. Predict first.

## Challenge

Make a small private cookbook (or a pet-care diary, or a football log: choose your own world). You must also practise a mistake: you commit a private file by accident, and then you repair it.

Work in a new folder outside the course project, for example in your Documents folder. Run `git init` there. Make at least four commits on a branch that you created. One early commit must contain a file named `private-notes.txt` by mistake. Then repair the repository so that Git no longer tracks that file, while the file stays on your disk.

Create the file `exercises/challenges/git-basics.txt` in the course project. Paste into it the output of the commands below, and add one sentence about why the secret is still not safe.

It is done when:

- `git status` says "nothing to commit, working tree clean", and `private-notes.txt` is still in the folder.
- `git ls-files` does not list `private-notes.txt`.
- `git log --oneline` shows at least four commits, and each message tells one idea.
- `git log --oneline -- private-notes.txt` shows two commits: the one that added the file and the one that stopped tracking it.
- Your file `exercises/challenges/git-basics.txt` holds the output of the last two commands, and one sentence that explains why you must change any password that was inside.

You will need something this lesson did not teach: how to make Git stop tracking a file but keep it on disk. Search for: `git rm --cached keep file`, `git init new repository`.

## Think it through

1. You added `secrets.txt` to `.gitignore`, but you committed `secrets.txt` last week. You change the file and run `git status`. Does Git list the file as changed? Predict, then explain why.

<details>
<summary>Answer</summary>

Yes, Git lists it. `.gitignore` only works for files that Git does not track yet. This file is already part of the history, so Git still watches it. To stop tracking it, you must remove it from Git with `git rm --cached`. You must also change any password inside it, because the old commits still hold the old text.

</details>

2. A friend runs these steps. The last command prints "no changes added to commit". The code of the friend is fine and the file was saved. Find the mistake.

```bash
git switch -c fix-typo
# edit soup.txt and save
git commit -m "Fix typo in soup"
```

<details>
<summary>Answer</summary>

The friend forgot `git add`. A commit saves only what is in the staging area, and nothing was put there. The edit is still in the folder, not staged. The fix is `git add soup.txt` and then the same commit command. A habit that prevents this is to run `git status` before each commit.

</details>

3. Two ways to stage: `git add .` and `git add soup.txt`. Both work. Which is better when you finish a task, and what would make you choose the other?

<details>
<summary>Answer</summary>

Naming the file is safer. You choose exactly what goes in, so a `.env` file or a half-finished experiment cannot slip in. `git add .` is better when you have just read `git status` and every changed file belongs to this one idea. It is shorter, and you cannot forget a file. The choice depends on how many files changed and how sure you are about each one.

</details>

4. Your team grows from 3 to 20 people. They all push straight to `main`, with no branches and no pull requests. What breaks first, and why?

<details>
<summary>Answer</summary>

Mistakes reach everyone at once. One broken change in `main` stops all 20 people, and nobody read it before it arrived. Two people also change the same file at the same time more often, so they must repair clashes while they try to work. A branch plus a review gives a place to catch problems before they reach the shared code. With 3 people you may survive without it, but the cost of one mistake grows with the number of people.

</details>

5. Explain to a new teammate what a commit is. Use three sentences and do not use the word "snapshot".

<details>
<summary>Answer</summary>

A good answer could be: "A commit is a save point of your whole project, with a short note that says what you did. Git keeps every save point in order, so you can look at an old one or return to it. Each save point knows which one came before it." The reasoning is that the teammate needs the idea of a save point, a message, and a chain. If your answer says "a copy of changed lines", it is not exact, because a commit stores the state of the files, not a list of edits.

</details>

6. Two cooks work on two branches. One changes line 2 of `soup.txt`. The other changes line 9 of the same file. Both branches are merged into `main`. Is there a conflict?

<details>
<summary>Answer</summary>

No. Git compares the files line by line. The two changes are on different lines, so it can combine them without help. A conflict appears only when both branches change the same lines, or one changes a line that the other deletes. This is why small, focused commits and short-lived branches cause fewer conflicts.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **What is a merge conflict, and how do you solve one?**
   - Search for: `git merge conflict markers resolve`
   - Try it: in a practice repository, make two branches that change the same line of one file. Merge one into the other. Open the file, read the marker lines, fix the file, and finish the merge.
   - A good answer explains: what causes a conflict, what the marker lines in the file mean, and the steps to fix the file and finish.
2. **What can you write in a `.gitignore` file besides a plain name, such as `*` and `!`?**
   - Search for: `gitignore pattern format`
   - Try it: in a practice repository, create `a.log`, `b.log` and `keep.log`. Write `*.log` and `!keep.log` in `.gitignore`. Run `git status`, then `git check-ignore -v a.log`.
   - A good answer explains: how to ignore all files with one ending, how to ignore a folder, and how to make an exception.
3. **How do you undo a change that is not staged, a change that is staged, and a commit that you already made?**
   - Search for: `git undo restore reset revert difference`
   - Try it: in a practice repository, change a file and undo it with `git restore`. Then stage a change and unstage it. Then make a commit and undo it with `git revert`. Run `git log --oneline` after each step.
   - A good answer explains: which command fits each of the three situations, and why `git revert` is safer than `git reset` on work that you already shared.

## Next step

Next, you will learn how the web works, so that you know what your tests will control.
