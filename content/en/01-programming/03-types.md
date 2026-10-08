---
title: Types
duration: 50 min
---

## Goal

In this lesson you learn that every value has a type, and you use the TypeScript type checker to find mistakes before you run the code.

- Predict what an operation gives when its values have different types.
- Name the type of a value, and write a type annotation when it is needed.
- Use the type checker to find a mistake before you run the code.
- Decide when a missing value should be `null` and when it should be `undefined`.

## Every value has a type

A **type** is the kind of a value. You already know three.

| Type      | Example           | Meaning        |
| --------- | ----------------- | -------------- |
| `string`  | `"Rex"`           | text           |
| `number`  | `404`             | a number       |
| `boolean` | `true`            | yes or no      |

The type decides what you can do with a value. You can multiply numbers. You cannot multiply a dog name in a useful way.

You can ask for the type with `typeof`.

```ts
console.log(typeof "Rex")
console.log(typeof 404)
console.log(typeof true)
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
console.log("5" + "1")
console.log(5 + 1)
```

This prints:

```text
51
6
```

With text, `+` joins the parts. With numbers, `+` adds them.

To change text to a number, use `Number()`. To change a number to text, use `String()`.

```ts
const ageFromForm = "5"
console.log(Number(ageFromForm) + 1)
console.log(String(404) + " error")
```

This prints:

```text
6
404 error
```

### Mixing text and numbers

A pet shelter keeps the number of cats as text, because it comes from a form, and the number of dogs as a real number.

```ts
const cats = "3"
const dogs = 4
console.log(cats + dogs)
console.log(cats * dogs)
console.log(cats - dogs)
```

This prints:

```text
34
12
-1
```

The sign `+` has two jobs. If one side is text, it joins. So `"3" + 4` becomes the text `"34"`. The signs `*` and `-` have only one job: maths. So JavaScript quietly turns `"3"` into the number 3 and calculates `3 * 4` and `3 - 4`.

This automatic change is called **type coercion**. It is dangerous because the program does not stop: the same text gives different kinds of result in each line, and none of them is an error.

The type checker flags the operations with `*` and `-`: `cats` is text rather than a number. Node.js removes type annotations, but does not run the checker.

## Type annotations

A **type annotation** tells TypeScript the type of a variable. You write a colon and the type after the name.

```ts
const dogName: string = "Rex"
const dogAge: number = 3
const isHungry: boolean = false
```

Read the first line: `dogName` is a string, and its value is this text.

## Type inference

You often do not need to write the type. TypeScript can see it from the value. This is called **type inference**.

```ts
const dogName = "Rex"
```

TypeScript infers the type from the text you assigned to `dogName`.

A good rule: let TypeScript infer the type for simple variables, and write it when TypeScript cannot know it.

## The type checker

The **type checker** is a part of TypeScript. It reads your code and looks for mistakes before you run it.

Write this in a file:

```ts
const dogAge: number = "three"
```

The type checker reports an error:

```text
error TS2322: Type 'string' is not assignable to type 'number'.
```

It says: you promised a number, but you gave text.

![TypeScript Playground: the checker shows TS2322 when text is assigned to number. Replacing the text with 3 removes the underline.](/clips/01-type-error.webm)

You see the problem in two places:

- In VS Code, a red wavy line appears under the code. Move the mouse over it to read the message.
- In the terminal, you can run the type checker for the whole project:

```bash
pnpm typecheck
```

> **Note:** The command `node file.ts` does not check types. It only removes them and runs the code. `pnpm typecheck` runs the checker; VS Code shows its diagnostics while you type.

## null and undefined

Sometimes a value is missing. JavaScript has two values we use to represent missing data.

We use `undefined` when no value has been supplied yet. A variable declared without an initial value, such as the temperature of a station with no measurements, starts as `undefined`.

We use `null` to state explicitly that there is no value. You can assign it to the owner of a dog that nobody has adopted.

```ts
let temperature: number | undefined
console.log(temperature)
console.log(typeof temperature)

const owner: string | null = null
console.log(owner)
```

This prints:

```text
undefined
undefined
null
```

The sign `|` means "or". So `number | undefined` allows a number or `undefined`. And `string | null` allows a string or `null`.

With the project's strict configuration, the checker flags an operation that needs a value when it could still be `null` or `undefined`.

## Go deeper

### Types disappear when the program runs

With `node file.ts`, Node.js removes type annotations and V8 runs the resulting JavaScript. The type checker runs separately. An annotation does not check an external value at run time: that check must be in the code.

### Number() always gives a `number`, but not always a useful one

```ts
console.log(Number("abc"))
console.log(Number(""))
console.log(typeof Number("abc"))
```

This prints:

```text
NaN
0
number
```

`NaN` means "not a number". It is a value of type `number`; here it appears because converting `"abc"` failed. And an empty text becomes `0`, with no warning. So check the text before you trust the result.

## Practice

1. Create the file `exercises/01-programming/types.ts`.
2. Print the `typeof` of a text, a number and `true`.
3. Print `"2" + "3"` and `2 + 3`. Check that the results are different.
4. Turn the text `"10"` into a number with `Number()`. Add 5 and print the result.
5. Write `const dogAge: number = "three"`. Look at the red line in VS Code. Read the message. Then run `pnpm typecheck` in the terminal. Fix the line.
6. Open `exercises/01-programming/03-types.ts` and run it:

```bash
node exercises/01-programming/03-types.ts
```

Solve the exercises. Make each check say `OK`.

## Challenge

A weather station sends its readings as text, with the unit at the end: `"21.5°C"`, `"19°C"`, `"23°C"`. Write a program that turns the readings into numbers and reports the average. You may change the theme: a swimming pool sensor or the prices on a menu.

Create the file `exercises/challenges/types.ts`.

It is done when:

- The readings are stored as text in three `const` variables. A fourth reading, `"n/a"`, is stored too.
- You run `node exercises/challenges/types.ts` and it prints the average of the first three readings as `Average: 21.2°C`.
- The program also prints `typeof` of the average before you format it, and it says `number`.
- The program prints `false` for the question "is the fourth reading a valid number?" and `true` for the first one.

You will need something this lesson did not teach: a way to read the number at the start of a text such as `"21.5°C"`, and a reliable way to ask "is this value `NaN`?". Search for: `javascript parseFloat`, `javascript Number.isNaN`. For one decimal, search for `javascript toFixed`.

## Think it through

1. What does this line print, and why?

```ts
console.log("3" * "4", "3" + "4", "3" - 1, "3" + 1)
```

<details>
<summary>Answer</summary>

It prints `12 34 2 31`. The signs `*` and `-` can only do maths, so JavaScript turns the text into numbers: `3 * 4` is 12 and `3 - 1` is 2. The sign `+` joins when one side is text, so you get `"34"` and `"31"`. The type checker marks the maths lines with a red line, but `node` runs them.

</details>

2. A swimming pool program should print the average of two readings, 20 and 30. It prints a strange number. Find the bug.

```ts
const morning = "20"
const evening = "30"
console.log((morning + evening) / 2)
```

<details>
<summary>Answer</summary>

It prints `1015`. Both values are text, so `+` joins them into `"2030"`. Then `/ 2` turns that text into the number 2030 and divides it. The program runs with no error and gives a wrong answer. The fix is to turn the text into numbers first: `(Number(morning) + Number(evening)) / 2`, which gives 25.

</details>

3. A form sends an age as text. Your code is `Number(ageText) + 1` to find the next birthday. A new rule says the age field may be empty. What goes wrong?

<details>
<summary>Answer</summary>

An empty text becomes `0` with `Number("")`, so the next age is `1`. The program shows no error and no warning, and the result looks like a real age. You would need to check for the empty text before you convert.

</details>

## Next step

In the next lesson you make your program take decisions with comparisons and `if`.
