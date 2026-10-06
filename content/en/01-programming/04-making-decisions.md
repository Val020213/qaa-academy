---
title: Making decisions
summary: Compare values and use if, else if and else so your program can choose what to do, and learn why the order of the choices matters.
duration: 70 min
---

## Start with a puzzle

A video game gives a medal at the end of a level. Bronze is for 50 points or more. Silver is for 70 or more. Gold is for 90 or more.

```ts
const points = 95;

if (points >= 50) {
  console.log("bronze medal");
} else if (points >= 70) {
  console.log("silver medal");
} else if (points >= 90) {
  console.log("gold medal");
}
```

A player scores 95. Which medal does the program print? Each condition is correct on its own. The rules match the story. Still, one player may be very unhappy.

Think about how the computer walks through the lines. Does it read all three conditions, or does it stop earlier?

Write down your guess before you read on.

## Goal

- Predict which branch of an `if` chain runs for a given value.
- Choose the right order for several conditions.
- Combine conditions with `&&`, `||` and `!`, and find the case where a rule is wrong.
- Test a decision at its boundary values.

## Comparisons

A program often needs to ask a question. Is it raining? Is the score over 50?

A **comparison** asks such a question. The answer is always a boolean: `true` or `false`.

```ts
console.log(5 > 3);
console.log("rain" === "rain");
console.log("rain" === "sun");
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

What happens if you do mix them up? Try this traffic light. Guess before you run it.

```ts
let lightColor = "green";

if (lightColor = "red") {
  console.log("stop");
}
console.log(lightColor);
```

This prints:

```text
stop
red
```

The light was green. The program says "stop", and now the light is red. The line `lightColor = "red"` did not ask a question. It stored `"red"`, and the stored text counts as true. There was no error message. This is one reason why you must type three equal signs.

Another surprise: text is compared letter by letter, even when it looks like a number.

```ts
console.log(10 > 9);
console.log("10" > "9");
```

This prints:

```text
true
false
```

The text `"10"` starts with `1`, and `"9"` starts with `9`. The first letter decides, and `1` comes before `9`. Numbers are compared as numbers. Text is compared as text.

## if

An **if** statement runs some code only when a condition is `true`. The code goes inside curly brackets `{ }`.

```ts
const isRaining = true;

if (isRaining) {
  console.log("Take an umbrella");
}
console.log("Leave the house");
```

This prints:

```text
Take an umbrella
Leave the house
```

If `isRaining` was `false`, the first message would not print. Only `Leave the house` would print.

## else

Use **else** to run code when the condition is `false`.

```ts
const temperature = 28;

if (temperature > 25) {
  console.log("Go to the beach");
} else {
  console.log("Stay at home");
}
```

This prints:

```text
Go to the beach
```

## else if

Use **else if** when you have more than two choices. The computer checks the conditions from the top. It runs the first block that is true, and skips the rest.

```ts
const temperature = 12;

if (temperature < 0) {
  console.log("coat and gloves");
} else if (temperature < 15) {
  console.log("jacket");
} else {
  console.log("t-shirt");
}
```

This prints:

```text
jacket
```

Here `temperature < 0` is false, so the computer goes on. Then `temperature < 15` is true, so it prints `jacket` and stops. It never looks at the `else`.

The order matters. Look at the same rules in the wrong order:

```ts
const temperature = -5;

if (temperature < 15) {
  console.log("jacket");
} else if (temperature < 0) {
  console.log("coat and gloves");
}
```

This prints `jacket`. At `-5` degrees, you want a coat. The first condition is also true for `-5`, so the second one is never reached.

### Back to the puzzle

The puzzle prints `bronze medal`. A score of 95 is 50 or more, so the first condition is true and the computer stops. It never checks for silver or gold. A player with 95 points gets the same medal as a player with 50.

Each condition on its own is correct. The mistake is in the order. The fix is to put the most demanding condition first:

```ts
const points = 95;

if (points >= 90) {
  console.log("gold medal");
} else if (points >= 70) {
  console.log("silver medal");
} else if (points >= 50) {
  console.log("bronze medal");
}
```

Now it prints `gold medal`. The rule: in an `else if` chain, the most specific condition goes first.

## Logical operators

You can join conditions. There are three **logical operators**.

`&&` means AND. Both sides must be true.

`||` means OR. At least one side must be true.

`!` means NOT. It turns `true` into `false` and `false` into `true`.

```ts
const hasTicket = true;
const hasPassport = false;

console.log(hasTicket && hasPassport);
console.log(hasTicket || hasPassport);
console.log(!hasPassport);
```

This prints:

```text
false
true
true
```

Here is a weather plan that uses `&&` and `!`:

```ts
const temperature = 25;
const isRaining = true;

if (temperature > 20 && !isRaining) {
  console.log("beach");
} else if (temperature > 20) {
  console.log("cafe");
} else {
  console.log("home");
}
```

Before you read on, decide what it prints. It is warm, but it rains. The first condition needs warm AND not raining, so it is false. The second condition is only about the warm weather, so it is true:

```text
cafe
```

Here is one with `||`:

```ts
const day = "Saturday";

if (day === "Saturday" || day === "Sunday") {
  console.log("weekend");
}
```

This prints:

```text
weekend
```

Notice that you write the full comparison on both sides. `day === "Saturday" || "Sunday"` does not work as you expect.

## A short note on truthy and falsy

JavaScript lets you write `if (name)` without a comparison. It treats some values as false: `""`, `0`, `null` and `undefined`. These are called **falsy**. Most other values are **truthy**.

This is short, but it can surprise you. Think of a puppy that is 0 years old:

```ts
const age = 0;

if (age) {
  console.log("age is known");
} else {
  console.log("no age given");
}
```

This prints `no age given`. The age is known, and it is 0. The number `0` is falsy, even when `0` is a valid value.

> **Tip:** As a beginner, write the full comparison, like `age !== undefined`. It is clearer and safer.

## Go deeper

### Why `&&` can protect you

The computer reads `a && b` from left to right. If `a` is false, the answer is already false. So it does not look at `b`. This is called **short-circuit** evaluation.

```ts
const userName: string | undefined = undefined;

if (userName !== undefined && userName.length > 0) {
  console.log("has name");
} else {
  console.log("no name");
}
```

This prints:

```text
no name
```

`userName.length` would fail on `undefined`. It never runs, because the first part is false. The order of the two parts matters. (`length` is the number of characters in text. You learn more about it in lesson 06.)

### A common wrong idea: "case does not matter" and the `||` mistake

Comparisons are exact. Capital letters count.

```ts
console.log("Passed" === "passed");
```

This prints `false`. In a test, the text on the page and the text in your code must match exactly.

The lesson showed that `day === "Saturday" || "Sunday"` does not work as expected. Here is why. The computer reads it as two separate parts: `day === "Saturday"` and `"Sunday"`. A non-empty text is truthy, so the second part is always true.

```ts
const day = "Monday";

if (day === "Saturday" || "Sunday") {
  console.log("weekend");
}
```

This prints `weekend`, even though the day is `Monday`.

### How it shows up in real QA automation work

A test is a decision at its core. Compare what you expected with what you got. If they differ, the test fails.

```ts
const expected = "Welcome, Ana";
const actual = "Welcome, Luis";

if (actual === expected) {
  console.log("PASS");
} else {
  console.log(`FAIL: expected ${expected} but got ${actual}`);
}
```

This prints:

```text
FAIL: expected Welcome, Ana but got Welcome, Luis
```

Playwright's `expect` does this for you. It also stops the test and prints a clear message. You will write the check once as a function in the next lesson. This is one case of DRY, "Don't Repeat Yourself". You will study it at the end of this module.

### When not to use `if`

Do not put `if` inside a test to hide a different result. A test should follow one clear path. If the test can take two paths, you may not know which one ran, and a failure can hide.

### Boundary values

Most decision mistakes live at the border, not in the middle. A rule "free shipping from 50" can be wrong at 49, 50 and 51, and nowhere else. A **boundary value** is a value at the edge of a rule. When you test a decision, choose values just below, on and just above each border. Later in the course, you will turn these values into rows of test data.

## Practice

1. Create the file `exercises/01-programming/decisions.ts`.
2. Make a `const` called `score` with a number. Write an `if` and `else` that print `pass` when the score is 50 or more, and `fail` otherwise.
3. Change the score. Run the file each time. Check that the output changes. Use 49, 50 and 51.
4. Add an `else if` for a third case: print `excellent` when the score is 90 or more. Put it before the `pass` case. Think about why the order matters.
5. Open `exercises/01-programming/04-making-decisions.ts` and run it:

```bash
node exercises/01-programming/04-making-decisions.ts
```

Solve the exercises. Make every line say `OK`.

## Challenge

Build the rules of a board game turn. Every 3rd turn is a "bonus turn". Every 5th turn is a "penalty turn". A turn that is both is a "super turn". Every other turn is a "normal turn". You can change the world: a card game, a school bell, a bus that has special stops.

Create the file `exercises/challenges/making-decisions.ts`. Store the turn number in a `const` at the top and print the name of the turn.

It is done when:

- Turn `7` prints `normal turn`, turn `9` prints `bonus turn`, and turn `10` prints `penalty turn`.
- Turn `15` prints `super turn`, and turn `30` prints `super turn`.
- You ran the file at least once for each of these five values, by changing the one `const`.
- A comment explains what happens to turn 15 if you move the super turn check to the end, and you tested your answer.

You will need something this lesson did not teach: a way to ask "does this number divide exactly by 3?". Search for: `javascript remainder operator`, `javascript modulo`.

## Think it through

1. A person plans a day. What does this print, and why?

```ts
const temperature = 20;
const isRaining = false;

if (temperature > 20 && !isRaining) {
  console.log("beach");
} else if (temperature > 20) {
  console.log("cafe");
} else {
  console.log("home");
}
```

<details>
<summary>Answer</summary>

It prints `home`. There is no rain, but `20 > 20` is false, because 20 is not greater than 20. So both the first and the second condition are false, and the computer reaches `else`. A person would say "20 degrees is warm". The code only follows the sign you wrote. The value on the border is where this kind of surprise lives.

</details>

2. This game should print `custom level` only when the level is neither `easy` nor `hard`. It prints it for `easy` too. Find the bug.

```ts
const level = "easy";

if (level !== "easy" || level !== "hard") {
  console.log("custom level");
}
```

<details>
<summary>Answer</summary>

With `||`, one true side is enough. The level `easy` makes the second part true, because it is not `hard`. Every text is different from at least one of the two words, so the condition is always true. Use `&&`: both sides must be true. Another way to see it: "not (easy or hard)" is the same as "not easy and not hard".

</details>

3. Two ways to give a grade. Both work for scores from 0 to 100. Which is better, and what would make you choose the other?

```ts
if (score >= 90) {
  console.log("A");
} else if (score >= 80) {
  console.log("B");
} else {
  console.log("C");
}
```

```ts
if (score >= 90) {
  console.log("A");
}
if (score >= 80 && score < 90) {
  console.log("B");
}
if (score < 80) {
  console.log("C");
}
```

<details>
<summary>Answer</summary>

The first is shorter and easier to change, because each border appears once and the chain makes sure that only one block runs. The second states every range in full, so you can read each block alone, in any order. The cost is that the ranges must fit with no gap and no overlap. If you change one border and forget another, a score can get two grades or none. Choose the second only when the blocks are independent and a score may need to match several of them.

</details>

4. A shop says "free shipping from 50". The code is `total >= 50`. The shop changes the rule to "free shipping over 50". What changes in the code, and which total reveals a mistake?

<details>
<summary>Answer</summary>

Change `>=` to `>`. The total of exactly 50 is the value that reveals the mistake, because it is the only one that changes meaning. A total of 40 or 60 gives the same result in both versions. This is why testers choose values on the border: a wrong sign hides everywhere except there.

</details>

5. A pet shelter writes `if (age)` to check that a dog has an age. A puppy that is 0 years old gets the message "no age given". Why, and what would you write instead?

<details>
<summary>Answer</summary>

`0` is falsy, so `if (age)` treats it in the same way as a missing value. The age is known, and it is zero. Write the question you really mean: `age !== undefined` if the age may be missing. The edge case here is zero: the smallest valid number looks like "nothing" to a short check.

</details>

6. A teammate puts an `if` inside a test: "if the banner is on the page, close it, and then continue". Is this a good idea? There is no single right answer. Explain the trade-off.

<details>
<summary>Answer</summary>

It makes the test pass in both situations, so it is less likely to fail for a reason that is not a real bug. The cost is that the test now has two paths, and you do not know which one ran. If the banner disappears by a bug, the test still passes. It depends on what you want to learn. If the banner is part of the requirement, test it in its own test. If it is random noise, such as a cookie notice, handle it in one place, not in every test.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **What is the difference between `==` and `===` in JavaScript, and what is type coercion?**
   - Search for: `javascript == vs === type coercion`
   - Try it: print `0 == ""`, `0 === ""`, `null == undefined`, `null === undefined` and `"1" == 1`. VS Code may underline some of them. Node runs them anyway. Write the reason for each result.
   - A good answer explains: what coercion means, two surprising results of `==`, and why `===` is safer.

2. **What is short-circuit evaluation in JavaScript, and what does `??` do?**
   - Search for: `javascript short-circuit evaluation && || nullish coalescing`
   - Try it: print `"" || "default"`, `0 || "default"` and `0 ?? "default"`. Explain why the last two differ.
   - A good answer explains: how `&&` and `||` stop early, and when `??` is the better choice.

3. **Why do many testing guides say that a test should not contain `if` statements?**
   - Search for: `no conditional logic in tests`
   - Try it: take your game-turn program and write a table of six turns and their expected results. Check each row by running the program. The table, not an `if` inside the test, tells you what is right.
   - A good answer explains: the problem with tests that have several paths, and what to do instead.

## Next step

In the next lesson you put code in functions, so you can name it and use it many times.
