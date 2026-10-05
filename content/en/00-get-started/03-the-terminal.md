---
title: The terminal
summary: Learn what a terminal is and the few PowerShell commands you need every day.
duration: 25 min
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

## Next step

In the next lesson, you will download the course project and run it on your computer.
