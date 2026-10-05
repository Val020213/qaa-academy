---
title: What to automate
summary: Learn the test pyramid and how to choose which checks deserve an automated end-to-end test.
duration: 25 min
---

## Goal

- Explain the test pyramid in plain words.
- Say why end-to-end tests must be few and chosen with care.
- Choose what to automate using risk, frequency and stability.
- Read a real coverage inventory.

## The test pyramid

Software tests come in three common sizes.

- A **unit test** checks one small piece of code, such as a function that adds tax to a price. It runs in milliseconds.
- An **integration test** checks that several pieces work together. An **API test** is a common kind: it sends a request to the server and checks the answer. It runs in tens of milliseconds.
- An **end-to-end test**, or **E2E test**, opens a real browser and uses the application like a person. It runs in seconds.

Teams draw these as a pyramid. Many unit tests sit at the bottom. Fewer API tests sit in the middle. The fewest E2E tests sit at the top.

The shape matters. Tests at the bottom are fast and cheap. Tests at the top are slow and costly.

## Why E2E tests are expensive

An E2E test starts a browser, loads pages and waits for the screen. It touches the whole system, so it can fail for many reasons: the page, the server, the data or the network.

This has three costs.

- The suite takes longer to run, so people run it less often.
- A failure is harder to explain, because many parts could be the cause.
- The test breaks more often when the screen changes.

So an E2E test should cover an **important user journey**. A journey is a path a user follows to reach a goal, such as "sign in, create a product, see it in the list".

An E2E test should not cover every input combination. Checking ten invalid prices in the browser is slow. Those checks belong lower in the pyramid, close to the code.

> **Note:** You will mostly write E2E tests in this course. That is your job at the top of the pyramid. Knowing the lower levels helps you ask developers for the right tests there.

## How to pick what to automate

You are a manual tester. You already know how to find important checks. Ask three questions about each one.

1. **Risk.** What happens if this breaks? Login, payments and data loss are high risk. A wrong colour is low risk.
2. **Frequency.** How often do you run this check by hand? A check you repeat every release is a good candidate.
3. **Stability.** Does this part of the product change every week? If yes, wait. A test for a screen that changes often costs more than it saves.

A check that is high risk, repeated often and stable is the best first choice.

## What stays manual

Not everything should be automated.

- **Exploratory testing.** You explore the product without a script and look for surprises. A test can only check what someone thought of in advance. A person finds the unexpected.
- **Usability and visual feel.** Is the page clear? Is the text easy to read?
- **Checks you run once.** Writing a test costs more than doing the check one time.

Automation does not replace you. It removes the repeated work, so you have time to explore.

## An honest coverage inventory

The practice shop keeps a list of what its tests cover. Open `apps/practice-shop/e2e/COVERAGE.md`. It has two parts.

The first part is a table of what is covered. One row looks like this:

```text
| Orders    | Status filter, admin marks a pending order as paid                                            | `orders/orders.spec.ts`       |
```

The second part is "Not covered yet". It lists gaps on purpose:

```text
- Editing a product.
- Pagination: the Next and Previous buttons.
- Duplicate SKU error when creating a product.
- The viewer role: no New, Edit or Delete buttons, and the API answers 403.
```

This is honest. It does not say "everything is tested". It says what is tested and what is not. A reader can trust the first part because the second part exists.

Keep such a file for your own project. Update it in the same change as the tests.

## Practice

1. Open `apps/practice-shop/e2e/COVERAGE.md`. Count the rows in the "What is covered" table.
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

7. Read the output. Count the tests. Note how long the whole run takes.

## Check what you know

1. Which level of the pyramid has the most tests?

<details><summary>Answer</summary>

The bottom: unit tests. They are fast and cheap.

</details>

2. Why should an E2E test not check ten invalid prices?

<details><summary>Answer</summary>

E2E tests are slow and costly. Those checks are better placed lower in the pyramid, close to the code.

</details>

3. What three questions help you pick what to automate?

<details><summary>Answer</summary>

Risk, frequency and stability.

</details>

4. Why does `COVERAGE.md` list what is not covered?

<details><summary>Answer</summary>

It makes the inventory honest. Readers know the real state and can choose the next test to write.

</details>

## Next step

In the next lesson you learn how to keep each test independent, so it passes alone and in any order.
