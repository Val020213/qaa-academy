---
title: Your first project
summary: Download the course repository, run the course site, and learn what each folder and file is for.
duration: 30 min
---

## Goal

- Download the course project with Git.
- Install its libraries and run the course site.
- Know what each folder and project file is for.
- Run the project scripts and check that your setup works.

## Download the project

The course is a project in a Git repository. A **repository** is a folder that Git tracks. The person who gave you this course sent you its URL.

In the terminal, go to the folder where you keep projects. Then run `git clone` with the address of the course repository:

```bash
cd projects
git clone https://github.com/Val020213/qaa-academy.git qaa
cd qaa
code .
```

- `git clone` downloads a copy of the repository.
- `qaa` is the name of the new folder.
- `cd qaa` moves you into it.
- `code .` opens it in VS Code.

In the new VS Code window, open a terminal with Terminal > New Terminal. It starts inside the `qaa` folder.

## Install the libraries

A project uses code written by other people. These pieces are called **dependencies**. Download them with:

```bash
pnpm install
```

This can take a minute. It creates a folder called `node_modules`.

## Run the course site

```bash
pnpm dev
```

The terminal prints a message that the site is running. Open this address in your browser:

```text
http://localhost:5180
```

`localhost` means "this computer". The site runs only on your machine. You read the lessons there.

The terminal stays busy while the site runs. To stop it, click in the terminal and press **Ctrl+C**.

## The folders

| Folder | What it contains |
| --- | --- |
| `content/` | The lessons, as Markdown text files |
| `exercises/` | Practice files where you write your own code |
| `e2e/` | Playwright tests that check this course site |
| `src/` | The code of the course site itself |
| `apps/practice-shop/` | A second, bigger app to test in module 5. You can ignore it until then. |

You will work mostly in `exercises/`. You do not need to change `src/`.

## The project files

- `package.json` lists the project name, its dependencies, and its scripts.
- `node_modules/` holds the downloaded dependencies. Never edit it.
- `pnpm-lock.yaml` records the exact version of each dependency, so everyone gets the same ones.
- `tsconfig.json` has the settings for TypeScript.

## The scripts

A **script** is a named command stored in `package.json`. You run it with `pnpm <name>`.

| Command | What it does |
| --- | --- |
| `pnpm dev` | Starts the course site at http://localhost:5180 |
| `pnpm build` | Builds the final version of the site |
| `pnpm typecheck` | Checks the TypeScript code for mistakes |
| `pnpm e2e` | Runs the Playwright tests without a visible browser |
| `pnpm e2e:ui` | Runs the tests in a window where you can watch each step |
| `pnpm e2e:headed` | Runs the tests with a visible browser |

## Run the tests once

Playwright needs its own browser. Download it once with this command:

```bash
pnpm exec playwright install chromium
```

Then run the tests:

```bash
pnpm e2e
```

You do not need to start the site first. Playwright starts it by itself.

You do **not** need to understand these tests yet. This step only proves that your setup works. You will learn how they work in module 3.

If all tests pass, the output ends with a line like this:

```text
  7 passed (6.0s)
```

The number of tests and the time can be different.

> **Careful:** If `pnpm dev` is still running in another terminal, that is fine. Playwright can use it or start its own.

## Practice

1. Open a terminal and go to your projects folder.
2. Run `git clone https://github.com/Val020213/qaa-academy.git qaa`.
3. Run `cd qaa`, then `code .`.
4. In the VS Code terminal, run `pnpm install`.
5. Run `pnpm dev`. Open http://localhost:5180 and find this lesson.
6. Press Ctrl+C in the terminal to stop the site.
7. Run `pnpm exec playwright install chromium`.
8. Run `pnpm e2e` and check that the tests pass.
9. Open `package.json` in VS Code. Find the section called `scripts`.

## Check what you know

1. What does `git clone` do?

<details>
<summary>Answer</summary>

It downloads a copy of a repository to your computer.

</details>

2. What does `pnpm install` do?

<details>
<summary>Answer</summary>

It downloads the libraries that the project needs into `node_modules`.

</details>

3. How do you stop `pnpm dev`?

<details>
<summary>Answer</summary>

Press Ctrl+C in the terminal.

</details>

4. Which folder will you use most for practice?

<details>
<summary>Answer</summary>

The `exercises/` folder.

</details>

## Next step

Your setup is ready. Go to module 1 and write your first program.
