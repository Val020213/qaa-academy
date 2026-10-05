---
title: Your own types
summary: Name the shape of your objects with type aliases, optional properties and literal unions.
duration: 25 min
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

## Next step

In the next lesson you use `map`, `filter` and `find` to work with lists of typed test cases.
