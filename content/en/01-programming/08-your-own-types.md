---
title: Your own types
duration: 50 min
---

## Goal

In this lesson you name the shape of your objects and limit the values they can hold, so TypeScript finds mistakes before the program runs.

- Write a type alias for an object shape, with an optional property.
- Limit a text value to a fixed set of choices, and explain why that is safer than plain text.
- Predict which mistakes TypeScript catches before you run the program, and which it cannot catch.
- Decide when a type is worth writing and when it is only noise.

## Type aliases

In the "Objects" lesson you wrote the type of an object again and again. That is long and easy to get wrong.

A **type alias** gives a name to a type. You write it once and use it everywhere.

```ts
type Dog = {
  name: string
  age: number
}

const rex: Dog = {
  name: "Rex",
  age: 3,
}

console.log(rex.name)
```

The program prints `Rex`.

By convention, type names start with a capital letter. Now TypeScript checks that every `Dog` has the right properties:

```ts
type Dog = { name: string, age: number }

// Error: Property 'age' is missing
const missing: Dog = { name: "Mimi" }

// Error: Type 'string' is not assignable to type 'number'
const wrong: Dog = { name: "Luna", age: "three" }
```

Both lines get a red underline. You find the mistake while you type, without waiting for the program to run.

## Optional properties

Some values are not always there. A dog may have a nickname, or not. Put `?` after the property name to make it **optional**.

```ts
type Dog = {
  name: string
  age: number
  nickname?: string
}

const withNickname: Dog = { name: "Rex", age: 3, nickname: "Rexy" }
const withoutNickname: Dog = { name: "Mimi", age: 5 }

console.log(withNickname.nickname)
console.log(withoutNickname.nickname)
```

The program prints:

```text
Rexy
undefined
```

The type of `nickname` is `string | undefined`. The `|` sign means "or", and `undefined` is the "no value here" you met in the "Types" lesson.

## Limit the choices

A pizza shop has a function that gives the price for a size. If the parameter is a plain `string`, an order with the size spelled `"Large"`, with a capital L, produces no error:

```ts
function pizzaPrice(size: string): number {
  if (size === "small") {
    return 8
  }
  if (size === "large") {
    return 12
  }
  return 0
}

console.log(pizzaPrice("Large"))
```

The program prints `0`. `"Large"` is not equal to `"large"`, so both `if` lines are skipped and the last line returns 0: the customer gets a free pizza. TypeScript could not warn you, because `"Large"` is a valid `string`.

A pizza size should only be `"small"`, `"medium"` or `"large"`. You can make a type from exact text values, joined with `|`. This is called a **union**.

```ts
type Size = "small" | "medium" | "large"

type Pizza = {
  flavour: string
  size: Size
}

const order: Pizza = { flavour: "Margherita", size: "large" }
console.log(order.size)
```

The program prints `large`. A value outside the list is a mistake:

```ts
type Size = "small" | "medium" | "large"

// Error: Type '"Large"' is not assignable to type 'Size'
const size: Size = "Large"
```

TypeScript catches the spelling mistake before you run anything. If you change the parameter type of `pizzaPrice` to `Size`, the checker also flags the call with `"Large"`. This excerpt omits the function body; keep the body from the earlier example:

```ts
function pizzaPrice(size: Size): number {
  // ...
}

pizzaPrice("Large")
```

The call gets a red underline: `Argument of type '"Large"' is not assignable to parameter of type 'Size'`. The union lets the checker detect this incorrect call; Node.js does not reject it because of its type.

> **Note:** Other tutorials use `enum` for this. In this course, use a union of text values instead. It is removed when Node.js runs the file. An `enum` needs code transformation, which Node.js does not support in its type-stripping mode.

## Narrowing with if

Sometimes a value can be one of several types. A condition can rule out some possible types; the checker uses it to narrow the type in each branch. This is called **narrowing**.

```ts
type Dog = {
  name: string
  age: number
  nickname?: string
}

function callName(dog: Dog): string {
  if (dog.nickname === undefined) {
    return dog.name
  }
  return dog.nickname.toUpperCase()
}

console.log(callName({ name: "Rex", age: 3, nickname: "Rexy" }))
console.log(callName({ name: "Mimi", age: 5 }))
```

The program prints:

```text
REXY
Mimi
```

After the `if` with `return`, TypeScript knows `nickname` is a `string`. Without that `if`, it refuses `dog.nickname.toUpperCase()` with the message `'dog.nickname' is possibly 'undefined'`, protecting you from the crash that would happen for Mimi.

## Reading Array and Promise types

Sometimes you see types with `<` and `>`. You only need to read them, not write them. Read the part inside `< >` as "of".

- `Array<Dog>` is "an array of dogs". It is the same as `Dog[]`.
- `Promise<string>` is a promise whose value, if it fulfills, is a `string`.

## Go deeper

### Types do not validate data at runtime

When you run a `.ts` file, Node.js removes type annotations before executing JavaScript. It does not check types, so a type does not validate data that arrives while the program runs.

```ts
type Dog = { name: string, age: number }

const parsed: Dog = JSON.parse('{"name":"Rex","age":"abc"}')
console.log(parsed.age + 1)
```

TypeScript shows no error. The program prints:

```text
abc1
```

The type says `age` is a number, but the real data has text. `JSON.parse` returns a value of type `any`, which means "anything", so TypeScript accepts it without a check. The type you write is what you expect, not proof of what arrived.

### When not to write a type

Do not write a type for everything. This line needs none:

```ts
const count = 3
```

TypeScript already knows that `count` is a number. Write types for function parameters, for shapes that many places share, and for fixed choices. Repeating a type the checker already infers does not always add a useful check. The idea here is **KISS**: keep it simple. A related idea is **YAGNI**, "You Aren't Gonna Need It": do not build for needs that you only imagine, such as a type with ten optional properties because "maybe we will need them".

Use a union only when the choices are a small, fixed list. If the text can be anything, such as the name a person types, use `string`.

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

Make every check say `OK`.

## Challenge

Choose your own world, for example payment methods in a shop or geometric shapes. Write a type with at least three kinds of thing. Each kind has its own properties: a circle has a `radius` and a square has a `side`. Then write a function that takes any of them and returns a text that describes it.

Create the file `exercises/challenges/your-own-types.ts`. Run it with `node exercises/challenges/your-own-types.ts`.

It is done when:

- The type has at least three kinds. When you write an object of one kind directly with a property belonging only to another, the checker flags it. Check this on purpose, then remove the wrong line.
- Your function handles every kind, and running the file prints one line per kind.
- You add a fourth kind to the type, and TypeScript shows an error inside your function until you handle the new kind.
- `pnpm typecheck` shows no error for your file at the end.

You will need something this lesson did not teach: how to give each kind a label so that TypeScript knows which kind it has, and how to make TypeScript complain about a kind you forgot. Search for `typescript discriminated union` and `typescript exhaustive check never`.

## Think it through

1. Predict the output and say why.

```ts
type Dog = { name: string, age: number, nickname?: string }

const rex: Dog = { name: "Rex", age: 3 }
console.log(`Nickname: ${rex.nickname}`)
```

<details>
<summary>Answer</summary>

It prints `Nickname: undefined`. The property `nickname` is optional and was not given, so its value is `undefined`. The template converts it to the text "undefined". TypeScript does not stop you, but the result is probably not what you want on a screen. A check with `if` would be better.

</details>

2. The code compiles and runs. A medium pizza costs 12, but the shop wants 10. Find the bug.

```ts
type Size = "small" | "medium" | "large"

function price(size: Size): number {
  if (size === "small") {
    return 8
  }
  return 12
}
```

<details>
<summary>Answer</summary>

The function was written when only `small` and `large` existed. When `"medium"` was added to the type, it still compiled, because "everything that is not small costs 12" is valid code. The type did not force the author to think about the new size. A safer shape lists every size with its own `if` and ends with a check that fails to compile when a size is missing, like the one in the challenge. Types catch a whole class of mistakes, not every mistake.

</details>

3. What breaks if the requirement changes, and the type changes from `age: number` to `age: string` because some dogs are "about 3"?

```ts
type Dog = { name: string, age: string }
const rex: Dog = { name: "Rex", age: "3" }
console.log(rex.age + 1)
```

<details>
<summary>Answer</summary>

The checker rejects `rex.age * 2` because its operand has type `string`. JavaScript can convert numeric text when multiplying, but TypeScript requires a numeric type here. In contrast, `rex.age + 1` is allowed: `+` concatenates when an operand is text, and the program prints `31`, not `4`. After a type change like this, search for every use of the property and read each one.

</details>

## Next step

In the next lesson you use `map`, `filter` and `find` to work with lists of typed objects.
