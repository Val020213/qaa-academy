---
title: Welcome
summary: What QA Automation is, why a computer needs exact instructions, how this course is ordered, and how to study so that you really learn.
duration: 60 min
---

## Start with a puzzle

You give a robot a cooking card. It has three lines:

1. Boil water.
2. Put the tea bag in the cup.
3. Pour the water. Wait until the tea is strong enough.

The robot does exactly what the card says and nothing more. It has never seen tea.

What will it do? Will it make a good cup of tea? Will it stop at some line? Will it do something strange? Which line is the most dangerous, and why?

Do not look for the "right" answer yet. Look for the line where you would be afraid to leave the robot alone.

Write down your guess before you read on.

## Goal

- Predict what a literal machine does with an instruction that is not exact.
- Decide which of your manual test steps a computer could follow today, and which not.
- Explain what an end-to-end test is, and why it does not replace manual testing.
- Explain why this course teaches programming before Playwright.

## What is QA Automation?

You already test software by hand. You open a page, type data, click buttons, and check the result.

QA Automation means you write a program that does these steps for you. The program is called an automated test. You can run it in seconds, as many times as you want.

A **program** is a list of instructions that a computer follows exactly. To write automated tests, you must learn to write programs. That is why this course starts with programming.

### Experiment: a robot that does only what you say

Take a cooking card for a boiled egg:

1. Put the egg in the pot.
2. Turn on the stove.
3. Wait 8 minutes.
4. Take the egg out.

What do you expect a literal robot to do? Think before you read on.

Here are four problems. The pot has no water. The stove has two knobs. "Wait 8 minutes" does not say what to do while it waits. "Take the egg out" does not say with what. A person fills the gaps without noticing. A robot cannot.

Now try a second world, a shape. Write exact steps to draw a square on paper. Start with "Draw a square" and keep adding detail until a stranger who has never seen a square could follow you. How many steps do you need? You will find that you need the length of a side, the angle of each turn, and the number of sides. You also need a rule for when to stop.

This work has a name. **Decomposition** means breaking a big job into small steps that are each easy to do. Programmers decompose before they write code. Often they write the steps in plain words first. This is called **pseudocode**: steps that look like code but are written for people.

### Back to the puzzle

The most dangerous line is line 3: "Wait until the tea is strong enough". "Strong enough" has no number. A robot has no taste. It does not know when to stop, so it may wait forever, or stop at once.

The lines "Boil water" and "Put the tea bag in the cup" also hide gaps. How much water? Which cup? A good instruction says: "Pour water until the cup is full. Wait 3 minutes. Remove the tea bag." Each step has a number or a clear end.

Your manual test steps have the same problem. "Check that the page looks right" is like "strong enough".

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

Why "end to end"? Think of a parcel. You can check each part of the trip: the shop, the truck, the sorting office. Or you can check one thing: did the parcel arrive at the door? An E2E test checks that last thing.

## What is Playwright?

**Playwright** is a free tool made by Microsoft. It controls a browser such as Chrome from your code. It can open pages, click, type, and check what is on the screen.

You write Playwright tests in **TypeScript**. TypeScript is a programming language. You will learn it in module 1.

## The order of this course

Many courses start with the tool. This course does not. A tool is hard to use when you do not know the language behind it.

Think of a music lesson. You can press the keys of a piano on day one. But you cannot play a song before you know notes and rhythm. The tool is the piano. The language is the notes.

The order is:

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

**Guess first.** Before you run an example, write what you expect to see. Then run it. When your guess is wrong, you learn the most.

**Break things on purpose.** After an example works, change it. Delete a character. Change a name. See what happens. You will learn what each part does.

**Read the error messages.** An error message is not a punishment. It tells you what is wrong and often where. Read it slowly, from the top. Read the line number.

**Search before you ask.** Each lesson has a Challenge that needs something the lesson did not teach. You must look it up. This is the real work of a programmer.

**Take small steps every day.** Thirty minutes each day is better than five hours once a week. Stop when you are tired. Come back tomorrow.

**Ask for help with a clear question.** Say what you did, what you expected, and what happened. Copy the full error message.

> **Tip:** Keep a notes file. When you learn a new word, write it down with your own short explanation.

### Using an AI assistant

You may ask an AI assistant for help. But follow one rule: run the code, and be able to explain every line. Never paste code that you cannot explain. If you cannot explain a line, you cannot fix it when it breaks. A good use is to ask "why does this line work?" after you wrote your own version.

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

## Challenge

Write a card for a literal robot. Choose your own world: a pet shelter that feeds a dog, a library that lends a book, a football league that adds a score, a kitchen that makes pancakes. The card must be so exact that a person who knows nothing about your world can follow it and get the right result. Test your card on a real person, or on yourself after a day, using only the text.

Create the file `exercises/challenges/01-welcome.md` and write your card there.

It is done when:

- The card has between 8 and 15 numbered steps, and each step is one action or one check.
- No step uses a word with no number or no clear end, such as "enough", "a while", or "looks good".
- At least one step is a decision written as "If ... then ... otherwise ...".
- Below the card, you list three things that could go wrong, and each one has a step that handles it.
- You gave the card to a person, or you followed it yourself with real objects, and you wrote down one step that failed.

You will need something this lesson did not teach: how programmers write a decision in plain words before they write code. Search for `pseudocode examples for beginners` and `if then else flowchart simple`.

## Think it through

1. A card for a robot says: "Draw a square. Repeat 3 times: move forward 10 steps, turn right 90 degrees." The robot runs it without error. What is wrong with the result?

<details>
<summary>Answer</summary>

The robot draws only three sides, an open shape like the letter U. A square has four sides, so the loop must repeat 4 times. The robot gives no error, because the card is valid. It does what the card says, not what you meant. Bugs like this are the most common ones, and a tester finds them by checking the result, not the instructions.

</details>

2. An automated test checks that the page title is exactly "Welcome". A designer changes the title to "Welcome!". The test now fails. Is that a bug in the product, a bug in the test, or neither? Give your reasoning.

<details>
<summary>Answer</summary>

It is neither, or both, depending on the requirement. The test was exact, so it correctly noticed a change. If the requirement says the title is "Welcome", the product has a bug. If the designer changed the requirement on purpose, the test is out of date and you must update it. The test cannot know which one is true. A person must decide, and this is why automation needs a tester.

</details>

3. A team has 50 test cases that all start with "open the login page, type the email and password, click Log in". The button text changes from "Log in" to "Sign in". What breaks if the steps are written 50 times, and what breaks if they are written once and shared?

<details>
<summary>Answer</summary>

With 50 copies, you must change 50 places, and you can miss one. That one case then fails for a reason that has nothing to do with its goal. With one shared copy, you change one place. But the shared copy has a risk too: if it is wrong, all 50 cases fail together. Sharing makes a change cheap and a mistake loud. That is usually a good trade, and you will study it as DRY.

</details>

4. Explain to a new colleague what an automated test is. Use three sentences. Do not use the word "program".

<details>
<summary>Answer</summary>

A sample answer: "An automated test is a list of exact steps that a computer follows, like a person would in a manual test. At the end, it checks a result and says pass or fail. You can run it again and again, in seconds, with the same steps each time." A good answer has three parts: the steps, the check, and the repeat. If your answer has no check, it describes only a script that clicks, not a test.

</details>

5. A manual case says: "Open the first search result." What happens when the search returns zero results? What should an automated test do?

<details>
<summary>Answer</summary>

There is no first result, so the step cannot be done. A literal program stops with an error that says it cannot find the element, and the message does not say why. The case is incomplete: it does not say what the expected behavior is for zero results. A better test first makes sure that results exist, or has a separate case for "no results" that checks the empty message. The edge case teaches you to ask what the step assumes.

</details>

6. A screen changes every week, and every change has broken something in the past. Should you automate its tests? There is no single answer. Say what your answer depends on.

<details>
<summary>Answer</summary>

There are two forces. The screen is risky, so you want a guard. But it changes often, so every test will need repair, and repair costs time. It depends on how big the cost of a bug is, how big the changes are, and what you test. Tests of the stable core, such as "the user can log in", are worth it. Tests of the exact layout are not. A good compromise is to automate the few checks that must always hold, and to explore the rest by hand.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **What is the test pyramid, and where do end-to-end tests fit in it?**
   - Search for: `test pyramid unit integration e2e`
   - Try it: Think of an app you use every day, such as a music player. Write 10 checks you would make. Place each one in a layer of the pyramid and count how many are in each layer.
   - A good answer explains: the three layers, why there are fewer E2E tests than unit tests, and what each layer costs.

2. **Why do people say that an automated test is also a program that can have bugs?**
   - Search for: `flaky test meaning automation`
   - Try it: Take one manual case and list everything that could differ between two runs: speed, data, time of day, other users. Mark which differences could make a check pass once and fail the next time.
   - A good answer explains: what a flaky test is, and why a test that sometimes passes and sometimes fails is a problem for a team.

3. **Which kinds of test cases are good candidates for automation, and which are not?**
   - Search for: `what to automate test automation candidates`
   - Try it: Write 5 manual cases from your work. Give each one a score from 1 to 3 for how often it runs, how stable the screen is, and how clear the result is. Add the scores and sort the list.
   - A good answer explains: at least three signs of a good candidate, such as repeated often, stable, and clear result, and at least two cases to leave manual.

## Next step

Go to the next lesson and install the tools you need on Windows.
