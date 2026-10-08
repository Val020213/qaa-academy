---
title: Modules
duration: 50 min
---

## Goal

In this lesson you split code into several files and share what is needed between them with `export` and `import`.

- Decide what another file can and cannot see from a module.
- Share a value, a function or a type with `export` and use it with `import`.
- Explain why a module runs only once, and what follows from it.
- Choose how to split code into modules and name them.

## One file, one module

Each file is a **module**. A module keeps its own variables and functions, and other files cannot see them.

To share something, the module must **export** it. To use it, another file must **import** it.

## export

Put the word `export` before the thing you want to share.

Create the file `exercises/01-programming/_shapes.ts`:

```ts
export const unit = "cm"

export function squareArea(side: number): number {
  return side * side
}

export function circleArea(radius: number): number {
  return Math.PI * radius * radius
}

const secret = "not shared"
```

The file shares `unit`, `squareArea` and `circleArea`. The variable `secret` has no `export`, so it stays private.

## import

Use `import` at the top of another file. List the names in curly braces, then say where they come from.

Create the file `exercises/01-programming/use-shapes.ts`:

```ts
import { unit, squareArea, circleArea } from "./_shapes.ts"

console.log(`${squareArea(3)} square ${unit}`)
console.log(circleArea(1))
```

Run it with `node exercises/01-programming/use-shapes.ts`. The program prints:

```text
9 square cm
3.141592653589793
```

The names in `{ }` must match the exported names exactly.

If a file tries to import the private `secret`:

```ts
import { secret } from "./_shapes.ts"
console.log(secret)
```

the program stops with:

```text
SyntaxError: The requested module './_shapes.ts' does not provide an export named 'secret'
```

VS Code shows the problem earlier, as a red underline. What is not exported cannot be imported.

## Relative paths

The text after `from` is the **path**. A path that starts with `./` points to a file next to the current file. A path that starts with `../` goes one folder up.

- `"./_shapes.ts"` means the file `_shapes.ts` in the same folder.
- `"../shared/data.ts"` means the file `data.ts` in the folder `shared`, one level up.

> **Note:** In this course, write the `.ts` ending in relative imports. Node needs it to find the file.

Each of these three wrong versions fails in a different way:

- `from "_shapes.ts"` (no `./`): Node thinks it is a package name and reports `Cannot find package '_shapes.ts'`.
- `from "./_shapes"` (no `.ts`): Node reports `Cannot find module` and shows the path without the ending.
- `from "./_shape.ts"` (a typo): the same `Cannot find module` error. Read the path in the message and compare it with the real file name.

## Importing types

A type exists only while TypeScript checks your code. It disappears when the program runs. Use `import type` for types.

Create `exercises/01-programming/_weather.ts`:

```ts
export type Weather = "sunny" | "rainy" | "snowy"

export const city = "Lima"
```

Use it in another file:

```ts
import type { Weather } from "./_weather.ts"

const today: Weather = "rainy"
console.log(today)
```

The program prints `rainy`.

You can import values and types from the same file with two lines:

```ts
import type { Weather } from "./_weather.ts"
import { city } from "./_weather.ts"
```

## A module runs only once

A bakery has a ticket machine. It lives in `_tickets.ts` and has a counter that goes up by one. Two more files use the machine, and the main file calls them.

`exercises/01-programming/_tickets.ts`:

```ts
console.log("ticket machine loaded")

let count = 0

export function nextTicket(): number {
  count += 1
  return count
}
```

`exercises/01-programming/_till.ts`:

```ts
import { nextTicket } from "./_tickets.ts"

export function serveCustomer(): number {
  return nextTicket()
}
```

`exercises/01-programming/_screen.ts`:

```ts
import { nextTicket } from "./_tickets.ts"

export function showNextTicket(): number {
  return nextTicket()
}
```

`exercises/01-programming/bakery.ts`:

```ts
import { serveCustomer } from "./_till.ts"
import { showNextTicket } from "./_screen.ts"

serveCustomer()
serveCustomer()
console.log(showNextTicket())
```

Run `node exercises/01-programming/bakery.ts`. The program prints:

```text
ticket machine loaded
3
```

The message appears once, and the screen shows 3. When two files import the same module, the module code runs one time, and both files get the same exported values, not copies. There is one machine and one counter, so all customers share the numbers.

That is why a variable at the top of a module lives as long as the program, and every function that uses it shares it.

## Packages

Not every import points to your own file. Other people publish code as **packages**, which you install with pnpm.

Compare two imports:

```ts
import { squareArea } from "./_shapes.ts"
import { marked } from "marked"
```

- A path that starts with `./` or `../` is your own file.
- A name without a dot is a package. Node looks for it in the `node_modules` folder, where pnpm puts installed packages.

## Go deeper

### Imports are live, and read-only

Make `exercises/01-programming/_dog.ts`:

```ts
export let age = 3

export function birthday(): void {
  age += 1
}
```

The importing file can read `age`, but not set it.

```ts
import { age, birthday } from "./_dog.ts"

birthday()
console.log(age)
```

This prints `4`. The import is a live view of the variable, not a copy of the number. But this program stops with `TypeError: Assignment to constant variable.`:

```ts
import { age } from "./_dog.ts"

age = 10
```

Only the module that owns a variable may change it. The module offers a function, here `birthday`, for everyone else. TypeScript reports it before you run, as "Cannot assign to 'age' because it is an import".

### A trade-off: the junk drawer

Sharing is not free. A file named `utils.ts` that holds everything becomes a junk drawer. Nobody knows what is inside, and a change can break many files.

Share code when two files need the same thing. Give the module a name that says what it does, for example `shapes.ts` and not `stuff.ts`. A good test for a module is: can you say in one sentence what it is for?

## Practice

1. Create `exercises/01-programming/_shapes.ts` and `exercises/01-programming/use-shapes.ts` from this lesson and run `node exercises/01-programming/use-shapes.ts`.
2. Remove `export` from `squareArea` and look at the error in VS Code and in the terminal. Then put it back.
3. Create the four bakery files and run `bakery.ts`. Then add a second call of `serveCustomer()` and run it again.
4. Open `exercises/01-programming/_test-cases.ts` and read it. Do not change it.
5. Open `exercises/01-programming/11-modules.ts`. Replace each `// TODO` with code.
6. Run the exercise file with this command:

```bash
node exercises/01-programming/11-modules.ts
```

Make every line say `OK`.

## Challenge

Design a small zoo program in modules. Keep animals in one module, food rules in another, and give the main file one single place to import from. If you prefer, choose another world, such as a pet shelter or a library. Your program must have a private helper that no other file can use.

Create the main file `exercises/challenges/11-modules.ts`. Put your modules in the folder `exercises/challenges/_zoo/`.

It is done when:

- Running `node exercises/challenges/11-modules.ts` prints at least two results that come from two different modules.
- The main file has exactly one `import` line for values, and it points to a file named `index.ts` in your folder.
- One value in a module has no `export`. A second file, `exercises/challenges/11-private-test.ts`, tries to import it, and running that file fails with "does not provide an export named".
- `pnpm typecheck` reports an error only for `11-private-test.ts`, and you can read that error and say what it means.

You will need something this lesson did not teach: a file that takes names from other modules and exports them again, so one file can be the single door to a folder. Search for: `javascript re-export export from barrel file`.

## Think it through

1. This module works, but it gives a wrong answer on the second call. Find the bug.

```ts
const songs: string[] = []

export function makePlaylist(...titles: string[]): string[] {
  for (const title of titles) {
    songs.push(title)
  }
  return songs
}
```

A file calls `makePlaylist("Blue", "Green")` and then `makePlaylist("Red")`.

<details><summary>Answer</summary>

The second call returns `["Blue", "Green", "Red"]`, not `["Red"]`. The array `songs` is at the top of the module, so it is created once and every call adds to the same array. The fix is to create the array inside the function, so each call gets a new one. This kind of shared state is hard to find because no error appears.

</details>

2. The bakery opens a second till, and each till must have its own ticket numbers. What breaks in the design of `_tickets.ts`, and how would you change it?

<details><summary>Answer</summary>

Both tills would share one counter, because the module runs once and `count` exists once. Till 2 would give number 4 after till 1 gave number 3. The fix is to stop keeping the counter at the top of the module. Instead, export a function that creates a new machine with its own counter each time it is called, and have each till call it once. You can search for `factory function javascript` to see the usual pattern.

</details>

3. File `a.ts` imports `b` from `b.ts`, and `b.ts` imports `a` from `a.ts`. Each file prints the other's value as soon as it loads. You run `node a.ts`. What happens?

<details><summary>Answer</summary>

The program stops with "ReferenceError: Cannot access 'a' before initialization". Node starts `a.ts`, sees that it needs `b.ts`, and runs `b.ts` first. At that time `a.ts` has not yet created its value, so `b.ts` reads something that does not exist yet. Two modules that need each other are called a circular import. The usual fix is a third module that holds what both need.

</details>

## Next step

In the next lesson you learn how to read error messages and fix what is wrong.
