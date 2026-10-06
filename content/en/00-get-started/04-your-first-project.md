---
title: Your first project
summary: Download the course repository, run the course site, and understand what each folder, file, and script is for.
duration: 80 min
---

## Start with a puzzle

After `pnpm install`, your project has a folder called `node_modules`. It holds tens of thousands of files, and it takes up hundreds of megabytes. You never wrote any of them.

One afternoon your disk is full. You delete the whole `node_modules` folder. You did not touch any file that you wrote.

Is the project broken now? Did you lose some of your work? If you can fix it, which single command brings everything back, and why does that command know what to bring?

Write down your guess before you read on.

## Goal

- Download the course project with Git and run the course site.
- Predict what happens when you delete or change the files that pnpm manages.
- Explain what each folder and project file is for, and which ones you may edit.
- Decide how to react when a port is already in use.

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

### A pantry and a shopping list

Think of cooking. A recipe card says "flour, eggs, milk". It is short, and you can share it. The pantry holds the real bags and boxes. It is big, and you can fill it again from the list.

In a project, `package.json` is the shopping list. `node_modules` is the pantry. A third file, `pnpm-lock.yaml`, is the receipt. It says the exact brand and size of each item. Think of a music playlist too. The playlist file is small, and the song files are big. You can download the songs again from the playlist.

### Back to the puzzle

The project is not broken, and you lost none of your work. `node_modules` is only a copy of code that other people wrote. The command `pnpm install` reads `package.json` and `pnpm-lock.yaml`, and it fills the folder again with the same versions.

You can prove it. Stop any running site. Delete `node_modules`, then run `pnpm dev`. What do you expect? It fails, because the tool that starts the site is missing. Then run `pnpm install` and `pnpm dev` again. It works. This is why `node_modules` is never saved in Git.

## Run the course site

```bash
pnpm dev
```

The terminal prints a message that the site is running. Open this address in your browser:

```text
http://localhost:5180
```

`localhost` means "this computer". The site runs only on your machine. You read the lessons there.

Watch how the theme, the language and the completed mark change on the site.

![Switch the site to dark, then to Spanish, then mark the lesson as completed.](/clips/theme-and-language.webm)

The terminal stays busy while the site runs. To stop it, click in the terminal and press **Ctrl+C**.

### Experiment: two copies at once

Open a second terminal panel in VS Code. Run `pnpm dev` there too, while the first one still runs. What do you expect?

Two programs cannot listen on the same port at the same time. A **port** is a numbered door on your computer. Each program that waits for visitors uses one door. The course site is set to use door 5180 only. So the second command fails with an error that says the port is already in use. It does not move quietly to another port. This is on purpose, so a test never checks the wrong app.

Press Ctrl+C in the first terminal. Run the command in the second terminal again. Now it works.

## The folders

| Folder | What it contains |
| --- | --- |
| `content/` | The lessons, as Markdown text files |
| `exercises/` | Practice files where you write your own code |
| `e2e/` | Playwright tests that check this course site |
| `src/` | The code of the course site itself. It is a React app |
| `apps/practice-shop/` | A second, bigger app to test in module 5. You can ignore it until then. |

You will work mostly in `exercises/`. You do not need to change `src/`.

## The project files

- `package.json` lists the project name, its dependencies, and its scripts.
- `node_modules/` holds the downloaded dependencies. Never edit it.
- `pnpm-lock.yaml` records the exact version of each dependency, so everyone gets the same ones.
- `tsconfig.json` has the settings for TypeScript.
- `playwright.config.ts` has the settings for the Playwright tests.

## The scripts

A **script** is a named command stored in `package.json`. You run it with `pnpm <name>`. Think of the buttons on a microwave: "popcorn" is a name that stands for a long setting.

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

You do not need to start the site first. Playwright starts it by itself.

You do **not** need to understand these tests yet. This step only proves that your setup works. You will learn how they work in module 3.

If all tests pass, the output ends with a line that has the number of tests and the word `passed`, then the time. The numbers can be different on your computer.

> **Careful:** If `pnpm dev` is still running in another terminal, that is fine. Playwright can use it or start its own.

## Go deeper

### Why the lock file exists

In `package.json`, a dependency version can have a range, such as `^5.3.0`. The `^` means "this version or a newer compatible one". Without more control, two people could install two different versions on two days.

The file `pnpm-lock.yaml` removes this risk. It saves the exact version of every dependency, and pnpm uses it when you run `pnpm install`. So you and a colleague get the same code. Playwright itself has no `^` here: the course writes `1.59.1`, an exact version.

### Why Playwright installs its own browser

You may ask: "I have Chrome. Why download another browser?" A test needs a browser that behaves the same each time. Your Chrome updates by itself, and each update can change small things. The browser that Playwright downloads matches the Playwright version you use, so tests stay stable.

### How it shows up in real QA automation work: scripts

The `scripts` section of `package.json` is a small menu of commands. This is a part of the real section in this project:

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

### Using an AI assistant with a project

An assistant can explain a config file or an error. But it often does not know your versions. If it tells you to change `package.json`, ask why, run `pnpm install`, and check that the project still works. Never paste a block that you cannot explain.

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

## Challenge

Make a tiny project of your own from nothing, the way a developer starts a new one. Choose your own world: a pet shelter, a recipe, a football table, a playlist. The project must print one sentence about your world, and it must be repeatable on another computer from the files alone.

Create a new folder `projects/my-first-project`, outside the course repository. Inside it, you will have the files `package.json` and `hello.ts`, and your own version of the program.

It is done when:

- You run `pnpm start` in that folder and it prints one sentence about your world, such as the name and age of a dog.
- `package.json` has a script called `start`, and you wrote it, not a tool.
- You added the `typescript` package as a development dependency, and `pnpm exec tsc --version` prints a version.
- A lock file exists. You deleted `node_modules` and ran one command to bring it back, and `pnpm start` still works.
- You can explain, in one sentence for each, why `node_modules` is not saved in Git and the lock file is.

You will need something this lesson did not teach: how to create a new project file with pnpm, how to write a script, and how to run a TypeScript file with Node.js. Search for `pnpm init`, `package.json scripts start`, and `node run typescript file directly`.

## Think it through

1. You delete `node_modules` and run `pnpm dev`. What do you expect, and then what do you run to fix it? Where does pnpm find the list of what to download?

<details>
<summary>Answer</summary>

`pnpm dev` fails, because the program that starts the site, which lives in `node_modules`, is missing. You run `pnpm install`. The command reads `package.json` for the names of the libraries and `pnpm-lock.yaml` for the exact versions, and it downloads them again. So the two small files hold all the knowledge. The big folder is a copy that can be made again, which is why it is never saved in Git.

</details>

2. A colleague changes the script to `"e2e": "playwright test --ui"`. On her computer it works well. In CI, the run never ends. The code runs, with no error. Find the problem.

<details>
<summary>Answer</summary>

The `--ui` option opens a window where a person watches and clicks each test. CI has no screen and no person, so the run waits for someone who never comes. The script runs but does the wrong job for CI. The course keeps two separate scripts: `e2e` for runs without a window, and `e2e:ui` for people. One name should do one job.

</details>

3. Playwright is written as `1.59.1` in `package.json`, and many other libraries use `^`, such as `^5.3.0`. Which way is better for a test tool, and what would make you choose the other?

<details>
<summary>Answer</summary>

An exact version is better for a test tool, because a new version can change how tests behave and make them fail for no reason in your code. With the range, you get fixes and new features by default, which is good for small helper libraries that rarely break things. Choose the range when you want to receive updates without work, and when the lock file keeps everyone at the same version. The exact version asks for more work when you want to update, but it gives control.

</details>

4. What breaks if someone adds `pnpm-lock.yaml` to the list of files that Git ignores?

<details>
<summary>Answer</summary>

Each person runs `pnpm install` and gets the newest version that the ranges allow on that day. Two people can end up with two different versions. A test then passes for one person and fails for the other, and the code is the same. Nobody can say which version is right. The lock file is the one file that makes "the same install" a promise.

</details>

5. Another program uses port 5180. You run `pnpm dev`, and then you run `pnpm e2e`. What do you expect from each, and why are they different?

<details>
<summary>Answer</summary>

`pnpm dev` fails with an error that the port is in use, because the site is set to a fixed port and refuses to move. `pnpm e2e` is more dangerous: on your computer, Playwright reuses a server that already answers on that port. If the other program answers there, the tests check the wrong app. The config reads a port from the `QAA_E2E_PORT` setting, so you can choose a free port. A silent wrong answer is worse than a loud error.

</details>

6. Playwright downloads its own copy of a browser, and this takes hundreds of megabytes. A teammate says: "Just use the Chrome that is already on the computer." There is no single right answer. Say what your choice depends on.

<details>
<summary>Answer</summary>

Using the installed Chrome saves disk space and download time. But Chrome updates by itself, so a test can break on a day when nobody changed the code, and two computers can have two versions. The downloaded browser matches the Playwright version, so results are the same everywhere. The choice depends on whether you need the same results on many computers, and on how much disk and time you have. For a team and CI, the stable copy is usually worth the space.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **What is the difference between `dependencies` and `devDependencies` in package.json?**
   - Search for: `dependencies vs devDependencies package.json`
   - Try it: In your own project from the Challenge, run `pnpm add dayjs`, and then run `pnpm add -D typescript` if it is not there yet. Open `package.json` and see in which list each name landed.
   - A good answer explains: what each list holds, and why a testing tool such as Playwright goes in the second list.

2. **What is a lock file, and why should you commit it to Git?**
   - Search for: `pnpm-lock.yaml lock file why commit`
   - Try it: Open `pnpm-lock.yaml` in your own project. Find `typescript` and write down its exact version. Compare it with the range in `package.json`.
   - A good answer explains: what the lock file stores, and what can go wrong in a team without it.

3. **What is a port, and what does localhost:5180 mean?**
   - Search for: `what is a port localhost explained`
   - Try it: In the course project, start `pnpm dev` in one terminal. In another terminal, run `pnpm dev --port 5181` and open both addresses in the browser. Say what you saw, and why the second command works.
   - A good answer explains: what a port number is, why two apps cannot use the same port, and how a test tool finds the app to test.

## Next step

Your setup is ready. Go to module 1 and write your first program.
