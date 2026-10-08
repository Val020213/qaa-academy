---
title: What is programming?
duration: 45 min
---

## Goal

In this lesson you write and run your first TypeScript program, and learn to read what it prints and what it says when it fails.

- Describe the phases your code goes through, from text to execution.
- Write and run a program with `node`.
- Predict what a program prints, line by line.
- Leave notes in the code with comments.
- Tell apart an error found before the program runs from one that happens while it runs, and read the message of each.

## From text to a running program

Your computer's processor only understands machine code: numbers that stand for very small operations, such as adding two values or copying a piece of data. You normally write text in a programming language, and another program takes that text to the processor.

A **compiler** translates code into another form before that part runs: it may be machine code, bytecode or another language. An **interpreter** runs instructions without first creating a complete executable. Some tools combine the two ideas.

These are the phases you will encounter in this course's tools:

1. **Parsing.** The text is read and checked against the grammar of the language: brackets that close, quotes that are complete. The result is a tree that represents the structure of the code, the syntax tree (*AST*).
2. **Checking.** Some languages then check that the pieces fit together, for example that you do not multiply a text by a number. In TypeScript this phase is type checking.
3. **Execution.** The tree is turned into instructions the machine can run, and they run.

### What Node.js does with your file

In this course you write **TypeScript**, which is JavaScript with type annotations; its files end in `.ts`. **Node.js**, which you installed in module 0, runs them. With this course's `.ts` files, this happens:

1. Node.js parses the file and removes the type annotations. What is left is JavaScript. Node.js does not check the types, it only removes them.
2. V8, the JavaScript engine inside Node.js and also inside Chrome, parses that JavaScript, builds the tree and turns it into *bytecode*: intermediate instructions, simpler than your code and more general than machine code.
3. V8 starts by running the bytecode. It can also compile frequently used parts to machine code while the program runs, to run them faster. This is called *just-in-time* (JIT) compilation.

![What Node.js does with a .ts file. The type checker is a separate tool.](/images/code-to-execution.en.svg)

Type checking is done by another tool, the TypeScript checker. VS Code uses it while you type, which is why it underlines errors before you run anything. The lesson "Types" uses it in depth.

These phases explain what you will see at the end of this lesson: a grammar error shows up during parsing, before a single line runs, and other errors only show up when execution reaches them.

## Your first program

Open the project folder in VS Code. Create a new file at `exercises/01-programming/hello.ts`.

Type this one line:

```ts
console.log("Hello, world!")
```

`console.log` prints the value and adds a newline. In this course we put each instruction on its own line. TypeScript also accepts a `;` at the end of an instruction, so you will see it in other people's code, but this course leaves it out.

Now open the terminal in VS Code (Terminal > New Terminal). Run the file:

```bash
node exercises/01-programming/hello.ts
```

The terminal prints:

```text
Hello, world!
```

## Instructions run in order

This file is a music playlist:

```ts
console.log("Now playing: Blue Monday")
console.log("Now playing: Yesterday")
console.log("Now playing: Hey Jude")
```

The songs come out in the same order as the lines:

```text
Now playing: Blue Monday
Now playing: Yesterday
Now playing: Hey Jude
```

If you swap two lines in the file, the output swaps too. The order of the lines is part of the program.

A program can also run with no error and still be wrong. If you write "put the cake in the oven" before "heat the oven to 180 degrees", Node.js does not complain: the parser checks the file's grammar, not whether the order of the steps makes sense.

## Comments

A **comment** is a note for people. The parser does not treat it as an instruction, so it does not run. A line comment starts with `//` and goes to the end of the line.

```ts
// A short routine for a pet shelter
console.log("Fill the water bowls")
console.log("Feed the cats") // the dogs eat later
```

The terminal prints only this:

```text
Fill the water bowls
Feed the cats
```

Use comments to explain why you did something. Do not use them to repeat what the line already says.

You can also put `//` in front of a line of code to switch it off for a while. Programmers call this **commenting out** the line.

![TypeScript Playground: after commenting out the second line and running again, Logs shows only the first message.](/clips/01-comment-out.webm)

## Two kinds of error

When your code has an error, what you see in the terminal changes depending on whether Node.js finds it while parsing the file or while running it.

### Before it runs: no program output

Node.js reads the whole file before it runs a single line. If the file breaks the language rules, Node.js shows the error and runs none of its instructions, not even the correct ones that come before. This is called a **syntax error**.

Change line 1 of `hello.ts` so that it forgets the closing quote:

```ts
console.log("Hello, world!)
```

Save the file and run it. The first lines of the error look like this:

```text
C:/Users/you/project/exercises/01-programming/hello.ts:1
console.log("Hello, world!)

SyntaxError [ERR_INVALID_TYPESCRIPT_SYNTAX]: Expected ',', got '<eof>'
```

More lines follow. You can ignore them for now. Read the first lines:

- The first line tells you the file and the line number. Here it is line 1.
- The second line shows the code that has the problem.
- The line with `SyntaxError` names the kind of error.

The message is not always easy to understand. Here it says the file ended while the parser expected more code, and the real reason is the missing quote. Add the quote and run again: the message goes away.

### While it runs: earlier lines were already printed

Other errors only appear when Node.js reaches the line that causes them. Here is a recipe, one step per line:

```ts
console.log("1. Boil the water")
console.log("2. Add the pasta")
console.log("3. Drain the water")
console.log("4. Add the sauce")
console.log("5. Serve")
```

If you type `console.Log` with a capital L on line 4, the file follows the syntax rules and starts to run. It prints steps 1, 2 and 3, then stops with `TypeError: console.Log is not a function`. Steps 4 and 5 are never printed.

When a program fails halfway, the earlier lines did run and the later ones did not. Find the last line that worked and look at the one after it.

## Practice

1. In `exercises/01-programming/hello.ts`, write three `console.log` lines for the steps of a routine you know well (making tea, a morning at school, a football warm-up). Run the file with `node exercises/01-programming/hello.ts`.
2. Put a comment above the first line. Write what the routine is for.
3. Swap the order of two lines and run the file. Decide if the new order still makes sense.
4. Delete one closing quote on purpose and run the file. Find the line number in the error message.
5. Fix the quote. Then change `console.log` to `console.Log` in one line and run again. Compare the two error messages. Which one printed some lines before it failed?

## Challenge

Write a program that prints a short "instruction card" for something you know how to do. Choose your own theme, for example feeding a pet or a recipe.

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
console.log("Rinse the rice") // console.log("Add salt")
// console.log("Boil the rice")
console.log("Serve")
```

<details>
<summary>Answer</summary>

It prints `Rinse the rice` and then `Serve`. On line 1 the second `console.log` is inside the comment, so it never runs. Line 2 is a comment from its first character.

</details>

2. A friend writes a bakery program. It runs with no error, but the cake is a disaster. Find the bug.

```ts
console.log("Put the cake in the oven")
console.log("Heat the oven to 180 degrees")
console.log("Wait 30 minutes")
```

<details>
<summary>Answer</summary>

The steps are in the wrong order. Node.js runs the lines in the order they are written and does not know that an oven must be hot before the cake goes in. Swap lines 1 and 2.

</details>

3. What happens if you run an empty file? What if the file has only comments?

<details>
<summary>Answer</summary>

Nothing is printed and there is no error. An empty file is a valid program with zero instructions, and a file with only comments also has no instructions to run.

</details>

## Next step

In the next lesson you learn to store values, like names and numbers, in variables.
