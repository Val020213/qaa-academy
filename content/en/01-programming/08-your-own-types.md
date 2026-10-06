---
title: Your own types
summary: Name the shape of your objects with type aliases, optional properties and literal unions, and let the computer find mistakes before the program runs.
duration: 65 min
---

## Start with a puzzle

A pizza shop has a function that gives the price for a size. A customer order arrives with the size spelled `"Large"`, with a capital L.

```ts
function pizzaPrice(size: string): number {
  if (size === "small") {
    return 8;
  }
  if (size === "large") {
    return 12;
  }
  return 0;
}

console.log(pizzaPrice("Large"));
```

What does it print? There is no error message and the program does not stop. Now think about the shop: what happens to the customer, and how could the computer warn the programmer before the program ever runs?

Write down your guess before you read on.

## Goal

- Predict which mistakes TypeScript catches before you run the program, and which it cannot catch.
- Write a type alias for an object shape, with an optional property.
- Limit a text value to a fixed set of choices, and explain why that is safer than plain text.
- Decide when a type is worth writing and when it is only noise.

## Type aliases

In lesson 07 you wrote the type of an object again and again. That is long and easy to get wrong.

A **type alias** gives a name to a type. You write it once and use it everywhere.

```ts
type Dog = {
  name: string;
  age: number;
};

const rex: Dog = {
  name: "Rex",
  age: 3,
};

console.log(rex.name);
```

The program prints `Rex`.

By convention, type names start with a capital letter. Now TypeScript checks that every `Dog` has the right properties.

What do you expect when a property is missing, or when a value has the wrong type?

```ts
type Dog = { name: string; age: number };

// Error: Property 'age' is missing
const missing: Dog = { name: "Mimi" };

// Error: Type 'string' is not assignable to type 'number'
const wrong: Dog = { name: "Luna", age: "three" };
```

Both lines get a red underline. You find the mistake while you type. You do not wait for the program to run.

## Optional properties

Some values are not always there. A dog may have a nickname, or not.

Put `?` after the property name to make it **optional**.

```ts
type Dog = {
  name: string;
  age: number;
  nickname?: string;
};

const withNickname: Dog = { name: "Rex", age: 3, nickname: "Rexy" };
const withoutNickname: Dog = { name: "Mimi", age: 5 };

console.log(withNickname.nickname);
console.log(withoutNickname.nickname);
```

The program prints:

```text
Rexy
undefined
```

The type of `nickname` is `string | undefined`. The `|` sign means "or". Lesson 03 explained `undefined`: it means "no value here".

## Limit the choices

A pizza size should only be `"small"`, `"medium"` or `"large"`. If someone writes `"Large"`, that is a mistake.

You can make a type from exact text values. Join them with `|`. This is called a **union**.

```ts
type Size = "small" | "medium" | "large";

type Pizza = {
  flavour: string;
  size: Size;
};

const order: Pizza = { flavour: "Margherita", size: "large" };
console.log(order.size);
```

The program prints `large`.

Now try a wrong value:

```ts
type Size = "small" | "medium" | "large";

// Error: Type '"Large"' is not assignable to type 'Size'
const size: Size = "Large";
```

TypeScript catches the spelling mistake before you run anything. This is the way we use fixed choices in this course.

> **Note:** Other tutorials use `enum` for this. In this course, use a union of text values instead. It is simpler and works everywhere.

### Back to the puzzle

The program prints `0`. The text `"Large"` is not equal to `"large"`, so both `if` lines are skipped, and the last line returns 0. The customer gets a free pizza. TypeScript could not warn you, because the parameter type was `string`, and `"Large"` is a valid string. Change the parameter type to `Size`:

```ts
function pizzaPrice(size: Size): number {
  // ...
}

pizzaPrice("Large");
```

Now the call has a red underline: `Argument of type '"Large"' is not assignable to parameter of type 'Size'`. A union turns a silent wrong answer into a loud, early error. A mistake you see while typing costs seconds. A mistake that reaches a customer costs much more.

## Narrowing with if

Sometimes a value can be one of several types. Inside an `if`, TypeScript learns which one it is. This is called **narrowing**.

```ts
type Dog = {
  name: string;
  age: number;
  nickname?: string;
};

function callName(dog: Dog): string {
  if (dog.nickname === undefined) {
    return dog.name;
  }
  return dog.nickname.toUpperCase();
}

console.log(callName({ name: "Rex", age: 3, nickname: "Rexy" }));
console.log(callName({ name: "Mimi", age: 5 }));
```

The program prints:

```text
REXY
Mimi
```

After the `if` with `return`, TypeScript knows `nickname` is a `string`. Try to remove the `if`. TypeScript refuses `dog.nickname.toUpperCase()` with the message `'dog.nickname' is possibly 'undefined'`. It protects you from the crash that would happen for Mimi.

## Reading Array and Promise types

Sometimes you see types with `<` and `>`, like `Array<Dog>`. You only need to read them, not write them.

- `Array<Dog>` means a list of dogs. It is the same as `Dog[]`.
- `Promise<string>` means "a string that will arrive later". Lesson 10 explains this.

Read the part inside `< >` as "of". `Array<Dog>` is "an array of dogs".

## Go deeper

### Types exist only while you write

TypeScript removes all types before the program runs. Node only sees plain JavaScript. So a type cannot check data that arrives while the program runs.

```ts
type Dog = { name: string; age: number };

const parsed: Dog = JSON.parse('{"name":"Rex","age":"abc"}');
console.log(parsed.age + 1);
```

TypeScript shows no error. The program prints:

```text
abc1
```

The type says `age` is a number. The real data has text. `JSON.parse` returns a value of type `any`, which means "anything", so TypeScript accepts it without a check. You told TypeScript what you hope, and it believed you.

This is the one link to testing in this lesson. An API answer is data from outside. A type describes what you expect, not what the server sent. Your test must still check the real values.

### One shape, written once

A type alias is also a way to avoid repetition. This idea is called **DRY**, "Don't Repeat Yourself". Each piece of knowledge lives in one place. You will study it at the end of this module.

Look at `Size`. The allowed values are written once:

```ts
type Size = "small" | "medium" | "large" | "family";
```

You add `"family"` here, and every place that uses `Size` accepts it. If you wrote the choices in ten functions, you would change ten places and could forget one.

But be careful: a new choice does not make old code handle it. A function that says "small is 8, anything else is 12" still compiles, and it gives the family size the price of a large one. The type checker accepts it, because the code is valid. Only a person, or a test, can tell that the rule is wrong. Types catch a whole class of mistakes. They do not catch every mistake.

### When not to write a type

Do not write a type for everything. This line needs none:

```ts
const count = 3;
```

TypeScript already knows that `count` is a number. Write types for function parameters, for shapes that many places share, and for fixed choices. Extra types make the code longer and do not make it safer. The idea here is **KISS**: keep it simple. A related idea is **YAGNI**, "You Aren't Gonna Need It": do not build for needs that you only imagine. Do not write a big type with ten optional properties because "maybe we will need them".

Also choose the right tool. Use a union only when the choices are a small, fixed list. If the text can be anything, such as the name a person types, use `string`.

## Practice

1. Create the file `exercises/01-programming/types-practice.ts`.
2. Write a type `Mood` with the values `"happy"`, `"tired"` and `"hungry"`.
3. Write a type `Pet` with `name` (string), `age` (number), `mood` (`Mood`) and an optional `owner` (string).
4. Create two `Pet` objects, one with an owner and one without.
5. On purpose, write `mood: "angry"` and look at the red underline. Then fix it.
6. Open `exercises/01-programming/08-your-own-types.ts`. Replace each `// TODO` with code.
7. Run the exercise file with this command:

```bash
node exercises/01-programming/08-your-own-types.ts
```

Make every line say `OK`.

## Challenge

Choose your own world: payment methods in a shop, shapes, vehicles, messages that an app can send, moves in a card game. Write a type with at least three kinds of thing. Each kind has its own properties. For example, a circle has a `radius` and a square has a `side`. Then write a function that takes any of them and returns a text that describes it.

Create the file `exercises/challenges/your-own-types.ts`. Run it with `node exercises/challenges/your-own-types.ts`.

It is done when:

- The type has at least three kinds, and a kind cannot have the properties of another kind. TypeScript shows a red underline when you try. Check this on purpose, then remove the wrong line.
- Your function handles every kind, and running the file prints one line per kind.
- You add a fourth kind to the type, and TypeScript shows an error inside your function until you handle the new kind. Check this on purpose, then handle it or remove it.
- `pnpm typecheck` shows no error for your file at the end.

You will need something this lesson did not teach: how to give each kind a label so that TypeScript knows which kind it has, and how to make TypeScript complain about a kind you forgot. Search for `typescript discriminated union` and `typescript exhaustive check never`.

## Think it through

1. Predict the output and say why.

```ts
type Dog = { name: string; age: number; nickname?: string };

const rex: Dog = { name: "Rex", age: 3 };
console.log(`Nickname: ${rex.nickname}`);
```

<details>
<summary>Answer</summary>

It prints `Nickname: undefined`. The property `nickname` is optional and was not given, so its value is `undefined`. A template string turns any value into text, so you see the word `undefined`. TypeScript does not stop you, but the result is probably not what you want on a screen. A check with `if` would be better.

</details>

2. The code compiles and runs. A medium pizza costs 12, but the shop wants 10. Find the bug.

```ts
type Size = "small" | "medium" | "large";

function price(size: Size): number {
  if (size === "small") {
    return 8;
  }
  return 12;
}
```

<details>
<summary>Answer</summary>

The function was written when only `small` and `large` existed. When `"medium"` was added to the type, the function still compiled, because "everything that is not small costs 12" is valid code. The type did not force the author to think about the new size. A safer shape lists every size on purpose, with `if` for each one and a final check that fails to compile when a size is missing. You will see this idea in the challenge.

</details>

3. Both versions work. Which is better here, and what would make you choose the other?

```ts
type DogA = { name: string; nickname?: string };
type DogB = { name: string; nickname: string };
// For DogB, "no nickname" is written as an empty text: ""
```

<details>
<summary>Answer</summary>

Version A is usually better, because `undefined` means "no value" and TypeScript forces every reader to check it. With version B, the empty text looks like a real value, so a screen can show `Nickname: ` with nothing after it and no check warns you. You would choose B when the data comes from a form or a file that always gives a text, and when an empty text is a normal and harmless value in your program. The choice depends on whether "missing" and "empty" mean different things for your users.

</details>

4. What breaks if the requirement changes, and the type changes from `age: number` to `age: string` because some dogs are "about 3"?

```ts
type Dog = { name: string; age: string };
const rex: Dog = { name: "Rex", age: "3" };
console.log(rex.age + 1);
```

<details>
<summary>Answer</summary>

Code like `rex.age * 2` gets a red underline, because text cannot be multiplied. That is good: the compiler shows you the places to review. But `rex.age + 1` is allowed. With a string, `+` joins text, and the program prints `31`, not `4`. This shows that a type change does not always give you an error list that finds all problems. After a change like this, search for every use of the property and read each one.

</details>

5. Explain to a teammate, in three sentences and without using the word "wrong", why TypeScript did not stop `parsed.age + 1` from printing `abc1`.

<details>
<summary>Answer</summary>

A good answer could be: TypeScript checks the code while you write, and then it removes the types, so Node never sees them. Data that comes from outside, such as `JSON.parse`, arrives only while the program runs. TypeScript cannot know it, so `JSON.parse` returns `any` and the type you write is a promise, not a proof. The key reason is the time: the check happens before the data exists.

</details>

6. A teammate wants a type alias for every object in the project, even those used once. Where do you draw the line?

<details>
<summary>Answer</summary>

There is no single answer. Types help when a shape is shared by several places, when it comes into a function as a parameter, or when a mistake in it would be costly. For a small object used once in one function, TypeScript already knows its shape, and a name adds length and one more thing to read. This is the balance between safety and **KISS** or **YAGNI**. The line depends on how many places use the shape and how long the code will live.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **What is the difference between `type` and `interface` in TypeScript?**
   - Search for: `typescript type vs interface`
   - Try it: write the `Dog` shape both ways. Then try to make a union of two shapes with each one, and read which one works.
   - A good answer explains: how each one describes an object shape, one thing only `type` can do, and which one this course uses and why.

2. **What does it mean that TypeScript types are erased at runtime?**
   - Search for: `typescript types erased at runtime`
   - Try it: write a function with a typed parameter. Call it from a second file with `JSON.parse` data of the wrong type. Run it with `node` and see that no type error appears.
   - A good answer explains: what is removed before the program runs, why type checks do not exist when it runs, and one bug this can hide.

3. **How do other people check data that comes from outside, for example a form or a server answer?**
   - Search for: `typescript runtime validation zod`
   - Try it: write a function `isDog(value)` that takes `unknown` and returns `true` only if the value has a string `name` and a number `age`. Test it with three good and three bad values.
   - A good answer explains: why a type cannot do this job, and how a check at run time closes the gap.

## Next step

In the next lesson you use `map`, `filter` and `find` to work with lists of typed objects.
