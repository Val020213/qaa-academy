---
title: Working with lists
summary: Use map, filter, find, some, every and spread to work with lists of test cases.
duration: 45 min
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

## Go deeper

### What map really does

There is no magic in `map`. It is a loop that someone wrote for you. This function does the same work with a `for...of` loop:

```ts
function myMap(items: TestCase[], callback: (testCase: TestCase) => number): number[] {
  const result: number[] = [];
  for (const item of items) {
    result.push(callback(item));
  }
  return result;
}

console.log(myMap(testCases, (testCase) => testCase.id));
```

The text `(testCase: TestCase) => number` is the type of a callback. It says: a function that takes a test case and returns a number. With the four test cases above, the program prints `[ 1, 2, 3, 4 ]`.

### A wrong idea: all list methods leave the list alone

`map`, `filter` and `find` do not change the original. But `sort` does.

```ts
const ids = [3, 1, 2];
const sorted = ids.sort();
console.log(ids, sorted === ids);
console.log([10, 9, 1].sort());
```

The program prints:

```text
[ 1, 2, 3 ] true
[ 1, 10, 9 ]
```

Two surprises. `sort` changed `ids` and returned the same array. And `sort` without a callback sorts as text, so `10` comes before `9`. Use `toSorted`, which makes a new array, and give it a callback: `[10, 9, 1].toSorted((a, b) => a - b)` gives `[ 1, 9, 10 ]`.

### How it shows up in QA automation work

Imagine three bad login attempts. The steps are the same, only the input is different. You can write the data once, as an array of objects, and loop over it. This is **DRY**: one test body, many inputs. You will study the idea at the end of this module. The words `async` and `await` in the code come in the next lesson. Read them as manual steps.

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

5. What does this program print, and why?

```ts
const numbers = [1, 2, 3];
const doubled = numbers.map((n) => {
  n * 2;
});
console.log(doubled);
```

<details><summary>Answer</summary>

It prints `[ undefined, undefined, undefined ]`. The callback has curly braces, so it needs the word `return`. Without it, the callback calculates `n * 2` and throws the result away. A function with no `return` gives `undefined`. Write `(n) => n * 2` or add `return`.

</details>

6. Two people write a check for "is there any failed test case?" Which version is better, and why?

```ts
const versionA = testCases.filter((testCase) => testCase.status === "failed").length > 0;
const versionB = testCases.some((testCase) => testCase.status === "failed");
```

<details><summary>Answer</summary>

Version B is better. `some` says exactly what you want to know: is there at least one match? It can stop at the first match, and it does not build a new array. Version A works, but it builds a list only to count it, and the reader must think about what it means.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **What does `reduce` do, and when is a plain loop easier to read?**
   - Search for: `javascript array reduce explained`
   - A good answer explains: what the callback receives, a small example such as a sum, and one case where a `for...of` loop is clearer.

2. **Why does `sort` change the original array, and what do `toSorted` and the spread copy do instead?**
   - Search for: `javascript sort mutates original toSorted`
   - A good answer explains: which array methods change the original, which return a new array, and how to sort numbers in the right order.

3. **What is data-driven testing, and when does it help a tester?**
   - Search for: `data-driven testing test automation`
   - A good answer explains: what a data-driven test is, one example with a table of inputs and expected results, and one risk of too much data in one test.

## Next step

In the next lesson you learn how to handle work that takes time, such as a page that loads slowly.
