---
title: Working with lists
duration: 50 min
---

## Goal

In this lesson you ask questions of a list with the array methods: transform it, filter it, search it and sort it, without changing the original list by accident.

- Choose the right list method for a question: change every item, keep some, find one, or answer yes or no.
- Predict which methods change the original list and which leave it alone.
- Say what each method gives back for an empty list.
- Read a chain of list methods like a sentence.

## The data

The first examples use a music playlist. Copy it to the top of your practice file.

```ts
type Song = {
  title: string
  artist: string
  seconds: number
  liked: boolean
}

const playlist: Song[] = [
  { title: "Blue", artist: "Mia", seconds: 215, liked: true },
  { title: "Rain Dance", artist: "Tomas", seconds: 180, liked: false },
  { title: "Sunday", artist: "Mia", seconds: 245, liked: true },
  { title: "Echo", artist: "Lena", seconds: 120, liked: false },
]
```

## Callback functions

Several methods in this lesson take a function as an input. That function is called a **callback**. The method calls it while going through the list; some stop as soon as they find the answer. Here we write it as an arrow function: `(song) => ...`.

## map: change every item

`map` makes a new array. It runs your callback on each present item and collects the results.

```ts
const titles = playlist.map((song) => song.title)
console.log(titles)
```

The program prints:

```text
[ 'Blue', 'Rain Dance', 'Sunday', 'Echo' ]
```

The new array has the old array’s initial length. `map` does not modify the original array, although your callback can. Each item can become something different, for example a number:

```ts
const minutes = playlist.map((song) => Math.round(song.seconds / 60))
console.log(minutes)
```

This prints:

```text
[ 4, 3, 4, 2 ]
```

> **Careful:** If you use curly braces in the callback, you must write `return`. Without it, the callback gives `undefined` for every item. `[10, 20].map((p) => { p * 1.2 })` gives `[ undefined, undefined ]`. No error appears. You do not need curly braces for a one-line callback.

## filter: keep some items

`filter` makes a new array with only the items for which your callback returns a value JavaScript treats as true.

```ts
const liked = playlist.filter((song) => song.liked)
console.log(liked.length)
```

The program prints `2`.

You can chain the two methods. Get the titles of the songs by Mia:

```ts
const miaTitles = playlist
  .filter((song) => song.artist === "Mia")
  .map((song) => song.title)

console.log(miaTitles)
```

The program prints:

```text
[ 'Blue', 'Sunday' ]
```

A chain reads from top to bottom like a sentence: "from the playlist, keep the songs by Mia, then take their titles." The order matters. If you write `map` first and `filter` second, the items are already just titles and `song.artist` does not exist.

![filter keeps the Blue and Sunday objects in another array; map obtains their titles.](/images/01b-filter-map.en.svg)

## find: get one item

`find` returns the first item for which your callback returns a value JavaScript treats as true. If nothing matches, it returns `undefined`.

```ts
const found = playlist.find((song) => song.artist === "Tomas")
console.log(found?.title)

const missing = playlist.find((song) => song.artist === "Zed")
console.log(missing)
```

The program prints:

```text
Rain Dance
undefined
```

The result type is `Song | undefined`, so you must handle the `undefined` case. The `?.` in `found?.title` reads `title` if `found` is neither `null` nor `undefined`; in those two cases, the result is `undefined`.

![The checker requires handling a find with no match before reading found.title.](/clips/01b-find-guard.webm)

`find` gives only the first match. There are two songs by Mia, and `find` for Mia returns the `Blue` object, not the `Sunday` object. If you need all matches, use `filter`.

## some and every: yes or no

`some` returns `true` if at least one item matches. `every` returns `true` if all items match.

```ts
const hasLongSong = playlist.some((song) => song.seconds > 240)
const allLiked = playlist.every((song) => song.liked)

console.log(hasLongSong)
console.log(allLiked)
```

The program prints:

```text
true
false
```

For a list with no songs, `some` gives `false` because no song matches, and `every` gives `true` because no song breaks the rule.

```ts
const empty: Song[] = []
console.log(empty.some((song) => song.liked))
console.log(empty.every((song) => song.liked))
```

The program prints:

```text
false
true
```

> **Careful:** `every` on an empty list returns `true`. "All songs are liked" is true when there are no songs. Keep this in mind when a list can be empty.

## Spread: copy a list

Inside an array literal, `...playlist` uses **spread** to add the elements of `playlist` to the new array.

```ts
const extended: Song[] = [
  ...playlist,
  { title: "Moon", artist: "Zed", seconds: 99, liked: false },
]

console.log(playlist.length)
console.log(extended.length)
```

The program prints:

```text
4
5
```

The original list still has 4 items. You made a new list with 5 items, but both lists share the first four song objects. Changing a property of one of those objects is visible in both.

## Sorting

`sort` has two traps. Look at this code:

```ts
const scores = [9, 100, 25]
const sorted = scores.sort()

console.log(sorted)
console.log(scores)
```

It prints `[ 100, 25, 9 ]` two times. First, `sort` without a callback sorts items as text. As text, `"100"` comes before `"25"`, because the first character `1` is smaller than `2`, and `"25"` comes before `"9"`. Second, `sort` changes the original list and returns that same list. So `sorted` and `scores` are one list with two names, as you saw in lesson 06.

To sort numbers, `toSorted` takes a callback that says how to compare two items. The callback gets `a` and `b`, and returns a negative number if `a` goes first, or a positive number if `b` goes first. It returns `0` if it considers them equal; those items keep their relative order.

```ts
const scores = [9, 100, 25]

console.log(scores.toSorted((a, b) => a - b))
console.log(scores)
```

The program prints:

```text
[ 9, 25, 100 ]
[ 9, 100, 25 ]
```

`toSorted` makes a new list. `map`, `filter`, `find`, `some`, `every` and `toSorted` do not modify the original array themselves; your callback can modify it or change its objects. `sort` and `push` modify the array. When you are not sure about a method, look up its documentation: it tells you what the method returns and whether it changes the list.

## map or for...of?

Both work. Use this rule:

- Use `map`, `filter`, `find`, `some` and `every` when you want a result: a new list, one item or a yes/no answer.
- Use `for...of` when you want to do an action for each item, such as printing or clicking.

## Go deeper

### What map really does

You can reproduce this use of `map` with a loop. This function gets the durations from our list with `for...of`:

```ts
function myMap(items: Song[], callback: (song: Song) => number): number[] {
  const result: number[] = []
  for (const item of items) {
    result.push(callback(item))
  }
  return result
}

console.log(myMap(playlist, (song) => song.seconds))
```

The text `(song: Song) => number` is the type of a callback. It says: a function that takes a song and returns a number. The program prints:

```text
[ 215, 180, 245, 120 ]
```

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

Make every check say `OK`.

## Challenge

Choose your own world, for example a football league or a recipe book. Make a list of at least eight objects. Each object has a text property that puts it in a group (a team, a type of food) and a number property (goals, minutes, price, points).

Write a function `report(list)` that prints two things: the three items with the biggest number, highest first, and how many items are in each group. When the list is empty, it prints a clear message and does not crash.

Create the file `exercises/challenges/working-with-lists.ts`. Run it with `node exercises/challenges/working-with-lists.ts`.

It is done when:

- `report` prints the top three by the number property, highest first.
- After `report` runs, the original list still has the same order as when you wrote it. Print the complete list to check.
- `report` prints one count for each group, for example `Reds 3`, and each group appears only once.
- `report([])` prints a clear message such as `No players`, and no error.

You will need something this lesson did not teach: how to take only the first few items of a list, and how to keep a count for each group name when you do not know the names in advance. Search for `javascript array slice` and `typescript Record string number count occurrences`.

## Think it through

1. Predict the output and say why.

```ts
const numbers = [1, 2, 3, 4]
const big = numbers.filter((n) => n > 2)
big.push(99)

console.log(numbers, big)
```

<details>
<summary>Answer</summary>

It prints `[ 1, 2, 3, 4 ] [ 3, 4, 99 ]`. `filter` makes a new array, so `big` is a separate list from `numbers`. Pushing 99 into `big` does not touch `numbers`. If you had used `const big = numbers` and then pushed, both names would show the 99, because a plain assignment only adds a name to the same list.

</details>

2. The shop wants prices with 20 percent tax. The code runs without an error, but the answer is useless. Find the bug.

```ts
const prices = [10, 20]
const withTax = prices.map((price) => {
  price * 1.2
})

console.log(withTax)
```

<details>
<summary>Answer</summary>

It prints `[ undefined, undefined ]`. The callback has curly braces, so it needs the word `return`. Without it, the callback calculates `price * 1.2` and throws the result away. Write `(price) => price * 1.2` or add `return`. TypeScript can help: if you give the result a type such as `number[]`, it shows an error, because the callback returns nothing.

</details>

3. A rule says: "a playlist is ready when every song is shorter than 5 minutes." A new requirement arrives: users can now create playlists with no songs yet. What breaks?

```ts
const isReady = playlist.every((song) => song.seconds < 300)
```

<details>
<summary>Answer</summary>

An empty playlist gives `true`, so it is "ready". For `every`, no item breaks the rule. If publishing requires at least one song, add the rule: `playlist.length > 0 && playlist.every(...)`.

</details>

## Next step

In the next lesson you learn how to handle work that takes time, such as a page that loads slowly.
