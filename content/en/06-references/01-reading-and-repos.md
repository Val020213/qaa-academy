---
title: Reading and repos
duration: Reference
---

## How to use this page

You do not need to read everything. This page is a map. Each entry shows its level and tells you when to read it.

- **Beginner**: starts with the basics of the topic.
- **Intermediate**: expects that you have already written some code or tests.
- **Advanced**: read it only when your work needs it.

The linked pages are in English. Read the "Recommended path" first. Come back to the other sections when you need more detail.

Each entry names a course module:

- Module 0: Get started
- Module 1: Programming basics
- Module 2: Git and the web
- Module 3: Playwright basics
- Module 4: QAA good practices
- Module 5: Real project

> **Note:** Documentation changes. If a link fails, search for the title of the entry.

> **Note:** Some Playwright pages show commands that start with `npx playwright`. In this project, the same command is `pnpm exec playwright`.

## Recommended path

Read these nine pages in this order. You learn programming first. Playwright comes after.

1. [Command Line Crash Course (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started/Environment_setup/Command_line): so the terminal feels normal before you type many commands.
2. [The Modern JavaScript Tutorial (javascript.info)](https://javascript.info/): the language basics, in small steps with exercises.
3. [TypeScript for the New Programmer](https://www.typescriptlang.org/docs/handbook/typescript-from-scratch.html): the official starting point for people who never programmed.
4. [Everyday Types (TypeScript Handbook)](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html): the types you will use every day.
5. [Installation (Playwright)](https://playwright.dev/docs/intro): how Playwright is installed and how the first test runs.
6. [Writing tests (Playwright)](https://playwright.dev/docs/writing-tests): actions, assertions and test isolation.
7. [Locators (Playwright)](https://playwright.dev/docs/locators): how to find elements using attributes that users see or use.
8. [Best Practices (Playwright)](https://playwright.dev/docs/best-practices): a short list of what to do and what to avoid.
9. [The Practical Test Pyramid](https://martinfowler.com/articles/practical-test-pyramid.html): where end-to-end tests fit, and why you should not write too many.

## 1. Learn programming and JavaScript basics

- [Learn Web Development (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development): Beginner. A course in HTML, CSS and JavaScript that starts with the basics. Use it as a library. Open only the JavaScript part, during module 1.
- [The Modern JavaScript Tutorial (javascript.info)](https://javascript.info/): Beginner to Intermediate. It explains the language with short examples and exercises. Read it next to module 1, when you study variables, functions and `async`/`await`.
- [Command Line Crash Course (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started/Environment_setup/Command_line): Beginner. It covers commands like `cd`, `ls` and `mkdir`, and the tools `npm` and `npx`. Read it in module 0, before your first terminal exercise.

## 2. TypeScript

- [TypeScript for the New Programmer](https://www.typescriptlang.org/docs/handbook/typescript-from-scratch.html): Beginner. It explains what TypeScript is and why it finds mistakes before you run the code. Read it in module 1, when TypeScript starts.
- [TypeScript for JavaScript Programmers](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html): Beginner to Intermediate. A short summary of type inference, `interface` and union types. Read it at the end of module 1, when you can already write simple code.
- [Everyday Types (TypeScript Handbook)](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html): Beginner to Intermediate. It covers `string`, `number`, arrays, objects, unions and literal types. Keep it open during the type exercises in module 1.
- [TypeScript Playground](https://www.typescriptlang.org/play/): Beginner. An editor in the browser. You can test an idea without installing anything. Use it in module 1 when a type question blocks you.
- [Free TypeScript Tutorials (Total TypeScript)](https://www.totaltypescript.com/tutorials): Intermediate. It has free tutorials with exercises, such as "Beginner's TypeScript" and "Solving TypeScript Errors". Do them after module 1, to practice with real error messages.
- [Modules: TypeScript (Node.js)](https://nodejs.org/docs/latest-v24.x/api/typescript.html): Intermediate. It explains how Node 24 runs `.ts` files by removing types without checking them. An `enum` or a `namespace` with runtime code needs transformation; a `namespace` containing only types can be removed. Read it in module 1 if you wonder why `node file.ts` works.

## 3. Official Playwright documentation

Read these pages only after module 1. You need basic programming first.

- [Installation](https://playwright.dev/docs/intro): Beginner. It shows the install steps, the project structure, a first test and the HTML report. This project is already set up, so read it to understand the structure. Read it at the start of module 3. The page uses `npx playwright`. Here, use `pnpm exec playwright`.
- [Writing tests](https://playwright.dev/docs/writing-tests): Beginner. It covers basic actions, assertions that wait, and the `beforeEach` and `afterEach` hooks. Read it in module 3, before your first real test case.
- [Locators](https://playwright.dev/docs/locators): Beginner. It recommends `getByRole` and `getByLabel` to locate elements by what users see or use, instead of relying on DOM structure with CSS or XPath. It also explains strict locators. Keep it open during all of module 3.
- [Auto-waiting](https://playwright.dev/docs/actionability): Intermediate. It lists the checks Playwright waits for before acting. The checks depend on the action: a click requires, among others, that the element is visible, stable and enabled. Read it in module 4, when your first unstable test appears.
- [Assertions](https://playwright.dev/docs/test-assertions): Beginner to Intermediate. It shows the difference between assertions that retry, like `toBeVisible`, and assertions that do not, like `toBe`. Read it in module 3, when you learn to check results.
- [Best Practices](https://playwright.dev/docs/best-practices): Beginner to Intermediate. It says to test what users see, keep tests isolated and avoid fragile selectors. Read it at the end of module 3, after your first five tests. Read it again in module 4.
- [Fixtures](https://playwright.dev/docs/test-fixtures): Intermediate. It shows how to prepare and clean up each test with `test.extend()`. Read it in module 4, when you repeat the same setup in many files.
- [Page Object Models](https://playwright.dev/docs/pom): Intermediate. It groups the locators and actions of one screen in a class. Read it in module 4, when several tests repeat the same locators and actions.
- [Authentication](https://playwright.dev/docs/auth): Intermediate. It shows how to save and reuse signed-in state. Sharing one account across parallel tests requires that they do not affect each other by changing server data. It warns you not to commit session files to the repository. Read it in module 5.
- [Trace Viewer](https://playwright.dev/docs/trace-viewer-intro): Beginner to Intermediate. It lets you inspect recorded test actions, with DOM snapshots, network calls and console messages, to investigate a failure. Read it in module 3, after your first failing test.
- [UI Mode](https://playwright.dev/docs/test-ui-mode): Beginner. A window with a timeline and a watch mode. The page uses `npx playwright test --ui`. In this project, use `pnpm e2e:ui`, or `pnpm exec playwright test --ui`. Use it from your first test in module 3.
- [Generating tests (Codegen)](https://playwright.dev/docs/codegen-intro): Beginner. It records your clicks and writes code. The page uses `npx playwright codegen`. In this project, use `pnpm exec playwright codegen`. Use it in module 3 to see how a locator is written. Always review and clean the result.
- [Debugging Tests](https://playwright.dev/docs/debug): Intermediate. It covers the VS Code debugger, the Inspector, the headed mode and logs. Read it in module 3 or 4, when a test fails and you do not know why. Headed mode is `pnpm e2e:headed` in this project.
- [Retries](https://playwright.dev/docs/test-retries): Intermediate. Playwright classifies a test as "flaky" if it fails initially and passes on a retry. Read it in module 4, together with the flaky test articles in section 4.
- [TypeScript in Playwright Test](https://playwright.dev/docs/test-typescript): Intermediate. Playwright runs TypeScript but does not check the types. You must check them with a separate command. In this project that command is `pnpm typecheck`. Read it in module 4.
- [Parameterize tests](https://playwright.dev/docs/test-parameterize): Intermediate. It shows how to generate tests for different data sets and use environment variables. Read it in module 4, when you have almost identical cases with different data.
- [API testing](https://playwright.dev/docs/api-testing): Advanced. It shows how to create data through the API before a UI test, and check the final state. Read it in module 5, when tests are slow because of setup clicks.
- [Setting up CI](https://playwright.dev/docs/ci-intro): Intermediate. A GitHub Actions workflow that runs the tests and uploads the report. Read it at the end of module 5.

## 4. QAA good practices and test design

- [Test Pyramid (Martin Fowler)](https://martinfowler.com/bliki/TestPyramid.html): Beginner. A short version of the idea: end-to-end tests through the interface tend to be more fragile, slower and costlier than narrower tests. Read it at the start of module 4, before the next entry.
- [The Practical Test Pyramid (Ham Vocke)](https://martinfowler.com/articles/practical-test-pyramid.html): Intermediate. Write many unit tests, fewer integration tests and few end-to-end tests. Read it in module 4, before you decide which cases to automate.
- [Write tests. Not too many. Mostly integration. (Kent C. Dodds)](https://kentcdodds.com/blog/write-tests): Intermediate. It introduces the "Testing Trophy". It also discusses diminishing returns from chasing 100% coverage. Read it in module 4 to form your own opinion about how much to automate.
- [Guiding Principles (Testing Library)](https://testing-library.com/docs/guiding-principles/): Beginner. It presents a useful principle for choosing locators: the more a test resembles real use, the more confidence it can give you. Read it in module 3, with the locators page.
- [About Queries (Testing Library)](https://testing-library.com/docs/queries/about/#priority): Intermediate. It gives a priority list for finding elements and recommends role and label before other options. Read it in module 3, together with the locators lesson.
- [Test Flakiness: One of the main challenges of automated testing (Google Testing Blog)](https://testing.googleblog.com/2020/12/test-flakiness-one-of-main-challenges.html): Intermediate. It sorts the causes of flaky tests. Read it in module 4, the first time a test passes and fails with no code change.
- [Eradicating Non-Determinism in Tests (Martin Fowler)](https://martinfowler.com/articles/nonDeterminism.html): Intermediate. It lists causes and fixes for tests that give different results: isolation, async code, time and remote services. Read it in module 4, after the Google article.
- [Just Say No to More End-to-End Tests (Google Testing Blog)](https://testing.googleblog.com/2015/04/just-say-no-to-more-end-to-end-tests.html): Intermediate. It argues against relying only on end-to-end tests. The comments discuss when the advice does not apply, so read it with a critical eye. Read it in module 4.
- [Test Sizes (Google Testing Blog)](https://testing.googleblog.com/2010/12/test-sizes.html): Advanced. It sorts tests into small, medium and large by their dependencies, not by their names. Read it in module 5, when you want exact words to talk with developers.

## 5. Repos to read and practice with

### Code

- [microsoft/playwright](https://github.com/microsoft/playwright): Intermediate. The official repository of the framework. Use it in module 5 to read issues, release notes and examples when the documentation does not answer your question.
- [microsoft/playwright-examples](https://github.com/microsoft/playwright-examples): Intermediate. Example test scenarios with Node.js. Read it in module 4, after fixtures, to compare styles.
- [UKHO/playwright-template](https://github.com/UKHO/playwright-template): Advanced. A template with Playwright, TypeScript and Page Object Model. It has page-specific, end-to-end flow and accessibility tests. It also has an Angular example app. Look only at the `tests/` folder and skip the rest. Read it in module 5.
- [awesome-playwright](https://github.com/mxschmitt/awesome-playwright): Intermediate. A curated list of tools, helpers and projects around Playwright. Use it in module 5 when you need a specific library, for example for reports.

### Sites to practice on

- [TodoMVC demo (demo.playwright.dev)](https://demo.playwright.dev/todomvc/): Beginner. The sample app used by the Playwright documentation. It is made for testing. Use it in module 3 for your first locator and assertion practice.
- [The Internet (the-internet.herokuapp.com)](https://the-internet.herokuapp.com/): Beginner. More than 40 scenarios, such as checkboxes, dropdowns, dynamic content, alerts and downloads. Use it in modules 3 and 4. Pick one scenario for each practice session.

### Guided course

- [Build your first end-to-end test with Playwright (Microsoft Learn)](https://learn.microsoft.com/en-us/training/modules/build-with-playwright/): Beginner. A module of 8 units to install, run, debug and record tests from VS Code. Do it in module 3 if you prefer guided steps to reading documentation.

## 6. Everyday tools

- [What is Git? (Pro Git)](https://git-scm.com/book/en/v2/Getting-Started-What-is-Git%3F): Beginner. It explains the three states of a file: modified, staged and committed. Read it in module 2, before your first `git commit`.
- [Getting a Git Repository (Pro Git)](https://git-scm.com/book/en/v2/Git-Basics-Getting-a-Git-Repository): Beginner. It shows `git init` and `git clone` with examples. Use it in module 2, when you clone your team repository.
- [VS Code Extension for Playwright Testing](https://playwright.dev/docs/getting-started-vscode): Beginner. Run and debug tests with one click, record with Codegen and see traces inside the editor. Install it at the start of module 3.
- [Basic Editing (VS Code)](https://code.visualstudio.com/docs/editing/codebasics): Beginner. Shortcuts, multiple cursors, find and replace, and format on save. Read it once in module 0 to work faster in the editor.

> **Tip:** Keep a translator open in your browser if you need it. Always check the English names of methods, such as `getByRole`, `toBeVisible` and `test.extend`.
