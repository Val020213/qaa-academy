---
title: Making decisions
summary: Compare values and use if, else if and else so your program can choose what to do.
duration: 30 min
---

## Goal

- Compare two values with `===` and `!==`.
- Choose between actions with `if`, `else if` and `else`.
- Combine conditions with `&&`, `||` and `!`.

## Comparisons

A program often needs to ask a question. Is the status "passed"? Is the price over 50?

A **comparison** asks such a question. The answer is always a boolean: `true` or `false`.

```ts
console.log(5 > 3);
console.log("passed" === "passed");
console.log("passed" === "failed");
```

This prints:

```text
true
true
false
```

These are the comparison signs:

| Sign  | Meaning                  |
| ----- | ------------------------ |
| `===` | is equal to              |
| `!==` | is not equal to          |
| `>`   | is greater than          |
| `<`   | is less than             |
| `>=`  | is greater than or equal |
| `<=`  | is less than or equal    |

> **Careful:** `=` stores a value. `===` compares two values. Do not mix them up. Also, never use `==`. It has strange rules. Always use `===` and `!==`.

## if

An **if** statement runs some code only when a condition is `true`. The code goes inside curly brackets `{ }`.

```ts
const status = "failed";

if (status === "failed") {
  console.log("Create a bug report");
}
console.log("Done");
```

This prints:

```text
Create a bug report
Done
```

If `status` was `"passed"`, the first message would not print. Only `Done` would print.

## else

Use **else** to run code when the condition is `false`.

```ts
const status = "passed";

if (status === "passed") {
  console.log("Test OK");
} else {
  console.log("Test needs attention");
}
```

This prints:

```text
Test OK
```

## else if

Use **else if** when you have more than two choices. The computer checks the conditions from the top. It runs the first block that is true, and skips the rest.

```ts
const openBugs = 3;

if (openBugs === 0) {
  console.log("clean");
} else if (openBugs < 5) {
  console.log("minor");
} else {
  console.log("critical");
}
```

This prints:

```text
minor
```

Here `openBugs === 0` is false, so the computer goes on. Then `openBugs < 5` is true, so it prints `minor` and stops.

The order matters. Put the most specific condition first.

## Logical operators

You can join conditions. There are three **logical operators**.

`&&` means AND. Both sides must be true.

`||` means OR. At least one side must be true.

`!` means NOT. It turns `true` into `false` and `false` into `true`.

```ts
const hasUser = true;
const hasPassword = false;

console.log(hasUser && hasPassword);
console.log(hasUser || hasPassword);
console.log(!hasPassword);
```

This prints:

```text
false
true
true
```

Here is a login check that uses `&&`:

```ts
const userName = "ana";
const password = "";

if (userName !== "" && password !== "") {
  console.log("Send the login form");
} else {
  console.log("Show an error: fill in all fields");
}
```

This prints:

```text
Show an error: fill in all fields
```

The text `""` is an empty string. The password is empty, so the second part is false. With `&&`, one false part makes the whole condition false.

Here is one with `||`:

```ts
const status = "blocked";

if (status === "failed" || status === "blocked") {
  console.log("Needs review");
}
```

This prints:

```text
Needs review
```

Notice that you write the full comparison on both sides. `status === "failed" || "blocked"` does not work as you expect.

## A short note on truthy and falsy

JavaScript lets you write `if (name)` without a comparison. It treats some values as false: `""`, `0`, `null` and `undefined`. These are called **falsy**. Most other values are **truthy**.

This is short, but it can surprise you. The number `0` is falsy, even when `0` is a valid result.

> **Tip:** As a beginner, write the full comparison, like `name !== ""`. It is clearer and safer.

## Practice

1. Create the file `exercises/01-programming/decisions.ts`.
2. Make a `const` called `score` with a number. Write an `if` and `else` that print `pass` when the score is 50 or more, and `fail` otherwise.
3. Change the score. Run the file each time. Check that the output changes.
4. Add an `else if` for a third case: print `excellent` when the score is 90 or more. Put it before the `pass` case. Think about why the order matters.
5. Open `exercises/01-programming/04-making-decisions.ts` and run it:

```bash
node exercises/01-programming/04-making-decisions.ts
```

Solve the exercises. Make every line say `OK`.

## Check what you know

1. What is the difference between `=` and `===`?

<details>
<summary>Answer</summary>

`=` stores a value in a variable. `===` compares two values and gives `true` or `false`.

</details>

2. What does `true && false` give?

<details>
<summary>Answer</summary>

`false`. With `&&`, both sides must be true.

</details>

3. What does this print? `const n = 7; if (n > 10) { console.log("A"); } else if (n > 5) { console.log("B"); } else { console.log("C"); }`

<details>
<summary>Answer</summary>

It prints B. The first condition is false. The second is true, so the computer stops there.

</details>

4. Which comparison do you use to check that two values are different?

<details>
<summary>Answer</summary>

`!==`

</details>

## Next step

In the next lesson you put code in functions, so you can name it and use it many times.
