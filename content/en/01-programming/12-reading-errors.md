---
title: Reading errors
summary: Read type errors and stack traces, follow a debugging routine, and fix the most common beginner errors.
duration: 50 min
---

## Goal

- Tell a type error from a runtime error.
- Read the parts of a TypeScript error message.
- Read a stack trace.
- Follow a simple routine to find a bug.

## Two kinds of errors

Errors are normal. Every programmer sees them every day. An error message tells you what is wrong. You must learn to read it.

There are two kinds of errors:

- A **type error** is found before the program runs. TypeScript checks your code and finds a mismatch. You see it as a red underline in VS Code, or when you run `pnpm typecheck`.
- A **runtime error** happens while the program runs. The program stops at the failing line.

A third kind is a **logic bug**. The program runs without error but gives a wrong answer. No message helps you here. You must compare the result with what you expect.

## Anatomy of a TypeScript error

Here is a mistake:

```ts
const count: number = "five";
```

TypeScript reports:

```text
exercises/01-programming/demo.ts:1:7 - error TS2322: Type 'string' is not assignable to type 'number'.
```

Read it in parts:

- `exercises/01-programming/demo.ts` is the file.
- `1:7` is the line number and the column number. Go to line 1, character 7.
- `TS2322` is the error code. Search for it on the web to find explanations.
- `Type 'string' is not assignable to type 'number'` is the message. It says: you put text where a number is expected.

The phrase "Type X is not assignable to type Y" is the most common one. Read it as "I got X, but I need Y."

## Anatomy of a stack trace

Here is a runtime error:

```ts
function getUserName(jsonText: string): string {
  const user = JSON.parse(jsonText);
  return user.profile.name;
}

console.log(getUserName('{"name":"Ana"}'));
```

Node prints something like this:

```text
return user.profile.name;
                   ^

TypeError: Cannot read properties of undefined (reading 'name')
    at getUserName (file:///C:/qaa/exercises/01-programming/demo.ts:3:22)
    at file:///C:/qaa/exercises/01-programming/demo.ts:6:13
```

Read it in parts:

- The first lines show the failing code with a `^` marker.
- `TypeError` is the kind of error.
- After the colon is the message: `user.profile` is `undefined`, so you cannot read `name` from it.
- The lines that start with `at` are the **stack trace**. It lists the functions that were running, from the newest to the oldest.

Start with the first `at` line that is in your own file. It gives the line and column where the crash happened.

## A debugging routine

Use these five steps, in this order.

1. **Read** the full message slowly. Find the file, the line and the message.
2. **Reproduce** the problem. Make it fail again, the same way, every time.
3. **Make it smaller.** Remove code until you have the smallest example that still fails.
4. **Print values.** Use `console.log` to see what the variables really hold. Compare with what you expected.
5. **Search.** Copy the error message and search for it. Remove your own names from the text first.

Most bugs are found at step 4. The value is not what you thought it was.

## The most common beginner errors

### 1. Type 'string' is not assignable to type 'number'

You gave the wrong type. Change the value or the type. Example: `const age: number = "30"` becomes `const age: number = 30`.

### 2. Cannot find name 'x'

TypeScript does not know that name. Check the spelling and the capital letters. Check that you imported it.

### 3. Property 'x' does not exist on type 'Y'

You used a property name that the type does not have. Check the spelling, or add the property to your type.

### 4. 'x' is possibly 'undefined'

A value can be missing, for example the result of `find`. Check it first: `if (found !== undefined) { ... }`.

### 5. Cannot read properties of undefined

A runtime error. You read a property of something that is `undefined`. Print the object with `console.log` and look for the missing part.

### 6. x is not a function

You called something that is not a function. Check the name and the dots. Maybe you forgot that a property is a plain value.

### 7. Cannot find module

An import path is wrong, or a package is not installed. Check `./`, the file name and the `.ts` ending. For packages, run `pnpm install`.

### 8. A Promise shows as [object Promise]

You forgot `await`. Add it. This is the most common bug in Playwright tests.

> **Tip:** Fix the first error in the list first. Later errors are often caused by the first one.

## Go deeper

### Why a stack trace is a list

Functions call other functions. Node keeps a list of the functions that are running now. This list is the **call stack**. When a crash happens, Node prints the list. That is the stack trace.

```ts
type TestCase = { id: number; title: string };
const testCases: TestCase[] = [{ id: 1, title: "Login works" }];

function getTitle(id: number): string {
  const found = testCases.find((testCase) => testCase.id === id) as TestCase;
  return found.title;
}

function printTitle(id: number): void {
  console.log(getTitle(id));
}

printTitle(2);
```

Node prints, with the long folder names shortened:

```text
TypeError: Cannot read properties of undefined (reading 'title')
    at getTitle (demo.ts:6:16)
    at printTitle (demo.ts:10:15)
    at Object.<anonymous> (demo.ts:13:1)
```

Read it from top to bottom. `getTitle` crashed. It was called by `printTitle`, line 10. That was called by the main file, line 13.

### A wrong idea: the crash line holds the mistake

The crash is on line 6, but line 6 is not wrong. The real problem is that nobody has a test case with id 2. The text `as TestCase` told TypeScript to trust you, so it hid the `undefined`. The bad value came from line 13.

Read down the stack to find who passed the bad value. Then ask: what did I expect here, and what did I get?

### How it shows up in QA automation work

An error is a message from the code. You must not hide it. This is a common mistake:

```ts
async function checkWelcome(): Promise<void> {
  throw new Error("Expected the welcome text");
}

async function main(): Promise<void> {
  try {
    await checkWelcome();
  } catch {
    // ignore
  }
  console.log("test passed");
}

main();
```

It prints `test passed`, although the check failed. The empty `catch` swallowed the error. A test like this can never fail. Use `catch` only when you can do something useful. If you only want to log, write `throw error` at the end of the `catch` block to pass the error on.

Clear messages are valuable too. The helper `byTestId` in `src/views/playground.ts` writes the "was not found" message once, for every element. That is the **DRY** idea, which you will study in the next lesson.

## Practice

1. Create the file `exercises/01-programming/errors-practice.ts`.
2. Write `const count: number = "five";`. Read the red underline. Then run `pnpm typecheck` and find the same message. Name the file, line, column and code.
3. Fix it, so the error goes away.
4. Write a call to `getUserName` as in this lesson, and run it with `node`. Find the first `at` line in your own file.
5. Open `exercises/01-programming/12-reading-errors.ts`. It has five functions with one bug each.
6. Run the file with this command:

```bash
node exercises/01-programming/12-reading-errors.ts
```

7. Fix one bug at a time. Use `console.log` to print values. Make every line say `OK`.

## Check what you know

1. What is the difference between a type error and a runtime error?

<details><summary>Answer</summary>

A type error is found before the program runs. A runtime error happens while it runs.

</details>

2. In `demo.ts:12:5`, what do 12 and 5 mean?

<details><summary>Answer</summary>

Line 12 and column 5 in the file `demo.ts`.

</details>

3. Where do you start reading a stack trace?

<details><summary>Answer</summary>

At the first `at` line that points to your own file.

</details>

4. Your test prints `[object Promise]`. What is the likely cause?

<details><summary>Answer</summary>

A missing `await`.

</details>

5. What does this program print, and why?

```ts
function parsePrice(text: string): number {
  return Number(text.replace("$", ""));
}

console.log(parsePrice("$abc"));
```

<details><summary>Answer</summary>

It prints `NaN`, which means "not a number". `Number("abc")` cannot make a number, but it does not throw an error. The program runs without any message. This is a logic bug, and only a check of the value, for example with `console.log`, can show it.

</details>

6. This code crashes when it runs. Find the cause, and explain how you would fix it.

```ts
type TestCase = { id: number; title: string };
const testCases: TestCase[] = [{ id: 1, title: "Login works" }];

const second = testCases[5];
console.log(second.title);
```

<details><summary>Answer</summary>

There is no item at position 5, so `second` is `undefined`. Reading `.title` from it gives "Cannot read properties of undefined". Strict TypeScript warns first: `'second' is possibly 'undefined'`. Fix it with `if (second !== undefined) { ... }`, and find out why you looked at position 5.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **What is the call stack in JavaScript, and how does it relate to a stack trace?**
   - Search for: `javascript call stack explained`
   - A good answer explains: what is added and removed from the stack when functions run, and what a stack overflow is.

2. **What are the common JavaScript error types, such as `TypeError`, `ReferenceError` and `SyntaxError`?**
   - Search for: `MDN javascript error types TypeError ReferenceError`
   - A good answer explains: what causes each type and one short code example for each.

3. **How does the Playwright Trace Viewer help a tester find why a test failed?**
   - Search for: `playwright trace viewer`
   - A good answer explains: what a trace records, what you can see in it, and how it helps more than only reading the error text.

## Next step

In the last lesson of this module you learn DRY, a way to think that keeps your code easy to change and easy to trust.
