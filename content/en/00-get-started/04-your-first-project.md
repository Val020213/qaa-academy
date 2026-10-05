---
title: Your first project
summary: Download the course repository, run the course site, and learn what each folder and file is for.
duration: 45 min
---

## Goal

- Download the course project with Git.
- Install its libraries and run the course site.
- Know what each folder and project file is for.
- Run the project scripts and check that your setup works.

## Download the project

The course is a project in a Git repository. A **repository** is a folder that Git tracks. The course repository is public on GitHub, a website that stores repositories: https://github.com/Val020213/qaa-academy

You will not work in that repository. You will work in your own copy, called a **fork**. A fork is a copy of a repository in your own GitHub account. You can change it freely, and the original stays the same.

1. Create a free account on github.com if you do not have one.
2. Open the course repository in your browser.
3. Click **Fork**, at the top right. Then click **Create fork**.

Now you have your own copy at `https://github.com/<your-user>/qaa-academy`.

In the terminal, go to the folder where you keep projects. Then run `git clone` with the address of your fork. Replace `<your-user>` with your GitHub user name:

```bash
cd projects
git clone https://github.com/<your-user>/qaa-academy.git qaa
cd qaa
code .
```

- `git clone` downloads a copy of your fork to your computer.
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

## Go deeper

### Why the lock file exists

In `package.json`, a dependency version can have a range, such as `^5.3.0`. The `^` means "this version or a newer compatible one". Without more control, two people could install two different versions on two days.

The file `pnpm-lock.yaml` removes this risk. It saves the exact version of every dependency, and pnpm uses it when you run `pnpm install`. So you and a colleague get the same code. Playwright itself has no `^` here: the course writes `1.59.1`, an exact version.

### Why Playwright installs its own browser

You may ask: "I have Chrome. Why download another browser?" A test needs a browser that behaves the same each time. Your Chrome updates by itself, and each update can change small things. The browser that Playwright downloads matches the Playwright version you use, so tests stay stable.

### How it shows up in real QA automation work: scripts

The `scripts` section of `package.json` is a small menu of commands. This is the real section in this project:

```json
"scripts": {
  "dev": "vite",
  "e2e": "playwright test",
  "e2e:ui": "playwright test --ui"
}
```

When you run `pnpm e2e`, pnpm runs `playwright test`. You do not need to remember the long command. In a team, everyone runs the same short names, and CI runs them too. This is the first example of the DRY idea, "Don't Repeat Yourself": the long command is written once, in one place, and the name is used everywhere. You will study DRY at the end of module 1.

### A common wrong idea: "If tests pass, the setup is good"

The tests in this lesson check the course site. When they pass, they prove that Node, pnpm, and Playwright work together. They do not prove that you understand them. Also note the config file `playwright.config.ts`: it starts the site before the tests, so you do not run `pnpm dev` first. Read that file in module 3.

> **Tip:** When a command fails, do not delete `node_modules` first. Read the error. Most failures have a short, clear message.

## Practice

1. Open a terminal and go to your projects folder.
2. Fork the course repository on GitHub. Then run `git clone https://github.com/<your-user>/qaa-academy.git qaa` with your user name.
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

5. Another program on your computer already uses port 5180, and you run `pnpm e2e`. Why can this give wrong results, and what does the file `playwright.config.ts` offer for it?

<details>
<summary>Answer</summary>

Playwright can reuse a server that is already running on that port. If another app answers there, the tests would check the wrong app, or fail. The config reads the port from the `QAA_E2E_PORT` setting, so you can choose a free port and run again.

</details>

6. A colleague says: "I changed `package.json` by hand to a newer Playwright version, but I did not run `pnpm install`." What do you expect to happen when she runs the tests, and why?

<details>
<summary>Answer</summary>

The installed code in `node_modules` is still the old version, because only `pnpm install` downloads new code. The tests run with the old library, or fail with a version warning. The file and the installed code must agree, so run `pnpm install` after any change to dependencies.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **What is the difference between `dependencies` and `devDependencies` in package.json?**
   - Search for: `dependencies vs devDependencies package.json`
   - A good answer explains: what each list holds, and why a testing tool such as Playwright goes in the second list.

2. **What is a lock file, and why should you commit it to Git?**
   - Search for: `pnpm-lock.yaml lock file why commit`
   - A good answer explains: what the lock file stores, and what can go wrong in a team without it.

3. **What is a port, and what does localhost:5180 mean?**
   - Search for: `what is a port localhost explained`
   - A good answer explains: what a port number is, why two apps cannot use the same port, and how a test tool finds the app to test.

## Next step

Your setup is ready. Go to module 1 and write your first program.
