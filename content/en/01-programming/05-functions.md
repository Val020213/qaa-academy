---
title: Functions
summary: Write functions with parameters and return values, and learn why small named functions make code easy to read.
duration: 35 min
---

## Goal

- Write a function and call it.
- Use parameters to give a function its input.
- Use `return` to get a result back.
- Write an arrow function and a default parameter.

## A function is a named recipe

A **function** is a block of code with a name. You write the steps once. Then you use the name every time you need the steps.

Think of a recipe. The recipe has a name and a list of steps. You do not copy the steps each time. You say "make the recipe".

```ts
function printGreeting() {
  console.log("Hello, QA!");
}

printGreeting();
printGreeting();
```

This prints:

```text
Hello, QA!
Hello, QA!
```

The first three lines **define** the function. The word `function` starts it, then the name, then `()`, then the steps in `{ }`. Defining does not run it.

The lines `printGreeting();` **call** the function. A call runs the steps. Here it runs two times.

## Parameters

A **parameter** is an input of a function. It is a variable that gets its value when you call the function.

```ts
function greet(name: string) {
  console.log(`Hello, ${name}!`);
}

greet("Ana");
greet("Luis");
```

This prints:

```text
Hello, Ana!
Hello, Luis!
```

The `: string` is a type annotation. It says that `name` must be text. The value you give in the call is an **argument**. Here the arguments are `"Ana"` and `"Luis"`.

A function can have many parameters. Separate them with commas.

## Return values

A function can give a result back. The word `return` does this. The result is the **return value**.

```ts
function add(a: number, b: number): number {
  return a + b;
}

const total = add(2, 3);
console.log(total);
```

This prints:

```text
5
```

The `: number` after the round brackets is the type of the return value. It says: this function gives back a number.

When the computer reaches `return`, the function ends. Any line after `return` does not run.

> **Careful:** `console.log` shows a value in the terminal. `return` gives a value back to the code that called the function. They are not the same. A function that only prints has no return value.

## A QA example

Here is a function with a decision inside. It uses what you learned in lesson 04.

```ts
function verdict(status: string): string {
  if (status === "passed") {
    return "pass";
  }
  return "fail";
}

console.log(verdict("passed"));
console.log(verdict("failed"));
```

This prints:

```text
pass
fail
```

The first call returns at the `if`. The second call skips the `if` and reaches the last `return`.

## Arrow functions

There is a shorter way to write a function. It is called an **arrow function**. It uses the sign `=>`.

```ts
const multiply = (a: number, b: number): number => {
  return a * b;
};

console.log(multiply(4, 5));
```

This prints:

```text
20
```

It does the same as a normal function. You will see arrow functions often in Playwright tests. You can use either style. Be consistent in one file.

## Default parameters

A **default parameter** has a value that is used when you give no argument.

```ts
function formatResult(name: string, status: string = "pending"): string {
  return `${name}: ${status}`;
}

console.log(formatResult("Login test", "passed"));
console.log(formatResult("Search test"));
```

This prints:

```text
Login test: passed
Search test: pending
```

## Why small functions matter

Give each function one job and a clear name. Then the code reads almost like a sentence.

```ts
function tax(amount: number): number {
  return amount / 10;
}

function totalWithTax(amount: number): number {
  return amount + tax(amount);
}

console.log(totalWithTax(100));
```

This prints:

```text
110
```

You can read `totalWithTax` without looking inside `tax`. Small functions are easy to test, easy to fix and easy to reuse. A test that has clear steps, such as `login()` and `addToCart()`, is easy for your team to read.

## Practice

1. Create the file `exercises/01-programming/functions.ts`.
2. Write a function `double` that takes a number and returns it times 2. Print `double(21)`. It must print 42.
3. Write a function `statusMessage` with a parameter `name` and a parameter `status`. It returns `Test <name> is <status>`. Print one result.
4. Add a default value for `status`. Call the function without a second argument.
5. Rewrite `double` as an arrow function.
6. Open `exercises/01-programming/05-functions.ts` and run it:

```bash
node exercises/01-programming/05-functions.ts
```

Solve the exercises. Make every line say `OK`.

## Check what you know

1. What is the difference between defining and calling a function?

<details>
<summary>Answer</summary>

Defining writes the steps and gives them a name. Calling runs the steps.

</details>

2. What is a parameter?

<details>
<summary>Answer</summary>

An input of a function. It is a variable that gets its value from the call.

</details>

3. What does `return` do?

<details>
<summary>Answer</summary>

It gives a value back to the code that called the function, and it ends the function.

</details>

4. What does `formatResult("Search test")` print if there is no `console.log` around it?

<details>
<summary>Answer</summary>

Nothing. The function returns a value but does not print it. You need `console.log` to see it.

</details>

## Next step

In the next lesson you store many values in a list and repeat an action for each one.
