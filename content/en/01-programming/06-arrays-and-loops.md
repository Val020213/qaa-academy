---
title: Arrays and loops
summary: Keep many values in a list, and repeat an action for each item with a for...of loop.
duration: 35 min
---

## Goal

- Create an array and read items by index.
- Add items and count them.
- Repeat an action for each item with `for...of`.
- Count and sum values in a loop, and check a list with `includes`.

## Arrays

An **array** is a list of values in order. You write it with square brackets. The values are separated by commas.

```ts
const tests = ["login", "search", "checkout"];
console.log(tests);
```

This prints:

```text
[ 'login', 'search', 'checkout' ]
```

Each value in the array is an **item**. Node shows text with single quotes here. It is the same text.

An array can hold numbers too:

```ts
const durations = [12, 40, 7];
```

Keep one type in one array. A list of text, or a list of numbers.

## Index

The **index** is the position of an item. Counting starts at 0, not at 1.

```ts
const tests = ["login", "search", "checkout"];
console.log(tests[0]);
console.log(tests[2]);
```

This prints:

```text
login
checkout
```

The first item is index 0. The second is index 1. The third is index 2.

> **Careful:** The first item is `[0]`, not `[1]`. This is a very common source of mistakes. In a list of 3 items, the last index is 2.

If you ask for an index that does not exist, you get `undefined`.

```ts
console.log(tests[5]);
```

This prints:

```text
undefined
```

In this project, the type checker is strict. It treats `tests[0]` as "a string or `undefined`". You can still print it. If you want to use it as a string, you must check first, with an `if`.

```ts
const first = tests[0];
if (first !== undefined) {
  console.log(first.toUpperCase());
}
```

This prints:

```text
LOGIN
```

`toUpperCase()` is a ready-made function of text. It changes the text to capital letters.

## Length

The **length** of an array is the number of items.

```ts
const tests = ["login", "search", "checkout"];
console.log(tests.length);
console.log(tests[tests.length - 1]);
```

This prints:

```text
3
checkout
```

The last index is always `length - 1`.

## Adding items with push

**push** adds an item to the end of the array.

```ts
const tests = ["login"];
tests.push("search");
tests.push("checkout");
console.log(tests);
```

This prints:

```text
[ 'login', 'search', 'checkout' ]
```

You may ask: the array is a `const`, so why can it change? A `const` stops you from giving the name a new array. It does not stop you from changing the items inside.

## Loops

A **loop** repeats code. Use a loop when you need to do the same thing for each item.

The `for...of` loop takes one item at a time.

```ts
const tests = ["login", "search", "checkout"];

for (const test of tests) {
  console.log(`Running ${test}`);
}
```

This prints:

```text
Running login
Running search
Running checkout
```

Read it like this: for each `test` in `tests`, run the code in the brackets. In the first round, `test` is `"login"`. In the second round it is `"search"`. In the third it is `"checkout"`.

You choose the name `test`. Use a name that says what one item is.

## Counting in a loop

Use a `let` variable as a counter. Change it inside the loop.

```ts
const statuses = ["passed", "failed", "passed", "failed", "failed"];
let failedCount = 0;

for (const status of statuses) {
  if (status === "failed") {
    failedCount = failedCount + 1;
  }
}

console.log(`Failed tests: ${failedCount}`);
```

This prints:

```text
Failed tests: 3
```

Notice that `failedCount` starts at 0 before the loop. It is a `let` because it changes.

## Summing in a loop

The same idea adds numbers. Start at 0 and add each number.

```ts
const durations = [12, 40, 7];
let totalSeconds = 0;

for (const duration of durations) {
  totalSeconds = totalSeconds + duration;
}

console.log(totalSeconds);
```

This prints:

```text
59
```

## Check a list with includes

**includes** asks if a value is in the array. The answer is `true` or `false`.

```ts
const statuses = ["passed", "blocked"];
console.log(statuses.includes("blocked"));
console.log(statuses.includes("failed"));
```

This prints:

```text
true
false
```

Use it with `if` to decide what to do:

```ts
if (statuses.includes("blocked")) {
  console.log("Some tests are blocked");
}
```

This prints:

```text
Some tests are blocked
```

## Practice

1. Create the file `exercises/01-programming/lists.ts`.
2. Make an array with four test names. Print the first and the last item.
3. Add a new test name with `push`. Print the length.
4. Use `for...of` to print each name with the text `Running`.
5. Make an array of durations. Use a loop to print the sum.
6. Open `exercises/01-programming/06-arrays-and-loops.ts` and run it:

```bash
node exercises/01-programming/06-arrays-and-loops.ts
```

Solve the exercises. Make every line say `OK`.

## Check what you know

1. What is the index of the first item of an array?

<details>
<summary>Answer</summary>

0.

</details>

2. An array has 4 items. What is the index of the last one?

<details>
<summary>Answer</summary>

3. The last index is the length minus 1.

</details>

3. What does `push` do?

<details>
<summary>Answer</summary>

It adds an item to the end of the array.

</details>

4. What does this print? `let n = 0; for (const x of [1, 2, 3]) { n = n + x; } console.log(n);`

<details>
<summary>Answer</summary>

6. The loop adds 1, then 2, then 3.

</details>

## Next step

In the next lesson you group related values together in objects, for example the id, title and status of one test case.
