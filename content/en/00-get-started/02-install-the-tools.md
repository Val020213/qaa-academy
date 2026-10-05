---
title: Install the tools
summary: Install VS Code, Node.js, Git, and pnpm on Windows, and check that each one works.
duration: 30 min
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

## Next step

Go to the next lesson to learn the terminal, the place where you will run your code.
