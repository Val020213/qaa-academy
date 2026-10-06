---
title: Don't repeat yourself (DRY)
summary: Give every rule, value and format one home, and learn when a little repetition is better than a shortcut.
duration: 60 min
---

## Start with a puzzle

A teacher says: "The pass mark was 50. From today it is 60." A programmer changes the number in the program. Three functions use the pass mark, and each one has its own copy of the number.

```ts
function hasPassed(score: number): boolean {
  return score >= 60;
}

function describeStudent(name: string, score: number): string {
  return score >= 60 ? `${name} passed` : `${name} failed`;
}

function countPassed(scores: number[]): number {
  let count = 0;
  for (const score of scores) {
    if (score >= 50) {
      count += 1;
    }
  }
  return count;
}
```

Mia has 55 points. Another student has 40. What do `hasPassed(55)`, `describeStudent("Mia", 55)` and `countPassed([55, 40])` give? Is the answer to the last call correct for the new rule?

Write down your guess before you read on.

## Goal

- Predict which lines of a program break when one rule changes.
- Decide when to give a rule, a value or a format one home.
- Explain why two pieces of code that look the same can need to stay apart.
- Choose between a little repetition and a shortcut that is hard to read.

## The idea

**DRY** means "Don't Repeat Yourself". Every piece of knowledge has one home in the program. When it changes, you change it once.

The word is **knowledge**: a rule, a value or a format. DRY is not about text that looks alike. You will see this soon.

### Back to the puzzle

The first two calls give `false` and `Mia failed`. The third gives `1`, but under the new rule nobody passed. No error appears. The forgotten copy of `50` is the bug.

Now the fix. Name the number once, and let one function own the rule. The other functions ask that function.

```ts
const PASS_MARK = 60;

function hasPassed(score: number): boolean {
  return score >= PASS_MARK;
}

function describeStudent(name: string, score: number): string {
  return hasPassed(score) ? `${name} passed` : `${name} failed`;
}

function countPassed(scores: number[]): number {
  let count = 0;
  for (const score of scores) {
    if (hasPassed(score)) {
      count += 1;
    }
  }
  return count;
}

console.log(hasPassed(55));
console.log(describeStudent("Mia", 55));
console.log(`Passed: ${countPassed([55, 40])}`);
```

This prints:

```text
false
Mia failed
Passed: 0
```

Next time the pass mark changes, you edit one line. That is the whole benefit of DRY.

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
  return `${title} (${minutes} min)`;
}

console.log(songLine("Yellow", 4));
```

This prints `Yellow (4 min)`. If the app later shows `4:00` instead, you change one function.

### A loop over data

You build the sign-up form of a pet shelter. Three fields must not be empty. Look at this version first.

```ts
const pet = { name: "Rex", species: "", age: "" };
const errors: string[] = [];

if (pet.name === "") {
  errors.push("Name is required");
}
if (pet.species === "") {
  errors.push("Species is required");
}
if (pet.age === "") {
  errors.push("Age is required");
}

console.log(errors);
```

Before you read on: the shelter adds a fourth field, `color`. How many lines must you change? Now look at the version where the fields are data.

```ts
const pet: Record<string, string> = { name: "Rex", species: "", age: "" };
const errors: string[] = [];

const required = [
  { field: "name", label: "Name" },
  { field: "species", label: "Species" },
  { field: "age", label: "Age" },
];

for (const item of required) {
  if (pet[item.field] === "") {
    errors.push(`${item.label} is required`);
  }
}

console.log(errors);
```

Both versions print the same result:

```text
[ 'Species is required', 'Age is required' ]
```

For a new field, you add one object to the array. The loop does not change.

## When repetition is the better choice

A shared piece of code ties its users together. When you change it, every user changes. So the question is never "does this look the same?" The question is "does this change for the same reason?"

### Same text, different knowledge

A pizza may have at most 10 toppings. A playlist title may have at most 10 characters. Both rules say `10`. Would you use one constant?

```ts
const LIMIT = 10;
```

Suppose the pizza shop allows 12 toppings next month. With one `LIMIT`, playlist titles also grow to 12 characters, and nobody asked for that. Two rules need two names: `MAX_TOPPINGS` and `MAX_TITLE_LENGTH`. The number is the same by chance. The knowledge is not.

### Different text, same knowledge

Now the opposite. One function finds the area of a circle with `3.14 * radius * radius`. Another finds its length with `2 * 3.1416 * radius`. What do you expect for a radius of 10?

```ts
function circleArea(radius: number): number {
  return 3.14 * radius * radius;
}

function circleLength(radius: number): number {
  return 2 * 3.1416 * radius;
}

console.log(circleArea(10));
console.log(circleLength(10));
```

It prints `314` and `62.832`. The two functions hold one fact, the value of pi, but they hold two different guesses of it. The text does not match, so a search for the full number `3.1416` would miss the first one. Use `Math.PI` in both. Then `circleArea(10)` gives `314.1592653589793`, and the two functions agree.

### The rule of three

When do you remove repetition? Use the **rule of three**. The first time, write the code. The second time, you may copy it. The third time, you see the pattern, and you remove the repetition. With two copies you often do not yet know what the real difference is.

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
  let text = upper ? title.toUpperCase() : title;
  if (brackets) {
    text = `[${text}]`;
  }
  if (star) {
    text = `* ${text}`;
  }
  return `${text} (${minutes} min)`;
}

console.log(formatSong("Yellow", 4, true, false, true));
```

It prints `* YELLOW (4 min)`. But what do `true, false, true` mean? You must open the function to know. Each new need adds a flag. Two small functions with clear names are easier to read and to change.

This is the counterweight to DRY: **KISS** (keep it simple) and **YAGNI** (you aren't gonna need it: do not build for needs you only imagine). A flag you add "in case someone needs it" is YAGNI broken. A wrong shortcut costs more than a little repetition.

## Go deeper

### Different text, same knowledge

Repetition is not always the same text. A cart writes `total * 1.2`. An invoice writes `price + price / 5`. Both hold one fact: the tax is 20 percent. If the tax changes, someone must find both. DRY asks for one `TAX_RATE`. Ask yourself: if this rule changes, must all these places change together? If yes, they need one home. If no, leave them apart. This is the question to ask before every refactoring.

### How it looks in test automation

In test automation the same idea becomes helpers, fixtures and page objects. Module 4 has a full lesson on it. You can already see it in this project. The file `playwright.config.ts` holds `baseURL` once, so tests write `page.goto("/#/practice")` and not the full address. The spec file `e2e/playground.spec.ts` also keeps the first step of every test in one place. A hook named `beforeEach` runs before each test. Module 3 explains hooks.

```ts
test.beforeEach(async ({ page }) => {
  await page.goto("/#/practice");
});
```

### The limit for tests

Tests have a special rule: a test must be easy to read, like a story. A test with a little repetition that you understand in ten seconds is better than a test that hides its steps behind three layers of helpers. Remove the repetition that is noise, such as the address and the setup. Keep the steps that show what the test checks. A test that hides its story is harder to fix when it fails.

## Practice

1. Open `exercises/01-programming/13-dont-repeat-yourself.ts`. Replace each `// TODO` with code. Write each rule once.
2. Run the exercise file with this command:

```bash
node exercises/01-programming/13-dont-repeat-yourself.ts
```

Make every line say `OK`. The checks only see the result, so check yourself that each rule has one home.

## Challenge

Choose your own world: a bakery, a football league, a zoo, a library, a bus company. Write a small program with three rules that each appear in at least three places. For example, a bakery has a free-delivery limit, a delivery fee and a price list, and three functions use them. First write the repeated version and save its output. Then remove the repetition without changing the output. Then change one rule and see the whole program follow.

Create the file `exercises/challenges/13-dont-repeat-yourself.ts`. No solution is given.

It is done when:

- The file runs with `node exercises/challenges/13-dont-repeat-yourself.ts` and prints at least three lines.
- Each of the three rules is written once. A search for its number or text finds one place.
- You change one rule, run the file again, and every line that uses the rule changes.
- One of your rules is a table of prices or names, and you use a loop over it.
- One place in your code stays repeated on purpose, and a comment of one sentence says why.

You will need something this lesson did not teach: how to loop over a table of names and values. Search for: `typescript Object.entries loop` and `typescript Record string number`.

## Think it through

1. A zoo program has `const TICKET_AGE_LIMIT = 12` for child tickets. A second function says `age < 12` to give a free ride on the small train. The zoo changes child tickets to age 14. The free-ride rule must stay at 12. What do you do with the two numbers, and why?

<details><summary>Answer</summary>

The two rules look the same but change for different reasons. The ticket rule and the train rule are different knowledge. Give the train its own constant, for example `FREE_TRAIN_AGE`. If you reused `TICKET_AGE_LIMIT`, the change to 14 would silently change the train rule too. A shared name says "these always change together", so only use it when that is true.

</details>

2. Find the bug. The code runs and prints a line, but one rule is still copied.

```ts
const TAX_RATE = 0.2;

function priceWithTax(price: number): number {
  return price * (1 + TAX_RATE);
}

function tip(price: number): number {
  return price * 0.2;
}
```

A teammate says: "Good, the tax rate has a constant." What is the problem, and what would you check before changing it?

<details><summary>Answer</summary>

The `0.2` in `tip` has the same text but may be a different rule. If the tip is a fixed 20 percent that has nothing to do with tax, then using `TAX_RATE` there would be a bug waiting for the next tax change. Ask: if the tax becomes 0.25, should the tip change too? If no, the tip needs its own constant, `TIP_RATE`. The constant for tax is correct. The real fault is the unnamed `0.2`, which hides what it means.

</details>

3. Two versions both work. Version A has `printCat(name)` and `printDog(name)`, which differ in one word. Version B has `printAnimal(name, sound)`. Which is better, and when would you choose the other one?

<details><summary>Answer</summary>

Version B is better when the two functions change together, for example when the line format changes. One change fixes both. Version A is better if the cat and the dog output will later differ in many ways. Then B grows flags and gets hard to read. With only two copies, the rule of three says you may wait. With a third animal, B is the clear choice.

</details>

4. What breaks if you change the requirement in the pet shelter form: the fields stay the same, but the label of "Age" must be "Age in years" and `color` is optional? Think about the loop version.

<details><summary>Answer</summary>

The label is easy: you edit one object in the array. The optional field is harder, because the loop treats every item as required. You can add a `required: boolean` to each object and check it in the loop. That is a flag again, but it lives in data, not in a function call, so it stays readable. If you later add five different kinds of rules, a loop over simple data may stop being enough.

</details>

5. Explain DRY to a friend who cooks, in three sentences, without using the word "repeat". Use a recipe book as your example.

<details><summary>Answer</summary>

A good answer: "Write each fact in one place. If many recipes need the same sauce, write the sauce once and let the recipes point to it. When you improve the sauce, every recipe gets better." The test of a good answer is that it speaks about facts and one home, not about copying text. If your answer only says "do not copy paste", it misses the point, because two sauces with different words can still hold one fact.

</details>

6. A new teammate wants to remove every repeated line in a 500-line program in one afternoon. What would you tell them? There is no single right answer.

<details><summary>Answer</summary>

Removing repetition is a trade-off. It helps when copies change together, and it hurts when you tie together things that only look alike. It also costs time, and risk grows with each change to working code. A good answer says: remove the copies that are about one rule, start with ones that already caused a bug, and wait for the third copy in unclear cases. The best choice depends on how often the code changes and how many people read it.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **What is the "rule of three" in refactoring, and why do developers wait for the third copy?**
   - Search for: `rule of three refactoring duplication`
   - Try it: write a function twice in a scratch file, with one small difference. Then copy it a third time with a different difference. Now try to write one function for all three. Notice which differences were visible only after the third copy.
   - A good answer explains: what the rule says, one case where it helps, and one case where you would break it.

2. **What does the saying "duplication is far cheaper than the wrong abstraction" mean?**
   - Search for: `duplication far cheaper than wrong abstraction`
   - Try it: take the `formatSong` function from this lesson and add a fourth flag of your own. Count how many call sites become harder to read. Then split it into two named functions and compare.
   - A good answer explains: what a wrong abstraction is, why it grows worse over time, and how a team can fix it.

3. **What is the difference between DRY and DAMP in test code?**
   - Search for: `DRY vs DAMP tests`
   - Try it: open `e2e/playground.spec.ts` and read two tests. Decide which lines you would move into a helper and which you would keep in the test. Write one sentence for each decision.
   - A good answer explains: what each word means, why tests often prefer DAMP, and one example of a test that is too DRY.

## Next step

You finished the programming basics. In module 2 you learn Git and how the web works, so you can read and share real projects.
