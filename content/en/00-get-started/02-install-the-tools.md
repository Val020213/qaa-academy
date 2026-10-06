---
title: Install the tools
summary: Install VS Code, Node.js, Git, and pnpm on Windows, check that each one works, and understand how the terminal finds programs.
duration: 75 min
---

## Start with a puzzle

Your kitchen has two jars. Both are labelled "salt". One holds old salt that is damp. The other holds fresh salt. You ask a friend: "Pass me the salt." She looks at the shelf from left to right and takes the first jar with that label.

Now think about your computer. Suppose it has two programs that are both called `node`. One is very old. One is new. You open a terminal and type `node --version`.

Which one runs? How could you find out, without guessing? And what would you change to make the other one run?

Write down your guess before you read on.

## Goal

- Install VS Code, Node.js 24 LTS, Git for Windows, and pnpm.
- Predict which program runs when two programs share the same name.
- Diagnose the error "is not recognized" and the error "running scripts is disabled on this system".
- Explain why a version number matters when two people run the same code.

## What each tool does

- **VS Code** (Visual Studio Code) is the editor where you write code.
- **Node.js** runs JavaScript and TypeScript programs on your computer. Playwright needs it.
- **Git** saves the history of your files and lets you share them.
- **pnpm** is a package manager. It downloads the code libraries that a project needs.

Think of a workshop. VS Code is the desk. Node.js is the machine that does the work. Git is the notebook that records every change. pnpm is the person who fetches parts from the store.

Install them in the order below.

> **Note:** For each installer, use the official installer and accept the default options. Click "Next" until the end. You do not need to change anything.

## How to check an install

After each install, do these steps:

1. Close the terminal if it is open.
2. Open a new terminal. In VS Code, use Terminal > New Terminal.
3. Run the `--version` command for that tool.

You must reopen the terminal because an old terminal does not see the new program. You will see the real reason soon.

A `--version` command prints the version number. If you see a number, the tool works. If you see "is not recognized", the install did not finish, or you did not reopen the terminal.

## 1. VS Code

Download the Windows installer from the official VS Code website. Run it and accept the default options.

Open VS Code. Then open the terminal with Terminal > New Terminal. The terminal appears at the bottom of the window.

Check it:

```bash
code --version
```

You see three lines: a version number, a code, and `x64`. For example:

```text
1.105.0
a1b2c3d4e5f6...
x64
```

Your numbers will be different. That is fine.

## 2. Node.js 24 LTS

Go to the Node.js website, nodejs.org. Download the Windows installer for **24 LTS**. LTS means long-term support. It is the stable version. Run it and accept the default options.

Close and reopen the terminal. Then run:

```bash
node --version
```

You should see a version that starts with 24:

```text
v24.0.0
```

The numbers after 24 can be different.

## 3. Git for Windows

Download Git for Windows from the official Git website. Run the installer and accept the default options.

Close and reopen the terminal. Then run:

```bash
git --version
```

Healthy output looks like this:

```text
git version 2.50.0.windows.1
```

## 4. pnpm

You install pnpm with npm. npm is a program that came with Node.js. Run:

```bash
npm install -g pnpm
```

The `-g` option means global. The program is available everywhere on your computer.

Close and reopen the terminal. Then run:

```bash
pnpm --version
```

You see a version number. The course project uses pnpm 10, so you should see a number that starts with 10:

```text
10.33.4
```

## Problem: "running scripts is disabled on this system"

When you run `npm` or `pnpm`, PowerShell can show an error like this:

```text
npm : File C:\Program Files\nodejs\npm.ps1 cannot be loaded because running scripts is disabled on this system.
```

Windows blocks scripts by default, for safety. The fix is to allow scripts that you wrote or that are signed. Run this command once:

```bash
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

This command changes a security rule for your user only. It allows local scripts to run. Downloaded scripts must be signed.

If PowerShell asks for confirmation, type `Y` and press Enter. Then try your command again.

## VS Code extensions

An extension adds a feature to VS Code. Open the Extensions panel with Ctrl+Shift+X. Search for each name and click Install.

| Extension | Why you want it |
| --- | --- |
| Playwright Test for VSCode | Runs and debugs Playwright tests from the editor |
| ESLint | Shows code problems while you type |
| Prettier | Formats your code in a clean, common style |
| Error Lens | Shows error messages on the same line as the code |

## How the terminal finds a program

When you type `node`, where does the terminal look? It does not search the whole disk. That would be too slow.

Windows gives each terminal a list of folders. This list is called **PATH**. The shell reads the list from first to last. In each folder, it looks for a program with the name you typed. It runs the first one it finds and stops.

That is the salt jar rule. The first jar with the label wins.

### Experiment: see the list

Run this in PowerShell:

```bash
$env:PATH -split ";"
```

You see one folder per line. Before you run it, guess: is the Node.js folder near the top or near the bottom of your list? Then check. Look for a line that ends with `nodejs`.

Next, ask the shell which `node` programs it can see:

```bash
Get-Command node -All
```

The `-All` option shows every match, not only the first. On most computers you see one line. If you see two, the top one is the one that runs.

### Experiment: break it on purpose

This experiment is safe. It changes only the terminal that you are in. First, save the real list in a variable. A **variable** is a named box that holds a value.

```bash
$old = $env:PATH
$env:PATH = ""
node --version
```

What do you expect? Think first. The shell now has no folders to search, so it cannot find `node`. You see an error that says the term `node` is not recognized.

Now put the list back:

```bash
$env:PATH = $old
node --version
```

Node works again. You changed the list only in this one terminal. Close the terminal and open a new one. The new terminal gets a fresh, correct list from Windows.

### Back to the puzzle

The shell takes the first match in PATH order. So the old `node` runs if its folder comes before the new one. To see which one runs, use `Get-Command node -All` and read the top line. To make the new one run, install it so that its folder comes first, or remove the old one.

This also explains "close and reopen". An installer adds its folder to the list that Windows keeps. But a terminal that was already open keeps its old copy. A new terminal copies the new list.

## Go deeper

### A common wrong idea: "Node.js is only for websites"

Beginners see the word "JavaScript" and think of web pages. JavaScript was made for browsers. But Node.js lets the same language run outside the browser, as a normal program on your computer.

Playwright is such a program. It runs in Node.js, and it controls the browser from outside. So your test code does not run inside the web page. It runs in Node.js and sends commands to the browser.

### Why a version number matters

The course asks for Node.js 24 and gives exact tool versions. A version has three numbers, such as `10.33.4`. Different versions can behave differently. A test that passes on your computer with one version can fail on a colleague's computer with another.

In real QA automation work, this is a common cause of "it works on my machine". Teams write the versions in `package.json` and a lock file, so every computer and the CI server use the same ones. CI is a server that runs your tests automatically after each code change. You will see this in lesson 4 of this module.

### Trade-off: global install

`npm install -g pnpm` puts pnpm on your whole computer. This is easy, but it means every project uses the same pnpm version. Newer setups let each project choose its own version. For now, the global install is simple and fine.

### Using an AI assistant for install problems

An assistant can help you read an error. But a command that changes your system, such as `Set-ExecutionPolicy`, needs care. Ask the assistant what the command does and what the safest option is. Run only what you can explain.

## Practice

1. Install VS Code. Open it.
2. Install Node.js 24 LTS. Reopen the terminal. Run `node --version`.
3. Install Git for Windows. Reopen the terminal. Run `git --version`.
4. Run `npm install -g pnpm`. Reopen the terminal. Run `pnpm --version`.
5. If you see the "scripts is disabled" error, run the `Set-ExecutionPolicy` command and repeat the step.
6. Install the four extensions.
7. Run `$env:PATH -split ";"` and find the Node.js folder. Run `Get-Command node -All` and write down the result.

## Challenge

Write a small PowerShell script that checks your own setup and tells you what is wrong. It must test four tools: `code`, `node`, `git`, and `pnpm`. A friend should be able to run it on a new computer and know in two seconds what is missing.

Create the file `exercises/challenges/check-tools.ps1`. If you have not downloaded the course project yet, create it in your `projects` folder.

It is done when:

- You run `.\exercises\challenges\check-tools.ps1` and it prints one line for each of the four tools, with the tool name and its version.
- When a tool is not installed, its line says `MISSING` and the script does not stop and shows no red error. Prove this by adding a fake tool name, such as `banana`, to your list.
- If the Node.js version does not start with `v24`, the line says `WRONG VERSION`.
- The list of tool names is written once, in one place, and the script has no copy of the same code for each tool.
- If PowerShell refuses to run the file, you can explain why, and you fixed it with the safest option.

You will need something this lesson did not teach: how to write a PowerShell script with a list, a loop, and a decision, and how to ask for a command without an error if it does not exist. Search for `powershell foreach loop array`, `powershell Get-Command ErrorAction SilentlyContinue`, and `powershell if else`.

## Think it through

1. Two programs named `node` are on a computer. The PATH list has `C:\old-node` first and `C:\Program Files\nodejs` second. `C:\old-node` has version 12, and the other has version 24. You type `node --version`. What do you see, and what is the quickest way to find the reason?

<details>
<summary>Answer</summary>

You see the version 12, because the shell takes the first match and stops. The quickest way is `Get-Command node -All`, which lists every match in the order of PATH. The first line is the program that runs. To fix it, remove the old folder from PATH, or put the new folder before it. This is why "I installed the new version but the old one still runs" is a very common problem.

</details>

2. A beginner sees "running scripts is disabled on this system". A website tells him to run `Set-ExecutionPolicy -Scope LocalMachine Unrestricted`. It fixes the error. Why is this a bad fix, even though it works?

<details>
<summary>Answer</summary>

The command solves the problem, but it changes more than needed. `LocalMachine` changes the rule for every user of the computer, and `Unrestricted` allows every script to run, including downloaded ones. The safer command, `-Scope CurrentUser RemoteSigned`, changes only your user and still blocks unsigned downloaded scripts. A fix that works is not always a good fix. Ask what else the fix changes.

</details>

3. You can install pnpm in two ways. Way A: `npm install -g pnpm`, one version for the whole computer. Way B: each project says in its `package.json` which pnpm version it wants. Which is better for you today, and what would make you choose the other?

<details>
<summary>Answer</summary>

Way A is simpler for a beginner, because you run one command and it works. Way B is better when you work on several projects that need different versions, or in a team that wants everyone to use the same one. If you start to see errors that say "this project needs another pnpm version", move to way B. The rule is to start simple and add control only when a real problem appears.

</details>

4. Explain PATH to a friend who has never used a terminal. Use three sentences. Do not use the word "folder".

<details>
<summary>Answer</summary>

A sample answer: "When you type the name of a program, your computer needs to find where it lives. PATH is a list of places to look, and the computer reads it from the first to the last. It runs the first match it finds, and if it finds none, it says the name is not recognized." A good answer includes the order and the failure case. If the answer misses the order, it cannot explain the two-node puzzle.

</details>

5. A new colleague installed VS Code, but `code --version` says "is not recognized" in every new terminal. Other tools work. What is the most likely cause, and what do you do?

<details>
<summary>Answer</summary>

VS Code is installed, but its folder is not in PATH. The VS Code installer has an option called "Add to PATH", and it is on by default. Your colleague probably turned it off. The fix is to run the installer again and tick that option, and then open a new terminal. This is a good case of a missing value: the tool exists, but the list does not name it.

</details>

6. You can install Node.js with the official installer, or with a tool that lets you switch between many versions. There is no single right answer. Say what your choice depends on.

<details>
<summary>Answer</summary>

The official installer is simple, and it is the right choice if you use one project and one version. A version switcher helps when you work on projects that need different Node.js versions, because you can change versions with one command. But it adds a new tool to learn, and a new thing that can break. The choice depends on how many projects you have, and how much help you can get. For this course, one version is enough.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **What is the PATH environment variable, and how does the shell use it to find a program?**
   - Search for: `PATH environment variable explained windows`
   - Try it: Run `$env:PATH -split ";"` and count the lines. Then run `Get-Command git` and check that the folder it shows is one of the lines in the list.
   - A good answer explains: what PATH holds, in which order the shell searches it, and what happens when a program is not in it.

2. **What does semantic versioning mean, and what do the three numbers in a version tell you?**
   - Search for: `semantic versioning major minor patch`
   - Try it: Run `npm view pnpm version` and compare the result with your own `pnpm --version`. Decide whether the difference is major, minor, or patch, and say whether you think the change could break your code.
   - A good answer explains: the meaning of major, minor, and patch, and which change can break your code.

3. **Why do test automation teams say "it works on my machine" is a problem, and how do they reduce it?**
   - Search for: `works on my machine problem consistent environments`
   - Try it: Write a short report of your setup: the versions of Node.js, Git, pnpm, and VS Code, and your Windows version. Imagine you must paste it in a bug report. Check that a stranger could create the same setup from it.
   - A good answer explains: why different computers give different results, and at least two ways to make environments the same, such as pinned versions or lock files.

## Next step

Go to the next lesson to learn the terminal, the place where you will run your code.
