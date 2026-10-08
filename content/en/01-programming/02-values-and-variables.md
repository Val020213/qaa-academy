---
title: Values and variables
duration: 50 min
---

## Goal

In this lesson you store text, numbers and true/false values in variables, and learn to predict what each variable holds after several changes.

- Predict what a variable holds after a series of changes.
- Choose between `const` and `let`, and explain the choice.
- Name a variable so that a reader needs no comment.
- Build a message from several values with a template literal.

## Values

A **value** is a piece of data your program works with. Here you will use three kinds of value. You can try them with `console.log`.

```ts
console.log("Rex")
console.log(3)
console.log(true)
```

This prints:

```text
Rex
3
true
```

The first one is **text**. Text goes inside quotes. Programmers call text a **string**.

The second one is a **number**. Numbers have no quotes.

The third one is a **boolean**. It is either `true` or `false`, and it answers a yes or no question, like "is Rex hungry?".

## Variables

A **variable** is a name for a value.

```ts
const dogName = "Rex"
console.log(dogName)
```

This prints:

```text
Rex
```

Read the first line like this: create a variable called `dogName` and give it this text. The `=` sign here means "store". It does not mean "equal" as in maths.

You can use the variable many times. If the value changes, you change it in one place.

### A variable keeps a result

A variable keeps the value that was calculated at that moment, not the formula. Look at this program:

```ts
let side = 4
const area = side * side
side = 5
console.log(area)
```

It prints `16`. The line `const area = side * side` does the maths once: it reads `side`, which is 4, calculates 16, and stores the number 16. After that, `side = 5` changes only `side`, and `area` still holds 16.

![The calculation result is stored. Changing side afterwards leaves area at 16.](/images/01-stored-result.en.svg)

If you want the new area, you must calculate it again:

```ts
let side = 4
let area = side * side
side = 5
area = side * side
console.log(area)
```

This prints `25`.

## const and let

In this course we declare variables in two ways.

`const` declares a variable that you cannot assign another value to. Use it by default.

`let` makes a variable that can change. Use it only when the value must change.

```ts
const dogAge = 3
dogAge = 4
console.log(dogAge)
```

The program stops at line 2 with an error that says `Assignment to constant variable`. You cannot give a new value to a `const`. Line 3 never runs.

Now the same idea with `let`:

```ts
let dogAge = 3
console.log(dogAge)
dogAge = 4
console.log(dogAge)
```

This prints:

```text
3
4
```

Notice that you write `let` only once. To change the value later, write the name and `=`.

Why not use `let` everywhere? Because `const` tells the reader the variable is not reassigned, and when they see `let` they know to watch for a change.

> **Careful:** You may see `var` in old code on the internet. Never use `var`. It has confusing rules. Use `const` or `let`.

## Naming variables

Choose a name that says what the value is for. A good name saves you from writing a comment: `const t = 5 * 7` says nothing, and `const cookingMinutes = servings * minutesPerServing` explains itself.

This course's conventions:

- Use English words.
- Start with a lowercase letter.
- Do not use spaces. Write the next word with a capital letter: `dogName`, `ticketPrice`. This style is called **camelCase**.
- Names are case sensitive. `score` and `Score` are two different names.

![In camelCase, each capital letter is a hump.](/images/camel-case.en.svg)

Good names: `dogAge`, `squareArea`, `playlistLength`.

Bad names: `x`, `data`, `thing2`. They do not tell you what is inside.

## Basic maths

You can do maths with numbers. The signs are `+`, `-`, `*` (times) and `/` (divide).

```ts
const side = 6
const squareArea = side * side
const perimeter = side * 4
console.log(squareArea)
console.log(perimeter)
console.log(squareArea + perimeter * 2)
```

This prints:

```text
36
24
84
```

Maths follows the usual order: `*` and `/` come before `+` and `-`. Use round brackets to choose the order: `(1 + 2) * 3` is 9.

`Math.PI` is a ready-made value for the number pi. The area of a circle is pi times the radius times the radius:

```ts
const radius = 5
console.log(3.14 * radius * radius)
console.log(Math.PI * radius * radius)
```

This prints:

```text
78.5
78.53981633974483
```

Neither answer is "wrong": one uses a short version of pi, and the other is very close to the real value.

Decimals have a trickier case. Add ten cents and twenty cents:

```ts
console.log(0.1 + 0.2)
```

It prints:

```text
0.30000000000000004
```

This is not a bug in your program or in JavaScript. It is a **rounding error** from floating point representation.

The cause is limited precision. JavaScript's `number` type follows the IEEE 754 64-bit binary format. Base 10 has a similar case with 1/3: with a fixed number of digits, you have to round. In binary, 0.1 and 0.2 do not end either; they are represented by the closest available values. The sum is also rounded to a representable value, which is why it does not exactly match the value JavaScript uses for 0.3.

Not every decimal has this problem. 0.5 and 0.25 are exact, because in binary they are 1/2 and 1/4. Whole numbers are exact too, up to 9,007,199,254,740,992 (2 to the power of 53).

This has two practical consequences:

- A calculation with decimals may not give the exact result you expect. If a test checks that `0.1 + 0.2` is exactly `0.3`, it fails, even though the sum "is right". With decimals you check that the result is very close to the expected one, or you round before you compare.
- When the number is money, a small error is a problem. Store money in the smallest unit, such as cents, as whole numbers.

```ts
const priceInCents = 1999
console.log(priceInCents * 3)
```

This prints `5997`. In this example you divide by 100 only when you show the price to a person.

## Joining text

The `+` sign also joins text.

```ts
const firstPart = "Rex is "
const secondPart = "hungry"
console.log(firstPart + secondPart)
```

This prints:

```text
Rex is hungry
```

Joining many parts with `+` is hard to read. There is a better way.

## Template literals

A **template literal** is text between backticks. The backtick is the `` ` `` key. On many Windows keyboards you press it, then press the space bar.

Inside a template literal, `${...}` puts the value of a variable into the text.

```ts
const dogName = "Rex"
const dogAge = 3
console.log(`${dogName} is ${dogAge} years old`)
```

This prints:

```text
Rex is 3 years old
```

You can also put a calculation inside `${...}`:

```ts
console.log(`${dogName} is ${dogAge * 7} in dog years`)
```

This prints:

```text
Rex is 21 in dog years
```

> **Tip:** Use a template literal whenever you build a message from values.

## Go deeper

### Copying a number to another variable

In `const saved = price`, `price` is a number and JavaScript copies that value into `saved`. The two variables do not stay linked.

```ts
let price = 10
const saved = price
price = 20
console.log(saved, price)
```

This prints:

```text
10 20
```

`saved` kept the old value. Changing `price` later did not change it.

### A variable name and text are not the same thing

Beginners often put quotes around a variable name. Compare these two lines.

```ts
console.log("price")
console.log(price)
```

The first line prints the word `price`, because quotes make text. The second prints the value stored in the variable, here `20`. No quotes means "look up the variable". Quotes mean "this is text".

The same goes for template literals. A normal string in quotes does not fill in values. Only backticks do.

## Practice

1. Create the file `exercises/01-programming/variables.ts`.
2. Make a `const` called `dogName` with a name. Print it.
3. Make a `let` called `mood` with the text `"sleepy"`. Print it. Change it to `"playful"`. Print it again.
4. Make two numbers, `price` and `quantity`, for something you would buy. Print the total with a template literal, like `Total: 60`.
5. Try to change a `const` on purpose. Run the file. Read the error.
6. Open the file `exercises/01-programming/02-values-and-variables.ts`. Run it with this command:

```bash
node exercises/01-programming/02-values-and-variables.ts
```

At first, all five checks say `FAIL`. Solve the exercises one by one. Run the file after each one. Make each check say `OK`.

## Challenge

Write a program that prints a receipt or a score card. Choose your own theme, for example a pet shop or a pizza order.

Create the file `exercises/challenges/values-and-variables.ts`.

It is done when:

- Every number and text that you use more than once is stored in a variable. No number is typed twice.
- The program prints at least five lines, and at least one of them has a total that you calculate (with tax, a discount or a team total).
- Every money amount is printed with exactly two decimals, such as `7.50`, not `7.5`.
- You change one number at the top of the file, run it again, and every line that depends on it is correct.

You will need something this lesson did not teach: how to print a number with a fixed number of decimals. Search for: `javascript toFixed 2 decimals`, `javascript number format 2 decimal places`.

## Think it through

1. What does this code print, and why?

```ts
let score = 10
const bonus = score
score = score + 5
console.log(bonus + score)
```

<details>
<summary>Answer</summary>

It prints `25`. The second line copies the value 10 into `bonus`. The third line changes only `score`, to 15. The last line adds 10 and 15.

</details>

2. This code should print `Hello, Rex`, but it does not. Find the bug.

```ts
const dogName = "Rex"
console.log("Hello, ${dogName}")
```

<details>
<summary>Answer</summary>

It prints `Hello, ${dogName}`. The text uses normal quotes, so the parser reads it as a plain string and `${dogName}` is just characters. A template literal needs backticks: `` `Hello, ${dogName}` ``. The program runs with no error, which is why this bug is easy to miss.

</details>

3. What breaks if you write `let` instead of `const` for every variable in a program?

<details>
<summary>Answer</summary>

If the program does not try to reassign a variable declared with `const`, its output stays the same. What you lose is information: with `let` everywhere, the reader must check every variable for changes. You also lose a safety net. If you reassign a variable by accident, `const` stops the program with an error, and `let` does not.

</details>

## Next step

In the next lesson you learn that every value has a type, and how TypeScript uses types to find mistakes.
