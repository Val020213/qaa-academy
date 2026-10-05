---
title: Types
summary: Learn that every value has a type, and let the TypeScript type checker find mistakes before you run the code.
duration: 45 min
---

## Goal

- Name the type of a value: string, number or boolean.
- Write a type annotation, and know when TypeScript finds the type for you.
- Use the type checker to find mistakes before running.
- Explain `null` and `undefined` in simple words.

## Every value has a type

A **type** is the kind of a value. You met three kinds in the last lesson.

| Type      | Example           | Meaning        |
| --------- | ----------------- | -------------- |
| `string`  | `"Login failed"`  | text           |
| `number`  | `404`             | a number       |
| `boolean` | `true`            | yes or no      |

The type decides what you can do with a value. You can multiply numbers. You cannot multiply text in a useful way.

You can ask for the type with `typeof`.

```ts
console.log(typeof "Login failed");
console.log(typeof 404);
console.log(typeof true);
```

This prints:

```text
string
number
boolean
```

## Text that looks like a number

`"5"` and `5` look the same, but they are not the same. The first is a string. The second is a number.

```ts
console.log("5" + "1");
console.log(5 + 1);
```

This prints:

```text
51
6
```

With text, `+` joins the parts. With numbers, `+` adds them.

This is a common mistake. A web page often gives you text, even when it shows a number. For example, the text of a price on a page is a string.

To change text to a number, use `Number()`. To change a number to text, use `String()`.

```ts
const textFromPage = "5";
console.log(Number(textFromPage) + 1);
console.log(String(404) + " error");
```

This prints:

```text
6
404 error
```

## Type annotations

A **type annotation** tells TypeScript the type of a variable. You write a colon and the type after the name.

```ts
const testName: string = "Login with valid user";
const retries: number = 3;
const isBlocked: boolean = false;
```

Read the first line: `testName` is a string, and its value is this text.

## Type inference

You often do not need to write the type. TypeScript can see it from the value. This is called **type inference**.

```ts
const testName = "Login with valid user";
```

TypeScript knows that `testName` is a string, because the value is text.

A good rule: let TypeScript infer the type for simple variables. Write the type when TypeScript cannot know it. You will do this for functions in lesson 05.

## The type checker

The **type checker** is a part of TypeScript. It reads your code and looks for mistakes, before you run it. Think of it as a reviewer who reads every line.

Write this in a file:

```ts
const retries: number = "three";
```

The type checker reports an error:

```text
error TS2322: Type 'string' is not assignable to type 'number'.
```

It says: you promised a number, but you gave text.

You see the problem in two places:

- In VS Code, a red wavy line appears under the code. Move the mouse over it to read the message.
- In the terminal, you can run the type checker for the whole project:

```bash
pnpm typecheck
```

Fix the problem before you run the program. It is faster than finding it later.

> **Note:** The command `node file.ts` does not check types. It only removes them and runs the code. The checker is `pnpm typecheck` and the red lines in VS Code.

## null and undefined

Sometimes a value is missing. TypeScript has two special values for this.

`undefined` means: nothing has been given yet. A variable that has no value is `undefined`.

`null` means: there is no value, and this is on purpose. You set it yourself.

```ts
let assignee: string | undefined;
console.log(assignee);
console.log(typeof assignee);

const owner: string | null = null;
console.log(owner);
```

This prints:

```text
undefined
undefined
null
```

The sign `|` means "or". So `string | undefined` means: a string, or nothing yet. And `string | null` means: a string, or no value on purpose.

The type checker uses this to protect you. If a value can be missing, it makes you think about that case.

## Go deeper

### Why types disappear when the program runs

TypeScript checks your types, and then it removes them. What Node.js runs is plain JavaScript. This is why `node file.ts` does not report a type mistake.

It also means TypeScript only knows what you tell it. If a value comes from outside, like text from a web page, TypeScript cannot look inside it. At run time, the value has the type it really has.

### A common wrong idea: "Number() always gives a number I can trust"

`Number()` always returns a value of type `number`. But the value can still be useless.

```ts
console.log(Number("abc"));
console.log(Number(""));
console.log(typeof Number("abc"));
```

This prints:

```text
NaN
0
number
```

`NaN` means "not a number". It is a number value that marks a failed conversion. Its type is still `number`. And an empty text becomes `0`, with no warning. So check the text before you trust the result.

### How it shows up in real QA automation work

A page shows a price as text, like `$5.00`. You want to add 1 to it.

```ts
console.log(Number("$5.00"));
console.log(Number("$5.00".replace("$", "")) + 1);
console.log("5" + 1);
```

This prints:

```text
NaN
6
51
```

The `$` sign makes the conversion fail. `replace` is a ready-made function of text. Here it changes `$` into nothing. The last line shows the other danger: `+` with a string and a number joins them as text, and gives `"51"`.

Many wrong test results come from this. The value on the page looked like a number, but the code treated it as text.

### A trade-off: types help, but they are not tests

The type checker finds a wrong kind of value. It cannot tell you if a price is correct. Only a test with a check can do that. Types and tests catch different problems, so you need both.

## Practice

1. Create the file `exercises/01-programming/types.ts`.
2. Print the `typeof` of a text, a number and `true`.
3. Print `"2" + "3"` and `2 + 3`. Check that the results are different.
4. Turn the text `"10"` into a number with `Number()`. Add 5 and print the result.
5. Write `const retries: number = "three";`. Look at the red line in VS Code. Read the message. Then run `pnpm typecheck` in the terminal. Fix the line.
6. Open `exercises/01-programming/03-types.ts` and run it:

```bash
node exercises/01-programming/03-types.ts
```

Solve the exercises. Make every line say `OK`.

## Check what you know

1. What does `"5" + "1"` give?

<details>
<summary>Answer</summary>

The text `"51"`. With text, `+` joins the parts.

</details>

2. What is the difference between a type annotation and type inference?

<details>
<summary>Answer</summary>

An annotation is a type that you write. With inference, TypeScript finds the type from the value.

</details>

3. Does `node file.ts` find type mistakes?

<details>
<summary>Answer</summary>

No. Use the red lines in VS Code or `pnpm typecheck`.

</details>

4. What is the difference between `null` and `undefined`?

<details>
<summary>Answer</summary>

`undefined` means nothing has been given yet. `null` means there is no value, on purpose.

</details>

5. What does this code print, and why?

```ts
console.log(typeof Number("abc"), Number("abc"));
```

<details>
<summary>Answer</summary>

It prints `number NaN`. `Number()` cannot read the text `abc`, so it gives `NaN`. `NaN` is a special value of the type number. It is not an error, so the program continues.

</details>

6. A test reads the text `"20"` from a page and wants the total after adding 5. Find the bug.

```ts
const price = "20";
const total = price + 5;
console.log(total);
```

<details>
<summary>Answer</summary>

It prints `205`, not `25`. The variable `price` is a string, so `+` joins the text. The fix is `Number(price) + 5`. The type checker does not complain here, because joining text and a number is allowed.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **Why does `typeof null` give `"object"` in JavaScript?**
   - Search for: `typeof null object javascript why`
   - A good answer explains: the history behind it, and that it is a known mistake in the language.

2. **What is `NaN`, and why is `NaN === NaN` false? How do you check for it?**
   - Search for: `javascript NaN not equal itself Number.isNaN`
   - A good answer explains: what NaN means, the surprising comparison, and the correct way to test for it.

3. **What is the difference between a type checker and a test, and which problems can each one catch?**
   - Search for: `static typing vs testing bugs`
   - A good answer explains: one problem that only types catch, one that only tests catch, and why teams use both.

## Next step

In the next lesson you make your program take decisions with comparisons and `if`.
