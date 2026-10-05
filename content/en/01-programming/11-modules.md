---
title: Modules
summary: Split code into files, share it with export and import, and read Playwright import lines.
duration: 40 min
---

## Goal

- Explain that one file is one module.
- Share a value or function with `export`.
- Use it in another file with `import`.
- Read `import { test, expect } from "@playwright/test"`.

## One file, one module

Real projects have many files. Each file is a **module**. A module keeps its own variables and functions. Other files cannot see them.

This is useful. A test file can use a helper from another file instead of copying it. If the helper changes, you fix it in one place.

To share something, the module must **export** it. To use it, another file must **import** it.

## export

Put the word `export` before the thing you want to share.

Create the file `exercises/01-programming/_helpers.ts`:

```ts
export const appName = "Shop";

export function addTax(price: number): number {
  return price * 1.2;
}

const secret = "not shared";
```

The file shares `appName` and `addTax`. The variable `secret` has no `export`, so it stays private.

## import

Use `import` at the top of another file. List the names in curly braces, then say where they come from.

Create the file `exercises/01-programming/use-helpers.ts`:

```ts
import { appName, addTax } from "./_helpers.ts";

console.log(appName);
console.log(addTax(100));
```

Run it with `node exercises/01-programming/use-helpers.ts`. The program prints:

```text
Shop
120
```

The names in `{ }` must match the exported names exactly.

## Relative paths

The text after `from` is the **path**. A path that starts with `./` points to a file next to the current file. A path that starts with `../` goes one folder up.

- `"./_helpers.ts"` means the file `_helpers.ts` in the same folder.
- `"../shared/data.ts"` means the file `data.ts` in the folder `shared`, one level up.

> **Note:** In this course, write the `.ts` ending in relative imports. Node needs it to find the file.

## Importing types

A type exists only while TypeScript checks your code. It disappears when the program runs. Use `import type` for types.

Put this in `_helpers.ts`:

```ts
export type Status = "passed" | "failed" | "skipped";
```

Use it in another file:

```ts
import type { Status } from "./_helpers.ts";

const status: Status = "passed";
console.log(status);
```

The program prints `passed`.

You can import values and types from the same file with two lines:

```ts
import type { Status } from "./_helpers.ts";
import { appName } from "./_helpers.ts";
```

## Packages

Not every import points to your own file. Other people publish code as **packages**. A package is a bundle of code that you install with pnpm.

Compare two imports:

```ts
import { addTax } from "./_helpers.ts";
import { test, expect } from "@playwright/test";
```

- A path that starts with `./` or `../` is your own file.
- A name without a dot is a package. Node looks for it in the `node_modules` folder, where pnpm puts installed packages.

The name `@playwright/test` is the package made by the Playwright team.

## Reading a Playwright test file

Every Playwright test starts with an import line.

```ts
import { test, expect } from "@playwright/test";
```

Read it as: "From the package `@playwright/test`, bring in two tools. `test` defines a test. `expect` checks a result."

Then you use them:

```ts
test("login page has a title", async ({ page }) => {
  await page.goto("/login");
  await expect(page).toHaveTitle("Login");
});
```

You do not need to understand all of it now. Notice the three parts you know: `test` and `expect` came from the import, and `async` and `await` come from lesson 10.

## Go deeper

### A module runs only once

When two files import the same module, the module code runs one time. Both files get the same exported values. They do not get copies.

Create four small files. The first is `_settings.ts`:

```ts
console.log("settings loaded");

export const settings = { retries: 0 };
```

The second is `_bump.ts`:

```ts
import { settings } from "./_settings.ts";

export function bump(): void {
  settings.retries += 1;
}
```

The third is `_show.ts`:

```ts
import { settings } from "./_settings.ts";

export function show(): number {
  return settings.retries;
}
```

The fourth is `main.ts`:

```ts
import { bump } from "./_bump.ts";
import { show } from "./_show.ts";

bump();
console.log(show());
```

Run `node main.ts`. The program prints:

```text
settings loaded
1
```

The message appears once, and `show` sees the change made by `bump`. Both files use one object. In Playwright, each worker process loads its own copy of every module. So do not use a module variable to pass data from one test to another.

### How it shows up in QA automation work

Look at the real file `e2e/lib/test.ts` in this project. Every spec imports `test` and `expect` from it. Today it only passes them on from `@playwright/test`. When the team adds its own fixtures in module 4, the change is made in this one file. No spec changes its import.

This is **DRY**: "Don't Repeat Yourself". Shared code has one home. You will study the idea at the end of this module.

### A trade-off: the junk drawer

Sharing is not free. A file named `utils.ts` that holds everything becomes a junk drawer. Nobody knows what is inside, and a change can break many files.

Share code when two files need the same thing. Give the module a name that says what it does, for example `test-data.ts` and not `stuff.ts`.

## Practice

1. Create `exercises/01-programming/_helpers.ts` and `exercises/01-programming/use-helpers.ts` from this lesson.
2. Run `node exercises/01-programming/use-helpers.ts`.
3. Remove `export` from `addTax` and look at the error in VS Code and in the terminal. Then put it back.
4. Open `exercises/01-programming/_test-cases.ts` and read it. Do not change it.
5. Open `exercises/01-programming/11-modules.ts`. Replace each `// TODO` with code.
6. Run the exercise file with this command:

```bash
node exercises/01-programming/11-modules.ts
```

Make every line say `OK`.

## Check what you know

1. What is a module?

<details><summary>Answer</summary>

A module is one file. Its content is private unless you export it.

</details>

2. How do you share a function from a file?

<details><summary>Answer</summary>

Write `export` before the function.

</details>

3. What does `"./data.ts"` mean in an import?

<details><summary>Answer</summary>

The file `data.ts` in the same folder as the current file.

</details>

4. What does `import { test, expect } from "@playwright/test"` do?

<details><summary>Answer</summary>

It brings the tools `test` and `expect` from the package `@playwright/test` into your file.

</details>

5. A file has `const taxRate = 0.2;` and `export function addTax(...)`. Another file starts with `import { taxRate } from "./_helpers.ts";`. What happens when you run it, and why?

<details><summary>Answer</summary>

The program stops with an error such as "The requested module does not provide an export named 'taxRate'". The variable `taxRate` has no `export`, so it is private to its file. TypeScript also reports this in VS Code before you run. The fix is to write `export` before `const taxRate`, or to use only `addTax`.

</details>

6. This import does not work. Find the reason.

```ts
import { addTax } from "_helpers.ts";
```

<details><summary>Answer</summary>

The path has no `./` at the start. Node thinks `_helpers.ts` is the name of a package and looks in `node_modules`. It does not find it and reports "Cannot find package '_helpers.ts'". Write `"./_helpers.ts"` for a file in the same folder.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **What is the difference between ES modules (`import`) and CommonJS (`require`)?**
   - Search for: `es modules vs commonjs node`
   - A good answer explains: the two syntaxes, why you see both in tutorials, and which one this course uses.

2. **What is the difference between `dependencies` and `devDependencies` in `package.json`?**
   - Search for: `package.json dependencies vs devDependencies`
   - A good answer explains: what each list means, in which list a test tool such as Playwright usually belongs, and why.

3. **What is a test automation framework, and which parts do tests usually share?**
   - Search for: `test automation framework components`
   - A good answer explains: what a framework adds around the test tool, two or three shared parts such as helpers or test data, and one reason to keep them in separate modules.

## Next step

In the last lesson of this module you learn how to read error messages and fix what is wrong.
