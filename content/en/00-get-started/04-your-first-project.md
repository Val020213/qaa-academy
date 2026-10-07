---
title: Your first project
duration: 30 min
---

## Goal

By the end you will have the course project on your computer, with the site running and the tests passing once.

- Download the project with Git and install its dependencies.
- Run the course site and stop it.
- Know what is in each folder and what each script does.

## Download the project

The course lives in this GitHub repository: https://github.com/Val020213/qaa-academy

You will not work in that repository but in your own copy, called a **fork**. It is a copy in your GitHub account: you change it freely and the original stays as it is.

1. Create a free account on github.com if you do not have one.
2. Open the course repository in your browser.
3. Click **Fork**, at the top right. Then click **Create fork**.

![The Fork button is at the top right of the repository page.](/images/github-fork.png)

![On the next page, Owner shows your user name. Leave everything as it is and click Create fork.](/images/github-create-fork.png)


Now you have your own copy at `https://github.com/<your-user>/qaa-academy`.

In the terminal, go to the folder where you keep projects. Then run `git clone` with the address of your fork. Replace `<your-user>` with your GitHub user name:

```bash
cd projects
git clone https://github.com/<your-user>/qaa-academy.git qaa
cd qaa
code .
```

`git clone` downloads your fork to the computer, and `qaa` is the name of the new folder.

In the new VS Code window, open a terminal with Terminal > New Terminal. It starts inside the `qaa` folder.

## Install the dependencies

A project uses code written by other people. Those pieces are called **dependencies**. Download them with:

```bash
pnpm install
```

It takes about a minute and creates a folder called `node_modules`. Three pieces work together:

- `package.json` lists the dependencies of the project.
- `pnpm-lock.yaml` records the exact version of each one, so everyone gets the same ones.
- `node_modules/` holds the downloaded copies. Never edit it, and it is never saved in Git.

If you delete `node_modules`, `pnpm install` creates it again from the other two files.

## Run the course site

```bash
pnpm dev
```

The terminal prints a message that the site is running:

![What pnpm dev prints when the site is ready.](/images/terminal-pnpm-dev.png)

Open this address in your browser:

```text
http://localhost:5180
```

`localhost` means "this computer": the site runs only on your machine, and you read the lessons there. This clip shows how the theme, the language and the completed mark change.

![Switch the site to dark, then to Spanish, then mark the lesson as completed.](/clips/theme-and-language.webm)

The terminal stays busy while the site runs. To stop it, click in the terminal and press **Ctrl+C**.

The site always uses port 5180. If `pnpm dev` fails because the port is already in use, the site is most likely already running in another terminal: stop that one with Ctrl+C or keep using the site that is already open.

## The folders

| Folder | What it contains |
| --- | --- |
| `content/` | The lessons, as Markdown text files |
| `exercises/` | Practice files where you write your own code |
| `e2e/` | Playwright tests that check this course site |
| `src/` | The code of the course site itself. It is a React app |
| `apps/practice-shop/` | A second, bigger app to test in module 5. You can ignore it until then. |

You will work mostly in `exercises/`. You do not need to change `src/`.

The root of the project has two more configuration files: `tsconfig.json` for TypeScript and `playwright.config.ts` for the Playwright tests.

## The scripts

A **script** is a named command stored in `package.json`. You run it with `pnpm <name>`.

| Command | What it does |
| --- | --- |
| `pnpm dev` | Starts the course site at http://localhost:5180 |
| `pnpm build` | Checks the types and builds the final version of the site |
| `pnpm typecheck` | Checks the TypeScript code for mistakes |
| `pnpm e2e` | Runs the Playwright tests without a visible browser |
| `pnpm e2e:ui` | Runs the tests in a window where you can watch each step |
| `pnpm e2e:headed` | Runs the tests with a visible browser |
| `pnpm shop:dev` | Starts the practice shop. You need it in module 5 |
| `pnpm shop:e2e` | Runs the Playwright tests of the practice shop |

## Run the tests once

Playwright needs its own browser. Download it once with this command:

```bash
pnpm exec playwright install chromium
```

Then run the tests:

```bash
pnpm e2e
```

You do not need to start the site first, because Playwright starts it by itself, and if `pnpm dev` is still running in another terminal that is fine. You also do not need to understand these tests yet: this step only proves that your setup works, and you will learn how they work in module 3.

If they all pass, the output ends with a line that has the number of tests and the word `passed`, then the time. The numbers can be different on your computer. The tests marked `skipped` are exercises you will complete in module 3.

![The end of a healthy pnpm e2e run.](/images/terminal-pnpm-e2e.png)

Playwright downloads a browser that matches its own version, so tests behave the same on every computer. Your own Chrome, in contrast, updates itself.

## Practice

Open `package.json` in VS Code and find the `scripts` section. Match each entry to the table in the previous section. Then find the file of this lesson inside `content/`.

## Think it through

1. You delete `node_modules` and run `pnpm dev`. What do you expect, and then what do you run to fix it? Where does pnpm find the list of what to download?

<details>
<summary>Answer</summary>

`pnpm dev` fails, because the program that starts the site, which lives in `node_modules`, is missing. You run `pnpm install`, which reads `package.json` to know which libraries to download and `pnpm-lock.yaml` for the exact versions.

</details>

## Next step

Your setup is ready. Go to module 1 and write your first program.
