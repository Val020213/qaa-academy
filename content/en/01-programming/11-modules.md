---
title: Modules
summary: Split code into files, share it with export and import, and predict what is shared and what stays private.
duration: 70 min
---

## Start with a puzzle

A bakery has a ticket machine. It lives in the file `_tickets.ts`. It has a counter that starts at 0 and goes up by one for each ticket.

Two other files use the machine. The file `_till.ts` has a function `serveCustomer`. The file `_screen.ts` has a function `showNextTicket`. Both files import the same function `nextTicket` from `_tickets.ts`.

The main file calls `serveCustomer()` two times. Then it prints the result of `showNextTicket()`.

Does it print 1 (each file has its own machine) or 3 (there is one machine)? How many times is the machine file started?

Write down your guess before you read on.

## Goal

- Predict what another file can and cannot see from a module.
- Share a value, a function or a type with `export` and use it with `import`.
- Explain why a module runs only once, and what follows from it.
- Choose how to split code into modules and name them.

## One file, one module

Real projects have many files. Each file is a **module**. A module keeps its own variables and functions. Other files cannot see them.

This is useful. A recipe app can keep the oven code in one file and the shopping list in another. If the oven code changes, you fix it in one place.

To share something, the module must **export** it. To use it, another file must **import** it.

## export

Put the word `export` before the thing you want to share.

Create the file `exercises/01-programming/_shapes.ts`:

```ts
export const unit = "cm";

export function squareArea(side: number): number {
  return side * side;
}

export function circleArea(radius: number): number {
  return Math.PI * radius * radius;
}

const secret = "not shared";
```

The file shares `unit`, `squareArea` and `circleArea`. The variable `secret` has no `export`, so it stays private.

## import

Use `import` at the top of another file. List the names in curly braces, then say where they come from.

Create the file `exercises/01-programming/use-shapes.ts`:

```ts
import { unit, squareArea, circleArea } from "./_shapes.ts";

console.log(`${squareArea(3)} square ${unit}`);
console.log(circleArea(1));
```

Run it with `node exercises/01-programming/use-shapes.ts`. The program prints:

```text
9 square cm
3.141592653589793
```

The names in `{ }` must match the exported names exactly.

Now break it on purpose. What do you expect when a file imports the private `secret`?

```ts
import { secret } from "./_shapes.ts";
console.log(secret);
```

The program stops with:

```text
SyntaxError: The requested module './_shapes.ts' does not provide an export named 'secret'
```

VS Code shows the problem earlier, as a red underline. Private means private.

## Relative paths

The text after `from` is the **path**. A path that starts with `./` points to a file next to the current file. A path that starts with `../` goes one folder up.

- `"./_shapes.ts"` means the file `_shapes.ts` in the same folder.
- `"../shared/data.ts"` means the file `data.ts` in the folder `shared`, one level up.

> **Note:** In this course, write the `.ts` ending in relative imports. Node needs it to find the file.

Try three wrong versions. Each one fails in a different way. Guess the message first.

- `from "_shapes.ts"` (no `./`): Node thinks it is a package name and reports `Cannot find package '_shapes.ts'`.
- `from "./_shapes"` (no `.ts`): Node reports `Cannot find module` and shows the path without the ending.
- `from "./_shape.ts"` (a typo): the same `Cannot find module` error. Read the path in the message and compare it with the real file name.

## Importing types

A type exists only while TypeScript checks your code. It disappears when the program runs. Use `import type` for types.

Create `exercises/01-programming/_weather.ts`:

```ts
export type Weather = "sunny" | "rainy" | "snowy";

export const city = "Lima";
```

Use it in another file:

```ts
import type { Weather } from "./_weather.ts";

const today: Weather = "rainy";
console.log(today);
```

The program prints `rainy`.

You can import values and types from the same file with two lines:

```ts
import type { Weather } from "./_weather.ts";
import { city } from "./_weather.ts";
```

## A module runs only once

Back to the bakery. Create the three files and the main file.

`exercises/01-programming/_tickets.ts`:

```ts
console.log("ticket machine loaded");

let count = 0;

export function nextTicket(): number {
  count += 1;
  return count;
}
```

`exercises/01-programming/_till.ts`:

```ts
import { nextTicket } from "./_tickets.ts";

export function serveCustomer(): number {
  return nextTicket();
}
```

`exercises/01-programming/_screen.ts`:

```ts
import { nextTicket } from "./_tickets.ts";

export function showNextTicket(): number {
  return nextTicket();
}
```

`exercises/01-programming/bakery.ts`:

```ts
import { serveCustomer } from "./_till.ts";
import { showNextTicket } from "./_screen.ts";

serveCustomer();
serveCustomer();
console.log(showNextTicket());
```

Run `node exercises/01-programming/bakery.ts`. The program prints:

```text
ticket machine loaded
3
```

### Back to the puzzle

The message appears once, and the screen shows 3. When two files import the same module, the module code runs one time. Both files get the same exported values. They do not get copies. There is one machine and one counter, so all customers share the numbers.

This has a result you must remember. A variable at the top of a module lives as long as the program. Every function that uses it shares it.

## Packages

Not every import points to your own file. Other people publish code as **packages**. A package is a bundle of code that you install with pnpm.

Compare two imports:

```ts
import { squareArea } from "./_shapes.ts";
import { marked } from "marked";
```

- A path that starts with `./` or `../` is your own file.
- A name without a dot is a package. Node looks for it in the `node_modules` folder, where pnpm puts installed packages.

The package `marked` turns Markdown text into HTML. The course site uses it to show these lessons.

## Go deeper

### Imports are live, and read-only

Make `exercises/01-programming/_dog.ts`:

```ts
export let age = 3;

export function birthday(): void {
  age += 1;
}
```

The importing file can read `age`, but not set it. Predict what each program prints, then run them.

```ts
import { age, birthday } from "./_dog.ts";

birthday();
console.log(age);
```

This prints `4`. The import is a live view of the variable, not a copy of the number. But this program stops with `TypeError: Assignment to constant variable.`:

```ts
import { age } from "./_dog.ts";

age = 10;
```

Only the module that owns a variable may change it. The module offers a function, here `birthday`, for everyone else.

### A trade-off: the junk drawer

Sharing is not free. A file named `utils.ts` that holds everything becomes a junk drawer. Nobody knows what is inside, and a change can break many files.

Share code when two files need the same thing. Give the module a name that says what it does, for example `shapes.ts` and not `stuff.ts`. A good test for a module is: can you say in one sentence what it is for?

### How it shows up in QA automation work

Every Playwright test starts with an import line.

```ts
import { test, expect } from "@playwright/test";
```

Read it as: "From the package `@playwright/test`, bring in two tools. `test` defines a test. `expect` checks a result." The names `async` and `await` in the test body come from lesson 10.

Look at the real file `e2e/lib/test.ts` in this project. Every spec imports `test` and `expect` from it. Today it only passes them on from `@playwright/test`. When the team adds its own fixtures in module 4, the change is made in this one file. No spec changes its import.

This is **DRY**: "Don't Repeat Yourself". Shared code has one home. You will study the idea at the end of this module.

In Playwright, each worker process loads its own copy of every module. So do not use a module variable to pass data from one test to another.

> **Tip:** An AI assistant can suggest how to split code into files. Run what it gives you. If you cannot explain every import and export in the answer, do not keep it.

## Practice

1. Create `exercises/01-programming/_shapes.ts` and `exercises/01-programming/use-shapes.ts` from this lesson.
2. Run `node exercises/01-programming/use-shapes.ts`.
3. Remove `export` from `squareArea` and look at the error in VS Code and in the terminal. Then put it back.
4. Create the four bakery files and run `bakery.ts`. Then add a second call of `serveCustomer()` and predict the new number before you run.
5. Open `exercises/01-programming/_test-cases.ts` and read it. Do not change it.
6. Open `exercises/01-programming/11-modules.ts`. Replace each `// TODO` with code.
7. Run the exercise file with this command:

```bash
node exercises/01-programming/11-modules.ts
```

Make every line say `OK`.

## Challenge

Design a small zoo program in modules. Keep animals in one module, food rules in another, and give the main file one single place to import from. Choose your own world if you prefer: a pet shelter, a library, a football league. Your program must have a private helper that no other file can use.

Create the main file `exercises/challenges/11-modules.ts`. Put your modules in the folder `exercises/challenges/_zoo/`.

It is done when:

- Running `node exercises/challenges/11-modules.ts` prints at least two results that come from two different modules.
- The main file has exactly one `import` line for values, and it points to a file named `index.ts` in your folder.
- One value in a module has no `export`. A second file, `exercises/challenges/11-private-test.ts`, tries to import it, and running that file fails with "does not provide an export named".
- `pnpm typecheck` reports an error only for `11-private-test.ts`, and you can read that error and say what it means.

You will need something this lesson did not teach: a file that takes names from other modules and exports them again, so one file can be the single door to a folder. Search for: `javascript re-export export from barrel file`.

## Think it through

1. A file `_dog.ts` has `export let age = 3;` and `export function birthday() { age += 1; }`. A second file runs `import { age, birthday } from "./_dog.ts"; birthday(); console.log(age);`. What does it print, and why? What happens if the second file runs `age = 10;`?

<details><summary>Answer</summary>

It prints `4`. An import is a live view of the variable in the other module, not a copy of its value at import time. So when `birthday` changes `age`, the importer sees the new value. The line `age = 10;` stops with "Assignment to constant variable", and TypeScript reports "Cannot assign to 'age' because it is an import". Only the module that owns the variable may change it.

</details>

2. This module works, but it gives a wrong answer on the second call. Find the bug.

```ts
const songs: string[] = [];

export function makePlaylist(...titles: string[]): string[] {
  for (const title of titles) {
    songs.push(title);
  }
  return songs;
}
```

A file calls `makePlaylist("Blue", "Green")` and then `makePlaylist("Red")`.

<details><summary>Answer</summary>

The second call returns `["Blue", "Green", "Red"]`, not `["Red"]`. The array `songs` is at the top of the module, so it is created once and lives as long as the program. Every call adds to the same array, and every caller gets the same array back. The fix is to create the array inside the function, so each call gets a new one. This kind of shared state is hard to find because no error appears.

</details>

3. You have 12 helper functions: 5 about money, 4 about dates, 3 about text. Version A puts them all in `utils.ts`. Version B makes `money.ts`, `dates.ts` and `text.ts`. Both work. Which is better here, and what would make you choose A?

<details><summary>Answer</summary>

Version B is better here, because each file has a clear job and a name that tells you where to look. A change to a date rule cannot break the money code by accident. Version A is better when the project is very small, for example 3 helpers in total, because three files for three functions is more work than help. The decision depends on how many things you have and how many people must find them. Split when the names stop telling you where things are.

</details>

4. The bakery opens a second till, and each till must have its own ticket numbers. What breaks in the design of `_tickets.ts`, and how would you change it?

<details><summary>Answer</summary>

Both tills would share one counter, because the module runs once and `count` exists once. Till 2 would give number 4 after till 1 gave number 3. The fix is to stop keeping the counter at the top of the module. Instead, export a function that creates a new machine with its own counter each time it is called. Then each till calls it once and keeps its own machine. You can search for `factory function javascript` to see the usual pattern.

</details>

5. Explain to a teammate the difference between `from "./_shapes.ts"` and `from "marked"`, in three sentences, without using the word "path".

<details><summary>Answer</summary>

A good answer says three things. The first one points to a file you wrote, next to the current file. The second one is a package that somebody else made and that was installed into `node_modules`. If you write the first one without `./`, Node looks for a package and reports that it cannot find it.

</details>

6. File `a.ts` imports `b` from `b.ts`, and `b.ts` imports `a` from `a.ts`. Each file prints the other's value as soon as it loads. You run `node a.ts`. What happens?

<details><summary>Answer</summary>

The program stops with "ReferenceError: Cannot access 'a' before initialization". Node starts `a.ts`, sees that it needs `b.ts`, and runs `b.ts` first. At that time `a.ts` has not yet created its value, so `b.ts` reads something that does not exist yet. Two modules that need each other are called a circular import. The usual fix is a third module that holds what both need.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **What is the difference between ES modules (`import`) and CommonJS (`require`)?**
   - Search for: `es modules vs commonjs node`
   - Try it: create `old.cjs` with the line `module.exports = { hi: "hello" };`. In a `.ts` file write `import old from "./old.cjs"; console.log(old.hi);` and run it with `node`. Then run `pnpm typecheck` or look at VS Code. Note what each tool says.
   - A good answer explains: the two syntaxes, why you see both in tutorials, why the program can run while TypeScript complains, and which one this course uses.

2. **What does `^` mean in a version such as `^4.13.0` in `package.json`, and why is Playwright written without it?**
   - Search for: `package.json caret version range semver`
   - Try it: open `package.json` in this project. List three packages that start with `^` and one that does not. Then find the entry for `@playwright/test` in `pnpm-lock.yaml`.
   - A good answer explains: what the version numbers mean, what the lock file adds, and one reason to pin a test tool to an exact version.

3. **What is the difference between `dependencies` and `devDependencies`?**
   - Search for: `package.json dependencies vs devDependencies`
   - Try it: in `package.json`, find where `@playwright/test` and `react` are listed. Say why each one is in its list.
   - A good answer explains: what each list means, in which list a test tool usually belongs, and why.

## Next step

In the next lesson you learn how to read error messages and fix what is wrong.
