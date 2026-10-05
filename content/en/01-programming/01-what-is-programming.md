---
title: What is programming?
summary: Learn what a program is, write your first one with console.log, and read your first error message.
duration: 40 min
---

## Goal

- Explain what a program, code and a file are.
- Write and run a small program in VS Code.
- Use comments to add notes to your code.
- Read a simple error message and fix it.

## What is a program?

A program is a list of instructions. A computer follows the instructions one by one.

The computer does exactly what you tell it. It does not guess. It does not understand what you meant.

It reads the instructions in order, from the top line to the bottom line.

You already write instructions. A manual test case is a list of steps: open the page, type a user name, click Login. A program is similar. The difference is that a computer follows the steps, not a person.

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
console.log("Hello, QA!");
```

`console.log` is an instruction. It means: show this in the terminal. The text inside the quotes is what it shows. The `;` at the end closes the line.

Now open the terminal in VS Code (Terminal > New Terminal). Run the file:

```bash
node exercises/01-programming/hello.ts
```

The terminal prints:

```text
Hello, QA!
```

You wrote a program and ran it.

## Instructions run in order

Add more lines to the file:

```ts
console.log("Step 1: open the login page");
console.log("Step 2: type the user name");
console.log("Step 3: click Login");
```

The terminal prints the lines in the same order:

```text
Step 1: open the login page
Step 2: type the user name
Step 3: click Login
```

If you swap two lines in the file, the output swaps too. The order of the lines matters.

## Comments

A **comment** is a note for people. The computer ignores it. A comment starts with `//`.

```ts
// This test checks the login page
console.log("Open the login page");
```

The terminal prints only this:

```text
Open the login page
```

Use comments to explain why you wrote something. Do not use them to repeat what the line already says.

## Make a mistake on purpose

Mistakes are normal. Programmers make them all day. The skill is to read the message and fix the problem.

Change the first line so that it forgets the closing quote:

```ts
console.log("Hello, QA!);
```

Save the file and run it again. The terminal shows an error. The first lines look like this:

```text
C:/Users/you/project/exercises/01-programming/hello.ts:1
console.log("Hello, QA!);

SyntaxError [ERR_INVALID_TYPESCRIPT_SYNTAX]: Expected ',', got '<eof>'
```

More lines follow. You can ignore them for now. Read the first lines:

- The first line tells you the file and the line number. Here it is line 1.
- The second line shows the code that has the problem.
- The line with `SyntaxError` names the kind of error. A **syntax error** means the code breaks the rules of the language.

The message is not always easy to understand. Here it says the line ended too early. The reason is the missing quote.

Add the missing quote and run it again. The message goes away.

> **Tip:** Do not be afraid of red text. It tells you where to look. Read the line number first.

## Go deeper

### Why the computer does not guess

A computer chip understands only very small instructions, such as "add these two numbers". It cannot read your TypeScript directly. Node.js contains an engine that turns your code into those small instructions. The engine works in a strict way. It follows your text exactly, and it cannot ask you what you meant.

This is why one wrong letter breaks a program. A person reading a test case can guess that "Logn" means "Login". A computer cannot.

### A common wrong idea: "an error means nothing ran"

Many beginners think a failed program does nothing at all. Look at this file. The second line has a typing mistake: `Log` has a capital L.

```ts
console.log("Step 1: open the login page");
console.Log("Step 2: type the user name");
console.log("Step 3: click Login");
```

When you run it, the terminal shows this:

```text
Step 1: open the login page
```

After that line, you see the error `TypeError: console.Log is not a function`. Step 1 ran. Step 2 failed. Step 3 never ran.

The computer runs the lines in order and stops at the first problem. The lines before the problem already did their work. Remember this when you debug: find the last line that worked, and look at the next one.

> **Note:** A syntax error, like the missing quote in this lesson, is different. The computer reads the whole file before it runs anything. So with a syntax error, no line runs.

### How it shows up in real QA automation work

An automated test is a program. It has steps, in order, like a manual test case. When one step fails, the test stops there. The steps after it do not run. The report tells you which step failed.

So the order of the steps is part of the test. If you swap "type the password" and "click Login", you made a different test.

You may also see that the three `console.log` lines look alike. Repeating the same idea many times is a signal. You will study this idea, called DRY, at the end of this module.

## Practice

1. Create the file `exercises/01-programming/hello.ts` if you have not done it yet.
2. Write three `console.log` lines that print the steps of a login test. Run the file with `node exercises/01-programming/hello.ts`.
3. Put a comment above the first line. Write what the test checks.
4. Swap the order of two lines. Run the file. Check that the output changed.
5. Delete one closing quote on purpose. Run the file. Find the line number in the error message.
6. Fix the quote and run the file again.

## Check what you know

1. What is a program?

<details>
<summary>Answer</summary>

A list of instructions that a computer follows in order, from top to bottom.

</details>

2. What does `console.log("Hi");` do?

<details>
<summary>Answer</summary>

It shows the text Hi in the terminal.

</details>

3. What does the computer do with a line that starts with `//`?

<details>
<summary>Answer</summary>

It ignores the line. It is a comment, written for people.

</details>

4. You run a file and see an error. What do you read first?

<details>
<summary>Answer</summary>

The file name and the line number, then the last line that names the kind of error.

</details>

5. Look at this program. What does the terminal show, and why?

```ts
console.log("A");
console.Log("B");
console.log("C");
```

<details>
<summary>Answer</summary>

It shows `A`, then an error that says `console.Log is not a function`. It does not show `C`. The computer runs the lines in order. It stops at line 2, because `Log` with a capital L does not exist. Line 3 is never reached.

</details>

6. A teammate says: "My file has a missing quote on line 5, but lines 1 to 4 still printed their text." Is this possible?

<details>
<summary>Answer</summary>

No. A missing quote is a syntax error. The computer reads the whole file before it runs it, so it finds the problem first and runs nothing. If lines 1 to 4 printed text, the problem on line 5 was a different kind of error. That kind of error happens only when the computer reaches that line.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **What is the difference between JavaScript and TypeScript, and why do many teams choose TypeScript?**
   - Search for: `typescript vs javascript difference`
   - A good answer explains: what TypeScript adds, when the extra checks happen, and what is removed before the code runs.

2. **What is Node.js, and why can JavaScript run outside a browser?**
   - Search for: `what is node.js v8 engine`
   - A good answer explains: what an engine does and what Node.js adds around it, such as files and the terminal.

3. **Which manual tests are good to automate, and which are not?**
   - Search for: `what to automate in testing`
   - A good answer explains: at least three good candidates and three bad ones, with a reason for each.

## Next step

In the next lesson you learn to store values, like text and numbers, in variables.
