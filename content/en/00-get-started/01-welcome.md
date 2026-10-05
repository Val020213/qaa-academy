---
title: Welcome
summary: What QA Automation is, how this course is ordered, and how to study so that you really learn.
duration: 30 min
---

## Goal

- Explain what QA Automation (QAA) is.
- Explain what an end-to-end test is.
- Know the order of this course and the seven modules.
- Know how to study in a way that works.

## What is QA Automation?

You already test software by hand. You open a page, type data, click buttons, and check the result.

QA Automation means you write a program that does these steps for you. The program is called an automated test. You can run it in seconds, as many times as you want.

A **program** is a list of instructions that a computer follows exactly. To write automated tests, you must learn to write programs. That is why this course starts with programming.

## You already have the hard part

The hard part of testing is not the code. The hard part is knowing what to test.

You know how to read a requirement. You know which cases are risky. You know what a user might do wrong. You know when a result is a bug.

A programmer who does not test well writes weak tests. You will write strong tests, because you think like a tester. The code is a skill you can learn step by step.

## What is an end-to-end test?

An **end-to-end test** (E2E test) checks a whole user flow from the start to the end. It uses the real application in a real browser.

Here is an example of a flow:

1. Open the login page.
2. Type a valid email and password.
3. Click "Log in".
4. Check that the dashboard page appears.

An E2E test does the same steps as you do in a manual test case. The difference is that a program clicks and checks.

## What is Playwright?

**Playwright** is a free tool made by Microsoft. It controls a browser such as Chrome from your code. It can open pages, click, type, and check what is on the screen.

You write Playwright tests in **TypeScript**. TypeScript is a programming language. You will learn it in module 1.

## The order of this course

Many courses start with the tool. This course does not. A tool is hard to use when you do not know the language behind it.

The honest order is:

1. First, you learn to program.
2. Then, you learn Git and how the web works.
3. Then, you learn Playwright.

This takes time. Go slowly. Each step prepares the next one.

## The modules

| Module | Name | What you learn |
| --- | --- | --- |
| 0 | Get started | Install the tools and run the course site |
| 1 | Programming basics with TypeScript | Variables, decisions, loops, functions, and more |
| 2 | Git and the web for QA | Save your work with Git. Understand HTML and how browsers work |
| 3 | Playwright basics | Write your first real browser tests |
| 4 | QAA good practices | Make tests stable, clear, and easy to maintain |
| 5 | Real project | Test a complete small application |
| 6 | References | Links and a glossary for later |

## How to study

These habits make a big difference.

**Type the code yourself.** Do not copy and paste. Typing makes your brain pay attention. You will also make small mistakes, and fixing them is how you learn.

**Break things on purpose.** After an example works, change it. Delete a character. Change a name. See what happens. You will learn what each part does.

**Read the error messages.** An error message is not a punishment. It tells you what is wrong and often where. Read it slowly, from the top. Read the line number.

**Take small steps every day.** Thirty minutes each day is better than five hours once a week. Stop when you are tired. Come back tomorrow.

**Ask for help with a clear question.** Say what you did, what you expected, and what happened. Copy the full error message.

> **Tip:** Keep a notes file. When you learn a new word, write it down with your own short explanation.

## Go deeper

### A common wrong idea: "Automation replaces manual testing"

Many beginners think an automated test finds new bugs. It does not. An automated test only repeats a check that you already know. It is a guard that tells you when an old behavior breaks.

Finding new bugs still needs a person. You explore, you doubt, and you notice what looks strange. A program notices only what you told it to check. So the best plan uses both: manual testing to explore, and automation to protect what you learned.

### Why a program must be exact

A person can read "click the blue button" and understand it. A computer cannot. It needs the exact button, found in an exact way, and the exact result to expect. If one word is missing, it stops or does the wrong thing.

This is why writing a test case as steps, as you did in the Practice, is a good first skill. Each step you write clearly is a step you can later turn into code.

### How it shows up in real QA automation work

Think of a team with 50 manual test cases. Many of them start with the same three steps: open the login page, type the email and password, click "Log in". If the login page changes, you must fix 50 cases.

Programmers have a name for this problem. They say the cases repeat the same knowledge in many places. The rule against it is called DRY, which means "Don't Repeat Yourself". You will study this idea at the end of module 1, and again in module 4. For now, notice the pain: one change, many edits.

> **Note:** DRY has a limit. A test should still read as a clear story. Sometimes a little repetition is better than a clever trick that hides the steps.

## Practice

1. Think about one manual test case you wrote at work. Write down its steps on paper.
2. Mark each step as an action (click, type) or a check (see, compare).
3. Keep this paper. In module 3, you will turn a case like this into an automated test.

## Check what you know

1. What is an automated test?

<details>
<summary>Answer</summary>

It is a program that runs the steps of a test and checks the result for you.

</details>

2. What is an end-to-end test?

<details>
<summary>Answer</summary>

It is a test that checks a complete user flow in the real application, from the first step to the last.

</details>

3. Why does this course teach programming before Playwright?

<details>
<summary>Answer</summary>

Playwright tests are programs. You need to understand the language before you use the tool.

</details>

4. Why should you type the code and not copy it?

<details>
<summary>Answer</summary>

Typing helps you pay attention and learn. Fixing your own small mistakes teaches you a lot.

</details>

5. A team has a rule: "We will automate every test case, so we do not need manual testing." Give two reasons why this plan is weak.

<details>
<summary>Answer</summary>

An automated test only checks what someone already thought of, so it cannot explore new risks. Also, some checks are not worth the cost: a test that runs once, or a screen that changes every week, costs more to automate than to run by hand. A mix of both is stronger.

</details>

6. A manual case says: "Check that the page looks right." Why can this step not be automated as it is written?

<details>
<summary>Answer</summary>

"Looks right" is not exact. A program needs a clear check, such as "the title says Welcome" or "the error message is visible". To automate the step, you must first rewrite it as one or more exact checks. This work is part of your skill as a tester.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **What is the test pyramid, and where do end-to-end tests fit in it?**
   - Search for: `test pyramid unit integration e2e`
   - A good answer explains: the three layers, why there are fewer E2E tests than unit tests, and what each layer costs.

2. **Why do people say that an automated test is also a program that can have bugs?**
   - Search for: `flaky test meaning automation`
   - A good answer explains: what a flaky test is, and why a test that sometimes passes and sometimes fails is a problem for a team.

3. **Which kinds of test cases are good candidates for automation, and which are not?**
   - Search for: `what to automate test automation candidates`
   - A good answer explains: at least three signs of a good candidate, such as repeated often, stable, and clear result, and at least two cases to leave manual.

## Next step

Go to the next lesson and install the tools you need on Windows.
