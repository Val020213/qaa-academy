---
title: Values and variables
summary: Store text, numbers and true/false values in variables, and find out what a variable remembers and what it forgets.
duration: 70 min
---

## Start with a puzzle

In a spreadsheet, you type `=A1*A1` in cell B1. When you change A1, B1 changes too. Now look at the same idea in code. A square has a side and an area.

```ts
let side = 4;
const area = side * side;
side = 5;
console.log(area);
```

What does the terminal print? Two answers are tempting. One is `16`. The other is `25`, because the spreadsheet would update.

Think about what the computer does at each line. Does `area` hold a number, or does it hold a formula that it calculates again each time?

Write down your guess before you read on.

## Goal

- Predict what a variable holds after a series of changes.
- Choose between `const` and `let`, and explain the choice.
- Name a variable so that a reader needs no comment.
- Build a message from several values with a template literal.

## Values

A **value** is a piece of data. Your program works with values all the time.

There are three basic kinds. Think of a dog: it has a name, an age and a yes/no fact, like "is hungry". You can try them with `console.log`.

```ts
console.log("Rex");
console.log(3);
console.log(true);
```

This prints:

```text
Rex
3
true
```

The first one is **text**. Text goes inside quotes. Programmers call text a **string**.

The second one is a **number**. Numbers have no quotes.

The third one is a **boolean**. It is either `true` or `false`. It answers a yes or no question, like "is Rex hungry?".

## Variables

A **variable** is a name for a value. It works like a label on a box. You put a value in the box and use the label to find it later.

```ts
const dogName = "Rex";
console.log(dogName);
```

This prints:

```text
Rex
```

Read the first line like this: create a variable called `dogName` and give it this text. The `=` sign here means "store". It does not mean "equal" as in maths.

You can use the variable many times. If the value changes, you change it in one place.

### Back to the puzzle

The puzzle prints `16`. The line `const area = side * side;` does the maths once, at that moment. It reads `side`, which is 4, calculates 16, and stores the number 16. After that, `area` knows nothing about `side`.

Later, `side = 5` changes only the box called `side`. The box called `area` still holds 16.

A spreadsheet cell keeps a formula. A variable keeps a result. If you want the new area, you must calculate it again:

```ts
let side = 4;
let area = side * side;
side = 5;
area = side * side;
console.log(area);
```

This prints `25`.

## const and let

There are two ways to make a variable.

`const` makes a variable that cannot change. Use it by default.

`let` makes a variable that can change. Use it only when the value must change.

Before you read the result, guess: what happens in this program?

```ts
const dogAge = 3;
dogAge = 4;
console.log(dogAge);
```

The program stops at line 2 with an error that says `Assignment to constant variable`. You cannot give a new value to a `const`. Line 3 never runs.

Now the same idea with `let`:

```ts
let dogAge = 3;
console.log(dogAge);
dogAge = 4;
console.log(dogAge);
```

This prints:

```text
3
4
```

Notice that you write `let` only once. To change the value later, write the name and `=`.

Why not use `let` everywhere? Because `const` tells the reader "this never changes". When you see `let`, you know to watch for a change. The word is a small piece of information.

> **Careful:** You may see `var` in old code on the internet. Never use `var`. It has confusing rules. Use `const` or `let`.

## Naming variables

Choose a name that says what the value is for. A good name saves you from writing a comment.

Rules:

- Use English words.
- Start with a lowercase letter.
- Do not use spaces. Write the next word with a capital letter: `dogName`, `ticketPrice`. This style is called **camelCase**.
- Names are case sensitive. `score` and `Score` are two different names.

Good names: `dogAge`, `squareArea`, `playlistLength`.

Bad names: `x`, `data`, `thing2`. They do not tell you what is inside.

Here is a test of a name. Read this line aloud to a friend: `const t = 5 * 7;`. Your friend cannot understand it. Now read `const cookingMinutes = servings * minutesPerServing;`. Your friend can.

## Basic maths

You can do maths with numbers. The signs are `+`, `-`, `*` (times) and `/` (divide).

```ts
const side = 6;
const squareArea = side * side;
const perimeter = side * 4;
console.log(squareArea);
console.log(perimeter);
console.log(squareArea + perimeter * 2);
```

This prints:

```text
36
24
84
```

Maths follows the usual order: `*` and `/` come before `+` and `-`. Use round brackets to choose the order: `(1 + 2) * 3` is 9.

A circle needs the number pi. `Math.PI` is a ready-made value for it. The area of a circle is pi times the radius times the radius:

```ts
const radius = 5;
console.log(3.14 * radius * radius);
console.log(Math.PI * radius * radius);
```

This prints:

```text
78.5
78.53981633974483
```

Two answers for the same circle. Neither is "wrong". One is a short version of pi, and the other is very close to the real value.

Now try this with money. A friend adds ten cents and twenty cents. What do you expect?

```ts
console.log(0.1 + 0.2);
```

It prints:

```text
0.30000000000000004
```

This is not a bug in your program. Computers keep numbers in a form that cannot store 0.1 exactly. When the number is a price, a small error is a problem. A safe habit: keep money in the smallest unit, such as cents, as whole numbers.

```ts
const priceInCents = 1999;
console.log(priceInCents * 3);
```

This prints `5997`. You divide by 100 only when you show the price to a person.

## Joining text

The `+` sign also joins text.

```ts
const firstPart = "Rex is ";
const secondPart = "hungry";
console.log(firstPart + secondPart);
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
const dogName = "Rex";
const dogAge = 3;
console.log(`${dogName} is ${dogAge} years old`);
```

This prints:

```text
Rex is 3 years old
```

You can also put a calculation inside `${...}`:

```ts
console.log(`${dogName} is ${dogAge * 7} in dog years`);
```

This prints:

```text
Rex is 21 in dog years
```

> **Tip:** Use a template literal whenever you build a message from values.

## Go deeper

### A variable keeps its own copy of a value

When you write `const saved = price;`, the computer copies the value into `saved`. The two variables do not stay linked. This is the same thing you saw in the puzzle.

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

Do not make a variable for everything. A name like `const zero = 0;` adds nothing. Make a variable when the value is used more than once, or when the name explains something that the value does not. This is the idea of **KISS**: keep it simple. Extra names are extra things to read.

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

At the start every line says `FAIL`. Solve the exercises one by one. Run the file after each one. Make every line say `OK`.

## Challenge

Write a program that prints a receipt or a score card. Choose your own world: a pet shop, a pizza order, a football match, a music festival.

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
let score = 10;
const bonus = score;
score = score + 5;
console.log(bonus + score);
```

<details>
<summary>Answer</summary>

It prints `25`. The second line copies the value 10 into `bonus`. The third line changes only `score`, to 15. The last line adds 10 and 15. If a variable were linked to the other one, you would see 30.

</details>

2. This code should print `Hello, Rex`, but it does not. Find the bug.

```ts
const dogName = "Rex";
console.log("Hello, ${dogName}");
```

<details>
<summary>Answer</summary>

It prints `Hello, ${dogName}`. The text uses normal quotes, so the computer treats `${dogName}` as plain characters. A template literal needs backticks: `` `Hello, ${dogName}` ``. The program runs with no error, which is why this bug is easy to miss.

</details>

3. Two ways to price a shirt with 21% tax. Both work. Which is better, and what would make you choose the other?

```ts
const taxRate = 0.21;
const total = price * (1 + taxRate);
```

```ts
const total = price * 1.21;
```

<details>
<summary>Answer</summary>

The first is better when the tax rate appears in more than one place or may change. The name `taxRate` explains the 0.21, and you change it in one place. The second is shorter and fine for a quick test in a file that you will throw away. The better choice depends on how long the code lives and how many places use the number.

</details>

4. What breaks if you write `let` instead of `const` for every variable in a program?

<details>
<summary>Answer</summary>

Nothing breaks when you run it. The program gives the same output. What you lose is information. With `const`, a reader knows the value never changes. With `let` everywhere, the reader must check every variable for changes. You also lose a safety net: if you change a value by accident, `const` stops the program with an error, and `let` does not.

</details>

5. A shop program adds `0.1 + 0.2` euros and prints `0.30000000000000004`. Why does this happen, and how would you store prices to avoid it?

<details>
<summary>Answer</summary>

Computers store decimal fractions like 0.1 in a form that is not exact, so a small error appears after some maths. Whole numbers do not have this problem. Store prices as cents, for example `10` and `20`, add them to get `30`, and divide by 100 only when you show the value. You can also round the printed value to two decimals, but then the stored value is still not exact.

</details>

6. Explain `count = count + 1` to a teammate in three sentences, without the word "equal". The teammate knows only school maths, where `x = x + 1` is impossible.

<details>
<summary>Answer</summary>

A good answer: "In code, the sign `=` means store, not compare. The computer first works out the right side: it takes the value that `count` has now and adds 1. Then it puts the result back into `count`, so the box holds the new number." The key reasoning is that the right side is calculated first, and the left side only receives the result. Reading it as "is the same as" is what makes it look impossible.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **What is the difference between `var`, `let` and `const`, and why do style guides say to avoid `var`?**
   - Search for: `javascript var let const difference scope`
   - Try it: write `if (true) { var a = 1; let b = 2; }`, then print `a` and print `b` after the block. Run it and read what happens to each.
   - A good answer explains: how each one handles scope and re-assigning, and the main problem with `var`.

2. **What are camelCase, snake_case, PascalCase and kebab-case, and where is each one used?**
   - Search for: `camelCase snake_case PascalCase kebab-case`
   - Try it: write `const my-dog = "Rex";` and run it. Then rewrite the name in each of the four styles and find which ones the language accepts.
   - A good answer explains: each style with one example, and why one of them cannot be a variable name.

3. **What is a magic number or magic string in code, and why does it make code hard to change?**
   - Search for: `magic number magic string programming`
   - Try it: open your challenge file. Find every number or text that you typed more than once. Give each one a name. Change one value and check that the output changes everywhere.
   - A good answer explains: a definition, one example, and how a named constant fixes it.

## Next step

In the next lesson you learn that every value has a type, and how TypeScript uses types to find mistakes.
