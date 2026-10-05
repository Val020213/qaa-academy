---
title: Your own types
summary: Name the shape of your objects with type aliases, optional properties and literal unions.
duration: 40 min
---

## Goal

- Write a type alias for an object shape.
- Mark a property as optional.
- Limit a text value to a fixed set of choices.
- Check a value with `if`, so TypeScript knows what it holds.

## Type aliases

In lesson 07 you wrote the type of an object again and again. That is long and easy to get wrong.

A **type alias** gives a name to a type. You write it once and use it everywhere.

```ts
type TestCase = {
  id: number;
  title: string;
  status: string;
};

const testCase: TestCase = {
  id: 1,
  title: "Login works",
  status: "passed",
};

console.log(testCase.title);
```

The program prints `Login works`.

By convention, type names start with a capital letter. Now TypeScript checks that every `TestCase` has the right properties.

If you forget a property, TypeScript shows a red underline:

```ts
type TestCase = { id: number; title: string; status: string };

// Error: Property 'status' is missing
const broken: TestCase = { id: 2, title: "Logout works" };
```

You find the mistake while you type. You do not wait for the program to run.

## Optional properties

Some values are not always there. A test case may have an owner or not.

Put `?` after the property name to make it **optional**.

```ts
type TestCase = {
  id: number;
  title: string;
  owner?: string;
};

const withOwner: TestCase = { id: 1, title: "Login works", owner: "Ana" };
const withoutOwner: TestCase = { id: 2, title: "Logout works" };

console.log(withOwner.owner);
console.log(withoutOwner.owner);
```

The program prints:

```text
Ana
undefined
```

The type of `owner` is `string | undefined`. The `|` sign means "or". Lesson 03 explained `undefined`: it means "no value here".

## Limit the choices

A status should only be `"passed"`, `"failed"` or `"skipped"`. If someone writes `"pasd"`, that is a mistake.

You can make a type from exact text values. Join them with `|`. This is called a **union**.

```ts
type Status = "passed" | "failed" | "skipped";

type TestCase = {
  id: number;
  title: string;
  status: Status;
};

const testCase: TestCase = { id: 1, title: "Login works", status: "passed" };
console.log(testCase.status);
```

The program prints `passed`.

Now try a wrong value:

```ts
type Status = "passed" | "failed" | "skipped";

// Error: Type '"pasd"' is not assignable to type 'Status'
const status: Status = "pasd";
```

TypeScript catches the spelling mistake before you run anything. This is the way we use fixed choices in this course.

> **Note:** Other tutorials use `enum` for this. In this course, use a union of text values instead. It is simpler and works everywhere.

## Narrowing with if

Sometimes a value can be one of several types. Inside an `if`, TypeScript learns which one it is. This is called **narrowing**.

```ts
type TestCase = {
  id: number;
  title: string;
  owner?: string;
};

function describeOwner(testCase: TestCase): string {
  if (testCase.owner === undefined) {
    return `${testCase.title} has no owner`;
  }
  return `${testCase.title} belongs to ${testCase.owner}`;
}

console.log(describeOwner({ id: 1, title: "Login works", owner: "Ana" }));
console.log(describeOwner({ id: 2, title: "Logout works" }));
```

The program prints:

```text
Login works belongs to Ana
Logout works has no owner
```

After the `if` with `return`, TypeScript knows `owner` is a `string`. Without the check, it would refuse to let you use `owner` as text.

## Reading Array and Promise types

Sometimes you see types with `<` and `>`, like `Array<TestCase>`. You only need to read them, not write them.

- `Array<TestCase>` means a list of test cases. It is the same as `TestCase[]`.
- `Promise<string>` means "a string that will arrive later". Lesson 10 explains this.

Read the part inside `< >` as "of". `Array<TestCase>` is "an array of test cases".

## Go deeper

### Types exist only while you write

TypeScript removes all types before the program runs. Node only sees plain JavaScript. So a type cannot check data that arrives while the program runs.

```ts
type TestCase = { id: number; title: string };

const parsed: TestCase = JSON.parse('{"id":"abc","title":"Login works"}');
console.log(parsed.id + 1);
```

TypeScript shows no error. The program prints:

```text
abc1
```

The type says `id` is a number. The real data has text. `JSON.parse` returns a value of type `any`, which means "anything", so TypeScript accepts it without a check. You told TypeScript what you hope, and it believed you.

This matters in QA work. An API answer is data from outside. A type describes what you expect, not what the server sent. Your test must still check the real values.

### One shape, written once

A type alias is also a way to avoid repetition. This idea is called **DRY**, "Don't Repeat Yourself". Each piece of knowledge lives in one place. You will study it at the end of this module.

Look at `Status`. The allowed values are written once:

```ts
type Status = "passed" | "failed" | "skipped" | "blocked";
```

You add `"blocked"` here, and every place that uses `Status` accepts it. If you wrote the three choices in ten functions, you would change ten places and could forget one.

### When not to write a type

Do not write a type for everything. This line needs none:

```ts
const count = 3;
```

TypeScript already knows that `count` is a number. Write types for function parameters, for shapes that many places share, and for fixed choices. Extra types make the code longer and do not make it safer.

Also choose the right tool. Use a union only when the choices are a small, fixed list. If the text can be anything, such as a title typed by a user, use `string`.

## Practice

1. Create the file `exercises/01-programming/types-practice.ts`.
2. Write a type `Severity` with the values `"low"`, `"medium"` and `"high"`.
3. Write a type `Bug` with `id` (number), `title` (string), `severity` (`Severity`) and an optional `assignee` (string).
4. Create two `Bug` objects, one with an assignee and one without.
5. On purpose, write `severity: "urgent"` and look at the red underline. Then fix it.
6. Open `exercises/01-programming/08-your-own-types.ts`. Replace each `// TODO` with code.
7. Run the exercise file with this command:

```bash
node exercises/01-programming/08-your-own-types.ts
```

Make every line say `OK`.

## Check what you know

1. What does a type alias do?

<details><summary>Answer</summary>

It gives a name to a type, so you can reuse it.

</details>

2. What does the `?` mean in `owner?: string`?

<details><summary>Answer</summary>

The property is optional. It may be missing, and then its value is `undefined`.

</details>

3. What is wrong with `const s: "passed" | "failed" = "skipped";`?

<details><summary>Answer</summary>

`"skipped"` is not one of the allowed values. TypeScript shows an error.

</details>

4. How do you read `Array<TestCase>`?

<details><summary>Answer</summary>

"An array of test cases". It is the same as `TestCase[]`.

</details>

5. What does this program print, and why?

```ts
type TestCase = { id: number; title: string; owner?: string };

const testCase: TestCase = { id: 1, title: "Login works" };
console.log(`Owner: ${testCase.owner}`);
```

<details><summary>Answer</summary>

It prints `Owner: undefined`. The property `owner` is optional and was not given, so its value is `undefined`. A template string turns any value into text, so you see the word `undefined`. TypeScript does not stop you, but the result is probably not what you want. A check with `if` would be better.

</details>

6. This code has a bug. Find it.

```ts
type Status = "passed" | "failed";

function isDone(status: Status): boolean {
  if (status === "passed") {
    return true;
  }
  if (status === "failde") {
    return false;
  }
  return false;
}
```

<details><summary>Answer</summary>

The text `"failde"` has a spelling mistake. `Status` can only be `"passed"` or `"failed"`, so this comparison can never be true. TypeScript reports that the types have no overlap. With a plain `string` type, TypeScript could not catch this mistake. The program would run and the second `if` would never work.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **What is the difference between `type` and `interface` in TypeScript?**
   - Search for: `typescript type vs interface`
   - A good answer explains: how each one describes an object shape, one thing only `type` can do, and which one this course uses and why.

2. **What does it mean that TypeScript types are erased at runtime?**
   - Search for: `typescript types erased at runtime`
   - A good answer explains: what the compiler or Node removes, why type checks do not exist when the program runs, and one bug this can hide.

3. **What is an API contract, and why can a TypeScript type not prove that a server follows it?**
   - Search for: `api contract testing explained`
   - A good answer explains: what an API contract is, why a type is only a promise made at coding time, and how a tester can check the real answer.

## Next step

In the next lesson you use `map`, `filter` and `find` to work with lists of typed test cases.
