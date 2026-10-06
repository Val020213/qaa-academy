---
title: Types
summary: Learn that every value has a type, and let the TypeScript type checker find mistakes before you run the code.
duration: 70 min
---

## Start with a puzzle

A pet shelter keeps the number of cats as text, because it comes from a form. It keeps the number of dogs as a real number.

```ts
const cats = "3";
const dogs = 4;
console.log(cats + dogs);
console.log(cats * dogs);
console.log(cats - dogs);
```

What do the three lines print? You may think the program stops with an error, because you cannot mix text and numbers. Or you may think all three lines behave in the same way.

Look at each sign separately. One of them may treat `"3"` very differently from the other two.

Write down your guess before you read on.

## Goal

- Predict what an operation gives when its values have different types.
- Name the type of a value, and write a type annotation when it is needed.
- Use the type checker to find a mistake before you run the code.
- Decide when a missing value should be `null` and when it should be `undefined`.

## Every value has a type

A **type** is the kind of a value. You met three kinds in the last lesson.

| Type      | Example           | Meaning        |
| --------- | ----------------- | -------------- |
| `string`  | `"Rex"`           | text           |
| `number`  | `404`             | a number       |
| `boolean` | `true`            | yes or no      |

The type decides what you can do with a value. You can multiply numbers. You cannot multiply a dog name in a useful way.

You can ask for the type with `typeof`.

```ts
console.log(typeof "Rex");
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

Before you read the result, guess what each line prints:

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

To change text to a number, use `Number()`. To change a number to text, use `String()`.

```ts
const ageFromForm = "5";
console.log(Number(ageFromForm) + 1);
console.log(String(404) + " error");
```

This prints:

```text
6
404 error
```

### Back to the puzzle

The puzzle prints this:

```text
34
12
-1
```

The sign `+` has two jobs. If one side is text, it joins. So `"3" + 4` becomes the text `"34"`. The signs `*` and `-` have only one job: maths. So JavaScript quietly turns `"3"` into the number 3 and calculates `3 * 4` and `3 - 4`.

JavaScript does this change without telling you. It is called **type coercion**. It is friendly sometimes and dangerous often, because the same text gives different kinds of result in each line.

TypeScript sees the problem. In VS Code, the lines with `*` and `-` show a red line: the left side of the maths must be a number. The command `node` ignores types and runs the file anyway. So the program works, and the checker still warns you.

## Type annotations

A **type annotation** tells TypeScript the type of a variable. You write a colon and the type after the name.

```ts
const dogName: string = "Rex";
const dogAge: number = 3;
const isHungry: boolean = false;
```

Read the first line: `dogName` is a string, and its value is this text.

## Type inference

You often do not need to write the type. TypeScript can see it from the value. This is called **type inference**.

```ts
const dogName = "Rex";
```

TypeScript knows that `dogName` is a string, because the value is text.

A good rule: let TypeScript infer the type for simple variables. Write the type when TypeScript cannot know it. You will do this for functions in lesson 05.

## The type checker

The **type checker** is a part of TypeScript. It reads your code and looks for mistakes, before you run it. Think of it as a reviewer who reads every line.

Write this in a file:

```ts
const dogAge: number = "three";
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

`undefined` means: nothing has been given yet. A weather station that has not made its first measurement has an `undefined` temperature.

`null` means: there is no value, and this is on purpose. A dog in a shelter that nobody has adopted has no owner. You set that yourself.

```ts
let temperature: number | undefined;
console.log(temperature);
console.log(typeof temperature);

const owner: string | null = null;
console.log(owner);
```

This prints:

```text
undefined
undefined
null
```

The sign `|` means "or". So `number | undefined` means: a number, or nothing yet. And `string | null` means: a string, or no value on purpose.

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
5. Write `const dogAge: number = "three";`. Look at the red line in VS Code. Read the message. Then run `pnpm typecheck` in the terminal. Fix the line.
6. Open `exercises/01-programming/03-types.ts` and run it:

```bash
node exercises/01-programming/03-types.ts
```

Solve the exercises. Make every line say `OK`.

## Challenge

A weather station sends its readings as text, with the unit at the end: `"21.5°C"`, `"19°C"`, `"23°C"`. Write a program that turns the readings into numbers and reports the average. You may change the world: a swimming pool sensor, the heights of players in a basketball team, the prices on a menu.

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
console.log("3" * "4", "3" + "4", "3" - 1, "3" + 1);
```

<details>
<summary>Answer</summary>

It prints `12 34 2 31`. The signs `*` and `-` can only do maths, so JavaScript turns the text into numbers: `3 * 4` is 12 and `3 - 1` is 2. The sign `+` joins when one side is text, so you get `"34"` and `"31"`. The type checker marks the maths lines with a red line, but `node` runs them.

</details>

2. A swimming pool program should print the average of two readings, 20 and 30. It prints a strange number. Find the bug.

```ts
const morning = "20";
const evening = "30";
console.log((morning + evening) / 2);
```

<details>
<summary>Answer</summary>

It prints `1015`. Both values are text, so `+` joins them into `"2030"`. Then `/ 2` turns that text into the number 2030 and divides it. The program runs with no error and gives a wrong answer. The fix is to turn the text into numbers first: `(Number(morning) + Number(evening)) / 2`, which gives 25.

</details>

3. Two versions that both work. Which is better, and what would make you choose the other?

```ts
const dogAge: number = 3;
```

```ts
const dogAge = 3;
```

<details>
<summary>Answer</summary>

The second is better for a simple value. TypeScript already knows it is a number, so the annotation repeats information, and it adds noise. You would choose the first when the value is not given at that moment, for example `let dogAge: number;`, or when you want the checker to stop a wrong value from a function. The rule: write a type where TypeScript cannot know it by itself.

</details>

4. A form sends an age as text. Your code is `Number(ageText) + 1` to find the next birthday. A new rule says the age field may be empty. What goes wrong?

<details>
<summary>Answer</summary>

An empty text becomes `0` with `Number("")`, so the next age is `1`. The program shows no error and no warning, and the result looks like a real age. The missing value hides inside a valid number. You would need to check for the empty text before you convert, and decide what the program should say when there is no age.

</details>

5. A shelter stores the owner of each dog as `string`. A dog arrives with no owner. What problem do you meet, and how would the type `string | null` help?

<details>
<summary>Answer</summary>

With only `string`, you must invent a fake value such as `""` or `"none"`. That value looks like a real owner, and nothing warns you when you use it by mistake. With `string | null`, the missing owner is a real, separate case. The type checker then makes you handle `null` before you use the text. The cost is a little more code at each place where you read the owner.

</details>

6. Should a program keep a price as the number `5` or as the text `"$5.00"`? There is no single right answer. Explain what each choice gives you, and what it depends on.

<details>
<summary>Answer</summary>

A number lets you add, compare and multiply with no conversion, and the checker can protect you. The text is what a person reads, so it is good for showing, and it keeps the symbol and the format. A common solution is to keep the number inside the program and make the text only at the last moment, when you show it. The choice depends on what the value does: calculations need a number, while display and comparison with a page need the text.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **Why does `typeof null` give `"object"` in JavaScript?**
   - Search for: `typeof null object javascript why`
   - Try it: print `typeof null`, `typeof undefined`, `typeof NaN` and `typeof []` in one `console.log`. Check each answer against your expectation.
   - A good answer explains: the history behind it, and that it is a known mistake in the language.

2. **What is `NaN`, and why is `NaN === NaN` false? How do you check for it?**
   - Search for: `javascript NaN not equal itself Number.isNaN`
   - Try it: print `NaN === NaN`, `Number.isNaN(NaN)`, `Number.isNaN("abc")` and `isNaN("abc")`. Two of the last three give different answers. Find out why.
   - A good answer explains: what NaN means, the surprising comparison, and why `Number.isNaN` and `isNaN` are not the same.

3. **What is the difference between a type checker and a test, and which problems can each one catch?**
   - Search for: `static typing vs testing bugs`
   - Try it: write `const squareArea: number = 4 + 4;` for a square with side 4. Check that the type checker is happy. Then explain what kind of check would find the mistake.
   - A good answer explains: one problem that only types catch, one that only tests catch, and why teams use both.

## Next step

In the next lesson you make your program take decisions with comparisons and `if`.
