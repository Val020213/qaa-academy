---
title: Arrays and loops
summary: Keep many values in a list, repeat an action for each item with a for...of loop, and learn to find the bug in a loop that gives a wrong answer without an error.
duration: 80 min
---

## Start with a puzzle

A running club writes down three lap times, in seconds. The coach wants the best lap. The best lap is the smallest number. Here is the code.

```ts
const laps = [62, 58, 61];
let best = 0;

for (const lap of laps) {
  if (lap < best) {
    best = lap;
  }
}

console.log(best);
```

What does it print? Is it 58? Is it 62? Something else? The program has no error message. It runs to the end.

Write down your guess before you read on.

## Goal

- Predict what a loop does to a variable in each round.
- Read an item by its index, and say what happens when the index does not exist.
- Choose a good start value for a counter, a sum, a smallest value and a biggest value.
- Find a bug in a loop by shrinking the problem and changing one thing at a time.

## Arrays

An **array** is a list of values in order. You write it with square brackets. The values are separated by commas.

```ts
const dogs = ["Rex", "Mimi", "Luna"];
console.log(dogs);
```

This prints:

```text
[ 'Rex', 'Mimi', 'Luna' ]
```

Each value in the array is an **item**. Node shows text with single quotes here. It is the same text.

An array can hold numbers too:

```ts
const laps = [62, 58, 61];
```

Keep one type in one array. A list of text, or a list of numbers.

## Index

The **index** is the position of an item. Counting starts at 0, not at 1.

Before you run this, guess: what do the two lines print?

```ts
const dogs = ["Rex", "Mimi", "Luna"];
console.log(dogs[0]);
console.log(dogs[2]);
```

This prints:

```text
Rex
Luna
```

The first item is index 0. The second is index 1. The third is index 2.

> **Careful:** The first item is `[0]`, not `[1]`. In a list of 3 items, the last index is 2.

Now guess again. What does this print?

```ts
console.log(dogs[3]);
console.log(dogs[-1]);
```

It prints `undefined` two times. No error. The program does not tell you that the index is wrong. It gives you "no value" and goes on. This is why a wrong index is dangerous: the mistake shows up later, far from where it began.

In this project, the type checker is strict. It treats `dogs[0]` as "a string or `undefined`". You can print it. To use it as a string, you must check first, with an `if`.

```ts
const first = dogs[0];
if (first !== undefined) {
  console.log(first.toUpperCase());
}
```

This prints:

```text
REX
```

`toUpperCase()` is a ready-made function of text. It changes the text to capital letters.

## Length

The **length** of an array is the number of items.

```ts
const dogs = ["Rex", "Mimi", "Luna"];
console.log(dogs.length);
console.log(dogs[dogs.length - 1]);
console.log(dogs.at(-1));
```

This prints:

```text
3
Luna
Luna
```

The last index is always `length - 1`. The `at` function is a shorter way to say the same thing: `at(-1)` means "the last item", `at(-2)` means "the one before it".

## Adding items with push

**push** adds an item to the end of the array.

```ts
const playlist = ["Blue"];
playlist.push("Sunday");
playlist.push("Echo");
console.log(playlist);
```

This prints:

```text
[ 'Blue', 'Sunday', 'Echo' ]
```

You may ask: the array is a `const`, so why can it change? A `const` stops you from giving the name a new array. It does not stop you from changing the items inside.

## Loops

A **loop** repeats code. Use a loop when you need to do the same thing for each item.

The `for...of` loop takes one item at a time.

```ts
const dogs = ["Rex", "Mimi", "Luna"];

for (const dog of dogs) {
  console.log(`Walking ${dog}`);
}
```

This prints:

```text
Walking Rex
Walking Mimi
Walking Luna
```

Read it like this: for each `dog` in `dogs`, run the code in the brackets. In the first round, `dog` is `"Rex"`. In the second round it is `"Mimi"`. In the third it is `"Luna"`.

You choose the name `dog`. Use a name that says what one item is.

### What does a loop do to a list that grows?

Here is an experiment. The loop adds a new item while it runs. What do you expect it to print?

```ts
const queue = ["a", "b"];

for (const item of queue) {
  console.log(item);
  if (item === "a") {
    queue.push("c");
  }
}
```

It prints `a`, `b` and `c`. The loop does not take a photo of the list at the start. It looks at the list again in every round, so it also visits the new item. If you push in every round, the loop never ends. Do not change a list while you loop over it, unless you know exactly why.

## Plan the loop in plain words first

Before you write a loop, write the steps in plain words. This is called **pseudocode**. It is not real code. It is a plan that you can read.

Task: count the rainy days in a week.

```text
start with a count of 0
for each day in the week
  if the day is "rain", add 1 to the count
show the count
```

Now the code is easy to write, because every line of the plan becomes one line of code. Breaking a problem into small steps like this is called **decomposition**.

## Counting in a loop

Use a `let` variable as a counter. Change it inside the loop.

```ts
const weather = ["rain", "sun", "rain", "rain", "cloud"];
let rainyDays = 0;

for (const day of weather) {
  if (day === "rain") {
    rainyDays = rainyDays + 1;
  }
}

console.log(`Rainy days: ${rainyDays}`);
```

This prints:

```text
Rainy days: 3
```

Notice that `rainyDays` starts at 0 before the loop. It is a `let` because it changes.

## Summing in a loop

The same idea adds numbers. Start at 0 and add each number.

```ts
const prices = [2.5, 1.2, 4];
let total = 0;

for (const price of prices) {
  total = total + price;
}

console.log(total);
```

This prints:

```text
7.7
```

Why start at 0? Because adding 0 changes nothing. The start value must be the one that does no harm. For a sum, it is 0.

## The start value is a decision

Look at the puzzle again. For a counter and a sum, 0 is a good start. Is it good for the smallest value too?

Think about it with a rule: the start value must lose against every real item. For "the smallest", the start must be bigger than every lap. For "the biggest", it must be smaller than every item. Zero is not bigger than a lap time.

### Back to the puzzle

The program prints `0`. The variable `best` starts at 0. No lap is smaller than 0, so the `if` is never true, and `best` stays 0. The program has no error. It only gives a wrong answer.

You can find this kind of bug like a scientist. This is **debugging by experiment**: make one guess, run one small test, change one thing at a time. First, shrink the failing case. Does a list with one lap, `[62]`, also print 0? Yes. So the list is not the problem. Then guess: "the start value is the problem". Change only that line:

```ts
const laps = [62, 58, 61];
let best = Infinity;

for (const lap of laps) {
  if (lap < best) {
    best = lap;
  }
}

console.log(best);
```

This prints `58`. `Infinity` is a number bigger than every other number. Another good start is the first item of the list. Both work. Which one is better when the list is empty? You will think about that in the questions.

## Check a list with includes

**includes** asks if a value is in the array. The answer is `true` or `false`.

```ts
const likedSongs = ["Blue", "Echo"];
console.log(likedSongs.includes("Echo"));
console.log(likedSongs.includes("Sunday"));
```

This prints:

```text
true
false
```

Use it with `if` to decide what to do:

```ts
if (likedSongs.includes("Echo")) {
  console.log("Add Echo to the party playlist");
}
```

This prints:

```text
Add Echo to the party playlist
```

What does `likedSongs.includes("echo")` give? Try it. Capital letters count, so the answer is `false`.

## Go deeper

### Why counting starts at 0

The index is the distance from the start of the list. The first item is 0 steps from the start. The second is 1 step away. That is why the last index is `length - 1`. Many programming languages work this way.

### A common wrong idea: "two names are two lists"

In lesson 02, copying a variable made two separate values. With arrays it is different. An array is one object in memory. A name points to it. When you write `const b = a`, both names point to the same list.

```ts
const a = ["x"];
const b = a;
b.push("y");
console.log(a);
```

This prints:

```text
[ 'x', 'y' ]
```

You changed `b`, but `a` changed too. It is one list with two names. To make a real copy, use `slice()`.

```ts
const c = a.slice();
c.push("z");
console.log(a, c);
```

This prints:

```text
[ 'x', 'y' ] [ 'x', 'y', 'z' ]
```

Now `c` is a separate list.

### How it shows up in real QA automation work

This is the one link to testing in this lesson. You often test the same rule with many inputs. A password must have at least 8 characters. Put the inputs in an array and write the check once.

```ts
const passwords = ["", "123", "abcdefgh"];

for (const password of passwords) {
  if (password.length < 8) {
    console.log(`Rejected: "${password}"`);
  } else {
    console.log(`Accepted: "${password}"`);
  }
}
```

This prints:

```text
Rejected: ""
Rejected: "123"
Accepted: "abcdefgh"
```

One body, many inputs. This is DRY, "Don't Repeat Yourself", and the name for this style is data-driven testing. You will study DRY at the end of this module. In Module 4 you will see it in real tests.

### A trade-off

Notice that the message prints the input. When a case fails, you must know which input it was. Also remember that a failure stops a plain loop at the first bad item. The items after it are not checked. Real test tools can run each input as its own test, so one failure does not hide the others.

## Practice

1. Create the file `exercises/01-programming/lists.ts`.
2. Make an array with four dog names, or four names from any world you like. Print the first and the last item.
3. Add a new name with `push`. Print the length.
4. Use `for...of` to print each name with the text `Walking`.
5. Make an array of numbers, for example lap times. Use a loop to print the sum.
6. Open `exercises/01-programming/06-arrays-and-loops.ts` and run it:

```bash
node exercises/01-programming/06-arrays-and-loops.ts
```

Solve the exercises. Make every line say `OK`.

## Challenge

Choose your own world: lap times, daily temperatures, quiz scores, the price of one coffee in ten shops, the age of every animal in a shelter. Write a function `report(values)` that takes a list of numbers and prints one line with the smallest value, the biggest value and the average. Use a loop. Do not use `Math.min` or `Math.max`.

Create the file `exercises/challenges/arrays-and-loops.ts`. Run it with `node exercises/challenges/arrays-and-loops.ts`.

It is done when:

- Your function prints a line like `min 58.9, max 70.25, average 62.3` for a list of at least five numbers.
- It also works when the smallest number is negative, for example `[-5, -2, -9]`.
- For an empty list it prints a clear message such as `No data`, and not `Infinity` or `NaN`.
- The average is shown with one digit after the decimal point.
- `pnpm typecheck` shows no error for your file.

You will need something this lesson did not teach: how to show a number with a fixed count of digits after the decimal point. Search for `javascript toFixed`.

## Think it through

1. Predict the output and say why.

```ts
const scores = [10, 20];
let total = 0;

for (const score of scores) {
  total = score;
}

console.log(total);
```

<details>
<summary>Answer</summary>

It prints `20`. The line `total = score` replaces the total in every round. It does not add. In round one the total is 10. In round two it becomes 20, and the loop ends. To sum, you write `total = total + score`. The first version is a very common slip because the two lines look almost the same.

</details>

2. This code should count the rainy days. It prints 0 although two days were rainy. Find the bug.

```ts
const week = ["rain", "rain", "sun"];
let rainy = 0;

for (const day of week) {
  rainy = 0;
  if (day === "rain") {
    rainy = rainy + 1;
  }
}
console.log(rainy);
```

<details>
<summary>Answer</summary>

The line `rainy = 0;` is inside the loop. It resets the counter in every round. The last day is `sun`, so the counter ends at 0. Move the start value, `let rainy = 0;`, before the loop only, and delete the reset. A good way to find this: print `rainy` at the end of each round and watch it fall back to 0.

</details>

3. Both lines give the last dog of a list. Which is better here, and what would make you choose the other?

```ts
const lastA = dogs[dogs.length - 1];
const lastB = dogs.at(-1);
```

<details>
<summary>Answer</summary>

Version B is better when you read the code. `at(-1)` says "the last item" and has no `length - 1` that you can get wrong. Both give `undefined` for an empty list. You would choose version A if your code must run in a very old program that does not know `at`, or if your team already uses one style everywhere and you want the code to look the same. Reading speed matters more than saving a few letters.

</details>

4. What happens with this code when the list is empty? What would you want to happen instead?

```ts
const lapTimes: number[] = [];
let total = 0;

for (const lap of lapTimes) {
  total = total + lap;
}

console.log(total / lapTimes.length);
```

<details>
<summary>Answer</summary>

It prints `NaN`, which means "not a number". The loop does nothing, so the total is 0. Then 0 divided by 0 is not a number. The program does not stop and gives no error. You want to check the length first with an `if`, and print a clear message such as "No laps yet". The edge case, an empty list, must be a decision that you make, not an accident.

</details>

5. Explain to a teammate, in three sentences and without using the word "zero", why the last index of a list is `length - 1`.

<details>
<summary>Answer</summary>

A good answer could be: the index tells how many steps you walk from the first item. The first item needs no steps, so it is at index 0. A list of 3 items has its last item 2 steps from the start, so the last index is the length minus 1. If your answer said "the position" without "the steps from the start", it may feel right but does not explain the reason. Try a ruler: the first line is at the start, not at 1.

</details>

6. A teammate says: "Always make a copy of a list with `slice()` before you push to it." Is that always right?

<details>
<summary>Answer</summary>

There is no single answer. A copy protects other names that point to the same list, so nobody gets a surprise. But a copy costs a little memory and time, and it can hide the fact that two parts of your program share data on purpose. If the list is only yours, inside one function, a copy adds noise. If you received the list from another part of the program, a copy is safer. It depends on who else uses the list.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **Why do most programming languages count from 0, and which languages count from 1?**
   - Search for: `zero-based indexing why`
   - Try it: in a file, make an array of five items. Print `items[0]`, `items[5]` and `items.at(-2)`. Write down which line you could not predict.
   - A good answer explains: what an index means, the reason about distance from the start, and one language that starts at 1.

2. **What is the difference between `for...of`, `for...in` and `forEach` in JavaScript?**
   - Search for: `for of vs for in vs forEach javascript`
   - Try it: loop over `["a", "b"]` with all three. Print what you get in each round. Then try to put `await` or `break` inside each one.
   - A good answer explains: what each one gives you in each round, and which one to use for arrays.

3. **Why can adding to a list inside a loop over the same list be dangerous?**
   - Search for: `modify array while iterating javascript`
   - Try it: change the `queue` experiment so that it pushes in every round. Add a line that stops it after 10 rounds, so your computer does not freeze.
   - A good answer explains: what the loop sees in each round, and one safer way to build the new list.

## Next step

In the next lesson you group related values together in objects, for example the name, age and weight of one dog.
