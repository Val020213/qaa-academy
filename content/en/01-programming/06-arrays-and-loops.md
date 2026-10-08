---
title: Arrays and loops
duration: 60 min
---

## Goal

In this lesson you keep many values in a list and repeat an action for each one with a loop. You also learn to find the bug in a loop that gives a wrong answer without showing any error.

- Read an item by its index, and say what happens when the index does not exist.
- Predict what a loop does to a variable in each round.
- Choose a good start value for a counter, a sum, a smallest value and a biggest value.
- Find a bug in a loop by shrinking the problem and changing one thing at a time.

## Arrays

An **array** is a list of values in order. You write it with square brackets, and the values are separated by commas.

```ts
const dogs = ["Rex", "Mimi", "Luna"]
console.log(dogs)
```

This prints:

```text
[ 'Rex', 'Mimi', 'Luna' ]
```

Each value in the array is an **item**. Node shows text with single quotes; it is the same text.

An array can hold numbers too:

```ts
const laps = [62, 58, 61]
```

Keep one type in each array: a list of text, or a list of numbers.

## Index

The **index** is the position of an item. Counting starts at 0, not at 1.

```ts
const dogs = ["Rex", "Mimi", "Luna"]
console.log(dogs[0])
console.log(dogs[2])
```

This prints:

```text
Rex
Luna
```

The first item is index 0, the second is index 1 and the third is index 2. In a list of 3 items, the last index is 2.

Counting starts at 0 because of how a list is stored in memory. Its items sit in slots of the same size, one next to the other. The variable `dogs` does not contain the items: it contains a **pointer**, which is the memory address where the first slot starts. To reach an item, the address is calculated as address = start + index × slot size. So the index is how many slots to skip from the start, and for the first item there are none to skip.

![An array in memory: the variable holds the address of the first slot, and the index says how many slots to skip.](/images/zero-index.en.svg)

The addresses in the drawing are examples. Languages such as C work exactly this way, and that is where the convention of starting at 0 comes from. The JavaScript engine stores normal lists the same way, although it never shows you the addresses.

If you ask for an index that does not exist, there is no error:

```ts
console.log(dogs[3])
console.log(dogs[-1])
```

It prints `undefined` twice. The program does not tell you the index is wrong; it gives you "no value" and goes on. This is why a wrong index is dangerous: the mistake shows up later, far from where it began.

In this project, the type checker is strict. It treats `dogs[0]` as "a string or `undefined`". You can print it, but to use it as a string you must check it first with an `if`.

```ts
const first = dogs[0]
if (first !== undefined) {
  console.log(first.toUpperCase())
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
const dogs = ["Rex", "Mimi", "Luna"]
console.log(dogs.length)
console.log(dogs[dogs.length - 1])
console.log(dogs.at(-1))
```

This prints:

```text
3
Luna
Luna
```

The last index is always `length - 1`. The `at` function is a shorter way to say the same thing: `at(-1)` is the last item and `at(-2)` is the one before it.

## Adding items with push

**push** adds an item to the end of the array.

```ts
const playlist = ["Blue"]
playlist.push("Sunday")
playlist.push("Echo")
console.log(playlist)
```

This prints:

```text
[ 'Blue', 'Sunday', 'Echo' ]
```

The array is a `const` and still changes: a `const` stops you from giving the name a new array, but not from changing the items inside.

## Loops

A **loop** repeats code. Use it when you need to do the same thing for each item. The `for...of` loop takes one item at a time.

```ts
const dogs = ["Rex", "Mimi", "Luna"]

for (const dog of dogs) {
  console.log(`Walking ${dog}`)
}
```

This prints:

```text
Walking Rex
Walking Mimi
Walking Luna
```

Read it like this: for each `dog` in `dogs`, run the code in the braces. In the first round `dog` is `"Rex"`, in the second it is `"Mimi"` and in the third it is `"Luna"`. You choose the name `dog`; use one that says what a single item is.

### The for loop with an index

There is an older way to write a loop, where you keep the index yourself. Three parts go between the parentheses, separated by `;`, the one place in this module where you type a semicolon:

```ts
const dogs = ["Rex", "Mimi", "Luna"]

for (let i = 0; i < dogs.length; i++) {
  console.log(`${i}: Walking ${dogs[i]}`)
}
```

- `let i = 0` runs once, before the loop starts: it creates the counter at the first index.
- `i < dogs.length` is the condition. It is evaluated before every turn, and the loop ends when it is false.
- `i++` runs at the end of every turn. It is a short way to write `i = i + 1`.

This prints:

```text
0: Walking Rex
1: Walking Mimi
2: Walking Luna
```

Use `for...of` when you only need each item, because there is no counter to get wrong. Use the loop with an index when you need the position, as here to number the lines. The typical mistake with this form is to write `i <= dogs.length`: the loop makes one turn too many and `dogs[3]` is `undefined`.

### A loop over a list that grows

Here the loop adds a new item while it runs:

```ts
const queue = ["a", "b"]

for (const item of queue) {
  console.log(item)
  if (item === "a") {
    queue.push("c")
  }
}
```

It prints `a`, `b` and `c`. The loop does not take a photo of the list at the start: it looks at the list again in every round, so it also visits the new item. If you push in every round, the loop never ends. Do not change a list while you loop over it, unless you know exactly why.

## Counting in a loop

Use a `let` variable as a counter and change it inside the loop.

```ts
const weather = ["rain", "sun", "rain", "rain", "cloud"]
let rainyDays = 0

for (const day of weather) {
  if (day === "rain") {
    rainyDays = rainyDays + 1
  }
}

console.log(`Rainy days: ${rainyDays}`)
```

This prints:

```text
Rainy days: 3
```

`rainyDays` starts at 0 before the loop, and it is a `let` because it changes.

## Summing in a loop

The same idea adds numbers. Start at 0 and add each number.

```ts
const prices = [2.5, 1.2, 4]
let total = 0

for (const price of prices) {
  total = total + price
}

console.log(total)
```

This prints:

```text
7.7
```

You start at 0 because adding 0 changes nothing. The start value must be one that does no harm to the result.

## The start value is a decision

For a counter and a sum, 0 is a good start. For a smallest value it is not. A running club writes down three lap times, in seconds, and wants the best lap, which is the smallest number:

```ts
const laps = [62, 58, 61]
let best = 0

for (const lap of laps) {
  if (lap < best) {
    best = lap
  }
}

console.log(best)
```

It prints `0`, with no error message. `best` starts at 0, no lap is smaller than 0, so the `if` is never true and `best` stays 0. The program does not fail; it only gives a wrong answer.

The rule is that the start value must lose against every real item. For "the smallest", the start must be bigger than every lap. For "the biggest", it must be smaller than every item.

To find a bug like this, shrink the failing case and change one thing at a time. With a list of one lap, `[62]`, the program also prints 0, so the list is not the problem. Then change only the line with the start value:

```ts
const laps = [62, 58, 61]
let best = Infinity

for (const lap of laps) {
  if (lap < best) {
    best = lap
  }
}

console.log(best)
```

This prints `58`. `Infinity` is a number bigger than every other number. Another good start is the first item of the list.

## Check a list with includes

**includes** asks if a value is in the array. The answer is `true` or `false`.

```ts
const likedSongs = ["Blue", "Echo"]
console.log(likedSongs.includes("Echo"))
console.log(likedSongs.includes("Sunday"))
```

This prints:

```text
true
false
```

Use it with `if` to decide what to do:

```ts
if (likedSongs.includes("Echo")) {
  console.log("Add Echo to the party playlist")
}
```

This prints:

```text
Add Echo to the party playlist
```

Capital letters count: `likedSongs.includes("echo")` gives `false`.

## Go deeper

### Two names, one list

When you copy a variable that holds a number or text, you get two separate values. With arrays it is different: an array is one object in memory and the name points to it. When you write `const b = a`, both names point to the same list.

```ts
const a = ["x"]
const b = a
b.push("y")
console.log(a)
```

This prints:

```text
[ 'x', 'y' ]
```

You changed `b`, but `a` changed too. To make a real copy, use `slice()`.

![Two names that point to the same list.](/images/shared-array.en.svg)

```ts
const c = a.slice()
c.push("z")
console.log(a, c)
```

This prints:

```text
[ 'x', 'y' ] [ 'x', 'y', 'z' ]
```

Now `c` is a separate list.

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

Choose your own world, for example lap times or the price of one coffee in ten shops. Write a function `report(values)` that takes a list of numbers and prints one line with the smallest value, the biggest value and the average. Use a loop. Do not use `Math.min` or `Math.max`.

Create the file `exercises/challenges/arrays-and-loops.ts`. Run it with `node exercises/challenges/arrays-and-loops.ts`.

It is done when:

- Your function prints a line like `min 58.9, max 70.25, average 62.3` for a list of at least five numbers.
- It also works when the smallest number is negative, for example `[-5, -2, -9]`.
- For an empty list it prints a clear message such as `No data`, and not `Infinity` or `NaN`.
- The average is shown with one digit after the decimal point.

You will need something this lesson did not teach: how to show a number with a fixed count of digits after the decimal point. Search for `javascript toFixed`.

## Think it through

1. Predict the output and say why.

```ts
const scores = [10, 20]
let total = 0

for (const score of scores) {
  total = score
}

console.log(total)
```

<details>
<summary>Answer</summary>

It prints `20`. The line `total = score` replaces the total in every round; it does not add. In round one the total is 10, and in round two it becomes 20. To sum, you write `total = total + score`. It is a very common slip because the two lines look almost the same.

</details>

2. This code should count the rainy days. It prints 0 although two days were rainy. Find the bug.

```ts
const week = ["rain", "rain", "sun"]
let rainy = 0

for (const day of week) {
  rainy = 0
  if (day === "rain") {
    rainy = rainy + 1
  }
}
console.log(rainy)
```

<details>
<summary>Answer</summary>

The line `rainy = 0` is inside the loop and resets the counter in every round. The last day is `sun`, so the counter ends at 0. Keep the start value, `let rainy = 0`, before the loop only, and delete the reset. A good way to find it is to print `rainy` at the end of each round and watch it fall back to 0.

</details>

3. What happens with this code when the list is empty? What would you want to happen instead?

```ts
const lapTimes: number[] = []
let total = 0

for (const lap of lapTimes) {
  total = total + lap
}

console.log(total / lapTimes.length)
```

<details>
<summary>Answer</summary>

It prints `NaN`, which means "not a number". The loop does nothing, so the total is 0, and 0 divided by 0 is not a number. The program does not stop and gives no error. You want to check the length first with an `if` and print a clear message such as "No laps yet". An empty list is an edge case, and what happens with it must be a decision you make, not an accident.

</details>

## Next step

In the next lesson you group related values together in objects, for example the name, age and weight of one dog.
