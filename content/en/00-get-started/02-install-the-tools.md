---
title: Install the tools
summary: Install VS Code, Node.js, Git, and pnpm on Windows, and check that each one works.
duration: 45 min
---

## Goal

- Install VS Code, Node.js 24 LTS, Git for Windows, and pnpm.
- Check each tool with a `--version` command.
- Fix the PowerShell error "running scripts is disabled on this system".

## What each tool does

- **VS Code** (Visual Studio Code) is the editor where you write code.
- **Node.js** runs JavaScript and TypeScript programs on your computer. Playwright needs it.
- **Git** saves the history of your files and lets you share them.
- **pnpm** is a package manager. It downloads the code libraries that a project needs.

Install them in the order below.

> **Note:** For each installer, use the official installer and accept the default options. Click "Next" until the end. You do not need to change anything.

## How to check an install

After each install, do these steps:

1. Close the terminal if it is open.
2. Open a new terminal. In VS Code, use Terminal > New Terminal.
3. Run the `--version` command for that tool.

You must reopen the terminal because an old terminal does not see the new program.

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

You see a version number:

```text
10.0.0
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

## Go deeper

### Why you must reopen the terminal

When Windows starts a terminal, it gives that terminal a list of folders. This list is called **PATH**. When you type `node`, the shell looks for a program called `node` in each folder of PATH, in order.

An installer adds its folder to PATH. But a terminal that was already open keeps its old copy of the list. A new terminal gets the new list. This is the real reason behind "close and reopen".

You can see the list in PowerShell:

```bash
$env:PATH -split ";"
```

You will see one folder on each line. Look for the Node.js folder after the install.

### A common wrong idea: "Node.js is only for websites"

Beginners see the word "JavaScript" and think of web pages. JavaScript was made for browsers. But Node.js lets the same language run outside the browser, as a normal program on your computer.

Playwright is such a program. It runs in Node.js, and it controls the browser from outside. So your test code does not run inside the web page. It runs in Node.js and sends commands to the browser.

### Why a version number matters

The course asks for Node.js 24 and gives exact tool versions. A version has three numbers, such as `10.33.4`. Different versions can behave differently. A test that passes on your computer with one version can fail on a colleague's computer with another.

In real QA automation work, this is a common cause of "it works on my machine". Teams write the versions in `package.json` and a lock file, so every computer and the CI server use the same ones. CI is a server that runs your tests automatically after each code change. You will see this in lesson 4 of this module.

### Trade-off: global install

`npm install -g pnpm` puts pnpm on your whole computer. This is easy, but it means every project uses the same pnpm version. Newer setups let each project choose its own version. For now, the global install is simple and fine.

## Practice

1. Install VS Code. Open it.
2. Install Node.js 24 LTS. Reopen the terminal. Run `node --version`.
3. Install Git for Windows. Reopen the terminal. Run `git --version`.
4. Run `npm install -g pnpm`. Reopen the terminal. Run `pnpm --version`.
5. If you see the "scripts is disabled" error, run the `Set-ExecutionPolicy` command and repeat the step.
6. Install the four extensions.

## Check what you know

1. Why do you reopen the terminal after an install?

<details>
<summary>Answer</summary>

An old terminal does not know about the new program. A new terminal does.

</details>

2. Which command shows the Node.js version?

<details>
<summary>Answer</summary>

`node --version`

</details>

3. What do you do when PowerShell says "running scripts is disabled on this system"?

<details>
<summary>Answer</summary>

Run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`, then run your command again.

</details>

4. What does pnpm do?

<details>
<summary>Answer</summary>

It downloads the code libraries that a project needs.

</details>

5. You install Git, then you run `git --version` in the terminal that was already open. You see "is not recognized". You close VS Code, open it again, and run the command again. It works. What happened, and why?

<details>
<summary>Answer</summary>

The old terminal had a copy of PATH from before the install, so it could not find Git. When you opened VS Code again, the new terminal received the new PATH, and the shell found Git. The install was fine from the start.

</details>

6. A colleague runs the same tests as you, with the same code. Your tests pass. Hers fail. Name two things about the tools you would compare first, and say why.

<details>
<summary>Answer</summary>

Compare the Node.js version and the versions of the project libraries, such as Playwright. Different versions can change how the same code behaves. Checking these first is cheap, and it removes a common cause before you look at the test itself.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **What is the PATH environment variable, and how does the shell use it to find a program?**
   - Search for: `PATH environment variable explained windows`
   - A good answer explains: what PATH holds, in which order the shell searches it, and what happens when a program is not in it.

2. **What does semantic versioning mean, and what do the three numbers in a version tell you?**
   - Search for: `semantic versioning major minor patch`
   - A good answer explains: the meaning of major, minor, and patch, and which change can break your code.

3. **Why do test automation teams say "it works on my machine" is a problem, and how do they reduce it?**
   - Search for: `works on my machine problem consistent environments`
   - A good answer explains: why different computers give different results, and at least two ways to make environments the same, such as pinned versions or lock files.

## Next step

Go to the next lesson to learn the terminal, the place where you will run your code.
