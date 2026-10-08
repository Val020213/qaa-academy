---
title: Reading errors
duration: 50 min
---

## Goal

In this lesson you learn to read a TypeScript error message and a stack trace, and to decide whether the line that crashed is the line that holds the mistake.

- Tell a type error, a runtime error and a logic bug apart.
- Read the parts of a TypeScript error message and of a stack trace.
- Recognize the most common beginner errors and their usual fix.
- Decide whether the line that crashed is the line that holds the mistake.

## Three kinds of errors

In the first lesson you saw that an error can be found before the program runs or while it runs. In TypeScript those two cases have names of their own:

- A **type error** is a mismatch between a value and its expected type detected by the type checker. Node.js does not perform that check when it runs `.ts` files. You see it as a red underline in VS Code, or when you run `pnpm typecheck`.
- A **runtime error** happens while the program runs. If nothing catches the error, Node.js stops the program; a `catch` can handle it.

A third kind is a **logic bug**. The program runs without error but gives a wrong answer. No message helps you here: you must compare the result with what you expect. The next lesson is about this kind.

## Anatomy of a TypeScript error

This code has a type error:

```ts
const count: number = "five"
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

The phrase "Type X is not assignable to type Y" appears when a value does not fit the target type. Read it as "I got X, but I need Y."

## Anatomy of a stack trace

Here is a runtime error. The function reads the owner's name from a JSON text. JSON is a text format for data.

```ts
function getDogName(jsonText: string): string {
  const dog = JSON.parse(jsonText)
  return dog.owner.name
}

console.log(getDogName('{"name":"Rex"}'))
```

Node prints something like this:

```text
  return dog.owner.name
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

An import path is wrong, or a package is not installed. Check `./`, the file name and the `.ts` ending. If the package is already in `package.json`, `pnpm install` installs declared dependencies; it does not fix a misspelled package name.

### 8. A Promise shows as [object Promise]

You forgot `await`. Add it. See lesson 10.

> **Tip:** Fix the first error in the list first. Later errors are often caused by the first one.

## Where is the mistake?

The line the message points to is where the program broke, and it is not always the line that holds the mistake. Look at this program:

```ts
type Dog = { id: number, name: string }
const dogs: Dog[] = [{ id: 1, name: "Rex" }]

function getName(id: number): string {
  const found = dogs.find((dog) => dog.id === id) as Dog
  return found.name
}

function printName(id: number): void {
  console.log(getName(id))
}

printName(2)
```

The real output, with the long folder names shortened:

```text
TypeError: Cannot read properties of undefined (reading 'name')
    at getName (demo.ts:6:16)
    at printName (demo.ts:10:15)
    at demo.ts:13:1
```

Node points to line 6, where `name` is read. Also inspect line 5: `find` can return `undefined`, but `as Dog` hides that possibility from the checker. The call on line 13 requests a missing id; the function must decide how to handle it, rather than assuming it always exists.

The `at` lines tell you how to get from the crash back to the source. Node keeps a list of the functions that are running, the **call stack**, and prints it when a crash happens. Read it from top to bottom: `getName` crashed, it was called by `printName` on line 10, and that was called by the main file on line 13. The bad value came from further down the list. At each line, ask: what did I expect here, and what did I get?

## Go deeper

### Loud failure or quiet failure

A program can fail loudly, with a crash and a message. Or it can fail quietly and print something wrong. Loud is usually better, because you see it. This dog shelter keeps an optional owner for each dog:

```ts
type Dog = { name: string, owner?: { name: string } }

function ownerName(dog: Dog): string {
  return (dog.owner as { name: string }).name
}

const dogs: Dog[] = [{ name: "Rex", owner: { name: "Ana" } }, { name: "Mimi" }]

for (const dog of dogs) {
  console.log(ownerName(dog))
}
```

It prints `Ana` and then crashes on line 4: that line reads a property without checking the optional owner. Mimi has no owner, and `as { name: string }` hid that possibility from the checker. The data and the code disagree, and the `as` hid it. A good fix decides what should happen for a dog with no owner: print "no owner", or report a clear message.

Compare the crash with this "fix" for Mimi:

```ts
console.log(`${dog.name} belongs to ${dog.owner?.name}`)
```

The `?.` means "if the owner is missing, give `undefined`". The program prints `Mimi belongs to undefined` and does not crash. The error is gone, but the mistake is still there.

### An empty `catch` hides the error

An error is a message from the code, and you must not hide it. This is a common mistake:

```ts
async function checkWelcome(): Promise<void> {
  throw new Error("Expected the welcome text")
}

async function main(): Promise<void> {
  try {
    await checkWelcome()
  } catch {
    // ignore
  }
  console.log("test passed")
}

main()
```

It prints `test passed`, although the check failed. The empty `catch` swallowed the error. A test like this can never fail. Use `catch` only when you can do something useful. If you only want to log, use `catch (error)` and write `throw error` at the end to pass it on.

## Practice

1. Create the file `exercises/01-programming/errors-practice.ts`.
2. Write `const count: number = "five"`. Read the red underline. Then run `pnpm typecheck` and find the same message. Name the file, line, column and code.
3. Fix it, so the error goes away.
4. Write a call to `getDogName` as in this lesson, and run it with `node`. Find the first `at` line in your own file.
5. Open `exercises/01-programming/12-reading-errors.ts`. It has five functions with one bug each.
6. Run the file with this command:

```bash
node exercises/01-programming/12-reading-errors.ts
```

7. Fix one bug at a time. Use `console.log` to print values. Make every check say `OK`.

## Challenge

Build a program in a world you choose, such as recipes or a football league. It must crash with a stack trace, and the line that crashes must not be the line that holds the mistake. Then write a second version that does not crash and tells the user in one clear sentence what is wrong with the data.

Create the file `exercises/challenges/12-reading-errors.ts` for the crashing version and `exercises/challenges/12-clear-error.ts` for the clear version.

It is done when:

- Running `node exercises/challenges/12-reading-errors.ts` crashes with a `TypeError`, and the stack trace has at least three `at` lines in your own file.
- A comment in the file names the line that crashed and the different line that holds the mistake.
- Running `node exercises/challenges/12-clear-error.ts` prints one sentence with the name of the thing that is wrong, for example `Recipe "Salad" has no oven`, and no stack trace.
- Right after the second program, the exit code is 1. In PowerShell, run `$LASTEXITCODE` to see it.

You will need something this lesson did not teach: a way to tell Node.js that your program failed, even though you caught the error. Search for: `node process.exitCode`.

## Think it through

1. What does this program print, and why?

```ts
const area = Number("5cm") * 5
console.log(area, area === area)
```

<details><summary>Answer</summary>

It prints `NaN false`. `Number("5cm")` cannot make a number from that text, but it does not throw an error. It returns `NaN`, which means "not a number", and `NaN` times 5 is still `NaN`. `NaN` is the one value that is not equal to itself, so `area === area` is `false`. The program runs without any message, so only a check of the value finds this logic bug.

</details>

2. A list of dogs is empty, and the code does `dogs[0].name`. What happens at run time? What does strict TypeScript say before you run?

<details><summary>Answer</summary>

At run time, `dogs[0]` is `undefined`, so the program stops with "Cannot read properties of undefined (reading 'name')". With this course’s `noUncheckedIndexedAccess` setting, TypeScript reports `Object is possibly 'undefined'` before you run. The edge case is the empty list. Check the value first with `if (first !== undefined)`, and decide what the program should do for no dogs.

</details>

3. A function must find a dog by its id. Version A uses `find(...) as Dog`. Version B checks the result and throws `new Error("Dog 2 not found")` when it is `undefined`. Both work when the dog exists. Which is better here, and when would you choose A?

<details><summary>Answer</summary>

Version B is better because the error names the real problem at the place where it starts. With version A the crash comes later, in another line, with a message about `undefined`. Version A is acceptable only when you know the value cannot be missing, for example you just created it a line above. Data from a file, a user or a server can always be missing.

</details>

## Next step

In the next lesson you learn to debug like a scientist: how to find bugs that give no error message at all.
