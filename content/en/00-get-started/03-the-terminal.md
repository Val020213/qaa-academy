---
title: The terminal
duration: 25 min
---

## Goal

The course runs almost everything from the terminal: installing the project, starting it and running the tests. This lesson gives you the few commands you need to move around there with confidence.

- Move between folders with `cd` and always know which one you are in.
- Write an absolute or a relative path.
- Read an error message and find the wrong folder or the typo.

## Open the terminal in VS Code

In VS Code, click Terminal > New Terminal and choose PowerShell from the terminal menu. A panel opens at the bottom with a line that ends in `>`. That line shows which folder you are in, and you type your command after it.

![The terminal opens at the bottom of VS Code. The screenshot is from VS Code in the browser: on Windows the path looks like C:\Users\you.](/images/vscode-terminal-panel.png)

```text
PS C:\Users\you>
```

`PS` means PowerShell. The rest is your current folder.

A terminal is a window where you type commands, and PowerShell is the program that runs them on Windows. Many developer tools have no buttons and are driven by text commands. A command can be saved in a file and repeated exactly, which is why test tools work this way.

## Paths

This absolute Windows path starts with a drive letter and uses backslashes:

```text
C:\Users\you\projects
```

In commands you can write the same path with forward slashes: `C:/Users/you/projects`. PowerShell and Node accept both, and this course uses forward slashes in commands.

An **absolute path** such as `C:/Users/you/projects` starts at the root of the drive and means the same from any folder. A **relative path** starts from the folder you are in, such as `projects` or `../other`, so it gives different results depending on where you are.

![An absolute path starts at the drive; a relative one starts at the folder you are in.](/images/folder-paths.en.svg)

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

> **Note:** In ordinary Windows folders, capital letters do not matter. `Projects` and `projects` are the same folder.

If a folder name has a space, put it in quotes. Without them, PowerShell reads two words:

```bash
mkdir "my pets"
cd my pets
```

The `cd` fails with an error about an extra argument, because it sees `my` and `pets` separately. With quotes it works:

```bash
cd "my pets"
```

> **Careful:** A command such as `rm` can delete files without asking and without going through the recycle bin. Read each command before you run it, especially one you copied from a web page or got from an AI assistant.

## Read the output

Always read what a command prints. If it works, it often prints nothing or a short result. If it fails, look for the error message.

From your user folder, this command fails if the folder does not exist:

```bash
cd missing-folder
```

```text
cd : Cannot find path 'C:\Users\you\missing-folder' because it does not exist.
```

The message names the path it could not find. Either you misspelled the name, or you are in a different folder than you thought. The same command gives different results in different folders, because a relative path starts from the current folder. When a result looks odd, run `pwd` and `ls` before you change anything.

## Keys that save time

- **Tab** completes a name. If `projects` is in the current folder, type `cd pro` and press Tab to complete the name. Use it all the time, because it saves typing and avoids typos.
- **Up arrow** brings back your last command. Press it again to go further back.
- **Ctrl+C** stops a command that is still running. You will use it to stop the course site.

## Open a folder in VS Code

The command `code .` opens the current folder in VS Code. The dot means "this folder". Run this example from your user folder:

```bash
cd projects
code .
```

VS Code shows the folder; it can use a new or an existing window. This is the usual way to start work on a project.

## Practice

From your user folder, create the folder `projects` if it does not exist yet, go into it, check with `pwd` that the path ends with `projects`, and open it with `code .`. The next lesson uses this folder.

## Think it through

1. You start in `C:\Users\you`. You run: `mkdir zoo`, `cd zoo`, `mkdir cat`, `cd cat`, `cd ../..`, `mkdir dog`, `cd dog`, `pwd`. What does the last command print, and where is the folder `cat`?

<details>
<summary>Answer</summary>

It prints `C:\Users\you\dog`. The command `cd ../..` goes up two levels, from `cat` to `zoo` and then to `you`. So `dog` is made next to `zoo`, not inside it. The folder `cat` is at `C:\Users\you\zoo\cat`. A common mistake is to think that you are still inside `zoo`. Writing the path after every command catches it.

</details>

2. A student runs `mkdir shop-tests`, then `code .`, and expects VS Code to open `shop-tests`. VS Code opens, with no error, but it shows the wrong files. What is the bug, and what is the fix?

<details>
<summary>Answer</summary>

The command `mkdir` makes a folder but does not move into it. The dot in `code .` means the current folder, so VS Code opens the folder where she stood. The fix is `cd shop-tests` before `code .`, or `code shop-tests`. All the commands worked: what failed was the assumption that `mkdir` takes you to the new folder.

</details>

## Next step

In the next lesson, you will download the course project and run it on your computer.
