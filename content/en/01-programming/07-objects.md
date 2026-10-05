---
title: Objects
summary: Group related values under names, and keep a list of test cases as objects.
duration: 25 min
---

## Goal

- Create an object that groups related values.
- Read and change a property of an object.
- Keep many objects in an array and loop over them.
- Read a short destructuring line.

## Why we need objects

A test case has an id, a title and a status. These three values belong together.

You could use three separate variables:

```ts
const testCaseId = 1;
const testCaseTitle = "Login works";
const testCaseStatus = "passed";
```

This gets messy when you have ten test cases. An **object** solves this. An object is one value that holds several named values.

## Create an object

You write an object with curly braces `{ }`. Inside, you write pairs of `name: value`, separated by commas.

```ts
const testCase = {
  id: 1,
  title: "Login works",
  status: "passed",
};

console.log(testCase);
```

A **property** is one `name: value` pair inside an object. This object has three properties: `id`, `title` and `status`.

The program prints:

```text
{ id: 1, title: 'Login works', status: 'passed' }
```

## Read a property

Write the object name, a dot, and the property name.

```ts
const testCase = {
  id: 1,
  title: "Login works",
  status: "passed",
};

console.log(testCase.title);
console.log(testCase.status);
```

The program prints:

```text
Login works
passed
```

If you write a property name that does not exist, TypeScript shows a red underline. This helps you find spelling mistakes early.

## Change a property

You can assign a new value to a property with `=`.

```ts
const testCase = {
  id: 1,
  title: "Login works",
  status: "not run",
};

testCase.status = "passed";
console.log(testCase.status);
```

The program prints:

```text
passed
```

> **Note:** The variable is `const`, and you still changed a property. `const` means the variable always points to the same object. It does not freeze the inside of the object.

## An object can hold any value

The value of a property can be text, a number, a boolean, an array, or even another object.

```ts
const testCase = {
  id: 2,
  title: "Checkout applies discount",
  automated: true,
  tags: ["checkout", "smoke"],
  environment: { name: "staging", browser: "chromium" },
};

console.log(testCase.environment.browser);
console.log(testCase.tags.length);
```

The program prints:

```text
chromium
2
```

Read `testCase.environment.browser` from left to right: the test case, then its environment, then its browser.

## A list of objects

In real work you have many test cases. Put the objects inside an array.

```ts
const testCases = [
  { id: 1, title: "Login works", status: "passed" },
  { id: 2, title: "Checkout applies discount", status: "failed" },
  { id: 3, title: "Logout clears session", status: "failed" },
];

let failedCount = 0;

for (const testCase of testCases) {
  console.log(`#${testCase.id} ${testCase.title}`);
  if (testCase.status === "failed") {
    failedCount += 1;
  }
}

console.log(`Failed: ${failedCount}`);
```

The loop gives you one object at a time in the variable `testCase`. The program prints:

```text
#1 Login works
#2 Checkout applies discount
#3 Logout clears session
Failed: 2
```

This shape, an array of objects, is very common. Test data and API answers often look like this.

## Destructuring

**Destructuring** takes properties out of an object and puts them in variables, in one line.

```ts
const testCase = { id: 7, title: "Reset password", status: "failed" };

const { title, status } = testCase;

console.log(`${title} is ${status}`);
```

The program prints:

```text
Reset password is failed
```

The names inside `{ }` must match the property names. You will see this form often in Playwright code, so learn to read it. You can also use it in a function parameter:

```ts
function describe({ id, title }: { id: number; title: string }): string {
  return `#${id} ${title}`;
}

console.log(describe({ id: 7, title: "Reset password" }));
```

This prints `#7 Reset password`. The text after the colon is the type of the object. Lesson 08 shows a cleaner way to write it.

## Practice

1. Create the file `exercises/01-programming/objects-practice.ts`.
2. Write an object named `bug` with the properties `id` (a number), `title` (text) and `severity` (text, for example `"high"`).
3. Print the title with `console.log(bug.title)`.
4. Change `bug.severity` to `"low"` and print the object.
5. Make an array of three bugs. Use `for...of` to print each title.
6. Open `exercises/01-programming/07-objects.ts`. Replace each `// TODO` with code.
7. Run the exercise file with this command:

```bash
node exercises/01-programming/07-objects.ts
```

Make every line say `OK`.

## Check what you know

1. What is a property?

<details><summary>Answer</summary>

A property is one `name: value` pair inside an object.

</details>

2. How do you read the `status` of an object named `testCase`?

<details><summary>Answer</summary>

Write `testCase.status`.

</details>

3. Can you change a property of an object that is stored in a `const` variable?

<details><summary>Answer</summary>

Yes. `const` only stops you from putting a different object in the variable. You can still change properties inside it.

</details>

4. What does `const { title } = testCase;` do?

<details><summary>Answer</summary>

It creates a variable `title` and gives it the value of `testCase.title`.

</details>

## Next step

In the next lesson you give names to your own object shapes, so TypeScript can check them for you.
