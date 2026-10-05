---
title: What is programming?
summary: Learn what a program is, write your first one with console.log, and read your first error message.
duration: 25 min
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

## Next step

In the next lesson you learn to store values, like text and numbers, in variables.
