---
title: Don't repeat yourself (DRY)
summary: Give every rule, value and format one home, and learn when a little repetition is better than a shortcut.
duration: 40 min
---

## Goal

- Explain what DRY means and why repeated knowledge causes bugs.
- Remove repetition with a constant, a function, a parameter, a loop, a type alias and a module.
- Know when to leave a little repetition alone.

## The problem

A page is "slow" when it needs more than 2000 milliseconds. Three functions use this rule, and each has its own copy of the number.

The requirement changes: the limit is 1500. Someone updates two functions and forgets the third.

```ts
function isSlow(ms: number): boolean {
  return ms > 1500;
}

function describePage(name: string, ms: number): string {
  return ms > 1500 ? `${name} is too slow` : `${name} is fast enough`;
}

function countSlow(times: number[]): number {
  let count = 0;
  for (const time of times) {
    if (time > 2000) {
      count += 1;
    }
  }
  return count;
}

console.log(isSlow(1700));
console.log(describePage("Checkout", 1700));
console.log(`Slow pages: ${countSlow([1700, 900])}`);
```

The program prints:

```text
true
Checkout is too slow
Slow pages: 0
```

Two lines say the page is slow. The third says there are no slow pages. No error appears. The forgotten copy is the bug.

## The idea

**DRY** means "Don't Repeat Yourself". Every piece of knowledge has one home in the program. When it changes, you change it once.

DRY is about knowledge: a rule, a value or a format. It is not about text that looks alike.

## The tools you already have

**A constant** for a repeated value. Write the number once, with a name.

```ts
const MAX_RESPONSE_MS = 1500;
```

**A function** for repeated steps. The rule gets its own home, and the other places call it.

```ts
function isSlow(ms: number): boolean {
  return ms > MAX_RESPONSE_MS;
}
```

`describePage` and `countSlow` now call `isSlow(ms)`. The three lines from the problem now print `true`, `Checkout is too slow` and `Slow pages: 1`.

**A parameter** for the same steps with one difference. The format of a bug title lives in one place.

```ts
function bugTitle(area: string, problem: string, severity: string): string {
  return `[${severity}] ${area}: ${problem}`;
}

console.log(bugTitle("Checkout", "discount is not applied", "high"));
```

This prints `[high] Checkout: discount is not applied`.

**An array of data and a loop** for the same check on many inputs. Here is the "before". Three copied `if` blocks, one for each form field:

```ts
const form = { name: "Ana", email: "", password: "" };
const errors: string[] = [];

if (form.name === "") {
  errors.push("Name is required");
}
if (form.email === "") {
  errors.push("Email is required");
}
if (form.password === "") {
  errors.push("Password is required");
}

console.log(errors);
```

Here is the "after". The fields are data in an array, and one `for...of` loop checks them all:

```ts
const form: Record<string, string> = { name: "Ana", email: "", password: "" };
const errors: string[] = [];

const required = [
  { field: "name", label: "Name" },
  { field: "email", label: "Email" },
  { field: "password", label: "Password" },
];

for (const item of required) {
  if (form[item.field] === "") {
    errors.push(`${item.label} is required`);
  }
}

console.log(errors);
```

Both versions print the same result:

```text
[ 'Email is required', 'Password is required' ]
```

To check a new field, you add one object to the array. The loop does not change.

**A type alias** for a repeated object shape (lesson 08), and **a module** for code used by several files (lesson 11). A change lives in one place, and every user gets it.

## The limit: do not remove repetition too early

A shared piece of code ties its users together. When you change it, every user changes. Use the **rule of three**. The first time, write the code. The second time, you may copy it. The third time, you see the pattern, and you remove the repetition. With two copies, you often do not yet know the real difference.

Two pieces of code can look the same and change for different reasons. The shop allows 10 items in a cart, and a list title may have 10 characters. One shared `LIMIT = 10` would be wrong. Keep `MAX_CART_ITEMS` and `MAX_LIST_TITLE_LENGTH` apart.

A wrong shortcut costs more than a little repetition. This function serves every case with flags:

```ts
function formatLine(name: string, status: string, upper: boolean, brackets: boolean, withIcon: boolean): string {
  let text = upper ? status.toUpperCase() : status;
  if (brackets) {
    text = `[${text}]`;
  }
  if (withIcon) {
    text = `${status === "passed" ? "+" : "-"} ${text}`;
  }
  return `${text} ${name}`;
}

console.log(formatLine("Login works", "passed", true, false, true));
```

It prints `+ PASSED Login works`. But what do `true, false, true` mean? You must open the function to know. Each new need adds a flag. Two small functions with clear names are easier to read and to change.

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

## Check what you know

1. What does DRY mean?

<details><summary>Answer</summary>

"Don't Repeat Yourself". Each piece of knowledge, such as a rule, a value or a format, has one home in the program.

</details>

2. What is the rule of three?

<details><summary>Answer</summary>

Wait until you see the same code three times before you remove the repetition. With two copies, you may not yet know what the real difference is.

</details>

3. A colleague removes repetition with `doStep("pay", true, false, true, false, true)`. The function works. Why is it a problem?

<details><summary>Answer</summary>

Nobody can read the call without opening the function. Each new case adds a flag, and the function gets harder to change. Two small functions with clear names are better. A wrong abstraction costs more than a little repetition.

</details>

4. The shop allows 10 items in a cart, and a list title may have 10 characters. Should both use one constant `LIMIT = 10`?

<details><summary>Answer</summary>

No. The two rules change for different reasons. If the cart limit becomes 20, the title limit must not change. Use two constants with two names.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **What is the "rule of three" in refactoring, and why do developers wait for the third copy?**
   - Search for: `rule of three refactoring duplication`
   - A good answer explains: what the rule says, one case where it helps, and one case where you would break it.

2. **What does the saying "duplication is far cheaper than the wrong abstraction" mean?**
   - Search for: `duplication far cheaper than wrong abstraction`
   - A good answer explains: what a wrong abstraction is, why it grows worse over time, and how a team can fix it.

3. **What is the difference between DRY and DAMP in test code?**
   - Search for: `DRY vs DAMP tests`
   - A good answer explains: what each word means, why tests often prefer DAMP, and one example of a test that is too DRY.

## Next step

You finished the programming basics. In module 2 you learn Git and how the web works, so you can read and share real projects.
