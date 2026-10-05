---
title: Working with lists
summary: Use map, filter, find, some, every and spread to work with lists of test cases.
duration: 30 min
---

## Goal

- Transform a list with `map`.
- Pick items with `filter` and `find`.
- Ask yes/no questions with `some` and `every`.
- Copy a list and add an item with spread.

## The test data

All examples in this lesson use this data. Copy it to the top of your practice file.

```ts
type Status = "passed" | "failed" | "skipped";

type TestCase = {
  id: number;
  title: string;
  status: Status;
};

const testCases: TestCase[] = [
  { id: 1, title: "Login works", status: "passed" },
  { id: 2, title: "Checkout applies discount", status: "failed" },
  { id: 3, title: "Logout clears session", status: "failed" },
  { id: 4, title: "Order history", status: "skipped" },
];
```

## Callback functions

The methods in this lesson take a function as an input. That function is called a **callback**. The method calls it for each item in the list.

You write the callback as an arrow function. Lesson 05 showed arrow functions: `(testCase) => ...`.

## map: change every item

`map` makes a new array. It runs your callback on each item and collects the results.

```ts
const titles = testCases.map((testCase) => testCase.title);
console.log(titles);
```

The program prints:

```text
[
  'Login works',
  'Checkout applies discount',
  'Logout clears session',
  'Order history'
]
```

The new array has the same length as the old one. The old array is not changed.

## filter: keep some items

`filter` makes a new array with only the items for which your callback returns `true`.

```ts
const failed = testCases.filter((testCase) => testCase.status === "failed");
console.log(failed.length);
```

The program prints `2`.

You can chain the two methods. Get the titles of failed test cases:

```ts
const failedTitles = testCases
  .filter((testCase) => testCase.status === "failed")
  .map((testCase) => testCase.title);

console.log(failedTitles);
```

The program prints:

```text
[ 'Checkout applies discount', 'Logout clears session' ]
```

## find: get one item

`find` returns the first item for which your callback returns `true`. If nothing matches, it returns `undefined`.

```ts
const found = testCases.find((testCase) => testCase.id === 3);
console.log(found?.title);

const missing = testCases.find((testCase) => testCase.id === 99);
console.log(missing);
```

The program prints:

```text
Logout clears session
undefined
```

The result type is `TestCase | undefined`. You must handle the `undefined` case. The `?.` in `found?.title` means "read `title` only if `found` has a value". Otherwise the result is `undefined`.

## some and every: yes or no

`some` returns `true` if at least one item matches. `every` returns `true` if all items match.

```ts
const hasFailure = testCases.some((testCase) => testCase.status === "failed");
const allPassed = testCases.every((testCase) => testCase.status === "passed");

console.log(hasFailure);
console.log(allPassed);
```

The program prints:

```text
true
false
```

> **Careful:** `every` on an empty list returns `true`. An empty list has no failing item. Keep this in mind when a test run finds no test cases.

## Spread: copy a list

Three dots `...` before an array mean **spread**. It puts all items of the array into a new place.

```ts
const extended = [...testCases, { id: 5, title: "Search works", status: "passed" as Status }];

console.log(testCases.length);
console.log(extended.length);
```

The program prints:

```text
4
5
```

The original list still has 4 items. You made a new list with 5 items. The part `as Status` tells TypeScript the text is a `Status` and not just any text.

## map or for...of?

Both work. Use this rule:

- Use `map`, `filter`, `find`, `some` and `every` when you want a result: a new list, one item or a yes/no answer.
- Use `for...of` when you want to do an action for each item, such as printing or clicking.

In Playwright you often use `for...of` with `await`. Lesson 10 shows why.

## Practice

1. Create the file `exercises/01-programming/lists-practice.ts`.
2. Paste the test data from the top of this lesson.
3. Print the ids of all test cases with `map`.
4. Print the titles of all skipped test cases.
5. Use `find` to get the test case with id 2 and print its status.
6. Print whether `some` test case is skipped.
7. Open `exercises/01-programming/09-working-with-lists.ts`. Replace each `// TODO` with code.
8. Run the exercise file with this command:

```bash
node exercises/01-programming/09-working-with-lists.ts
```

Make every line say `OK`.

## Check what you know

1. Does `map` change the original array?

<details><summary>Answer</summary>

No. It returns a new array. The original stays the same.

</details>

2. What does `find` return when nothing matches?

<details><summary>Answer</summary>

It returns `undefined`.

</details>

3. Which method tells you if all items match a rule?

<details><summary>Answer</summary>

`every`.

</details>

4. What does `[...list, item]` create?

<details><summary>Answer</summary>

A new array with all items of `list`, and `item` at the end.

</details>

## Next step

In the next lesson you learn how to handle work that takes time, such as a page that loads slowly.
