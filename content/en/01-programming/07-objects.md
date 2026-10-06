---
title: Objects
summary: Group related values under names, keep many objects in a list, and learn why a function can change an object but not a number.
duration: 65 min
---

## Start with a puzzle

Two functions both add one year to an age. One gets a plain number. The other gets a dog, which is an object with a name and an age. You call both.

```ts
function birthdayAge(age: number): void {
  age = age + 1;
}

function birthdayDog(dog: { name: string; age: number }): void {
  dog.age = dog.age + 1;
}

let age = 3;
const dog = { name: "Rex", age: 3 };

birthdayAge(age);
birthdayDog(dog);

console.log(age, dog.age);
```

Both functions do the same arithmetic. Do both ages become 4? Does only one change? Which one, and why would the computer treat them differently?

Write down your guess before you read on.

## Goal

- Predict when a function changes the value you gave it, and when it does not.
- Read, change and add a property of an object, also in a nested object.
- Keep many objects in an array and loop over them.
- Decide when to change an object and when to make a new one.

## Why we need objects

A dog has a name, an age and a weight. These three values belong together.

You could use three separate variables:

```ts
const dogName = "Rex";
const dogAge = 3;
const dogWeight = 12.5;
```

This gets messy when you have ten dogs. An **object** solves this. An object is one value that holds several named values.

## Create an object

You write an object with curly braces `{ }`. Inside, you write pairs of `name: value`, separated by commas.

```ts
const dog = {
  name: "Rex",
  age: 3,
  weight: 12.5,
};

console.log(dog);
```

A **property** is one `name: value` pair inside an object. This object has three properties: `name`, `age` and `weight`.

The program prints:

```text
{ name: 'Rex', age: 3, weight: 12.5 }
```

## Read a property

Write the object name, a dot, and the property name.

```ts
const square = { side: 4, color: "red" };

console.log(square.side);
console.log(square.side * square.side);
```

The program prints:

```text
4
16
```

The second line is the area of the square: side times side. The object holds the facts. The code makes new facts from them.

What do you expect from `console.log(square.size)`? The property `size` does not exist. TypeScript shows a red underline before you run anything. If you ignore it and run the file, the program prints `undefined`. It does not stop. A spelling mistake in a property name gives "no value", not an error.

## Change a property

You can assign a new value to a property with `=`.

```ts
const dog = { name: "Rex", age: 3 };

dog.age = 4;
console.log(dog.age);
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
};

console.log(recipe.oven.needed);
console.log(recipe.ingredients.length);
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
const rectangle = { width: 3, height: 5, color: "red" };
const wanted = "height";

console.log(rectangle["width"]);
console.log(rectangle[wanted]);
```

The program prints:

```text
3
5
```

`rectangle.width` and `rectangle["width"]` mean the same. The dot form is easier to read. Use the bracket form only when the name is in a variable.

## A list of objects

In real work you have many objects. Put them inside an array.

```ts
const playlist = [
  { title: "Blue", artist: "Mia", seconds: 215 },
  { title: "Rain Dance", artist: "Tomas", seconds: 180 },
  { title: "Sunday", artist: "Mia", seconds: 245 },
];

let totalSeconds = 0;

for (const song of playlist) {
  console.log(`${song.title} by ${song.artist}`);
  totalSeconds += song.seconds;
}

console.log(`Total: ${totalSeconds} seconds`);
```

The loop gives you one object at a time in the variable `song`. The program prints:

```text
Blue by Mia
Rain Dance by Tomas
Sunday by Mia
Total: 640 seconds
```

This shape, an array of objects, is very common. A table in a spreadsheet is the same idea: each row is an object and each column is a property. Data that arrives from a server often looks like this.

## Destructuring

**Destructuring** takes properties out of an object and puts them in variables, in one line.

```ts
const song = { title: "Blue", artist: "Mia", seconds: 215 };

const { title, seconds } = song;

console.log(`${title} lasts ${seconds} seconds`);
```

The program prints:

```text
Blue lasts 215 seconds
```

The names inside `{ }` must match the property names. You will see this form often in Playwright code, so learn to read it. You can also use it in a function parameter:

```ts
function describe({ title, artist }: { title: string; artist: string }): string {
  return `${title} by ${artist}`;
}

console.log(describe({ title: "Blue", artist: "Mia" }));
```

This prints `Blue by Mia`. The text after the colon is the type of the object. Lesson 08 shows a cleaner way to write it.

## Make your own rule for functions

You have two choices when a function needs to "change" an object. It can change the object you gave it. Or it can leave that object alone and return a new one. Look at the second way:

```ts
function withBirthday(dog: { name: string; age: number }): { name: string; age: number } {
  return { ...dog, age: dog.age + 1 };
}

const rex = { name: "Rex", age: 3 };
const olderRex = withBirthday(rex);

console.log(rex);
console.log(olderRex);
```

The program prints:

```text
{ name: 'Rex', age: 3 }
{ name: 'Rex', age: 4 }
```

The three dots `...dog` put all properties of `dog` into the new object. Then `age: dog.age + 1` replaces one of them. A function that returns a new value and changes nothing else is easier to trust. You can call it twice and nothing surprising happens.

### Back to the puzzle

The program prints `3 4`. The number is passed by value: the function receives its own copy of `3`, adds 1 to the copy, and the copy disappears. The dog is passed by link: the function receives a link to the same object, so `dog.age = ...` changes the one dog that both names point to. The next section explains this link.

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

The first change went through `same` and changed the one shared object. The three dots in `{ ...original }` make a new object with the same properties. Lesson 06 shows the same idea for arrays.

This copy is shallow: an object inside the object is still shared. What do you expect here?

```ts
const rex = { name: "Rex", owner: { city: "Lima" } };
const copyOfRex = { ...rex };
copyOfRex.owner.city = "Cusco";
console.log(rex.owner.city);
```

It prints `Cusco`. The copy has its own `name`, but its `owner` is the same link. To copy everything inside too, use `structuredClone(rex)`.

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

This is the one link to testing in this lesson. Test data is often an object. You write it once and every test reads it. This idea has a name: **DRY**, "Don't Repeat Yourself". You will study it at the end of this module.

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
2. Write an object named `book` with the properties `id` (a number), `title` (text) and `pages` (a number).
3. Print the title with `console.log(book.title)`.
4. Change `book.pages` to a new number and print the object.
5. Make an array of three books. Use `for...of` to print each title and add up all pages.
6. Open `exercises/01-programming/07-objects.ts`. Replace each `// TODO` with code.
7. Run the exercise file with this command:

```bash
node exercises/01-programming/07-objects.ts
```

Make every line say `OK`.

## Challenge

Choose your own world: a pet shelter, a library book, a football player, a recipe, a flight. Make one object with at least four properties. One property must be another object, for example the owner of a pet, with a name and a city.

Then write two functions. The first, `describeAll`, prints every property as a line `name: value`. It must not contain the name of any property. The second, `moveOwner`, takes your object and a new city. It returns a new object with the new city, and it does not change the original.

Create the file `exercises/challenges/objects.ts`. Run it with `node exercises/challenges/objects.ts`.

It is done when:

- `describeAll` prints one line for every property, and no property name is written inside the function.
- When you add a new property to your object, a new line appears and you did not change `describeAll`.
- After you call `moveOwner`, printing the original and the result shows two different cities.
- `pnpm typecheck` shows no error for your file.

You will need something this lesson did not teach: how to list the names and values of an object. Search for `javascript Object.entries`. To copy an object and everything inside it, use `structuredClone` from the deep copy section above. For the type of the parameters, write the object type in the function head as in the `describe` example.

## Think it through

1. Predict the output and say why.

```ts
const rex = { name: "Rex", owner: { city: "Lima" } };
const copyOfRex = { ...rex };
copyOfRex.owner.city = "Cusco";
console.log(rex.owner.city);
```

<details>
<summary>Answer</summary>

It prints `Cusco`. The spread `{ ...rex }` makes a new top object, but each property is copied as it is. The property `owner` holds a link, and the link is copied, not the object it points to. So `rex.owner` and `copyOfRex.owner` are the same object. This is a shallow copy. `structuredClone` makes a deep copy.

</details>

2. The song is in the list, but the program says it is not. Find the bug.

```ts
const favourite = { title: "Blue", artist: "Mia" };
const songs = [
  { title: "Blue", artist: "Mia" },
  { title: "Echo", artist: "Lena" },
];

console.log(songs.includes(favourite));
```

<details>
<summary>Answer</summary>

It prints `false`. `includes` compares objects with the same rule as `===`: it asks "is this the same object?", not "does it have the same content?". The object in the list and `favourite` look the same, but they are two objects. Compare the properties you care about, for example `songs.some((song) => song.title === favourite.title)`. Lesson 09 teaches `some`.

</details>

3. Two versions of a birthday function both work. Which is better here, and what would make you choose the other?

```ts
function birthdayA(dog: { age: number }): void {
  dog.age = dog.age + 1;
}

function birthdayB(dog: { name: string; age: number }): { name: string; age: number } {
  return { ...dog, age: dog.age + 1 };
}
```

<details>
<summary>Answer</summary>

Version B is better when several parts of the program use the same dog. It does not change the dog behind your back, so you can keep the old value and compare. Version A is shorter, and it is fine when the dog is private to one function and you want to save the work of a new object. You would also choose A for a huge object that changes thousands of times per second. For normal programs, prefer B. It is easier to reason about.

</details>

4. What breaks if someone renames the property `seconds` to `duration` in the data, but not in the code that reads it?

```ts
const song = { title: "Blue", duration: 215 };
console.log(`${song.title} lasts ${song.seconds} seconds`);
```

<details>
<summary>Answer</summary>

TypeScript shows a red underline: the property `seconds` does not exist. If you ignore it and run the file, it prints `Blue lasts undefined seconds`. If the code then used the value in a sum, the result would be `NaN`. The rename must be done in every place. This is why a type that writes the names once helps. Lesson 08 shows how.

</details>

5. Explain to a teammate, in three sentences and without using the word "copy", why a function can change an object that you pass in, but cannot change a number.

<details>
<summary>Answer</summary>

A good answer could be: a number is stored directly in the variable, so the function receives its own number and changes only that. An object is stored somewhere in memory, and the variable holds a link to the place. The function receives the same link, so it works on the same object that you see outside. A bad answer says "objects are passed differently" and gives no reason. The reason is what the variable holds: the value itself, or a link.

</details>

6. What happens here when no song has the title "Nope"? How would you make the code safe?

```ts
const songs = [{ title: "Blue", artist: "Mia" }];
const found = songs.find((song) => song.title === "Nope");
const { title } = found;
```

<details>
<summary>Answer</summary>

The program stops with a `TypeError`: it cannot destructure the property `title` because `found` is `undefined`. The function `find` gives `undefined` when nothing matches. TypeScript also warns you before you run the file. Check with `if (found === undefined)` first, and decide what the program does when the song is missing: stop with a clear message, or use a default. An edge case like "nothing found" must have a planned answer.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **What is the difference between a shallow copy and a deep copy of an object?**
   - Search for: `javascript shallow copy vs deep copy`
   - Try it: make an object with an array inside, for example `{ name: "Rex", toys: ["ball"] }`. Copy it with `{ ...x }`, push a toy into the copy, and print the original. Then do it again with `structuredClone`.
   - A good answer explains: what is copied and what is still shared in each case, and one example where a shallow copy causes a surprise.

2. **What is JSON, and how do `JSON.parse` and `JSON.stringify` change between text and objects?**
   - Search for: `MDN JSON.parse JSON.stringify`
   - Try it: turn your dog object into text with `JSON.stringify`, print it, then turn it back with `JSON.parse`. Then call `JSON.parse` on the text `{name: "Rex"}` and read the error.
   - A good answer explains: what JSON text looks like, what each function does, and what happens when the text is not valid JSON.

3. **What does `Object.freeze` do, and does it stop a change deep inside an object?**
   - Search for: `javascript Object.freeze shallow`
   - Try it: freeze the `recipe` object from this lesson. Try to change `recipe.name` and `recipe.oven.needed`. Print both after each try.
   - A good answer explains: what a frozen object refuses, why the nested object may still change, and one reason to freeze data.

## Next step

In the next lesson you give names to your own object shapes, so TypeScript can check them for you.
