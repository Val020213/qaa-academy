---
title: Objects
summary: Group related values under names, and keep a list of test cases as objects.
duration: 40 min
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

## Go deeper

### Why a copy changes the original

An object lives in the computer memory. A variable does not hold the object itself. It holds a link to it. This link is called a **reference**.

When you write `const same = original;`, you copy the link. You do not copy the object. Now two names point to one object.

```ts
const original = { id: 1, status: "failed" };
const same = original;
same.status = "passed";
console.log(original.status);

const copy = { ...original };
copy.status = "skipped";
console.log(original.status, copy.status);
```

The program prints:

```text
passed
passed skipped
```

The first change went through `same` and changed the one shared object. The three dots in `{ ...original }` make a new object with the same properties. Lesson 09 shows the same idea for arrays. This copy is shallow: an object inside the object is still shared.

The same rule explains why `===` does not compare content:

```ts
const a = { id: 1 };
const b = { id: 1 };
console.log(a === b);
console.log(a === a);
console.log(JSON.stringify(a) === JSON.stringify(b));
```

It prints `false`, `true` and `true`. Two objects are equal with `===` only when they are the same object. The checker at the bottom of every exercise file compares the text made by `JSON.stringify`, for this reason.

### How it shows up in QA automation work

Test data is often an object. You write it once and every test reads it. This idea has a name: **DRY**, "Don't Repeat Yourself". You will study it at the end of this module.

This test file lives in the `e2e` folder. The `async` and `await` words come later, in lesson 10. Read the lines as manual steps.

```ts
import { expect, test } from "./lib/test";

const validUser = { email: "qa@example.com", password: "Playwright123" };

test("accepts the test credentials", async ({ page }) => {
  await page.goto("/#/practice");
  await page.getByTestId("login-email").fill(validUser.email);
  await page.getByTestId("login-password").fill(validUser.password);
  await page.getByTestId("login-submit").click();

  await expect(page.getByTestId("login-welcome")).toContainText(validUser.email);
});
```

If the password changes, you change one line. A test must still read as a clear story, so keep the data object small and named well.

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

5. What does this program print, and why?

```ts
type TestCase = { id: number; title: string; status: string };

function markPassed(testCase: TestCase): void {
  testCase.status = "passed";
}

const login: TestCase = { id: 1, title: "Login works", status: "failed" };
markPassed(login);
console.log(login.status);
```

<details><summary>Answer</summary>

It prints `passed`. The function receives a reference to the same object, not a copy. When it changes `status`, the object that `login` points to changes too. This is useful, but also a risk: a function can change your data without you noticing.

</details>

6. This code has a bug. Find it.

```ts
const testCase = { id: 1, title: "Login works", status: "failed" };
const { title, state } = testCase;
console.log(`${title} is ${state}`);
```

<details><summary>Answer</summary>

The object has no property `state`. The property is called `status`. TypeScript shows the error "Property 'state' does not exist" before you run the program. Without the check, the program would print `Login works is undefined`.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **What is the difference between a shallow copy and a deep copy of an object?**
   - Search for: `javascript shallow copy vs deep copy`
   - A good answer explains: what is copied and what is still shared in each case, and one example where a shallow copy causes a surprise.

2. **What is JSON, and how do `JSON.parse` and `JSON.stringify` change between text and objects?**
   - Search for: `MDN JSON.parse JSON.stringify`
   - A good answer explains: what JSON text looks like, what each function does, and what happens when the text is not valid JSON.

3. **Why do testers keep test data separate from test steps?**
   - Search for: `test data management software testing`
   - A good answer explains: what test data is, two problems that appear when data is copied into every test, and one way to keep it in one place.

## Next step

In the next lesson you give names to your own object shapes, so TypeScript can check them for you.
