---
title: Functions
summary: Write functions with parameters and return values, and learn why small named functions make code easy to read.
duration: 75 min
---

## Start with a puzzle

You want the total area of two square gardens. You write a function for the area of one square, and you call it twice.

```ts
function areaOfSquare(side: number) {
  const area = side * side;
  console.log(area);
}

const total = areaOfSquare(3) + areaOfSquare(4);
console.log(total);
```

The terminal shows three lines. The first two come from the function. What do you expect on the third line, the one with `total`?

The answer is not 25. Think about what the variable `total` receives from each call. Is a number really handed back, or is something only shown?

Write down your guess before you read on.

## Goal

- Predict what a function call gives back, and what it only prints.
- Write a function with parameters and a return value.
- Explain the difference between `console.log` and `return`.
- Split a problem into small functions that each do one job.

## A function is a named recipe

A **function** is a block of code with a name. You write the steps once. Then you use the name every time you need the steps.

Think of a recipe. The recipe has a name and a list of steps. You do not copy the steps each time. You say "make the recipe".

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

The lines `barkTwice();` **call** the function. A call runs the steps. Here it runs two times.

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

The `: number` after the round brackets is the type of the return value. It says: this function gives back a number.

When the computer reaches `return`, the function ends. Any line after `return` does not run.

> **Careful:** `console.log` shows a value in the terminal. `return` gives a value back to the code that called the function. They are not the same. A function that only prints has no return value.

### Back to the puzzle

The function `areaOfSquare` calculates the area, but it only prints it. It has no `return`. So each call gives back `undefined`, which means "nothing".

The third line adds `undefined + undefined`. The result is not a number that makes sense. The terminal shows:

```text
9
16
NaN
```

The `9` and the `16` are printed inside the function, by `console.log`. The `NaN` is the sum of two nothings. The type checker catches this too: VS Code underlines the `+` and says it cannot add two `void` values.

The fix is to return the number, and print only at the end:

```ts
function areaOfSquare(side: number): number {
  return side * side;
}

const total = areaOfSquare(3) + areaOfSquare(4);
console.log(total);
```

This prints `25`. A function that returns a value can be used in maths, stored, compared and tested. A function that only prints can only be read by a person.

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

The first call returns at the `if`. The second call skips the `if` and reaches the last `return`.

What if you forget the last `return`? Look at this function, and decide what `isHungry("full")` gives:

```ts
function isHungry(mood: string): boolean {
  if (mood === "hungry") {
    return true;
  }
}
```

It gives `undefined`. When the `if` is false, the function reaches its end with no `return`. The type checker reports it too: `Function lacks ending return statement and return type does not include 'undefined'`.

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

A default can even use a parameter that comes before it. Guess the output before you read it:

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

You can read `totalWithTax` without looking inside `tax`. Small functions are easy to test, easy to fix and easy to reuse.

A good habit before you write a big function is **decomposition**: break the problem into smaller problems, and give each one a name. To find the cost of a pizza party, you may need `slicesNeeded`, `pizzasNeeded` and `totalPrice`. Each is small. Together they solve a large problem. The next lesson shows how to do this step by step.

## Go deeper

### Why variables inside a function stay inside

Variables made inside a function exist only while the function runs. This is called **scope**. The function has its own private space.

```ts
function secretDemo() {
  const secret = 1;
  return secret;
}

secretDemo();
console.log(secret);
```

The last line fails with `ReferenceError: secret is not defined`. The variable lived only inside the function. This is good. Two functions can use the same name without a clash.

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

### A common wrong idea: "every function gives something back"

A function that has no `return` gives back `undefined`. The puzzle at the start of this lesson is this mistake.

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

The word `Hello` came from `console.log` inside the function. The variable `result` got nothing. If you want a value, you must return it.

### How it shows up in real QA automation work

Each test must create its own data. A small function does this once, for all tests.

```ts
function uniqueEmail(prefix: string): string {
  return `${prefix}-${Date.now()}@example.com`;
}

console.log(uniqueEmail("ana"));
```

`Date.now()` is the current time in milliseconds. Calls with the same prefix at different milliseconds give different emails. Two calls in the same millisecond can give the same email. The output looks like this, with another number on your computer:

```text
ana-1791219025604@example.com
```

Here the steps are written once and used in many places. This is DRY, "Don't Repeat Yourself". You will study it at the end of this module.

A test that has clear steps, such as `login()` and `addToCart()`, is easy for your team to read.

### A trade-off

A function should make code easier to read. `login()` is a good name for three steps. But if you hide every line in a function, the reader must open many functions to understand one thing. Do not make a function for code that you use only once and that is already clear. This is **YAGNI**: do not build for a need that you only imagine.

## Practice

1. Create the file `exercises/01-programming/functions.ts`.
2. Write a function `double` that takes a number and returns it times 2. Print `double(21)`. It must print 42.
3. Write a function `dogSummary` with a parameter `name` and a parameter `age`. It returns `<name> is <age> years old`. Print one result.
4. Add a default value for `age`. Call the function without a second argument.
5. Rewrite `double` as an arrow function.
6. Write `areaOfSquare` from the puzzle in both ways: one that prints and one that returns. Add the areas of two squares with each. See which one works.
7. Open `exercises/01-programming/05-functions.ts` and run it:

```bash
node exercises/01-programming/05-functions.ts
```

Solve the exercises. Make every line say `OK`.

## Challenge

Write a function that turns a number of minutes into a clock text. For example, 135 minutes becomes `2:15`. Choose your own world: the length of a song, a flight, a film, a cooking time.

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

It prints `3 2`. In the first call, there is no second argument, so `b` takes its default, which is `a * 2`, and `a` is 1. So `b` is 2 and the sum is 3. In the second call, `b` is given as 1, so the default is not used and the sum is 2. A default can read the parameters that come before it.

</details>

2. This function should return `true` for `"passed"`. What does `isPassed("failed")` give? Find the problem.

```ts
function isPassed(status: string): boolean {
  if (status === "passed") {
    return true;
  }
}
```

<details>
<summary>Answer</summary>

It gives `undefined`. When the `if` is false, the function reaches its end without a `return`. A function with no `return` gives back `undefined`. Add `return false;` after the `if`. The type checker also reports this problem, because the function promised a boolean.

</details>

3. Two versions of a function. Both work. Which is better, and what would make you choose the other?

```ts
function showArea(side: number): void {
  console.log(side * side);
}
```

```ts
function area(side: number): number {
  return side * side;
}
```

<details>
<summary>Answer</summary>

The second is better in most cases, because the caller decides what to do with the number: print it, add it, compare it, or check it in a test. The first one decides for everybody, and nobody can reuse its result. You would choose the first when the only purpose is to show something, such as a report line at the end of a program. A good habit is to calculate in one function and print in another.

</details>

4. The `tax` function from the lesson always uses 10%. A new rule says that books pay 4% and food pays 21%. What must change, and what would you do?

<details>
<summary>Answer</summary>

The number 10 is hidden inside `tax`, so the function cannot handle other rates. Add a parameter for the rate, for example `tax(amount, rate)`, and change every call. You can give the rate a default value, so old calls still work. Each rate then lives at the place that knows the product. Without this change, you would copy the function three times and have to fix three places later.

</details>

5. A function `average(total, count)` returns `total / count`. What does it return for `average(0, 0)` and for `average(5, 0)`? Is that a good result?

<details>
<summary>Answer</summary>

It returns `NaN` for the first and `Infinity` for the second. The program does not stop, so a wrong number can travel far before anybody sees it. A better design decides what an empty case means: return 0, return a message, or stop with a clear error. The decision belongs to the requirement, because an average of nothing has no single right answer.

</details>

6. Explain the difference between `console.log` and `return` to a teammate, in three sentences. Do not use the words "terminal" or "show".

<details>
<summary>Answer</summary>

A good answer: "A return hands a value back to the line that called the function, like a waiter bringing you a plate. A console.log writes the value for a person to read, and the code that called the function gets nothing. If you want to use the value again in the program, you need return." The reasoning: a function is a tool for other code. Output for a human is a side effect, and it cannot be used in the next calculation.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **What is scope in JavaScript, and what is the difference between local and global variables?**
   - Search for: `javascript scope local global function shadowing`
   - Try it: make a `const size = 1;` outside a function, and a different `const size = 2;` inside a function that prints it. Call the function, then print `size` outside. Explain both results.
   - A good answer explains: a definition of scope, one example of each kind, and why too many global variables cause trouble.

2. **What is the difference between an arrow function and a normal function?**
   - Search for: `javascript arrow function vs function hoisting`
   - Try it: call a function before the line where you define it. Do it once with a normal `function` and once with an arrow function in a `const`. Read the second error.
   - A good answer explains: the shorter syntax, what hoisting means, and at least one more real difference.

3. **What is a pure function, and why is it easy to unit test?**
   - Search for: `pure function javascript side effects testing`
   - Try it: write `double(n)` and `uniqueEmail(prefix)` from this lesson. Call each one twice with the same input and compare the two results. Which one is pure?
   - A good answer explains: the two rules of a pure function and why the same input always gives the same result to check.

## Next step

In the next lesson you learn a method to solve a problem step by step, so a blank page does not stop you.
