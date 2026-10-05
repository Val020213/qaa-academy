---
title: Modules
summary: Split code into files, share it with export and import, and read Playwright import lines.
duration: 25 min
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

## Next step

In the last lesson of this module you learn how to read error messages and fix what is wrong.
