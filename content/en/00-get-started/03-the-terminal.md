---
title: The terminal
summary: Learn what a terminal is and the few PowerShell commands you need every day.
duration: 40 min
---

## Goal

- Open PowerShell inside VS Code.
- Move between folders with a few simple commands.
- Understand what a path is.
- Stop a running command and reuse old commands.

## What is a terminal?

A **terminal** is a window where you type commands. The computer reads each command, runs it, and prints a result.

You use a terminal because many developer tools have no buttons. You run them with text commands.

The terminal runs a **shell**. A shell is the program that understands your commands. On Windows, the shell you use is **PowerShell**.

## Open the terminal in VS Code

1. Open VS Code.
2. Click Terminal > New Terminal in the top menu.
3. A panel opens at the bottom.

You see a line that ends with `>`. This is the **prompt**. It shows where you are, and it waits for your command.

```text
PS C:\Users\you>
```

`PS` means PowerShell. The rest is your current folder.

## What is a path?

A **path** is the address of a file or folder on your computer.

On Windows, a path starts with a drive letter and uses backslashes:

```text
C:\Users\you\projects
```

Read it from left to right. Drive `C:`, then folder `Users`, then folder `you`, then folder `projects`.

In commands, you can write the same path with forward slashes: `C:/Users/you/projects`. PowerShell and Node accept both. This course uses forward slashes in commands.

## Your first commands

**pwd** means "print working directory". It shows the folder you are in now.

```bash
pwd
```

```text
Path
----
C:\Users\you
```

**ls** lists the files and folders inside the current folder.

```bash
ls
```

The output is a table with names such as `Documents` and `Downloads`.

**mkdir** makes a new folder:

```bash
mkdir projects
```

PowerShell prints a small table that confirms the new folder.

**cd** means "change directory". It moves you into a folder:

```bash
cd projects
pwd
```

```text
Path
----
C:\Users\you\projects
```

**cd ..** moves you up one folder. The two dots mean "the parent folder".

```bash
cd ..
pwd
```

```text
Path
----
C:\Users\you
```

> **Note:** Capital letters do not matter in PowerShell paths. `Projects` and `projects` are the same folder.

## Read the output

When you run a command, always read what it prints. If a command works, it often prints nothing, or a short result. If it fails, it prints an error in red.

Here is an error for a folder that does not exist:

```bash
cd missing-folder
```

```text
cd : Cannot find path 'C:\Users\you\missing-folder' because it does not exist.
```

The message tells you the problem. You made a typo, or you are in the wrong folder. Run `pwd` and `ls` to check.

## Keys that save time

- **Tab** completes a name. Type `cd pro` and press Tab. PowerShell writes `projects`.
- **Up arrow** brings back your last command. Press it again to go further back.
- **Ctrl+C** stops a command that is still running. You will use it to stop the course site.

> **Tip:** Use Tab all the time. It saves typing and avoids typos.

## Open a folder in VS Code

The command `code .` opens the current folder in VS Code. The dot means "this folder".

```bash
cd projects
code .
```

VS Code opens a new window that shows the folder. This is the usual way to start work on a project.

## Go deeper

### Why the terminal exists: text is easy to repeat

A button needs a person to click it. A text command can be saved in a file, shared, and run again by a program. This is why test tools use commands: a computer can run `pnpm e2e` at night with nobody there.

This is the same reason you want automated tests. A step written as text can be repeated exactly.

### A common wrong idea: "The terminal is a different computer"

Beginners often think the commands change something far away. They do not. A terminal runs on your own computer, and every command works from one **current folder**. The prompt shows this folder.

This is why the same command can give different results in different places. Compare:

```bash
cd projects
ls
cd ..
ls
```

The two `ls` commands show different files, because you are in different folders. Many beginner errors, such as "cannot find path", come from running a command in the wrong folder. Before you debug, run `pwd`.

### How it shows up in real QA automation work

You will run test commands from the project folder, not from any folder. If you run `pnpm e2e` in your home folder, pnpm cannot find `package.json`, and it fails. The test was fine. The location was wrong.

A second example is CI, a server that runs your tests after each code change. CI has no mouse. It starts in a folder and runs the same text commands you type. If your tests work only with clicks in a window, they cannot run there.

### Why you can copy a command but must still understand it

A command can delete files. In PowerShell, `rm` removes a file and does not ask. There is no recycle bin for it. Read each command before you run it, especially one from the internet.

> **Careful:** Never run a command you do not understand, only because a web page says so.

## Practice

1. Open a terminal in VS Code. Run `pwd`.
2. Run `ls`. Read the names that appear.
3. Run `mkdir projects`.
4. Run `cd projects`, then `pwd`. Check that the path ends with `projects`.
5. Run `cd ..`, then `pwd`. Check that you went back up.
6. Type `cd pro`, press Tab, and watch the name complete. Press Enter.
7. Press the Up arrow two times. See your old commands.
8. Run `code .` inside `projects`. VS Code opens the folder.
9. Make an error on purpose: run `cd nothing-here`. Read the message.

## Check what you know

1. What does `pwd` show?

<details>
<summary>Answer</summary>

It shows the folder you are in now.

</details>

2. What does `cd ..` do?

<details>
<summary>Answer</summary>

It moves you to the parent folder, one level up.

</details>

3. What is a path?

<details>
<summary>Answer</summary>

It is the address of a file or folder, for example `C:\Users\you\projects`.

</details>

4. How do you stop a command that is still running?

<details>
<summary>Answer</summary>

Press Ctrl+C.

</details>

5. What does `code .` do?

<details>
<summary>Answer</summary>

It opens the current folder in VS Code.

</details>

6. You run `pnpm dev` in `C:\Users\you` and see an error that no `package.json` was found. You are sure the project exists. What is the most likely cause, and what do you run to check?

<details>
<summary>Answer</summary>

You are in the wrong folder. pnpm looks for `package.json` in the current folder, and your home folder does not have one. Run `pwd` to see where you are, then `cd` into the project folder and try again.

</details>

7. You run these commands in order, starting in `C:\Users\you`: `mkdir work`, `cd work`, `cd ..`, `cd work`. Which folder are you in at the end, and which two commands could be removed without changing it?

<details>
<summary>Answer</summary>

You are in `C:\Users\you\work`. The middle two commands, `cd ..` and the second `cd work`, cancel each other: one goes up, and the other goes back down. Removing both gives the same final folder.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **What is the difference between a terminal, a shell, and a console?**
   - Search for: `terminal vs shell vs console difference`
   - A good answer explains: what each word means, and why people often use them as if they were the same thing.

2. **What is the difference between an absolute path and a relative path?**
   - Search for: `absolute path vs relative path`
   - A good answer explains: how each one is written, and an example of when each one is the better choice.

3. **Why do CI servers run tests from a terminal, and what does "headless" mean for a test run?**
   - Search for: `CI continuous integration run tests headless`
   - A good answer explains: what CI does, why it has no screen, and how a headless browser runs a test without a window.

## Next step

In the next lesson, you will download the course project and run it on your computer.
