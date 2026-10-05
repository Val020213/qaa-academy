---
title: Values and variables
summary: Store text, numbers and true/false values in variables, and combine them with maths and template literals.
duration: 30 min
---

## Goal

- Name the three basic kinds of value: text, number and true/false.
- Store a value in a variable with `const` or `let`.
- Choose clear names for variables.
- Build a message from several values with a template literal.

## Values

A **value** is a piece of data. Your program works with values all the time.

There are three basic kinds. You can try them with `console.log`.

```ts
console.log("Login with valid user");
console.log(42);
console.log(true);
```

This prints:

```text
Login with valid user
42
true
```

The first one is **text**. Text goes inside quotes. Programmers call text a **string**.

The second one is a **number**. Numbers have no quotes.

The third one is a **boolean**. It is either `true` or `false`. It answers a yes or no question, like "did the test pass?".

## Variables

A **variable** is a name for a value. It works like a label on a box. You put a value in the box and use the label to find it later.

```ts
const testName = "Login with valid user";
console.log(testName);
```

This prints:

```text
Login with valid user
```

Read the first line like this: create a variable called `testName` and give it this text. The `=` sign here means "store". It does not mean "equal" as in maths.

You can use the variable many times. If the value changes, you change it in one place.

## const and let

There are two ways to make a variable.

`const` makes a variable that cannot change. Use it by default.

```ts
const bugId = 101;
bugId = 102;
```

The second line is a mistake. You cannot give a new value to a `const`. The program stops with an error that says `Assignment to constant variable`.

`let` makes a variable that can change. Use it only when the value must change.

```ts
let status = "open";
console.log(status);
status = "fixed";
console.log(status);
```

This prints:

```text
open
fixed
```

Notice that you write `let` only once. To change the value later, write the name and `=`.

> **Careful:** You may see `var` in old code on the internet. Never use `var`. It has confusing rules. Use `const` or `let`.

## Naming variables

Choose a name that says what the value is. A good name saves you from writing a comment.

Rules:

- Use English words.
- Start with a lowercase letter.
- Do not use spaces. Write the next word with a capital letter: `testName`, `openBugs`. This style is called **camelCase**.
- Names are case sensitive. `status` and `Status` are two different names.

Good names: `userName`, `failedTests`, `orderTotal`.

Bad names: `x`, `data`, `thing2`. They do not tell you what is inside.

## Basic maths

You can do maths with numbers. The signs are `+`, `-`, `*` (times) and `/` (divide).

```ts
const passed = 8;
const failed = 2;
const total = passed + failed;
console.log(total);
console.log(total * 3);
```

This prints:

```text
10
30
```

Maths follows the usual order: `*` and `/` come before `+` and `-`. Use round brackets to choose the order: `(1 + 2) * 3` is 9.

## Joining text

The `+` sign also joins text.

```ts
const firstPart = "Test ";
const secondPart = "passed";
console.log(firstPart + secondPart);
```

This prints:

```text
Test passed
```

Joining many parts with `+` is hard to read. There is a better way.

## Template literals

A **template literal** is text between backticks. The backtick is the `` ` `` key. On many Windows keyboards you press it, then press the space bar.

Inside a template literal, `${...}` puts the value of a variable into the text.

```ts
const user = "Ana";
const openBugs = 3;
console.log(`${user} has ${openBugs} open bugs`);
```

This prints:

```text
Ana has 3 open bugs
```

You can also put a calculation inside `${...}`:

```ts
console.log(`Total tests: ${8 + 2}`);
```

This prints:

```text
Total tests: 10
```

> **Tip:** Use a template literal whenever you build a message from values. You will do this often in tests.

## Practice

1. Create the file `exercises/01-programming/variables.ts`.
2. Make a `const` called `testName` with the name of a test. Print it.
3. Make a `let` called `status` with the text `"open"`. Print it. Change it to `"fixed"`. Print it again.
4. Make two numbers, `price` and `quantity`. Print the total with a template literal, like `Total: 60`.
5. Try to change a `const` on purpose. Run the file. Read the error.
6. Open the file `exercises/01-programming/02-values-and-variables.ts`. Run it with this command:

```bash
node exercises/01-programming/02-values-and-variables.ts
```

At the start every line says `FAIL`. Solve the exercises one by one. Run the file after each one. Make every line say `OK`.

## Check what you know

1. What are the three basic kinds of value?

<details>
<summary>Answer</summary>

Text (string), number and boolean (`true` or `false`).

</details>

2. When do you use `let` instead of `const`?

<details>
<summary>Answer</summary>

Only when the value must change later. Otherwise use `const`.

</details>

3. What does this print? `const a = 2; console.log(a * 5 + 1);`

<details>
<summary>Answer</summary>

It prints 11.

</details>

4. Which sign do you use around a template literal?

<details>
<summary>Answer</summary>

Backticks. Values go inside `${...}`.

</details>

## Next step

In the next lesson you learn that every value has a type, and how TypeScript uses types to find mistakes.
