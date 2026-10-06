---
title: Reading errors
summary: Read type errors and stack traces, find where the real mistake is, and fix the most common errors.
duration: 75 min
---

## Start with a puzzle

A dog shelter keeps a list of dogs. Each dog may have an owner. This program prints the owner of every dog.

```ts
type Dog = { name: string; owner?: { name: string } };

function ownerName(dog: Dog): string {
  return (dog.owner as { name: string }).name;
}

const dogs: Dog[] = [{ name: "Rex", owner: { name: "Ana" } }, { name: "Mimi" }];

for (const dog of dogs) {
  console.log(ownerName(dog));
}
```

The program prints `Ana`. Then it crashes, and the message points to line 4, inside `ownerName`.

Is line 4 wrong? If not, where is the mistake?

Write down your guess before you read on.

## Goal

- Tell a type error from a runtime error from a logic bug.
- Read the parts of a TypeScript error message and of a stack trace.
- Decide whether the line that crashed is the line that holds the mistake.
- Choose between failing loudly and hiding a problem.

## Two kinds of errors

Errors are normal. Every programmer sees them every day. An error message tells you what is wrong. You must learn to read it.

There are two kinds of errors:

- A **type error** is found before the program runs. TypeScript checks your code and finds a mismatch. You see it as a red underline in VS Code, or when you run `pnpm typecheck`.
- A **runtime error** happens while the program runs. The program stops at the failing line.

A third kind is a **logic bug**. The program runs without error but gives a wrong answer. No message helps you here. You must compare the result with what you expect. The next lesson is about this kind.

## Anatomy of a TypeScript error

Here is a mistake in the world of a school:

```ts
const count: number = "five";
```

Before you read on, guess which words the message will use. TypeScript reports:

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

Here is a runtime error. The function reads the owner's name from a JSON text. JSON is a text format for data.

```ts
function getDogName(jsonText: string): string {
  const dog = JSON.parse(jsonText);
  return dog.owner.name;
}

console.log(getDogName('{"name":"Rex"}'));
```

Node prints something like this:

```text
return dog.owner.name;
                 ^

TypeError: Cannot read properties of undefined (reading 'name')
    at getDogName (file:///C:/qaa/exercises/01-programming/demo.ts:3:20)
    at file:///C:/qaa/exercises/01-programming/demo.ts:6:13
```

Read it in parts:

- The first lines show the failing code with a `^` marker.
- `TypeError` is the kind of error.
- After the colon is the message: `dog.owner` is `undefined`, so you cannot read `name` from it.
- The lines that start with `at` are the **stack trace**. It lists the functions that were running, from the newest to the oldest.

Start with the first `at` line that is in your own file. It gives the line and column where the crash happened.

## A debugging routine

Use these five steps, in this order.

1. **Read** the full message slowly. Find the file, the line and the message.
2. **Reproduce** the problem. Make it fail again, the same way, every time.
3. **Make it smaller.** Remove code until you have the smallest example that still fails.
4. **Print values.** Use `console.log` to see what the variables really hold. Compare with what you expected.
5. **Search.** Copy the error message and search for it. Remove your own names from the text first.

Most bugs are found at step 4. The value is not what you thought it was. Lesson 12b teaches this routine as a method with guesses and experiments.

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

You forgot `await`. Add it. See lesson 10.

> **Tip:** Fix the first error in the list first. Later errors are often caused by the first one.

## Where is the mistake?

Look at this program again. The crash is on one line, but is the mistake on that line?

```ts
type Dog = { id: number; name: string };
const dogs: Dog[] = [{ id: 1, name: "Rex" }];

function getName(id: number): string {
  const found = dogs.find((dog) => dog.id === id) as Dog;
  return found.name;
}

function printName(id: number): void {
  console.log(getName(id));
}

printName(2);
```

Guess which line Node blames. Then read the real output, with the long folder names shortened:

```text
TypeError: Cannot read properties of undefined (reading 'name')
    at getName (demo.ts:6:16)
    at printName (demo.ts:10:15)
    at Object.<anonymous> (demo.ts:13:1)
```

Node blames line 6. Line 6 is fine. The mistake is that nobody has a dog with id 2, and line 13 asked for it. The text `as Dog` told TypeScript to trust you, so it hid the `undefined`.

### Back to the puzzle

The crash is on line 4, but line 4 is not the mistake. Mimi has no owner. The code says `as { name: string }`, which tells TypeScript "trust me, the owner is there". The data and the code disagree, and the `as` hid it. A good fix decides what should happen for a dog with no owner: print "no owner", or report a clear message.

## Go deeper

### Why a stack trace is a list

Functions call other functions. Node keeps a list of the functions that are running now. This list is the **call stack**. When a crash happens, Node prints the list. That is the stack trace.

Read it from top to bottom. `getName` crashed. It was called by `printName`, line 10. That was called by the main file, line 13. The bad value came from the bottom of the list. Read down the stack to find who passed it. Then ask: what did I expect here, and what did I get?

### Loud failure or quiet failure

A program can fail loudly, with a crash and a message. Or it can fail quietly and print something wrong. Loud is usually better, because you see it. Compare the crash with this "fix" for Mimi:

```ts
console.log(`${dog.name} belongs to ${dog.owner?.name}`);
```

The `?.` means "if the owner is missing, give `undefined`". The program prints `Mimi belongs to undefined` and does not crash. The error is gone, but the mistake is still there.

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

Playwright errors are written to help. When a check cannot find an element, the failure names the locator it used and says that the element was not found. Read that text before you change anything.

> **Tip:** You may paste an error message into an AI assistant and ask what it means. Then check the answer against the file and line in the message. Never keep a fix that you cannot explain.

## Practice

1. Create the file `exercises/01-programming/errors-practice.ts`.
2. Write `const count: number = "five";`. Read the red underline. Then run `pnpm typecheck` and find the same message. Name the file, line, column and code.
3. Fix it, so the error goes away.
4. Write a call to `getDogName` as in this lesson, and run it with `node`. Find the first `at` line in your own file.
5. Open `exercises/01-programming/12-reading-errors.ts`. It has five functions with one bug each.
6. Run the file with this command:

```bash
node exercises/01-programming/12-reading-errors.ts
```

7. Fix one bug at a time. Use `console.log` to print values. Make every line say `OK`.

## Challenge

Build a program in a world you choose, such as recipes, a zoo or a football league. It must crash with a stack trace, and the line that crashes must not be the line that holds the mistake. Then write a second version that does not crash and tells the user in one clear sentence what is wrong with the data.

Create the file `exercises/challenges/12-reading-errors.ts` for the crashing version and `exercises/challenges/12-clear-error.ts` for the clear version.

It is done when:

- Running `node exercises/challenges/12-reading-errors.ts` crashes with a `TypeError`, and the stack trace has at least three `at` lines in your own file.
- A comment in the file names the line that crashed and the different line that holds the mistake.
- Running `node exercises/challenges/12-clear-error.ts` prints one sentence with the name of the thing that is wrong, for example `Recipe "Salad" has no oven`, and no stack trace.
- Right after the second program, the exit code is 1. In PowerShell, run `$LASTEXITCODE` to see it.

You will need something this lesson did not teach: a way to tell the computer that your program failed, even though you caught the error. Search for: `node process.exitCode`.

## Think it through

1. What does this program print, and why?

```ts
const area = Number("5cm") * 5;
console.log(area, area === area);
```

<details><summary>Answer</summary>

It prints `NaN false`. `Number("5cm")` cannot make a number from that text, but it does not throw an error. It returns `NaN`, which means "not a number", and `NaN` times 5 is still `NaN`. `NaN` is the one value that is not equal to itself, so `area === area` is `false`. The program runs without any message, so only a check of the value finds this logic bug.

</details>

2. This program runs and prints a good message. Find the bug.

```ts
async function checkOven(): Promise<void> {
  throw new Error("Oven is cold");
}

async function main(): Promise<void> {
  try {
    await checkOven();
  } catch {
    // ignore
  }
  console.log("Dinner is ready");
}

main();
```

<details><summary>Answer</summary>

The empty `catch` swallows the error, so the program says "Dinner is ready" even though the oven is cold. Nothing tells you that something went wrong. Either remove the `try` and `catch`, or in `catch` do something useful and pass the error on with `throw error`. A program that hides failures cannot be trusted.

</details>

3. A function must find a dog by its id. Version A uses `find(...) as Dog`. Version B checks the result and throws `new Error("Dog 2 not found")` when it is `undefined`. Both work when the dog exists. Which is better here, and when would you choose A?

<details><summary>Answer</summary>

Version B is better because the error names the real problem at the place where it starts. With version A the crash comes later, in another line, with a message about `undefined`. Version A is acceptable only when you know the value cannot be missing, for example you just created it a line above. The choice depends on who controls the data. Data from a file, a user or a server can always be missing.

</details>

4. A colleague "fixes" the crash for Mimi with `dog.owner?.name`. The program now runs to the end. What changed, and what is the risk?

<details><summary>Answer</summary>

The crash is gone, and the program prints `Mimi belongs to undefined`. The data problem is still there, but now it is quiet. If this text goes to a report or a customer, nobody notices until later. The risk is that a loud, easy failure became a silent, hard one. A better fix decides what should happen for a missing owner, for example a clear text like "no owner".

</details>

5. Explain to a teammate what a stack trace tells you, in three sentences, without using the word "stack".

<details><summary>Answer</summary>

A good answer says three things. It is a list of the functions that were running when the crash happened. The first lines show where the crash was, and the lines after show who called it, one by one. The mistake is often further down the list than the first line.

</details>

6. A list of dogs is empty, and the code does `dogs[0].name`. What happens at run time? What does strict TypeScript say before you run?

<details><summary>Answer</summary>

At run time, `dogs[0]` is `undefined`, so the program stops with "Cannot read properties of undefined (reading 'name')". With the strict settings of this course, TypeScript reports `Object is possibly 'undefined'` before you run. The edge case is the empty list. Check the value first with `if (first !== undefined)`, and decide what the program should do for no dogs.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **What is the call stack in JavaScript, and how does it relate to a stack trace?**
   - Search for: `javascript call stack explained`
   - Try it: write a function that calls itself with no end, for example `function f() { f(); } f();`, and run it. Read the message and the first lines.
   - A good answer explains: what is added and removed from the stack when functions run, and what a stack overflow is.

2. **What are the common JavaScript error types, such as `TypeError`, `ReferenceError` and `SyntaxError`?**
   - Search for: `MDN javascript error types TypeError ReferenceError`
   - Try it: write three tiny programs that each cause a different error type. Run them and write down the first line of each message.
   - A good answer explains: what causes each type and one short code example for each.

3. **How does the Playwright Trace Viewer help a tester find why a test failed?**
   - Search for: `playwright trace viewer`
   - Try it: read the Playwright documentation page for the trace viewer. Write the command that opens a saved trace file, and list three things the viewer shows for each step.
   - A good answer explains: what a trace records, what you can see in it, and how it helps more than only reading the error text.

## Next step

In the next lesson you learn to debug like a scientist: how to find bugs that give no error message at all.
