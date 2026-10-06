---
title: Working with lists
summary: Use map, filter, find, some, every, sort and spread to ask questions of a list, and learn which methods change the original list.
duration: 70 min
---

## Start with a puzzle

A game keeps the scores of three players. You want them from the lowest to the highest, so you call `sort`. Then you print both the new list and the old list.

```ts
const scores = [9, 100, 25];
const sorted = scores.sort();

console.log(sorted);
console.log(scores);
```

Is the first line `[ 9, 25, 100 ]`? Is the second line still `[ 9, 100, 25 ]`, because you made a new list? Or is something stranger going on? Decide what each line prints, and why.

Write down your guess before you read on.

## Goal

- Choose the right list method for a question: change every item, keep some, find one, or answer yes or no.
- Predict which methods change the original list and which leave it alone.
- Say what each method gives back for an empty list.
- Read a chain of list methods like a sentence.

## The data

All examples in this lesson use a music playlist. Copy it to the top of your practice file.

```ts
type Song = {
  title: string;
  artist: string;
  seconds: number;
  liked: boolean;
};

const playlist: Song[] = [
  { title: "Blue", artist: "Mia", seconds: 215, liked: true },
  { title: "Rain Dance", artist: "Tomas", seconds: 180, liked: false },
  { title: "Sunday", artist: "Mia", seconds: 245, liked: true },
  { title: "Echo", artist: "Lena", seconds: 120, liked: false },
];
```

## Callback functions

The methods in this lesson take a function as an input. That function is called a **callback**. The method calls it for each item in the list.

You write the callback as an arrow function. Lesson 05 showed arrow functions: `(song) => ...`.

## map: change every item

`map` makes a new array. It runs your callback on each item and collects the results.

What do you expect from this line? How long is the new array?

```ts
const titles = playlist.map((song) => song.title);
console.log(titles);
```

The program prints:

```text
[ 'Blue', 'Rain Dance', 'Sunday', 'Echo' ]
```

The new array has the same length as the old one. The old array is not changed. Each item can become something different, for example a number:

```ts
const minutes = playlist.map((song) => Math.round(song.seconds / 60));
console.log(minutes);
```

This prints:

```text
[ 4, 3, 4, 2 ]
```

> **Careful:** If you use curly braces in the callback, you must write `return`. Without it, the callback gives `undefined` for every item. `[10, 20].map((p) => { p * 1.2; })` gives `[ undefined, undefined ]`. No error appears. You do not need curly braces for a one-line callback.

## filter: keep some items

`filter` makes a new array with only the items for which your callback returns `true`.

```ts
const liked = playlist.filter((song) => song.liked);
console.log(liked.length);
```

The program prints `2`.

You can chain the two methods. Get the titles of the songs by Mia:

```ts
const miaTitles = playlist
  .filter((song) => song.artist === "Mia")
  .map((song) => song.title);

console.log(miaTitles);
```

The program prints:

```text
[ 'Blue', 'Sunday' ]
```

Read a chain from top to bottom as a sentence: "from the playlist, keep the songs by Mia, then take their titles." If you can say the chain in one plain sentence, it is a good chain. The order matters. What happens if you write `map` first and `filter` second? Try it. After `map` the items are only titles, so `song.artist` no longer exists.

## find: get one item

`find` returns the first item for which your callback returns `true`. If nothing matches, it returns `undefined`.

```ts
const found = playlist.find((song) => song.artist === "Tomas");
console.log(found?.title);

const missing = playlist.find((song) => song.artist === "Zed");
console.log(missing);
```

The program prints:

```text
Rain Dance
undefined
```

The result type is `Song | undefined`. You must handle the `undefined` case. The `?.` in `found?.title` means "read `title` only if `found` has a value". Otherwise the result is `undefined`.

Notice that `find` gives only the first match. There are two songs by Mia. `find` for Mia gives `Blue` and never shows `Sunday`. If you need all matches, you need `filter`.

## some and every: yes or no

`some` returns `true` if at least one item matches. `every` returns `true` if all items match.

```ts
const hasLongSong = playlist.some((song) => song.seconds > 240);
const allLiked = playlist.every((song) => song.liked);

console.log(hasLongSong);
console.log(allLiked);
```

The program prints:

```text
true
false
```

Now the edge case. What do `some` and `every` give for a list with no songs? Think about it before you read on. For `some`, there is no song that matches, so the answer is `false`. For `every`, there is no song that breaks the rule, so the answer is `true`.

```ts
const empty: Song[] = [];
console.log(empty.some((song) => song.liked));
console.log(empty.every((song) => song.liked));
```

The program prints:

```text
false
true
```

> **Careful:** `every` on an empty list returns `true`. "All songs are liked" is true when there are no songs. Keep this in mind when a list can be empty.

## Spread: copy a list

Three dots `...` before an array mean **spread**. It puts all items of the array into a new place.

```ts
const extended: Song[] = [
  ...playlist,
  { title: "Moon", artist: "Zed", seconds: 99, liked: false },
];

console.log(playlist.length);
console.log(extended.length);
```

The program prints:

```text
4
5
```

The original list still has 4 items. You made a new list with 5 items.

## Sorting

Now go back to the opening puzzle. A list of numbers needs a small callback that says how to compare two items. The callback gets two items, `a` and `b`. It returns a negative number if `a` goes first, a positive number if `b` goes first.

```ts
const scores = [9, 100, 25];

console.log(scores.toSorted((a, b) => a - b));
console.log(scores);
```

The program prints:

```text
[ 9, 25, 100 ]
[ 9, 100, 25 ]
```

`toSorted` makes a new list. The old list stays as it was.

### Back to the puzzle

The program prints `[ 100, 25, 9 ]` two times. There are two surprises. First, `sort` without a callback sorts items as text. As text, `"100"` comes before `"25"`, because the first character `1` is smaller than `2`, and `"25"` comes before `"9"`. Second, `sort` changes the original list and returns that same list. So `sorted` and `scores` are one list with two names, as you saw in lesson 06. The safe way is `toSorted` with a compare callback.

## map or for...of?

Both work. Use this rule:

- Use `map`, `filter`, `find`, `some` and `every` when you want a result: a new list, one item or a yes/no answer.
- Use `for...of` when you want to do an action for each item, such as printing or clicking.

In Playwright you often use `for...of` with `await`. Lesson 10 shows why.

## Go deeper

### What map really does

There is no magic in `map`. It is a loop that someone wrote for you. This function does the same work with a `for...of` loop:

```ts
function myMap(items: Song[], callback: (song: Song) => number): number[] {
  const result: number[] = [];
  for (const item of items) {
    result.push(callback(item));
  }
  return result;
}

console.log(myMap(playlist, (song) => song.seconds));
```

The text `(song: Song) => number` is the type of a callback. It says: a function that takes a song and returns a number. The program prints:

```text
[ 215, 180, 245, 120 ]
```

### Which methods change the list?

`map`, `filter`, `find`, `some`, `every` and `toSorted` do not change the original. `sort` and `push` do. When you are not sure, look it up in the documentation of the method. It tells you what the method returns and whether it changes the list.

### How it shows up in real QA automation work

This is the one link to testing in this lesson. Imagine three bad login attempts. The steps are the same, only the input is different. You can write the data once, as an array of objects, and loop over it. This is **DRY**: one test body, many inputs. You will study the idea at the end of this module. The words `async` and `await` in the code come in the next lesson. Read them as manual steps.

```ts
import { expect, test } from "./lib/test";

const badLogins = [
  { name: "empty email", email: "", message: "Enter your email and password." },
  { name: "spaces only", email: "   ", message: "Enter your email and password." },
  { name: "unknown email", email: "ana@example.com", message: "Wrong email or password." },
];

for (const badLogin of badLogins) {
  test(`shows an error for ${badLogin.name}`, async ({ page }) => {
    await page.goto("/#/practice");
    await page.getByTestId("login-email").fill(badLogin.email);
    await page.getByTestId("login-password").fill("Playwright123");
    await page.getByTestId("login-submit").click();

    await expect(page.getByTestId("login-error")).toHaveText(badLogin.message);
  });
}
```

Each test needs its own title, so the title uses `name`. If the cases need different steps, write separate tests. A test must stay easy to read.

## Practice

1. Create the file `exercises/01-programming/lists-practice.ts`.
2. Paste the playlist data from the top of this lesson.
3. Print the titles of all songs with `map`.
4. Print the titles of all songs that are not liked.
5. Use `find` to get the song by "Lena" and print its length in seconds.
6. Print whether `some` song is longer than 4 minutes.
7. Open `exercises/01-programming/09-working-with-lists.ts`. Replace each `// TODO` with code.
8. Run the exercise file with this command:

```bash
node exercises/01-programming/09-working-with-lists.ts
```

Make every line say `OK`.

## Challenge

Choose your own world: a football league, a recipe book, a pet shelter, the cities of a trip, a quiz with players. Make a list of at least eight objects. Each object has a text property that puts it in a group (a team, a country, a type of food) and a number property (goals, minutes, price, points).

Write a function `report(list)` that prints two things: the three items with the biggest number, highest first, and how many items are in each group. When the list is empty, it prints a clear message and does not crash.

Create the file `exercises/challenges/working-with-lists.ts`. Run it with `node exercises/challenges/working-with-lists.ts`.

It is done when:

- `report` prints the top three by the number property, highest first.
- After `report` runs, the original list still has the same order as when you wrote it. Print its first item to see this for yourself.
- `report` prints one count for each group, for example `Reds 3`, and each group appears only once.
- `report([])` prints a clear message such as `No players`, and no error.
- `pnpm typecheck` shows no error for your file.

You will need something this lesson did not teach: how to take only the first few items of a list, and how to keep a count for each group name when you do not know the names in advance. Search for `javascript array slice` and `typescript Record string number count occurrences`.

> **Tip:** You may ask an AI assistant to explain the gap. Then run the code yourself, change one thing at a time, and make sure you can explain every line in your own words. Never paste code that you cannot explain.

## Think it through

1. Predict the output and say why.

```ts
const numbers = [1, 2, 3, 4];
const big = numbers.filter((n) => n > 2);
big.push(99);

console.log(numbers, big);
```

<details>
<summary>Answer</summary>

It prints `[ 1, 2, 3, 4 ] [ 3, 4, 99 ]`. `filter` makes a new array, so `big` is a separate list from `numbers`. Pushing 99 into `big` does not touch `numbers`. If you had used `const big = numbers` and then pushed, both names would show the 99. The difference is that `filter` builds a new list, while a plain assignment only adds a name.

</details>

2. The shop wants prices with 20 percent tax. The code runs without an error, but the answer is useless. Find the bug.

```ts
const prices = [10, 20];
const withTax = prices.map((price) => {
  price * 1.2;
});

console.log(withTax);
```

<details>
<summary>Answer</summary>

It prints `[ undefined, undefined ]`. The callback has curly braces, so it needs the word `return`. Without it, the callback calculates `price * 1.2` and throws the result away. A function with no `return` gives `undefined`. Write `(price) => price * 1.2` or add `return`. TypeScript can help: if you give the result a type such as `number[]`, it shows an error, because the callback returns nothing.

</details>

3. Two people check "is there any liked song?" Which version is better, and what would make you choose the other?

```ts
const versionA = playlist.filter((song) => song.liked).length > 0;
const versionB = playlist.some((song) => song.liked);
```

<details>
<summary>Answer</summary>

Version B is better here. `some` says exactly what you want to know: is there at least one match? It can stop at the first match, and it does not build a new list. Version A works, but it builds a list only to count it, and the reader must think about what it means. You would choose A when you also need the liked songs themselves, or the count, for the next line. Then one `filter` does two jobs.

</details>

4. A rule says: "a playlist is ready when every song is shorter than 5 minutes." A new requirement arrives: users can now create playlists with no songs yet. What breaks?

```ts
const isReady = playlist.every((song) => song.seconds < 300);
```

<details>
<summary>Answer</summary>

An empty playlist gives `true`, so it is "ready". For `every`, no item breaks the rule, so the rule holds. That is probably not what the business wants: nobody wants to publish an empty playlist. You must add a rule: `playlist.length > 0 && playlist.every(...)`. The lesson is that a rule written for a list with items must be checked again for the empty list.

</details>

5. Explain what a callback is to a teammate, in three sentences and without using the word "function".

<details>
<summary>Answer</summary>

A good answer could be: a callback is a small piece of code that you hand to someone else. They run it when they need it, for example once for each item of a list. You do not call it yourself. A recipe card is a good picture: you give the card to a helper, and the helper follows it for each dish. An answer that only says "a function inside a function" repeats the word and does not explain who runs it and when.

</details>

6. You need the titles of the three longest liked songs. Is one long chain better, or a few named steps? There is no single right answer.

```ts
const result = playlist
  .filter((song) => song.liked)
  .toSorted((a, b) => b.seconds - a.seconds)
  .slice(0, 3)
  .map((song) => song.title);
```

<details>
<summary>Answer</summary>

A chain reads like one sentence and has no names to invent, so it is good when every step is short and obvious. Named steps such as `likedSongs` and `longestThree` give you places to print and look at, and they are easier to debug when a result is wrong. A long chain hides the middle results. The choice depends on who reads the code and how often you expect to debug it. A good rule: if you need a comment to explain a step, give that step its own name.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **What does `reduce` do, and when is a plain loop easier to read?**
   - Search for: `javascript array reduce explained`
   - Try it: write the total of the `seconds` of the playlist twice, once with `reduce` and once with `for...of`. Give both to a friend and ask which one they understand first.
   - A good answer explains: what the callback receives, the role of the start value, and one case where a `for...of` loop is clearer.

2. **How do you read a documentation page for an array method? Pick `flatMap`, `at` or `findLast`.**
   - Search for: `MDN Array flatMap`
   - Try it: scan the page in this order: first the signature at the top, then the first example, then the section about edge cases and return values. Write one test of your own with an empty array.
   - A good answer explains: what the method gives back, what the callback gets, and one edge case the page mentions.

3. **Why do sort rules like `a - b` work, and what happens when a compare callback is not consistent?**
   - Search for: `javascript sort compare function a - b`
   - Try it: sort `["b", "a", "C"]` with the default `sort`, then with `localeCompare`. Then sort 5 song titles by length with a callback that you write.
   - A good answer explains: what the sign of the returned number means, why capital letters sort first by default, and how to sort text in a human order.

## Next step

In the next lesson you learn how to handle work that takes time, such as a page that loads slowly.
