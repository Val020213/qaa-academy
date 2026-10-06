---
title: What to automate
summary: Choose which checks deserve an automated end-to-end test, using the test pyramid, cost numbers and a risk-based way of thinking.
duration: 75 min
---

## Start with a puzzle

A shop has one rule: the price of a product must be greater than 0. A developer writes three tests for it.

- Test A calls the price rule directly in code. It takes 2 milliseconds.
- Test B sends a request to the server. It takes 40 milliseconds.
- Test C opens a browser, signs in, fills the form and clicks Save. It takes 6 seconds.

All three fail when the price is 0. All three pass when the price is 5.

The team can keep only two of them. Which one do you delete? Two answers feel right: "delete the slowest, speed matters" and "keep C, it is the most like a real user".

Write down your guess before you read on.

## Goal

- Predict how long a suite takes when you move a check from the browser to a lower level.
- Decide what to automate using risk, frequency and stability.
- Explain why an honest list of gaps is more useful than a list of test counts.
- Choose which checks stay manual, and defend the choice.

## The test pyramid

Software tests come in three common sizes.

- A **unit test** checks one small piece of code, such as a function that adds tax to a price. It runs in milliseconds.
- An **integration test** checks that several pieces work together. An **API test** is a common kind: it sends a request to the server and checks the answer. It runs in tens of milliseconds.
- An **end-to-end test**, or **E2E test**, opens a real browser and uses the application like a person. It runs in seconds.

Teams draw these as a pyramid: many unit tests at the bottom, fewer API tests in the middle, the fewest E2E tests at the top.

Do not accept the shape because a book says so. Test it with numbers.

### An experiment: what does one rule cost at each level?

The shop has 12 rules. Each rule has 8 interesting inputs (valid ones, empty, too long, zero, and so on). That is 96 checks. Use the times from the puzzle. Before you run anything, guess: how long do the 96 checks take at each level?

Save this as `exercises/challenges/cost.ts` and run it with `node exercises/challenges/cost.ts`:

```ts
const levels = [
  { name: "unit", seconds: 0.002 },
  { name: "api", seconds: 0.04 },
  { name: "browser", seconds: 6 },
]

const rules = 12
const rows = 8

for (const level of levels) {
  const total = rules * rows * level.seconds
  console.log(`${level.name}: ${rules * rows} checks take ${total.toFixed(1)} seconds`)
}
```

It prints:

```text
unit: 96 checks take 0.2 seconds
api: 96 checks take 3.8 seconds
browser: 96 checks take 576.0 seconds
```

That is almost 10 minutes in the browser. A developer waits 10 minutes after every change, or stops running the suite. Both outcomes are bad.

## Why E2E tests are expensive

An E2E test starts a browser, loads pages and waits for the screen. It touches the whole system, so it can fail for many reasons: the page, the server, the data or the network.

This has three costs.

- The suite takes longer to run, so people run it less often.
- A failure is harder to explain, because many parts could be the cause.
- The test breaks more often when the screen changes.

So an E2E test should cover an **important user journey**. A journey is a path a user follows to reach a goal, such as "sign in, create a product, see it in the list".

An E2E test should not cover every input combination. Checking ten invalid prices in the browser is slow. Those checks belong lower in the pyramid, close to the code.

> **Note:** You will mostly write E2E tests in this course. That is your job at the top of the pyramid. Knowing the lower levels helps you ask developers for the right tests there.

### The other side: what only the browser can catch

Now be fair to Test C. Think about three different bugs.

1. The price rule is wrong in the code: it accepts 0.
2. The rule is right, but the server forgets to call it.
3. The rule is right and the server calls it, but the form never shows the error.

Which of the three tests fails for each bug? Work it out on paper first.

Test A fails only for bug 1. Test B fails for bugs 1 and 2. Test C fails for all three. So the browser test catches the most kinds of bugs, but it also tells you the least about where the bug is. A lower test catches fewer kinds of bugs, and it points at the cause.

### Back to the puzzle

There is no single right answer. Look at what each test catches that the others do not. If B already fails for bug 1, then A adds little, so A is the best one to delete. If you delete C, bug 3 is not caught by anything, and the user sees nothing when the price is wrong.

A sensible team keeps B, and tests the rule's edge values there (0, negative, a letter). It keeps one browser test that checks the form shows the message. It deletes A only if B is fast enough, and the rule sits in server code anyway. The two answers from the start were both too simple, because they looked at speed or at realism, and not at which bug each test is the only one to catch.

## How to pick what to automate

You are a manual tester. You already know how to find important checks. Ask three questions about each one.

1. **Risk.** What happens if this breaks? Login, payments and data loss are high risk. A wrong colour is low risk.
2. **Frequency.** How often do you run this check by hand? A check you repeat every release is a good candidate.
3. **Stability.** Does this part of the product change every week? If yes, wait. A test for a screen that changes often costs more than it saves.

A check that is high risk, repeated often and stable is the best first choice.

### Try it on three checks

Here are three checks from a shop. Before you read my score, give each one a number from 1 (low) to 3 (high) for risk, frequency and stability. Then multiply the three numbers.

- Login with a valid account.
- The colour of the status badge.
- A new CSV export, built last week, which the team still changes every few days.

Login scores 3 x 3 x 3 = 27. The badge colour scores 1 x 2 x 2 = 4: a low risk, even if the page is stable. The CSV export scores 2 x 1 x 1 = 2, because it changes a lot and few people use it. Your numbers may differ a little. The point is the order: login first, the export last.

> **Careful:** Multiplying is a thinking aid, not a law. A check with risk 3 and stability 1 scores 3 x 2 x 1 = 6, low on the list. But it may still be the most important check you have. Do not let a score make the decision for you.

## What stays manual

Not everything should be automated.

- **Exploratory testing.** You explore the product without a script and look for surprises. A test can only check what someone thought of in advance. A person finds the unexpected.
- **Usability and visual feel.** Is the page clear? Is the text easy to read?
- **Checks you run once.** Writing a test costs more than doing the check one time.

Automation does not replace you. It removes the repeated work, so you have time to explore.

There is a name for a trap here: **YAGNI**, "You Aren't Gonna Need It". It means do not build for a need you only imagine. A team that writes tests "in case we need them later" builds a large suite that nobody reads. Write the test when the risk is real.

## An honest coverage inventory

The practice shop keeps a list of what its tests cover. Open `apps/practice-shop/e2e/COVERAGE.md`. It has two parts.

The first part is a table of what is covered. One row looks like this:

```text
| Orders    | Status filter, admin marks a pending order as paid                                            | `orders/orders.spec.ts`       |
```

The second part is "Not covered yet". It lists gaps on purpose:

```text
- Editing a product.
- The product detail page: open it from the list, check its data, go back.
- Deleting a product from its detail page.
- Pagination: the Next and Previous buttons.
- Duplicate SKU error when creating a product.
- The viewer role: no New, Edit or Delete buttons, and the API answers 403.
```

This is honest. It does not say "everything is tested". It says what is tested and what is not. A reader can trust the first part because the second part exists.

Keep such a file for your own project. Update it in the same change as the tests.

## Go deeper

### Why the same check costs so much more in a browser

Think about one rule: a SKU must look like `SKU-0001`. You can check it in a browser. The test opens the page, signs in, opens the form, types the value, clicks save and reads the error. That takes seconds.

The rule itself is one line of code. A unit test can check it in milliseconds. Here is the idea in plain TypeScript. It checks five inputs with one loop:

```ts
function isValidSku(value: string): boolean {
  return /^SKU-\d{4}$/.test(value.trim().toUpperCase())
}

const rows = [
  { input: "SKU-0001", expected: true },
  { input: "sku-0001", expected: true },
  { input: "SKU-1", expected: false },
  { input: "SKU-12345", expected: false },
  { input: "", expected: false },
]

for (const row of rows) {
  const actual = isValidSku(row.input)
  console.log(`${JSON.stringify(row.input)} -> ${actual} ${actual === row.expected ? "ok" : "WRONG"}`)
}
```

It prints five lines, and each one ends with `ok`. In a browser, the same five checks would take about 25 seconds if each takes 5 seconds.

Notice the shape: one body of code and a table of inputs. This is **DRY**, "Don't Repeat Yourself", from the lesson "Don't repeat yourself (DRY)" in the programming module. The rows in the table are also **boundary values** and **equivalence classes**: `SKU-1` and `SKU-12345` sit just outside the allowed length, and `""` is the empty case. Lesson 10 of this module applies the table idea to tests.

### A common wrong idea: more tests mean more safety

Many beginners think 200 tests are safer than 20. Not always. If 150 of them walk the same journey with small changes, one broken button turns 150 tests red. You get one problem and 150 messages.

Coverage is not a count of tests. It is a list of risks that a test would notice. `COVERAGE.md` is useful because it lists risks, not test numbers.

### How it shows up in QA work: test a rule through the API

You can often reach the rule without the screen. The shop API checks the same rules as the form. This test needs no browser page:

```ts
import { expect, test } from "../lib/test"

test("the API rejects a name that is too short", async ({ request }) => {
  const response = await request.post("/api/products", {
    data: { name: "ab", sku: "SKU-7001", price: 5, stock: 1, status: "active" },
  })

  expect(response.status()).toBe(422)
  const body = (await response.json()) as { errors: { name: string } }
  expect(body.errors.name).toBe("Name must have at least 3 characters.")
})
```

The status `422` means the server understood the request but the data is not valid. This test is fast. One E2E test can then check only that the form shows the error to the user.

## Practice

1. Open `apps/practice-shop/e2e/COVERAGE.md`. Count the rows in the "What is covered" table. There are 7.
2. Pick one item from "Not covered yet". Write which of the three questions (risk, frequency, stability) makes it worth testing.
3. Pick the item that you would automate last. Explain why in one sentence.
4. Think of a feature in your own work. Write one line for each question: risk, frequency, stability. Decide: automate, or keep manual.
5. Run the existing suite once. Start the shop in one terminal:

```bash
pnpm shop:dev
```

6. In a second terminal, run the tests:

```bash
pnpm shop:e2e
```

7. Read the output. Count the tests. Note how long the whole run takes. Then find the slowest test in the list. Is it a journey, or a rule?

## Challenge

Split one rule across the pyramid. Choose one field of the product form: name, SKU, price or stock. Test its rule fast through the API, with a table of wrong values. Then add exactly one browser test that proves the user sees the error.

Create the file `apps/practice-shop/e2e/challenges/pyramid-split.spec.ts`.

It is done when:

- At least four wrong values for your chosen field are tested through `/api/products`, and each one expects status `422` and the exact message for that field.
- Each wrong value is its own test, and its test name contains the value, so a red line tells you which value failed.
- One browser test submits the form with one wrong value in your field. It checks the message under that field, and checks that the error elements of the other fields do not exist.
- You ran `pnpm shop:e2e challenges/pyramid-split.spec.ts`, all tests passed, and you can read in the output that each API test is much faster than the browser test.

You will need something this lesson did not teach: how to make many tests from one array of data, and how to send a request that is wrong in only one field. Search for: `playwright parameterize tests for loop`, `playwright list reporter test duration`.

> **Tip:** An AI assistant can explain the loop idea. You may ask one. But run the code, and be able to explain every line to a teammate. Never keep a line you cannot explain.

## Think it through

1. A team has 40 E2E tests. Each one types a different wrong price in the product form, and each takes 12 seconds. How long is the suite? Now the team moves 38 of them to the API (0.04 seconds each) and keeps 2 in the browser. Predict the new time, and say what you would keep in the browser.

<details><summary>Answer</summary>

Before: 40 x 12 = 480 seconds, which is 8 minutes. After: 2 x 12 + 38 x 0.04 = 24 + 1.52, about 26 seconds. The price rule is in the server code, so it does not need a browser. The two tests that stay should check that the form shows the error message, so the screen is still tested once. The failure also points to the cause more clearly.

</details>

2. You can automate only one check this week. Check A is the checkout, which is high risk and used every release, but the page is redesigned next week. Check B is password reset, which is also high risk and has not changed for two years, but you test it by hand only once a month. Which do you pick first?

<details><summary>Answer</summary>

Pick B. Both are high risk. A is unstable: the redesign will break the test, and you pay twice. B is stable, so the test will keep working. Frequency is lower for B, but stability decides this time. Write the checkout test after the redesign.

</details>

3. A teammate says: "We have 300 E2E tests, so we are safe." Another says: "We have 40, and a list of what they do not cover." Who is more likely to find a problem before the users do? What would you ask each of them?

<details><summary>Answer</summary>

You cannot tell from the numbers. Ask the first: "Which risks do the 300 tests notice?" If most walk the same journey, one failure gives 300 red tests and many risks are still unchecked. Ask the second: "Which gap worries you most?" The person with the list knows where the system is blind, and that is the start of a plan. Honest knowledge of gaps is worth more than a large count.

</details>

4. Your team wants one E2E test for every row of `COVERAGE.md`'s "Not covered yet" list. Next month the product team will remove the whole orders area. What breaks in your plan, and what would you do instead?

<details><summary>Answer</summary>

The tests for the orders gaps (cancel, ship, empty filter) would be written and thrown away. This is the stability question: an area that will disappear should not get new tests. Keep the orders gaps in the list and mark them "will be removed". Spend the time on gaps in areas that stay, such as editing a product or pagination.

</details>

5. The SKU table in this lesson has five rows. A colleague adds a sixth row: `" SKU-0001 "` with spaces around it, and expects `false`. The test says `WRONG`. Who is right: the test data or the function? How do you decide?

<details><summary>Answer</summary>

The function calls `.trim()`, so it accepts the spaces and returns `true`. The row is not "wrong" in itself: it is a question about the rule. You decide by asking what the requirement says, and what the real server does. In the shop, `validation.ts` also trims the SKU, so `true` is the true behaviour, and the expected value in the row is the mistake. The case shows why a row is a decision about the product, and not only a line of code.

</details>

6. You have two hours before a release. You can write three automated tests, or explore the new feature by hand. The feature changed a lot this week. What do you do, and what does your answer depend on?

<details><summary>Answer</summary>

Most testers would explore by hand first. The feature is new and unstable, so a script would be rewritten, and exploring finds the surprises a script cannot. The answer depends on the risk: if a core journey such as login could be affected, you check that by hand in 5 minutes first, and automate it after the release. It also depends on what already exists. If a stable regression suite already runs, you are free to explore. There is no single right answer.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **What is the testing trophy, and how is it different from the test pyramid?**
   - Search for: `testing trophy vs testing pyramid`
   - Try it: take the rows of `COVERAGE.md`. Write each one at a level (unit, API, E2E) twice: once for a pyramid team and once for a trophy team. Mark where your two lists differ.
   - A good answer explains: which levels each shape stresses, and why some teams choose the trophy.

2. **What is risk-based testing, and how do teams rank risks?**
   - Search for: `risk-based testing likelihood impact`
   - Try it: list six features of the shop. Give each a likelihood and an impact from 1 to 3. Multiply, sort, and compare your order with the "Not covered yet" list.
   - A good answer explains: how likelihood and impact combine into a priority, and how it helps you choose what to automate.

3. **What is the difference between a smoke test and a regression test?**
   - Search for: `smoke test vs regression test`
   - Try it: run `pnpm shop:e2e auth/auth.spec.ts`, then the whole suite. Note both times. Decide which spec files you would put in a "smoke" run of under 30 seconds.
   - A good answer explains: the purpose, size and timing of each, and which one you would run first after a new build.

## Next step

In the next lesson you learn how to keep each test independent, so it passes alone and in any order.
