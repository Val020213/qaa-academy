---
title: The terminal
summary: Learn what a terminal is, how paths work, and the few PowerShell commands you need every day.
duration: 70 min
---

## Start with a puzzle

You open VS Code. You split the terminal into two panels, side by side. Both show the same prompt:

```text
PS C:\Users\you>
```

In the left panel, you run `mkdir zoo` and then `cd zoo`. Then you click the right panel and run `pwd`.

Which folder does the right panel show? Is it `C:\Users\you\zoo`, because the left panel just moved? Or is it `C:\Users\you`? And if the right panel is different, what does that tell you about what a terminal really is?

Write down your guess before you read on.

## Goal

- Predict in which folder you are after a series of `cd` commands.
- Explain what a path is and read one from left to right.
- Decide when a path should be absolute and when it should be relative.
- Read an error message and find the wrong folder or the typo.

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

### Back to the puzzle

Each terminal panel is its own shell, and each shell has its own current folder. Think of two people in a large building. Moving one person to room 12 does not move the other. The right panel still shows `C:\Users\you`. The `mkdir zoo` command did make the folder, so you would see `zoo` in `ls` in both panels. But only the left shell moved into it.

You can check this. Click the split button at the top right of the terminal panel. Run `cd` in one panel and `pwd` in the other.

## What is a path?

A **path** is the address of a file or folder on your computer.

Think of a postal address: country, city, street, house number. You read it from the biggest place to the smallest. A path works the same way. A library is another good picture: building, floor, shelf, book.

On Windows, a path starts with a drive letter and uses backslashes:

```text
C:\Users\you\projects
```

Read it from left to right. Drive `C:`, then folder `Users`, then folder `you`, then folder `projects`.

In commands, you can write the same path with forward slashes: `C:/Users/you/projects`. PowerShell and Node accept both. This course uses forward slashes in commands.

### Two ways to write an address

You can give a postal address in full: "Spain, Madrid, Calle Mayor 5". Or you can say "the house next to mine". The first way is the same from anywhere. The second way depends on where you stand.

Paths have the same two forms. An **absolute path** starts at the drive, such as `C:/Users/you/projects`. A **relative path** starts from the folder you are in now, such as `projects` or `../other`. A relative path gives different results in different places.

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

## Experiment: predict the folder

Here is a small zoo. Predict the result before you run it. Start in `projects`.

```bash
mkdir zoo
cd zoo
mkdir cat
cd cat
cd ../..
pwd
```

In which folder are you? Think. Each `cd` is one move. Write the path after each command on paper. The command `cd ../..` means "up one, then up one more". Then run it and compare.

Now a second experiment. Make a folder whose name has a space, and try to enter it:

```bash
mkdir "my pets"
cd my pets
```

What do you expect? The shell sees two words, `my` and `pets`, and the command takes only one. You get an error about an extra argument. Quote the name and it works:

```bash
cd "my pets"
```

A computer splits text at spaces. Quotes tell it "this is one piece".

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

Debug like a scientist. Make one guess ("I am in the wrong folder"). Do one small experiment (`pwd`). Then change one thing. Do not change three things at once, because then you do not know which one helped.

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

> **Careful:** Never run a command you do not understand, only because a web page says so. This is also the rule for an AI assistant: you may ask it for a command, but you must be able to explain it before you run it.

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

## Challenge

Build a small tree of folders using only commands, then show it with one command, then remove it with one command. Choose your own world: a pet shelter (cats, dogs, rooms), a music collection (artists, albums), a football league (teams, players), or a recipe book.

Build the tree inside `projects/challenge-terminal/world`. Next to it, create the file `projects/challenge-terminal/commands.txt` and write in it, in order, every command you used.

It is done when:

- The tree has at least 6 folders and at least 3 levels deep, and one folder name contains a space.
- You create at least one file inside the tree with a command, not with the mouse.
- One command, run from the top folder of the tree, lists every folder and file inside it, including the ones that are deep.
- You move between the deep folders using relative paths only, and `pwd` at the end shows the folder you planned.
- You remove the whole tree with one command, and `ls` shows that `world` is gone while `commands.txt` is still there.

You will need something this lesson did not teach: how to create an empty file, how to list folders inside folders, and how to delete a folder and everything in it. Search for `powershell New-Item ItemType File`, `powershell ls Recurse`, and `powershell Remove-Item Recurse`.

> **Careful:** Before you delete, run `pwd` and read the path. A delete command in the wrong folder cannot be undone.

## Think it through

1. You start in `C:\Users\you`. You run: `mkdir zoo`, `cd zoo`, `mkdir cat`, `cd cat`, `cd ../..`, `mkdir dog`, `cd dog`, `pwd`. What does the last command print, and where is the folder `cat`?

<details>
<summary>Answer</summary>

It prints `C:\Users\you\dog`. The command `cd ../..` goes up two levels, from `cat` to `zoo` and then to `you`. So `dog` is made next to `zoo`, not inside it. The folder `cat` is at `C:\Users\you\zoo\cat`. A common mistake is to think that you are still inside `zoo`. Writing the path after every command catches it.

</details>

2. A student runs `mkdir shop-tests`, then `code .`, and expects VS Code to open `shop-tests`. VS Code opens, with no error, but it shows the wrong files. What is the bug, and what is the fix?

<details>
<summary>Answer</summary>

The command `mkdir` makes a folder but does not move into it. The dot in `code .` means the current folder, so VS Code opens the folder where she stood. The fix is `cd shop-tests` before `code .`, or `code shop-tests`. The commands all worked. The assumption "mkdir takes me there" was wrong. When the result is odd and there is no error, check where you are with `pwd`.

</details>

3. Each morning you want to start work in your project. Way A: in VS Code, use File > Open Folder and click through. Way B: in a terminal, run `cd projects/qaa` and then `code .`. Which is better, and what would make you choose the other?

<details>
<summary>Answer</summary>

Way A needs no commands, so it is good while you are learning the terminal. Way B is faster, and you can write it down once and repeat it exactly. Choose B when you do the same steps every day, or when you must write steps for a teammate. Choose A when the mouse is faster for you, for example when the folder is far away and you do not remember its path. The best answer is the one you will really use every day.

</details>

4. A teammate says: "Our tests ask 'Are you sure? (Y/N)' before each step. It is only one key." What breaks if you put such a question in a command that CI runs?

<details>
<summary>Answer</summary>

CI has no person to press a key. The command waits for an answer for a long time, and then the whole run fails or hangs. A command that works in a terminal with a person can fail in CI for this reason. Automated commands must run from the start to the end without asking. This is the same reason test steps must be exact.

</details>

5. You are in `C:\` and you run `cd ..` five times. What do you expect, and why does this matter when you write a command that moves up a fixed number of levels?

<details>
<summary>Answer</summary>

You stay in `C:\`, because the drive root has no parent folder. PowerShell does not show an error here. This matters because a command such as `cd ../../..` is only correct from one starting place. From a different place, it ends in a different folder, or at the root without telling you. Relative paths depend on the start, so a script should first move to a known place.

</details>

6. A setup page says: "Run this one line to install everything", and the line downloads a script from the internet and runs it at once. Would you run it? There is no single right answer. Say what it depends on.

<details>
<summary>Answer</summary>

The line saves time, but you do not see what the script does before it runs. If the source is a well-known company, and you can read the script first, the risk is small. If the page is unknown, the risk is large, because a script can delete files or steal data. The decision depends on how much you trust the source, and on whether you can read the script before you run it. A safe habit is to download it, read it, and then run it.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **What is the difference between a terminal, a shell, and a console?**
   - Search for: `terminal vs shell vs console difference`
   - Try it: Open PowerShell, and also open Command Prompt (search "cmd" in the Start menu). Run `pwd` in both. Write down what each one does, and say which of the three words describes the window and which describes the program inside it.
   - A good answer explains: what each word means, and why people often use them as if they were the same thing.

2. **What is the difference between an absolute path and a relative path, and when does a relative path fail?**
   - Search for: `absolute path vs relative path`
   - Try it: Make a folder `a` with a folder `b` inside it. From `a`, enter `b` using a relative path, and then using the full path. Then go to your home folder and try the same relative path. Read the error.
   - A good answer explains: how each one is written, and an example of when each one is the better choice.

3. **How does a command tell its caller that it worked or failed, and why does CI need this?**
   - Search for: `exit code 0 success powershell LASTEXITCODE`
   - Try it: Run `node --version`, and then run `$LASTEXITCODE`. Then run `node does-not-exist.js` and run `$LASTEXITCODE` again. Compare the two numbers.
   - A good answer explains: what an exit code is, what the number 0 means, and how a CI server uses the number to mark a run as passed or failed.

## Next step

In the next lesson, you will download the course project and run it on your computer.
