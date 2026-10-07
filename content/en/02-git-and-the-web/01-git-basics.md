---
title: Git basics
duration: 60 min
---

## Goal

You will save changes with Git, check what goes into each commit, and share your work on a branch.

- Stage the files that belong to one task.
- Predict what a file contains after you switch branches.
- Read a diff and write a commit message that describes one idea.
- Recognize why deleting a secret does not remove it from history.

## Commits and branches

Git records versions of a repository's files so you can review changes and recover an earlier version. A **commit** saves the state of the files Git tracks, with a message describing the change.

Each commit has a long unique ID and stores the ID of the commit it starts from, its **parent**. The first commit of a repository has no parent, and a *merge* commit has two or more parents. The IDs are shortened in `git log --oneline`:

```text
a1b2c3d Add login test for valid user
9f8e7d6 Add exercises folder
```

Your IDs will be different. A **branch** is a reference that points to a commit. When you commit on that branch, Git moves the reference to the new commit. Creating a branch does not require copying all the files.

A **remote** is a name configured in Git for the address of another repository. For example, `origin` can point to the repository on GitHub where you share changes with your team.

## First-time setup

Configure your name and email once on your computer. Replace the example values with your own:

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

Git writes this information in each commit you make. Check the name:

```bash
git config --global user.name
```

```text
Your Name
```

## The daily loop

These examples change a recipe in `soup.txt`.

**1. Check the state.** `git status` shows the current branch and the files with changes.

```bash
git status
```

```text
On branch main
nothing to commit, working tree clean
```

**2. Create a branch.** Use a branch for the task. `git switch -c` creates a new one and moves you to it.

```bash
git switch -c try-spicy
```

```text
Switched to a new branch 'try-spicy'
```

**3. Make your changes.** Edit the files in VS Code and save them. Run `git status` to see which ones changed.

**4. Stage the changes.** `git add` saves the version of the file you want to include in the next commit.

```bash
git add soup.txt
```

**5. Commit.** `git commit -m` records the staged state with a message.

```bash
git commit -m "Use chili instead of salt in the soup"
```

**6. Push.** `git push` sends your branch's commits to the remote.

```bash
git push -u origin try-spicy
```

The `-u` option configures the remote branch your local branch tracks. With Git's usual configuration, later `git push` and `git pull` can use that tracking without arguments.

**7. Open a pull request.** A **pull request** (PR) asks to integrate your branch's changes into `main`. You create it on GitHub so a teammate can review the changes before merging them.

To get the latest changes from the team, run:

```bash
git pull
```

Git downloads changes from the remote and integrates them into your current branch. With no arguments, it uses the remote branch your branch is configured to track.

## The staging area

Git distinguishes between the files in your folder, the **staging area**, and the last commit. `git add` saves the file's contents as they are at that moment in the staging area. `git commit` records that state, even if you kept editing the file afterward.

For example, you start with no pending changes and follow these steps:

1. Edit `soup.txt`: add the line "Add a little salt."
2. Run `git add soup.txt`.
3. Edit `soup.txt` again: add the line "Add black pepper."
4. Run `git commit -m "Add salt"`.

The commit includes the salt line. The pepper line remains unstaged because you added it after `git add`. After step 3, `git status` shows the same file in two lists:

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

The first list shows staged changes relative to the last commit. The second shows changes in the folder relative to the staged version.

![The staging area keeps the salt; pepper stays only in the working folder and outside the commit.](/images/02-git-staging.en.svg)

`git add .` stages new files, modifications and deletions in the current folder and its subfolders. It excludes new files ignored by `.gitignore`, but still stages changes to files Git already tracks. Run `git status` before using it and check that all the files belong to the task. To include just one file, name it as in `git add soup.txt`.

## Branches change your files

Suppose that on `main`, `soup.txt` contains "Add one spoon of salt." You create `try-spicy`, change the line to "Add one spoon of chili.", and commit. Then you return to `main`, with no pending changes.

When you switch to `main`, `soup.txt` says "Add one spoon of salt." again. Git rewrites the files in your folder so that they match the commit that branch points to. Here every change is in a commit. Git preserves compatible local changes, but refuses to switch branches if that would overwrite uncommitted changes. Returning to `try-spicy` brings back the chili version.

## Read a diff

A **diff** shows exactly what changed in a file. Run this command before staging your changes:

```bash
git diff
```

`git diff` compares the files in your folder with the staging area. It shows changes you have not staged yet; changes already staged do not appear in this comparison.

The output looks like this, without the header lines:

```text
-Add one spoon of salt.
+Add one spoon of chili.
```

A line starting with `-` was removed and one starting with `+` was added. A changed line appears as one removal and one addition. Review the diff to find mistakes before staging the file.

## The .gitignore file

A file named `.gitignore` lists what Git must ignore. Each line is a pattern: a file name, a folder that ends in `/`, or a name with `*` as a wildcard. Lines that start with `#` are comments; blank lines are ignored.

```text
node_modules
test-results
.env
```

Git excludes these files from `git add` if it does not track them yet. If a file was committed before, adding its name to `.gitignore` does not stop Git from tracking it.

Keep these out of your commits:

- Passwords, API keys, tokens, and `.env` files.
- Folders you can rebuild, such as `node_modules`, which `pnpm install` recreates.
- Reports and screenshots generated when running tests.

## Go deeper

### Deleting a file does not delete its history

If you commit a password in `.env` and then delete the file in another commit, Git keeps the earlier version. This outline shows the two commits:

```text
commit 2: Remove .env file      (the file is gone here)
commit 1: Add login test        (the file, and the password, are still here)
```

Anyone with access to those commits can read the password. Tell your team immediately and change the password.

### One commit per idea

Commit when you finish an idea, with a message that says what changed. These messages do not tell you:

```text
Update tests
Fix stuff
```

These identify the change a teammate can review:

```text
Add a failing test for the wrong-password error
Use data-testid for the sign-in button
```

A commit for every line also makes review harder. Group changes from one task so the team can review or undo them together.

## Practice

1. Run `git config --global user.name "Your Name"` with your own name.
2. Run `git config --global user.email "you@example.com"` with your email.
3. In the course project, run `git status`. Read the output.
4. Run `git switch -c my-notes`.
5. Create a file `exercises/notes.txt` and write one line in it.
6. Run `git status`. Find your new file in the list.
7. Run `git add exercises/notes.txt`. Then run `git commit -m "Add my notes"`.
8. Run `git log --oneline`. Find your commit at the top.
9. Change the line in `notes.txt` and save it. Run `git diff` and find the `-` and `+` lines.
10. Run `git add exercises/notes.txt`. Change and save the line once more. Run `git status` and find the file in both lists.

## Challenge

In a new folder outside the course project, run `git init`. Create a branch and make at least four commits with testing notes. In an early commit, include `private-notes.txt` with an invented password. Then make Git stop tracking that file while keeping it on disk.

Create `exercises/challenges/git-basics.txt` in the course project to save the evidence.

It is done when:

- `git status` says "nothing to commit, working tree clean", `private-notes.txt` is still in the folder, and `git ls-files` does not list it.
- `git log --oneline` shows at least four commits, and each message describes one idea.
- `git log --oneline -- private-notes.txt` shows two commits: the one that added the file and the one that stopped tracking it.
- `exercises/challenges/git-basics.txt` holds the output of the last two commands and one sentence explaining why you must change any password that was inside.

Search for how to stop tracking a file without deleting it from disk and how to create the repository: `git rm --cached keep file`, `git init new repository`.

## Think it through

1. You added `secrets.txt` to `.gitignore`, but you committed `secrets.txt` last week. You change the file and run `git status`. Does Git list the file as changed?

<details>
<summary>Answer</summary>

Yes. Git already tracks that file, so `.gitignore` does not stop Git from detecting its changes. Remove it from tracking with `git rm --cached` to keep it on disk.

</details>

2. A teammate runs these steps. The last command prints "no changes added to commit". The file was saved. Find the mistake.

```bash
git switch -c fix-typo
# edit soup.txt and save
git commit -m "Fix typo in soup"
```

<details>
<summary>Answer</summary>

`git add` is missing. The edit is in the folder, but the staging area has no changes for the commit. Run `git add soup.txt`, then the same commit command.

</details>

3. Git already tracks `soup.txt` and `exercises/notes.txt`, and you changed both files. There are no staged changes and you are at the project root. Only the recipe belongs to the task. What would the next commit include if you run `git add .`? What if you run `git add soup.txt`?

<details>
<summary>Answer</summary>

`git add .` stages both files if you run it from the project root. `git add soup.txt` stages only the recipe, so the notes stay out of the next commit.

</details>

## Next step

Next, you will learn how the web works, so that you know what your tests will control.
