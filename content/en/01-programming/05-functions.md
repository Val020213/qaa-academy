---
title: Functions
duration: 60 min
---

## Goal

In this lesson you write functions that take in data and give a result back, and you learn to tell what a function returns from what it only prints.

- Write a function with parameters and a return value.
- Predict what a function call gives back, and what it only prints.
- Use default parameters and arrow functions.
- Split a problem into small functions that each do one job.

## Your first function

A **function** is a block of code with a name. You write the steps once and run them by name as often as you like.

```ts
function barkTwice() {
  console.log("Woof!");
  console.log("Woof!");
}

barkTwice();
barkTwice();
```

This prints:

```text
Woof!
Woof!
Woof!
Woof!
```

The first four lines **define** the function. The word `function` starts it, then the name, then `()`, then the steps in `{ }`. Defining does not run it.

The lines `barkTwice();` **call** the function. A call runs the steps. Here it runs them twice.

## Parameters

A **parameter** is an input of a function: a variable that gets its value when you call the function.

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

The `: string` says that `name` is text. The value you give in the call is an **argument**. Here the arguments are `"Ana"` and `"Luis"`.

A function can have many parameters. Separate them with commas.

## Return values

A function can give a result back with the word `return`. That result is the **return value**.

```ts
function areaOfRectangle(width: number, height: number): number {
  return width * height;
}

const gardenArea = areaOfRectangle(4, 5);
console.log(gardenArea);
```

This prints:

```text
20
```

The `: number` after the round brackets is the type of the return value: this function gives back a number.

When Node.js runs `return`, the function ends. The lines after it do not run.

> **Careful:** `console.log` shows a value in the terminal. `return` gives a value back to the code that called the function. They are not the same. A function that only prints has no return value.

### A function that only prints

This function calculates the area of a square, but it only prints it. It is called twice to add up the area of two gardens:

```ts
function areaOfSquare(side: number) {
  const area = side * side;
  console.log(area);
}

const total = areaOfSquare(3) + areaOfSquare(4);
console.log(total);
```

Because it has no `return`, each call gives back `undefined`, which means "nothing". The third line adds `undefined + undefined`, and the terminal shows:

```text
9
16
NaN
```

The `9` and the `16` are printed inside the function, by `console.log`. The `NaN` is the result of adding two nothings. The type checker catches this too: VS Code underlines the `+` and says it cannot add two `void` values.

The fix is to return the number, and print only at the end:

```ts
function areaOfSquare(side: number): number {
  return side * side;
}

const total = areaOfSquare(3) + areaOfSquare(4);
console.log(total);
```

This prints `25`. A function that returns a value can be used in maths, stored, compared and tested. A function that only prints can only be read by a person.

The same happens with any function that has no `return`:

```ts
function printGreeting() {
  console.log("Hello");
}

const result = printGreeting();
console.log(result);
```

This prints:

```text
Hello
undefined
```

The word `Hello` comes from the `console.log` inside the function. The variable `result` got nothing. If you want a value, you must return it.

## Decisions inside a function

A function can use what you learned in lesson 04. This one converts a dog's age into a life stage.

```ts
function lifeStage(dogAge: number): string {
  if (dogAge < 2) {
    return "puppy";
  }
  return "adult";
}

console.log(lifeStage(1));
console.log(lifeStage(6));
```

This prints:

```text
puppy
adult
```

The first call returns at the `if`. The second skips the `if` and reaches the last `return`.

The `: string` after the parentheses is optional. If you remove it, the type checker works out the return type from the `return` lines of the function. Here it works out something more precise than `string`: `"puppy" | "adult"`, read as "the text puppy or the text adult", and nothing else. Hover over the function name in VS Code and you see its full signature, without reading the body.

![The editor shows the return type the checker worked out: only two possible texts.](/images/ts-inferred-return.png)

Writing the type does the opposite job: you state what the function must return, and the checker warns you if a `return` does not match.

If you forget that last `return`, the case where the `if` is false gives back `undefined`:

```ts
function isHungry(mood: string): boolean {
  if (mood === "hungry") {
    return true;
  }
}
```

`isHungry("full")` reaches the end of the function with no `return`. The type checker reports it too: `Function lacks ending return statement and return type does not include 'undefined'`.

## Arrow functions

There is a shorter way to write a function: the **arrow function**, which uses the sign `=>`.

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

It does the same as a normal function. You can use either style; be consistent within one file.

## Default parameters

A **default parameter** has a value that is used when you give no argument.

```ts
function describeSong(title: string, minutes: number = 3): string {
  return `${title} lasts ${minutes} minutes`;
}

console.log(describeSong("Yesterday", 2));
console.log(describeSong("Hey Jude"));
```

This prints:

```text
Yesterday lasts 2 minutes
Hey Jude lasts 3 minutes
```

A default can even use a parameter that comes before it:

```ts
function total(price: number, tip: number = price / 10): number {
  return price + tip;
}

console.log(total(50));
console.log(total(50, 0));
```

This prints:

```text
55
50
```

## Why small functions matter

Give each function one job and a clear name. This idea is called **single responsibility**. Then the code reads almost like a sentence.

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

You can read `totalWithTax` without looking inside `tax`. Small functions are easy to test, to fix and to reuse.

Before you write a big function, apply **decomposition**: break the problem into smaller problems and give each one a name. To find the cost of a pizza party, you may need `slicesNeeded`, `pizzasNeeded` and `totalPrice`. Each is small, and together they solve the whole problem.

## Go deeper

### Variables inside a function stay inside

Variables made inside a function exist only while the function runs. This is called **scope**.

```ts
function secretDemo() {
  const secret = 1;
  return secret;
}

secretDemo();
console.log(secret);
```

The last line fails with `ReferenceError: secret is not defined`. Thanks to this, two functions can use the same name without a clash.

A parameter is also a copy of the value. Changing it does not change the variable you passed in.

```ts
function addOne(n: number): number {
  n = n + 1;
  return n;
}

let x = 5;
console.log(addOne(x));
console.log(x);
```

This prints:

```text
6
5
```

### A trade-off

A function should make code easier to read. `login()` is a good name for three steps. But if you hide every line in a function, the reader has to open many functions to understand one thing. Do not make a function for code that you use only once and that is already clear.

## Practice

1. Create the file `exercises/01-programming/functions.ts`.
2. Write a function `double` that takes a number and returns it times 2. Print `double(21)`. It must print 42.
3. Write a function `dogSummary` with a parameter `name` and a parameter `age`. It returns `<name> is <age> years old`. Print one result.
4. Add a default value for `age`. Call the function without a second argument.
5. Rewrite `double` as an arrow function.
6. Write `areaOfSquare` in both ways: one that prints and one that returns. Add the areas of two squares with each. See which one works.
7. Open `exercises/01-programming/05-functions.ts` and run it:

```bash
node exercises/01-programming/05-functions.ts
```

Solve the exercises. Make every line say `OK`.

## Challenge

Write a function that turns a number of minutes into a clock text. For example, 135 minutes becomes `2:15`. Choose your own world: the length of a song, a flight or a film.

Create the file `exercises/challenges/functions.ts`. Name the main function `formatDuration`.

It is done when:

- `formatDuration(135)` returns `2:15`, and `formatDuration(60)` returns `1:00`.
- `formatDuration(5)` returns `0:05` and `formatDuration(0)` returns `0:00`. The minutes always have two digits.
- At the bottom of the file, you print each of these four calls next to the expected text, so you can see that they match when you run `node exercises/challenges/functions.ts`.
- `formatDuration` uses a second, small function for one part of the work. Each function has one job.

You will need something this lesson did not teach: how to find whole hours and the minutes left over, and how to fill a text with a leading zero. Search for: `javascript Math.floor`, `javascript remainder operator`, `javascript padStart`.

## Think it through

1. What does this code print, and why?

```ts
function f(a: number, b: number = a * 2): number {
  return a + b;
}

console.log(f(1), f(1, 1));
```

<details>
<summary>Answer</summary>

It prints `3 2`. In the first call, there is no second argument, so `b` takes its default, which is `a * 2`, and `a` is 1. So `b` is 2 and the sum is 3. In the second call, `b` is given as 1, so the default is not used and the sum is 2.

</details>

2. The `tax` function from the lesson always uses 10%. A new rule says that books pay 4% and food pays 21%. What must change in `tax`?

<details>
<summary>Answer</summary>

The number 10 is hidden inside `tax`, so the function cannot handle other rates. Add a parameter for the rate, for example `tax(amount, rate)`, and change every call. You can give the rate a default value, so old calls still work.

</details>

3. A function `average(total, count)` returns `total / count`. What does it return for `average(0, 0)` and for `average(5, 0)`? Is that a good result?

<details>
<summary>Answer</summary>

It returns `NaN` for the first and `Infinity` for the second. The program does not stop, so a wrong number can travel far before anybody sees it. A better design decides what an empty case means: return 0, return a message, or stop with a clear error.

</details>

## Next step

In the next lesson you learn a method to solve a problem step by step, so a blank page does not stop you.
