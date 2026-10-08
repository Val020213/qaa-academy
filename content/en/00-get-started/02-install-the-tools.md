---
title: Install the tools
duration: 25 min
---

## Goal

By the end of this lesson your Windows computer will have the editor, the runtime and the tools that the rest of the course uses. You will also know what to do when the terminal cannot find a program.

- Install VS Code, Node.js 24 LTS, Git for Windows, and pnpm.
- Diagnose the error "is not recognized" and the error "running scripts is disabled on this system".
- Explain why a version number matters when two people run the same code.

## What each tool does

- **VS Code** (Visual Studio Code) is the editor where you write code.
- **Node.js** runs JavaScript and TypeScript programs on your computer. Playwright needs it.
- **Git** saves the history of your files and lets you share them.
- **pnpm** is a package manager. It downloads the code libraries that a project needs.

Install them in the order below. For each one, use the official installer and accept the default options: click "Next" until the end.

## How to check an install

After you install each tool, close the terminals and all VS Code windows. Open VS Code again and use Terminal > New Terminal. Then run the `--version` command for that tool.

The terminal inherits VS Code’s settings for finding programs; restarting both updates them. The `--version` command prints the version number. If you see a number, the command is available. If you see "is not recognized", check the name, the install and the restart.

## 1. VS Code

Download the Windows installer from the [official VS Code website](https://code.visualstudio.com). Run it and accept the default options.

Open VS Code, then open the terminal with Terminal > New Terminal. It appears at the bottom of the window. Run:

```bash
code --version
```

You see three lines: the version, the revision identifier and the architecture, such as `x64`. For example:

```text
1.140.0
07f806f999227108933c2e30515b26eecc1fda74
x64
```

Your numbers will be different, and that is fine.

## 2. Node.js 24 LTS

Go to the Node.js website, [nodejs.org](https://nodejs.org), and download the Windows installer for **24 LTS**. LTS means long-term support: it receives fixes for longer. Run it and accept the default options.

In a new terminal, run:

```bash
node --version
```

You should see a version that starts with 24:

```text
v24.0.0
```

The numbers after 24 can be different.

## 3. Git for Windows

Download Git for Windows from the [official Git website](https://git-scm.com). Run the installer and accept the default options.

In a new terminal, run:

```bash
git --version
```

Healthy output looks like this:

```text
git version 2.50.0.windows.1
```

## 4. pnpm

You install pnpm with npm, a program that came with Node.js. Run:

```bash
npm install -g pnpm@10.33.4
```

The `-g` option means global: pnpm is installed outside the project for use from different folders.

In a new terminal, run:

```bash
pnpm --version
```

The course project uses pnpm 10, so the number should start with 10:

```text
10.33.4
```

## Problem: "running scripts is disabled on this system"

When you run `npm` or `pnpm`, PowerShell can show an error like this:

```text
npm : File C:\Program Files\nodejs\npm.ps1 cannot be loaded because running scripts is disabled on this system.
```

PowerShell’s execution policy blocks npm’s or pnpm’s script. Run this command to allow local scripts and require signatures for those marked as downloaded from the internet:

```bash
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

The command changes a security rule for your user only. Local scripts can run; those marked as downloaded from the internet need a trusted signature. A company policy can keep the script blocked.

If PowerShell asks for confirmation, type `Y` and press Enter. Then try your command again.

## VS Code extensions

Open the Extensions panel with Ctrl+Shift+X. Search for each name and click Install.

| Extension | Why you want it |
| --- | --- |
| Playwright Test for VSCode | Runs and debugs Playwright tests from the editor |
| ESLint | Shows code problems if the project configures ESLint |
| Prettier | Formats your code in a clean, common style |
| Error Lens | Shows error messages on the same line as the code |

## Go deeper

### Node.js is not only for websites

JavaScript was made for browsers, so many people link it with web pages. Node.js lets the same language run outside the browser, as a normal program on your computer.

Playwright is one of those programs. It runs in Node.js and controls the browser from outside, so your test code does not run inside the page: it runs in Node.js and sends commands to the browser.

### Why a version number matters

The course asks for Node.js 24 and pins some versions. A version such as `10.33.4` has three numbers, and different versions can behave differently. A test that passes on your computer can fail on a colleague's computer that has another version.

The project records versions in `package.json` and a lock file. pnpm uses that file to install the same dependency versions. Node.js is installed separately: use version 24 as the course asks.

### The pnpm version of each project

`npm install -g pnpm@10.33.4` installs pnpm outside projects. A project can ask for another exact version in the `packageManager` field of its `package.json`, and pnpm 10 downloads and uses it by default when you work inside that project. The course project does this, so the version you installed here does not have to match its version.

## Practice

Open a new terminal and run the four commands:

```bash
code --version
node --version
git --version
pnpm --version
```

You must see four version numbers, and the Node.js one must start with 24. If any of them says "is not recognized", check that install. If `npm` or `pnpm` shows the scripts error, run the `Set-ExecutionPolicy` command and repeat.

![Node.js, Git and pnpm answer with their versions; check VS Code with the command above.](/images/terminal-versions.png)

## Think it through

1. A beginner sees "running scripts is disabled on this system". A website tells him to run `Set-ExecutionPolicy -Scope LocalMachine Unrestricted`. It fixes the error. Why is this a bad fix, even though it works?

<details>
<summary>Answer</summary>

The command changes more than needed. `LocalMachine` changes the rule for every user of the computer, and `Unrestricted` allows unsigned scripts, including downloaded ones. The safer command, `-Scope CurrentUser RemoteSigned`, changes only your user and blocks unsigned scripts marked as downloaded from the internet. Before you run a fix you found on the internet, ask what else it changes.

</details>

## Next step

Go to the next lesson to learn the terminal, the place where you will run your code.
