---
title: Values and variables
summary: Store text, numbers and true/false values in variables, and combine them with maths and template literals.
duration: 45 min
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

## Go deeper

### A variable keeps its own copy of a value

When you write `const saved = price;`, the computer copies the value into `saved`. The two variables do not stay linked.

```ts
let price = 10;
const saved = price;
price = 20;
console.log(saved, price);
```

This prints:

```text
10 20
```

`saved` kept the old value. Changing `price` later did not change it. Think of two boxes, not one box with two labels.

### A common wrong idea: the name and the text are the same

Beginners often put quotes around a variable name. Compare these two lines.

```ts
console.log("price");
console.log(price);
```

The first line prints the word `price`, because quotes make text. The second prints the value stored in the variable, here `20`. No quotes means "look up the variable". Quotes mean "this is text".

The same mistake happens with template literals. A normal string in quotes does not fill in values. Only backticks do.

### How it shows up in real QA automation work

Test code uses the same value many times: a web address, a user name, an error message. Write it once, in a `const`, and use the name everywhere.

```ts
const baseUrl = "https://shop.example.com";
console.log(`${baseUrl}/login`);
console.log(`${baseUrl}/cart`);
```

This prints:

```text
https://shop.example.com/login
https://shop.example.com/cart
```

If the address changes, you edit one line. Not twenty. This idea is called DRY, "Don't Repeat Yourself". Each piece of knowledge lives in one place. You will study it at the end of this module.

A value written directly in the code, like `"https://shop.example.com"` in the middle of a line, is sometimes called a magic value. A reader does not know why it is there. A good name explains it.

### A trade-off

Do not make a variable for everything. A name like `const zero = 0;` adds nothing. Make a variable when the value is used more than once, or when the name explains something that the value does not.

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

5. What does this code print, and why?

```ts
let count = 1;
count = count + 1;
count = count * 5;
console.log(count);
```

<details>
<summary>Answer</summary>

It prints 10. The first line stores 1. The second line reads the current value, adds 1, and stores 2. The third line reads 2, multiplies by 5, and stores 10. Each line uses the value that the last line left.

</details>

6. This code should print `Hello, Ana`, but it does not. Find the bug.

```ts
const userName = "Ana";
console.log("Hello, ${userName}");
```

<details>
<summary>Answer</summary>

It prints `Hello, ${userName}`. The text uses normal quotes, so the computer treats `${userName}` as plain characters. A template literal needs backticks: `` `Hello, ${userName}` ``.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **What is the difference between `var`, `let` and `const`, and why do style guides say to avoid `var`?**
   - Search for: `javascript var let const difference scope`
   - A good answer explains: how each one handles scope and re-assigning, and the main problem with `var`.

2. **What are camelCase, snake_case, PascalCase and kebab-case, and where is each one used?**
   - Search for: `camelCase snake_case PascalCase kebab-case`
   - A good answer explains: each style with one example, and which one JavaScript variables normally use.

3. **What is a magic number or magic string in code, and why is it a problem in test code?**
   - Search for: `magic number magic string programming`
   - A good answer explains: a definition, one example, and how a named constant fixes it.

## Next step

In the next lesson you learn that every value has a type, and how TypeScript uses types to find mistakes.
