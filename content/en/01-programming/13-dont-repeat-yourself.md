---
title: Don't repeat yourself (DRY)
duration: 50 min
---

## Goal

In this lesson you learn to write each rule, value and format in one place, and to tell when a little repetition is better than a shortcut.

- Predict which lines of a program break when one rule changes.
- Give a rule, a value or a format one home with a constant, a function, a parameter or a loop over data.
- Explain why two pieces of code that look the same can need to stay apart.
- Choose between a little repetition and a shortcut that is hard to read.

## One rule copied in three places

A teacher says: "The pass mark was 50. From today it is 60." Three functions use the pass mark, and each one has its own copy of the number. The programmer changes the number in two of them and forgets the third.

```ts
function hasPassed(score: number): boolean {
  return score >= 60
}

function describeStudent(name: string, score: number): string {
  return score >= 60 ? `${name} passed` : `${name} failed`
}

function countPassed(scores: number[]): number {
  let count = 0
  for (const score of scores) {
    if (score >= 50) {
      count += 1
    }
  }
  return count
}
```

Mia has 55 points and another student has 40. `hasPassed(55)` gives `false` and `describeStudent("Mia", 55)` gives `Mia failed`, but `countPassed([55, 40])` gives `1`, even though under the new rule nobody passed. No error appears: the program runs, and only the result is wrong. The forgotten copy of `50` is the bug.

## One home for each rule

**DRY** means "Don't Repeat Yourself". Every piece of knowledge has one home in the program, and when it changes, you change it once.

The key word is **knowledge**: a rule, a value or a format. DRY is not about text that looks alike, as you will see below.

To fix the example, name the number once and let one function own the rule. The other functions ask that function.

```ts
const PASS_MARK = 60

function hasPassed(score: number): boolean {
  return score >= PASS_MARK
}

function describeStudent(name: string, score: number): string {
  return hasPassed(score) ? `${name} passed` : `${name} failed`
}

function countPassed(scores: number[]): number {
  let count = 0
  for (const score of scores) {
    if (hasPassed(score)) {
      count += 1
    }
  }
  return count
}

console.log(hasPassed(55))
console.log(describeStudent("Mia", 55))
console.log(`Passed: ${countPassed([55, 40])}`)
```

This prints:

```text
false
Mia failed
Passed: 0
```

Next time the pass mark changes, you edit one line. That is the whole benefit of DRY.

![describeStudent and countPassed use hasPassed; hasPassed reads the single PASS_MARK.](/images/01b-one-rule.en.svg)

## The tools you already have

You know several ways to give knowledge a home. Each fits a different kind of repetition.

- **A constant** for a repeated value, like `PASS_MARK` above.
- **A function** for repeated steps, like `hasPassed`.
- **A parameter** for the same steps with one difference.
- **An array of data and a loop** for the same check on many inputs.
- **A type alias** for a repeated object shape (lesson 08).
- **A module** for code used by several files (lesson 11).

### A parameter

A music app prints a song line in many places. The format is the knowledge. The title and the length are the differences.

```ts
function songLine(title: string, minutes: number): string {
  return `${title} (${minutes} min)`
}

console.log(songLine("Yellow", 4))
```

This prints `Yellow (4 min)`. If the app later shows `4:00` instead, you change one function.

### A loop over data

You build the sign-up form of a pet shelter. Three fields must not be empty. In this version, each field has its own `if` block.

```ts
const pet = { name: "Rex", species: "", age: "" }
const errors: string[] = []

if (pet.name === "") {
  errors.push("Name is required")
}
if (pet.species === "") {
  errors.push("Species is required")
}
if (pet.age === "") {
  errors.push("Age is required")
}

console.log(errors)
```

If the shelter adds a fourth required field, `color`, you must write another whole block. In the next version the fields are data:

```ts
const pet: Record<string, string> = { name: "Rex", species: "", age: "" }
const errors: string[] = []

const required = [
  { field: "name", label: "Name" },
  { field: "species", label: "Species" },
  { field: "age", label: "Age" },
]

for (const item of required) {
  if (pet[item.field] === "") {
    errors.push(`${item.label} is required`)
  }
}

console.log(errors)
```

Both versions print the same result:

```text
[ 'Species is required', 'Age is required' ]
```

For a new required field, add its value to `pet` and one object to the array. The loop does not change.

## When repetition is the better choice

Shared code ties its users together: they all use the same implementation. So the question is not whether two pieces look the same, but whether they change for the same reason.

### Same text, different knowledge

A pizza may have at most 10 toppings. A playlist title may have at most 10 characters. Both rules say `10`, and it is tempting to use one constant:

```ts
const LIMIT = 10
```

Suppose the pizza shop allows 12 toppings next month. With one `LIMIT`, playlist titles also grow to 12 characters, and nobody asked for that. Two rules need two names: `MAX_TOPPINGS` and `MAX_TITLE_LENGTH`. The number is the same by chance. The knowledge is not.

![MAX_TOPPINGS changes to 12; the independent MAX_TITLE_LENGTH rule stays at 10.](/images/01b-independent-limits.en.svg)

### Different text, same knowledge

Now the opposite. One function finds the area of a circle with `3.14 * radius * radius`. Another finds its length with `2 * 3.1416 * radius`.

```ts
function circleArea(radius: number): number {
  return 3.14 * radius * radius
}

function circleLength(radius: number): number {
  return 2 * 3.1416 * radius
}

console.log(circleArea(10))
console.log(circleLength(10))
```

It prints `314` and `62.832`. The two functions hold one fact, the value of pi, but they hold two different guesses of it. The text does not match, so a search for the full number `3.1416` would miss the first one. Use `Math.PI` in both. Then `circleArea(10)` gives `314.1592653589793`, and the two functions agree.

The same happens with a cart that writes `total * 1.2` and an invoice that writes `price + price / 5`: both hold one fact, that the tax is 20 percent. Before you merge code, ask whether all those places must change together when the rule changes. If yes, they need one home. If no, leave them apart.

### The rule of three

The **rule of three** is a guide: write the code the first time; you may copy it the second time; the third time, check whether the copies represent the same rule before combining them. With two copies you often do not yet know what the real difference is.

### A shortcut that hurts

This function serves every case with flags:

```ts
function formatSong(
  title: string,
  minutes: number,
  upper: boolean,
  brackets: boolean,
  star: boolean,
): string {
  let text = upper ? title.toUpperCase() : title
  if (brackets) {
    text = `[${text}]`
  }
  if (star) {
    text = `* ${text}`
  }
  return `${text} (${minutes} min)`
}

console.log(formatSong("Yellow", 4, true, false, true))
```

It prints `* YELLOW (4 min)`. But at the call you cannot tell what `true, false, true` mean: you must open the function to know, and each new need adds a flag. Two small functions with clear names are easier to read and to change.

This is the counterweight to DRY: **KISS** (keep it simple) and **YAGNI** (you aren't gonna need it: do not build for needs you only imagine). A flag you add "in case someone needs it" is YAGNI broken. A wrong shortcut costs more than a little repetition.

## Practice

1. Open `exercises/01-programming/13-dont-repeat-yourself.ts`. Complete the functions and constant marked with `// TODO`, replacing their placeholder values. Write each rule once.
2. Run the exercise file with this command:

```bash
node exercises/01-programming/13-dont-repeat-yourself.ts
```

Make every check say `OK`. The checks only see the result, so check yourself that each rule has one home.

## Challenge

Choose your own world, for example a bakery or a football league, and write a small program with three rules that each appear in at least three places. First write the repeated version and save its output. Then remove the repetition without changing the output. Then change one rule and see the whole program follow.

Create the file `exercises/challenges/13-dont-repeat-yourself.ts`. No solution is given.

It is done when:

- The file runs with `node exercises/challenges/13-dont-repeat-yourself.ts` and prints at least three lines.
- Each of the three rules is written once; when you change it, every part that uses it follows the new value.
- One of your rules is a table of prices or names, and you use a loop over it.
- One place in your code stays repeated on purpose, and a comment of one sentence says why.

You will need something this lesson did not teach: how to loop over a table of names and values. Search for: `typescript Object.entries loop` and `typescript Record string number`.

## Think it through

1. A zoo program has `const TICKET_AGE_LIMIT = 12` for child tickets. A second function says `age < 12` to give a free ride on the small train. The zoo changes child tickets to age 14. The free-ride rule must stay at 12. What do you do with the two numbers, and why?

<details><summary>Answer</summary>

The two rules look the same but change for different reasons, so they are different knowledge. Give the train its own constant, for example `FREE_TRAIN_AGE`. If you reused `TICKET_AGE_LIMIT`, the change to 14 would silently change the train rule too.

</details>

2. A teammate proposes using `TAX_RATE` in `tip` too, because both values are `0.2`. What would you check before changing it?

```ts
const TAX_RATE = 0.2

function priceWithTax(price: number): number {
  return price * (1 + TAX_RATE)
}

function tip(price: number): number {
  return price * 0.2
}
```

<details><summary>Answer</summary>

The `0.2` in `tip` has the same text but may be a different rule. If the tip is a fixed 20 percent that has nothing to do with tax, then using `TAX_RATE` there would be a bug waiting for the next tax change. Ask: if the tax becomes 0.25, should the tip change too? If no, the tip needs its own constant, `TIP_RATE`. The constant for tax is correct. The code does not show that both rates should change together. Naming the tip rate makes its independent rule clear.

</details>

3. The shelter changes the label "Age" to "Age in years" and adds `color` as an optional field. What do you change in the loop version?

<details><summary>Answer</summary>

Edit the label of the `age` object in the `required` array. Add `color` to `pet`, but not to `required`, because it is optional. The loop does not change.

</details>

## Next step

You finished the programming basics. In module 2 you learn Git and how the web works, so you can read and share real projects.
