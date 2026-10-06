---
title: What is programming?
summary: Learn what a program is, write your first one with console.log, and find out what the computer does when your code has a mistake.
duration: 60 min
---

## Start with a puzzle

Here is a recipe written as a program. Each line prints one step.

```ts
console.log("1. Boil the water");
console.log("2. Add the pasta");
console.log("3. Drain the water");
console.log("4. Add the sauce");
console.log("5. Serve");
```

Now you make a small mistake in line 4. There are two versions of the mistake. In version A you type `console.Log` with a capital L. In version B you forget the closing quote after `sauce`.

For each version, how many steps does the terminal print before it complains? The answer is not the same for A and B. Which one is it, and why would a computer behave in two ways?

Write down your guess before you read on.

## Goal

- Predict what a small program prints, line by line.
- Write and run a program in VS Code.
- Explain why a computer follows your words exactly, and what that costs you.
- Read an error message and decide where to look first.

## What is a program?

A program is a list of instructions. A computer follows the instructions one by one, from the top line to the bottom line.

The computer does exactly what you say. It does not guess. It does not understand what you meant.

Think about a robot cook. You say "make tea". A person knows what that means. A robot that follows words exactly needs more: take a cup, boil water, pour the water, put in a tea bag, wait three minutes. Even "wait" needs a number.

When you write for a computer, you must say every step. This is why programming makes you think clearly.

You already write instructions. A manual test case is a list of steps. So is a recipe, a route to the station, or the rules of a board game. A program is the same kind of list. The difference is that a computer follows it, not a person.

## Code, files and running

**Code** is the text that you write for the computer. Each instruction is a line of code.

You keep code in a **file**. A file is a document with a name, like `hello.ts`. The letters after the dot are the **extension**. The extension tells you the kind of file.

**Running** a program means asking the computer to follow the instructions in the file.

## JavaScript and TypeScript

**JavaScript** is a programming language. A programming language is a set of rules for writing instructions. JavaScript was made for web pages, and it also runs outside the browser.

**TypeScript** is JavaScript with extra checks. It can find some mistakes before the program runs. Files that use it end with `.ts`.

In this course you write TypeScript. Playwright, the tool you will use for tests, works well with it.

**Node.js** is the program that runs your code on your computer. You installed it in Module 0.

## Your first program

Open the project folder in VS Code. Create a new file at `exercises/01-programming/hello.ts`.

Type this one line:

```ts
console.log("Hello, world!");
```

`console.log` is an instruction. It means: show this in the terminal. The text inside the quotes is what it shows. The `;` at the end closes the line.

Now open the terminal in VS Code (Terminal > New Terminal). Run the file:

```bash
node exercises/01-programming/hello.ts
```

The terminal prints:

```text
Hello, world!
```

You wrote a program and ran it.

## Instructions run in order

Before you run this file, decide what you expect. It is a music playlist.

```ts
console.log("Now playing: Blue Monday");
console.log("Now playing: Yesterday");
console.log("Now playing: Hey Jude");
```

You expect the songs in the same order as the lines. That is what happens:

```text
Now playing: Blue Monday
Now playing: Yesterday
Now playing: Hey Jude
```

If you swap two lines in the file, the output swaps too. The order of the lines is part of the program.

Order can also break a program without any error. Look at this dinner plan:

```ts
console.log("Put the cake in the oven");
console.log("Heat the oven to 180 degrees");
console.log("Wait 30 minutes");
```

The computer is happy. A cake in a cold oven is not. A program can run with no error and still be wrong. The computer checks the rules of the language. It does not check your idea.

## Comments

A **comment** is a note for people. The computer ignores it. A comment starts with `//`.

```ts
// A short routine for a pet shelter
console.log("Fill the water bowls");
console.log("Feed the cats"); // the dogs eat later
```

The terminal prints only this:

```text
Fill the water bowls
Feed the cats
```

Use comments to explain why you did something. Do not use them to repeat what the line already says.

You can also put `//` in front of a line of code to switch it off for a while. Programmers call this **commenting out**.

## Make a mistake on purpose

Mistakes are normal. Programmers make them all day. The skill is to read the message and decide where to look.

Take version B of the puzzle. Change line 1 of `hello.ts` so that it forgets the closing quote:

```ts
console.log("Hello, world!);
```

Save the file and run it. The terminal shows an error. The first lines look like this:

```text
C:/Users/you/project/exercises/01-programming/hello.ts:1
console.log("Hello, world!);

SyntaxError [ERR_INVALID_TYPESCRIPT_SYNTAX]: Expected ',', got '<eof>'
```

More lines follow. You can ignore them for now. Read the first lines:

- The first line tells you the file and the line number. Here it is line 1.
- The second line shows the code that has the problem.
- The line with `SyntaxError` names the kind of error. A **syntax error** means the code breaks the rules of the language.

The message is not always easy to understand. Here it says the line ended too early. The real reason is the missing quote.

Add the missing quote and run it again. The message goes away.

> **Tip:** Do not be afraid of red text. It tells you where to look. Read the line number first.

### Back to the puzzle

Version A (`console.Log`) prints steps 1, 2 and 3. Then it stops with `TypeError: console.Log is not a function`. Steps 4 and 5 are never printed, because the computer cannot do step 4.

Version B (the missing quote) prints nothing at all. The computer reads the whole file before it runs a single line. It finds the broken line first and refuses to start.

So there are two kinds of problem. One is found when the computer reads the file. The other is found only when the computer reaches that line. Both stop the program, but at different moments.

## Go deeper

### Why the computer does not guess

A computer chip understands only very small instructions, such as "add these two numbers". It cannot read your TypeScript directly. Node.js contains an engine that turns your code into those small instructions. The engine works in a strict way. It follows your text exactly, and it cannot ask you what you meant.

This is why one wrong letter breaks a program. A person reading a recipe can guess that "Boill the water" means "Boil the water". A computer cannot.

### A common wrong idea: "an error means nothing ran"

Many beginners think a failed program does nothing at all. Version A of the puzzle shows that this is not true. Lines 1 to 3 ran. Line 4 failed. Line 5 never ran.

The computer runs the lines in order and stops at the first problem. The lines before the problem already did their work. Remember this when you debug: find the last line that worked, and look at the next one.

> **Note:** A syntax error, like the missing quote, is different. The computer reads the whole file before it runs anything. So with a syntax error, no line runs.

### How it shows up in real QA automation work

An automated test is a program. It has steps, in order, like a manual test case. When one step fails, the test stops there. The steps after it do not run. The report tells you which step failed.

So the order of the steps is part of the test. If you swap "type the password" and "click Login", you made a different test.

You may also see that many `console.log` lines look alike. Repeating the same idea many times is a signal. You will study this idea, called DRY, at the end of this module.

## Practice

1. Create the file `exercises/01-programming/hello.ts` if you have not done it yet.
2. Write three `console.log` lines for the steps of a routine you know well (making tea, a morning at school, a football warm-up). Run the file with `node exercises/01-programming/hello.ts`.
3. Put a comment above the first line. Write what the routine is for.
4. Swap the order of two lines. Run the file. Decide if the new order still makes sense.
5. Delete one closing quote on purpose. Run the file. Find the line number in the error message.
6. Fix the quote. Then change `console.log` to `console.Log` in one line and run again. Compare the two error messages. Which one printed some lines first?

## Challenge

Write a program that prints a short "instruction card" for something you know how to do. Choose your own world: feeding a pet, a game setup, a recipe, a route through your city.

Create the file `exercises/challenges/what-is-programming.ts`. Create the folder `challenges` if it does not exist.

It is done when:

- You run `node exercises/challenges/what-is-programming.ts` and it prints at least 8 lines without an error.
- The first line is a title, and the second line is a line of 30 dashes. You did not type the 30 dashes one by one.
- There is one empty line in the output that separates two parts of the card.
- A comment at the top names two lines that you can swap without changing the meaning, and two lines that you cannot swap.

You will need something this lesson did not teach: how to print a blank line, and how to repeat a piece of text many times without typing it. Search for: `console.log empty line`, `javascript string repeat`.

## Think it through

1. What does this file print?

```ts
console.log("Rinse the rice"); // console.log("Add salt");
// console.log("Boil the rice");
console.log("Serve");
```

<details>
<summary>Answer</summary>

It prints `Rinse the rice` and then `Serve`. The `//` starts a comment, and a comment goes to the end of the line. On line 1 the second `console.log` is inside the comment, so it never runs. Line 2 is a comment from its first character. Only the first part of line 1 and line 3 are code.

</details>

2. A friend writes a bakery program. It runs with no error, but the cake is a disaster. Find the bug.

```ts
console.log("Put the cake in the oven");
console.log("Heat the oven to 180 degrees");
console.log("Wait 30 minutes");
```

<details>
<summary>Answer</summary>

The steps are in the wrong order. The computer only checks that each line follows the rules of the language. It does not know that an oven must be hot before the cake goes in. Swap lines 1 and 2. The lesson is that "no error" does not mean "correct".

</details>

3. Two comments for the same line. Which one is better, and when would you choose the other?

```ts
// print the song name
console.log("Now playing: Yesterday");
```

```ts
// the radio screen shows this text, so keep it short
console.log("Now playing: Yesterday");
```

<details>
<summary>Answer</summary>

The second one is better. The first repeats what the line already says, so it adds nothing. The second tells you why the line is written in this way, and a reader cannot see that in the code. You would choose the first style only when the code is hard to read and you cannot make it clearer. Even then, a better line is often a better answer than a comment.

</details>

4. What happens if you run an empty file? What if the file has only comments?

<details>
<summary>Answer</summary>

Nothing is printed and there is no error. An empty file is a valid program with zero instructions, and so is a file with only comments, because the computer ignores comments. This is a useful edge case. A program does not need to print anything to be correct. It only needs to follow the rules of the language.

</details>

5. Explain to a new teammate, in three sentences and without the word "error", why a test stops at the step that fails. Imagine the teammate has never programmed.

<details>
<summary>Answer</summary>

A good answer could be: "The computer follows the steps in order, like a person who reads a list. When one step cannot be done, the computer does not know what to do next, so it stops. The steps before it already happened, and the steps after it never start." The reasoning is that a later step often depends on an earlier one. If you went on after a failure, the later results would not mean anything.

</details>

6. A computer could guess what you meant when you type `console.Log`. It could fix the capital letter by itself. Is this a good idea? Give one reason for and one reason against.

<details>
<summary>Answer</summary>

There is no single right answer. For: you lose less time on small typing mistakes, and beginners feel less stuck. Against: the guess can be wrong, and then the program does something you did not ask for, with no message to warn you. In a test, a wrong guess could mean a test that passes when it should fail. It depends on the cost of a wrong guess. A search box can guess, because a wrong guess is cheap. A program that moves money should not guess.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **What is the difference between JavaScript and TypeScript, and why do many teams choose TypeScript?**
   - Search for: `typescript vs javascript difference`
   - Try it: create `exercises/01-programming/types-demo.ts` with the lines `const n: number = "x";` and `console.log(n);`. Run it with `node`. Then look at the file in VS Code.
   - A good answer explains: why Node runs the file but VS Code shows a red line, and what TypeScript removes before the code runs.

2. **What is Node.js, and why can JavaScript run outside a browser?**
   - Search for: `what is node.js v8 engine`
   - Try it: run `node -p "process.version"` and then `node -e "console.log(typeof window)"` in the terminal. Open a browser, press F12, open the Console tab, and run `typeof window` there. Compare.
   - A good answer explains: what an engine does, and what a browser has that Node.js does not (and the other way round).

3. **Which tasks are good to give to a computer, and which are not?**
   - Search for: `what to automate in testing`
   - Try it: write a list of ten things you do every week, at work or at home. Mark each one "repeat often", "rarely changes" and "needs judgement". Choose three to automate and say why.
   - A good answer explains: at least three good candidates and three bad ones, with a reason for each.

## Next step

In the next lesson you learn to store values, like names and numbers, in variables.
