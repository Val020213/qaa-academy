---
title: Welcome
duration: 15 min
---

## The Thursday before a release

A version ships tomorrow and you have to run the regression. You open the sheet with 120 cases and start with the first one: *login*, search, cart, payment. They are the same cases as two weeks ago, and the two weeks before that.

Around case 90 you are clicking almost without looking, and that is where the unexpected slips through: the total that leaves out shipping, the button that landed out of place. The regression takes you two days, and the team is already planning the next version.

A program can run many of the checks on that sheet, as many times as you need. This course teaches you to write that program.

## Goal

- Explain what an end-to-end test is and what Playwright does.
- Recognise which steps of your manual cases a computer can follow and which it cannot.
- Understand the order of the course and why it starts with programming.
- Have a study method for the lessons that follow.

## What is test automation?

Automating tests means writing code that runs your cases for you. A case becomes an **automated test**: code that opens the application, performs the steps, compares the result and reports pass or fail. It runs whenever you want, or on every change the team makes, with nobody watching.

## You already have the hard part

The hard part of testing is not the code, it is knowing what to test. You already know how to read a requirement, spot the risky cases and anticipate what a user can do wrong. A programmer without that judgment writes weak tests. Code is learned step by step, and judgment is what takes longest to build.

## What is an end-to-end test?

An **end-to-end test** (E2E test) walks through a complete flow using the real application in a real browser. For example:

1. Open the login page.
2. Type a valid email and password.
3. Click "Log in".
4. Check that the *dashboard* appears.

It is called "end to end" because it follows the flow from the user’s action to its result. It can pass through the interface, server and database. It detects a failure if it prevents a step or changes a result the test checks.

## What is Playwright?

**Playwright** is a free tool from Microsoft that controls a browser such as Chrome from code. It opens pages, clicks, types and reads what appears on the screen. Playwright also exists for Python, Java and .NET. In this course you use it with TypeScript.

## Course tools

| Tool | Use in the course | Official site |
| --- | --- | --- |
| ![](/icons/typescript.svg) TypeScript | Write the programs and tests | [typescriptlang.org](https://www.typescriptlang.org) |
| ![](/icons/nodejs.svg) Node.js | Run the programs and tests | [nodejs.org](https://nodejs.org) |
| ![](/icons/playwright.svg) Playwright | Automate browser tests | [playwright.dev](https://playwright.dev) |
| ![](/icons/vscode.svg) VS Code | Write and review code | [code.visualstudio.com](https://code.visualstudio.com) |
| ![](/icons/git.svg) Git | Save code changes | [git-scm.com](https://git-scm.com) |
| ![](/icons/pnpm.svg) pnpm | Install the project's libraries | [pnpm.io](https://pnpm.io) |

## The order of this course

Many courses start with the tool. This one starts with the language, because a Playwright test is code, and if you cannot read it you cannot fix it when it fails. The order is:

1. First, programming with TypeScript.
2. Then, Git and how the web works.
3. Last, Playwright.

## The modules

| Module | Name | What you learn |
| --- | --- | --- |
| 0 | Get started | Install the tools and run the course site |
| 1 | Programming basics with TypeScript | Variables, decisions, loops, functions, and more |
| 2 | Git and the web for QA | Save your work with Git. Understand HTML and how browsers work |
| 3 | Playwright basics | Write your first real browser tests |
| 4 | QAA good practices | Make tests stable, clear, and easy to maintain |
| 5 | Real project | Test a complete small application |
| 6 | References | Links and repositories for later |

## How to study

**Type the code yourself.** Do not copy and paste. Typing makes you pay more attention, and the small mistakes you make teach you more than an example that works the first time.

**Guess first.** Before you run an example, write down what you expect to see. When you are wrong, that is when you learn the most.

**Break things on purpose.** Once an example works, delete a character or change a name and see what happens. That is how you find out what each part does.

**Read the error messages.** They say what is wrong and, almost always, where. Read them slowly, from the top, and note the line number.

**Search before you ask.** Some lessons have a Challenge that needs something the lesson did not teach. You have to look it up, and looking things up is part of a programmer's daily work.

**Take small steps every day.** Thirty minutes a day does more than five hours once a week. Stop when you are tired and come back tomorrow.

**Ask for help with a clear question.** Say what you did, what you expected and what happened, and copy the full error message.

> **Tip:** Keep a notes file. When you learn a new word, write it down with your own short explanation.

### Using an AI assistant

You can ask an AI assistant for help, on one condition: run the code and be able to explain every line. If you cannot explain it, you cannot fix it when it breaks. A good use is to ask "why does this line work?" after you have written your own version.

## Go deeper

### A manual step is not an automated step

A manual case can say "Check that the page looks right", and a person knows what to do. A test does not. It needs the exact element, the exact way to find it and the exact result to expect, such as "the title is Welcome" or "the total is 45.00". If one of those is missing, the test stops or checks something else.

That is why writing your cases as concrete steps, as in the Practice, is the first skill of this work. Every step you write clearly is a step you can later turn into code.

### Automation does not replace manual testing

An automated test repeats the checks you programmed. It can find a bug you had not seen, but only in what it checks. A person also needs to explore, question and notice what looks strange. The best approach combines both: manual exploration to discover, and automation to protect what you discovered.

## Practice

1. Think about one manual test case you wrote at work. Write down its steps on paper.
2. Mark each step as an action (click, type) or a check (see, compare).
3. Keep this paper. In module 3, you will turn a case like this into an automated test.

## Next step

Go to the next lesson and install the tools you need on Windows.
