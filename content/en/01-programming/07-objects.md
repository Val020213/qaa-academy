---
title: Objects
duration: 50 min
---

## Goal

In this lesson you group related values in an object, keep many objects in an array, and see why a function can change an object but not a number.

- Read, change and add a property of an object, also in a nested object.
- Keep many objects in an array and loop over them.
- Predict when a function changes the value you gave it, and when it does not.
- Decide when to change an object and when to make a new one.

## Why we need objects

A dog has a name, an age and a weight. You could use three separate variables:

```ts
const dogName = "Rex"
const dogAge = 3
const dogWeight = 12.5
```

With ten dogs this gets messy. An **object** is one value that holds several named values.

## Create an object

You write an object with curly braces `{ }`. Inside, you write pairs of `name: value`, separated by commas.

```ts
const dog = {
  name: "Rex",
  age: 3,
  weight: 12.5,
}

console.log(dog)
```

A **property** is one `name: value` pair inside an object. This object has three properties: `name`, `age` and `weight`.

The program prints:

```text
{ name: 'Rex', age: 3, weight: 12.5 }
```

## Read a property

Write the object name, a dot, and the property name.

```ts
const square = { side: 4, color: "red" }

console.log(square.side)
console.log(square.side * square.side)
```

The program prints:

```text
4
16
```

The second line is the area of the square: side times side. The object holds the data, and the code calculates new data from it.

The property `size` does not exist on `square`. If you write `console.log(square.size)`, TypeScript shows a red underline before you run anything. If you ignore it and run the file, the program prints `undefined` and does not stop. A spelling mistake in a property name gives "no value", not an error.

## Change a property

You can assign a new value to a property with `=`.

```ts
const dog = { name: "Rex", age: 3 }

dog.age = 4
console.log(dog.age)
```

The program prints:

```text
4
```

> **Note:** The variable is `const`, and you still changed a property. `const` means the variable always points to the same object. It does not freeze the inside of the object.

## An object can hold any value

The value of a property can be text, a number, a boolean, an array, or even another object.

```ts
const recipe = {
  name: "Pancakes",
  servings: 4,
  ingredients: ["flour", "milk", "egg"],
  oven: { needed: false, minutes: 0 },
}

console.log(recipe.oven.needed)
console.log(recipe.ingredients.length)
```

The program prints:

```text
false
3
```

Read `recipe.oven.needed` from left to right: the recipe, then its oven, then whether it is needed.

## Name a property with a variable

Sometimes you know the property name only while the program runs. Square brackets let you use a text value as the name.

```ts
const rectangle = { width: 3, height: 5, color: "red" }
const wanted = "height"

console.log(rectangle["width"])
console.log(rectangle[wanted])
```

The program prints:

```text
3
5
```

`rectangle.width` and `rectangle["width"]` mean the same. The dot form is easier to read. Use the bracket form only when the name is in a variable.

## A list of objects

When you have many objects, put them inside an array.

```ts
const playlist = [
  { title: "Blue", artist: "Mia", seconds: 215 },
  { title: "Rain Dance", artist: "Tomas", seconds: 180 },
  { title: "Sunday", artist: "Mia", seconds: 245 },
]

let totalSeconds = 0

for (const song of playlist) {
  console.log(`${song.title} by ${song.artist}`)
  totalSeconds += song.seconds
}

console.log(`Total: ${totalSeconds} seconds`)
```

The loop gives you one object at a time in the variable `song`. The program prints:

```text
Blue by Mia
Rain Dance by Tomas
Sunday by Mia
Total: 640 seconds
```

An array of objects is a very common way to organize data: each element is an object, and every object has the same properties.

## Destructuring

**Destructuring** takes properties out of an object and puts them in variables, in one line.

```ts
const song = { title: "Blue", artist: "Mia", seconds: 215 }

const { title, seconds } = song

console.log(`${title} lasts ${seconds} seconds`)
```

The program prints:

```text
Blue lasts 215 seconds
```

The names inside `{ }` must match the property names. You can also use it in a function parameter:

```ts
function describe({ title, artist }: { title: string, artist: string }): string {
  return `${title} by ${artist}`
}

console.log(describe({ title: "Blue", artist: "Mia" }))
```

This prints `Blue by Mia`. The text after the colon is the type of the object.

## What a function receives

Two functions add one year to an age. One gets a number. The other gets a dog, which is an object with a name and an age.

```ts
function birthdayAge(age: number): void {
  age = age + 1
}

function birthdayDog(dog: { name: string, age: number }): void {
  dog.age = dog.age + 1
}

let age = 3
const dog = { name: "Rex", age: 3 }

birthdayAge(age)
birthdayDog(dog)

console.log(age, dog.age)
```

The program prints `3 4`. The number's age did not change, but the dog's did.

A number is passed by value: the function receives its own copy of `3`, adds 1 to the copy, and the copy disappears. An object is different. A variable does not hold the object itself, it holds a link to it, and that link is called a **reference**. The function receives the same link, so `dog.age = ...` changes the one dog that both names point to.

The same happens with an assignment. When you write `const same = original`, you copy the link, not the object, and two names point to one object. The three dots in `{ ...original }` make a new object with the same properties.

```ts
const original = { id: 1, status: "failed" }
const same = original
same.status = "passed"
console.log(original.status)

const copy = { ...original }
copy.status = "skipped"
console.log(original.status, copy.status)
```

The program prints:

```text
passed
passed skipped
```

The first change went through `same` and changed the one shared object. The second changed only `copy`.

## Return a new object

When a function needs to "change" an object, it has two options. It can change the object you gave it, like `birthdayDog`. Or it can leave that object alone and return a new one:

```ts
function withBirthday(dog: { name: string, age: number }): { name: string, age: number } {
  return { ...dog, age: dog.age + 1 }
}

const rex = { name: "Rex", age: 3 }
const olderRex = withBirthday(rex)

console.log(rex)
console.log(olderRex)
```

The program prints:

```text
{ name: 'Rex', age: 3 }
{ name: 'Rex', age: 4 }
```

The three dots `...dog` put all properties of `dog` into the new object. Then `age: dog.age + 1` replaces one of them. A function that returns a new value and changes nothing else is easier to trust: you can call it twice and nothing surprising happens.

## Go deeper

### The shallow copy

`{ ...rex }` copies each property as it is. If a property holds another object, the link is copied and that inner object is still shared.

```ts
const rex = { name: "Rex", owner: { city: "Lima" } }
const copyOfRex = { ...rex }
copyOfRex.owner.city = "Cusco"
console.log(rex.owner.city)
```

It prints `Cusco`. The copy has its own `name`, but its `owner` is the same object. To copy everything inside too, use `structuredClone(rex)`.

![The copy is a new object, but its owner is the same object as the original's.](/images/shallow-copy.en.svg)

### Compare objects with `===`

Two objects are equal with `===` only when they are the same object, not when they have the same content.

```ts
const a = { id: 1 }
const b = { id: 1 }
console.log(a === b)
console.log(a === a)
console.log(JSON.stringify(a) === JSON.stringify(b))
```

It prints `false`, `true` and `true`. The checker at the bottom of every exercise file compares the text made by `JSON.stringify`, for this reason.

## Practice

1. Create the file `exercises/01-programming/objects-practice.ts`.
2. Write an object named `book` with the properties `id` (a number), `title` (text) and `pages` (a number). Print the title with `console.log(book.title)`.
3. Change `book.pages` to a new number and print the object.
4. Make an array of three books. Use `for...of` to print each title and add up all pages.
5. Open `exercises/01-programming/07-objects.ts`. Replace each `// TODO` with code.
6. Run the exercise file with this command:

```bash
node exercises/01-programming/07-objects.ts
```

Make every line say `OK`.

## Challenge

Choose your own world, for example a pet shelter or a recipe. Make one object with at least four properties. One property must be another object, for example the owner of a pet, with a name and a city.

Then write two functions. The first, `describeAll`, prints every property as a line `name: value`. It must not contain the name of any property. The second, `moveOwner`, takes your object and a new city. It returns a new object with the new city, and it does not change the original.

Create the file `exercises/challenges/objects.ts`. Run it with `node exercises/challenges/objects.ts`.

It is done when:

- `describeAll` prints one line for every property, and no property name is written inside the function.
- When you add a new property to your object, a new line appears and you did not change `describeAll`.
- After you call `moveOwner`, printing the original and the result shows two different cities.
- `pnpm typecheck` shows no error for your file.

You will need something this lesson did not teach: how to list the names and values of an object. Search for `javascript Object.entries`. To copy an object and everything inside it, use `structuredClone` from the shallow copy section above. For the type of the parameters, write the object type in the function head as in the `describe` example.

## Think it through

1. The song is in the list, but the program says it is not. Find the bug.

```ts
const favourite = { title: "Blue", artist: "Mia" }
const songs = [
  { title: "Blue", artist: "Mia" },
  { title: "Echo", artist: "Lena" },
]

console.log(songs.includes(favourite))
```

<details>
<summary>Answer</summary>

It prints `false`. `includes` compares objects with the same rule as `===`: it asks "is this the same object?", not "does it have the same content?". The object in the list and `favourite` look the same, but they are two objects. Compare the properties you care about, for example `songs.some((song) => song.title === favourite.title)`.

</details>

2. What breaks if someone renames the property `seconds` to `duration` in the data, but not in the code that reads it?

```ts
const song = { title: "Blue", duration: 215 }
console.log(`${song.title} lasts ${song.seconds} seconds`)
```

<details>
<summary>Answer</summary>

TypeScript shows a red underline: the property `seconds` does not exist. If you ignore it and run the file, it prints `Blue lasts undefined seconds`. If the code then used the value in a sum, the result would be `NaN`. The rename must be done in every place.

</details>

3. What happens here when no song has the title "Nope"? How would you make the code safe?

```ts
const songs = [{ title: "Blue", artist: "Mia" }]
const found = songs.find((song) => song.title === "Nope")
const { title } = found
```

<details>
<summary>Answer</summary>

The program stops with a `TypeError`: it cannot destructure the property `title` because `found` is `undefined`. The function `find` gives `undefined` when nothing matches. TypeScript also warns you before you run the file. Check with `if (found === undefined)` first, and decide what the program does when the song is missing: stop with a clear message, or use a default.

</details>

## Next step

In the next lesson you give names to your own object shapes, so TypeScript can check them for you.
