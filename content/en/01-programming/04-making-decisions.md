---
title: Making decisions
duration: 50 min
---

## Goal

In this lesson you make your program choose what to do based on a value, and you learn to check that the rule it chose is the one you meant.

- Predict which branch of an `if` chain runs for a given value.
- Choose the right order for several conditions.
- Combine conditions with `&&`, `||` and `!`, and find the case where a rule is wrong.
- Test a decision at its boundary values.

## Comparisons

A **comparison** asks a question about two values. The answer is always a boolean: `true` or `false`.

```ts
console.log(5 > 3)
console.log("rain" === "rain")
console.log("rain" === "sun")
```

This prints:

```text
true
true
false
```

The type checker can flag comparisons between different fixed strings, such as `"rain" === "sun"`, because it already knows they cannot match. Node.js runs them; in this example the comparison between different strings produces `false`.

These are the comparison signs:

| Sign  | Meaning                  |
| ----- | ------------------------ |
| `===` | is equal to              |
| `!==` | is not equal to          |
| `>`   | is greater than          |
| `<`   | is less than             |
| `>=`  | is greater than or equal |
| `<=`  | is less than or equal    |

> **Careful:** `=` stores a value. `===` compares two values. Do not mix them up. `==` can convert values before comparing them. Use `===` and `!==`, which compare without that conversion.

If you mix the signs up, the program does not warn you:

```ts
let lightColor = "green"

if (lightColor = "red") {
  console.log("stop")
}
console.log(lightColor)
```

This prints:

```text
stop
red
```

The light was green. The program says "stop", and now the light is red. The line `lightColor = "red"` did not ask a question. The assignment stores `"red"` and also produces that text as its result. Since it is not empty, the condition treats it as true. There was no error message.

JavaScript compares two strings from left to right by their UTF-16 codes, even when they look like numbers.

```ts
console.log(10 > 9)
console.log("10" > "9")
```

This prints:

```text
true
false
```

The text `"10"` starts with `1`, and `"9"` starts with `9`. The first differing code decides, and `1` comes before `9`. Numbers are compared as numbers. Text is compared as text.

Capital letters count too:

```ts
console.log("Passed" === "passed")
```

This prints `false`.

## if

An **if** statement runs code when JavaScript treats its condition's value as true. The code goes inside curly brackets `{ }`.

```ts
const isRaining = true

if (isRaining) {
  console.log("Take an umbrella")
}
console.log("Leave the house")
```

This prints:

```text
Take an umbrella
Leave the house
```

If `isRaining` was `false`, the first message would not print. Only `Leave the house` would print.

## else

Use **else** when JavaScript treats the condition as false.

```ts
const temperature = 28

if (temperature > 25) {
  console.log("Go to the beach")
} else {
  console.log("Stay at home")
}
```

This prints:

```text
Go to the beach
```

## else if

Use **else if** when you have more than two choices. Node.js evaluates the conditions from the top, runs the block of the first one that is true, and skips the rest of the chain.

```ts
const temperature = 12

if (temperature < 0) {
  console.log("coat and gloves")
} else if (temperature < 15) {
  console.log("jacket")
} else {
  console.log("t-shirt")
}
```

This prints:

```text
jacket
```

Here `temperature < 0` is false, so Node.js moves on to the next condition. Then `temperature < 15` is true, so it runs that block, prints `jacket` and skips the rest of the chain. It never reaches the `else`.

This is why the order matters. A video game gives a medal at the end of a level: bronze from 50 points, silver from 70 and gold from 90. Each condition is correct on its own, but they are in the wrong order:

```ts
const points = 95

if (points >= 50) {
  console.log("bronze medal")
} else if (points >= 70) {
  console.log("silver medal")
} else if (points >= 90) {
  console.log("gold medal")
}
```

This prints `bronze medal`. A score of 95 is 50 or more, so the first condition is true, Node.js runs that block and skips the rest of the chain. It never evaluates silver or gold, and a player with 95 points gets the same medal as a player with 50.

The fix is to put the most demanding condition first:

```ts
const points = 95

if (points >= 90) {
  console.log("gold medal")
} else if (points >= 70) {
  console.log("silver medal")
} else if (points >= 50) {
  console.log("bronze medal")
}
```

Now it prints `gold medal`. Here the ranges overlap: 95 satisfies all three conditions. Check the highest threshold first to award the right medal.

## Logical operators

You can join conditions with three **logical operators**. With boolean values:

`&&` means AND. Both sides must be true.

`||` means OR. At least one side must be true.

`!` means NOT. It turns `true` into `false` and `false` into `true`.

```ts
const hasTicket = true
const hasPassport = false

console.log(hasTicket && hasPassport)
console.log(hasTicket || hasPassport)
console.log(!hasPassport)
```

This prints:

```text
false
true
true
```

Here is a weather plan that uses `&&` and `!`:

```ts
const temperature = 25
const isRaining = true

if (temperature > 20 && !isRaining) {
  console.log("beach")
} else if (temperature > 20) {
  console.log("cafe")
} else {
  console.log("home")
}
```

It is warm, but it rains. The first condition needs warm AND not raining, so it is false. The second is only about the warm weather, so it is true:

```text
cafe
```

And one with `||`:

```ts
const day = "Saturday"

if (day === "Saturday" || day === "Sunday") {
  console.log("weekend")
}
```

This prints:

```text
weekend
```

You write the full comparison on both sides. `day === "Saturday" || "Sunday"` does not work as you expect; the "Go deeper" section explains why.

## Boundary values

A free-shipping rule from 50 must exclude 49 and include 50 and 51. Confusing `>` with `>=` changes the result at 50. A **boundary value** is at a rule's edge; test just below, at and above it.

## Truthy and falsy

JavaScript lets you write `if (name)` without a comparison. It treats some values as false: `""`, `0`, `null` and `undefined`. These are called **falsy**. Most other values are **truthy**.

This can surprise you with a puppy that is 0 years old:

```ts
const age = 0

if (age) {
  console.log("age is known")
} else {
  console.log("no age given")
}
```

This prints `no age given`. The age is known, and it is 0. The number `0` is falsy, even when `0` is a valid value.

> **Tip:** As a beginner, write the full comparison, like `age !== undefined`. It is clearer and safer.

## Go deeper

### Why `&&` can protect you

JavaScript evaluates `a && b` from left to right. If `a` is falsy, it returns that value without evaluating `b`. If `a` is truthy, it evaluates and returns `b`. This is called **short-circuit** evaluation.

```ts
let userName: string | undefined

if (userName !== undefined && userName.length > 0) {
  console.log("has name")
} else {
  console.log("no name")
}
```

This prints:

```text
no name
```

Reading `userName.length` would fail if `userName` were `undefined`. It never runs, because the first part is false. The order of the two parts matters.

### Why `day === "Saturday" || "Sunday"` is always truthy

`===` has higher precedence than `||`, so the parser builds the expression as `(day === "Saturday") || "Sunday"`: two expressions joined by `||`. `||` returns the first value if it is truthy; otherwise it returns the second. Here it returns `true` when `day` is `"Saturday"`, or the text `"Sunday"` otherwise. Both are truthy, so the `if` always runs its block.

```ts
const day = "Monday"

if (day === "Saturday" || "Sunday") {
  console.log("weekend")
}
```

This prints `weekend`, even though the day is `Monday`.

## Practice

1. Create the file `exercises/01-programming/decisions.ts`.
2. Make a `const` called `score` with a number. Write an `if` and `else` that print `pass` when the score is 50 or more, and `fail` otherwise.
3. Change the score and run the file each time, with 49, 50 and 51. Check that 49 prints `fail`, and that 50 and 51 print `pass`.
4. Add an `else if` for a third case: print `excellent` when the score is 90 or more. Put it before the `pass` case.
5. Open `exercises/01-programming/04-making-decisions.ts` and run it:

```bash
node exercises/01-programming/04-making-decisions.ts
```

Solve the exercises. Make each check say `OK`.

## Challenge

Build the rules of a board game turn. Every 3rd turn is a "bonus turn". Every 5th turn is a "penalty turn". A turn that is both is a "super turn". Every other turn is a "normal turn". You can change the theme: a card game, a school bell.

Create the file `exercises/challenges/making-decisions.ts`. Store the turn number in a `const` at the top and print the name of the turn.

It is done when:

- Turn `7` prints `normal turn`, turn `9` prints `bonus turn`, and turn `10` prints `penalty turn`.
- Turn `15` prints `super turn`, and turn `30` prints `super turn`.
- You ran the file at least once for each of these five values, by changing the one `const`.
- A comment explains what happens to turn 15 if you move the super turn check to the end, and you tested your answer.

You will need something this lesson did not teach: a way to ask "does this number divide exactly by 3?". Search for: `javascript remainder operator`, `javascript modulo`.

## Think it through

1. What does this print, and why?

```ts
const temperature = 20
const isRaining = false

if (temperature > 20 && !isRaining) {
  console.log("beach")
} else if (temperature > 20) {
  console.log("cafe")
} else {
  console.log("home")
}
```

<details>
<summary>Answer</summary>

It prints `home`. There is no rain, but `20 > 20` is false, because 20 is not greater than 20. So both the first and the second condition are false, and Node.js runs the `else`. A person would say "20 degrees is warm", but the code only follows the sign you wrote.

</details>

2. This game should print `custom level` only when the level is neither `easy` nor `hard`. It prints it for `easy` too. Find the bug.

```ts
const level = "easy"

if (level !== "easy" || level !== "hard") {
  console.log("custom level")
}
```

<details>
<summary>Answer</summary>

With `||`, one true side is enough. The level `easy` makes the second part true, because it is not `hard`. Every text is different from at least one of the two words, so the condition is always true. Use `&&`: both sides must be true. Another way to see it: "not (easy or hard)" is the same as "not easy and not hard".

</details>

3. A pet shelter writes `if (age)` to check that a dog has an age. A puppy that is 0 years old gets the message "no age given". Why, and what would you write instead?

<details>
<summary>Answer</summary>

`0` is falsy, so `if (age)` treats it in the same way as a missing value. The age is known, and it is zero. Write the question you really mean: `age !== undefined` if the age may be missing.

</details>

## Next step

In the next lesson you put code in functions, so you can name it and use it many times.
