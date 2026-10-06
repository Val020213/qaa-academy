---
title: Solve a problem step by step
summary: A five-move method for the blank-page moment, when you know every piece of the language and still cannot start.
duration: 80 min
---

## Start with a puzzle

A calendar program must say if a year is a leap year, a year with 366 days. A friend writes this and says "I learned at school that a leap year comes every four years".

```ts
function isLeapYear(year: number): boolean {
  return year % 4 === 0;
}
```

The sign `%` gives the remainder of a division. So `2024 % 4` is `0`, and the function says `true` for 2024. It says `false` for 2023. Both answers are right.

The function is wrong for some years. Find one such year without searching. What do you need to know about leap years to find it?

Write down your guess before you read on.

## Goal

- Restate a problem in your own words, with one example input and output.
- Write the steps of a solution in plain words before you write code.
- Grow a function one step at a time, and run it after each step.
- Choose test values: an easy case, an edge case and a wrong input.

## The blank page

You know variables, types, `if` and functions. You open a new file and look at an empty screen. Nothing happens.

This is normal. Knowing the pieces is not the same as knowing how to build with them. A cook may know every tool in the kitchen and still not know what to cook first.

The fix is not more syntax. The fix is a method. You think first, in words, and you write code last. Here are five moves.

1. **Say it.** Write the problem in your own words. Add one example: an input and the output you expect.
2. **Solve it by hand.** Do the task on paper for the example. Watch what you do, step by step.
3. **Write the steps in plain words.** This is called **pseudocode**: steps for a person, not for a computer.
4. **Code one step.** Turn one step into code. Run it. Then do the next step.
5. **Check three kinds of input.** An easy case, an edge case, and a wrong input.

Breaking a problem into small steps is called **decomposition**. Each move above is a way to do it.

## Example 1: the price of a cinema ticket

**Move 1: say it.** A cinema sells tickets by age and day. Children under 12 pay 6. People of 65 and older pay 7. Everybody else pays 10. On Tuesday every ticket costs 2 less.

Example: a person of 8 on Tuesday pays 4.

**Move 2: solve it by hand.** Take a 70-year-old on Tuesday. You look at the age: 70 is over 65, so the base price is 7. You look at the day: it is Tuesday, so you take 2 off. The answer is 5. Notice that you decided the age first and the day second.

**Move 3: plain words.**

```text
1. Start with the adult price, 10.
2. If the age is under 12, the price is 6. Otherwise, if the age is 65 or more, it is 7.
3. If the day is Tuesday, take 2 off the price.
4. Give back the price.
```

**Move 4: code, one step at a time.** Step 1 only. Run it.

```ts
function ticketPrice(age: number, day: string): number {
  return 10;
}

console.log(ticketPrice(30, "Monday"));
```

This prints `10`. Now step 2:

```ts
function ticketPrice(age: number, day: string): number {
  let price = 10;
  if (age < 12) {
    price = 6;
  } else if (age >= 65) {
    price = 7;
  }
  return price;
}

console.log(ticketPrice(30, "Monday"));
console.log(ticketPrice(8, "Monday"));
console.log(ticketPrice(70, "Monday"));
```

This prints `10`, `6` and `7`. Now step 3. Add it before the `return`:

```ts
  if (day === "Tuesday") {
    price = price - 2;
  }
```

Run it with `ticketPrice(8, "Tuesday")`. It prints `4`, the number from your example.

**Move 5: check.** An **edge case** is a value at the border of a rule or outside the usual. Try these:

```ts
console.log(ticketPrice(11, "Monday"), ticketPrice(12, "Monday"));
console.log(ticketPrice(64, "Monday"), ticketPrice(65, "Monday"));
console.log(ticketPrice(30, "tuesday"));
console.log(ticketPrice(-1, "Monday"));
```

It prints:

```text
6 10
10 7
10
6
```

The borders work: 11 pays 6 and 12 pays 10, 64 pays 10 and 65 pays 7. But you found two problems. The text `"tuesday"` with a small `t` gets no discount. And an age of -1 pays 6, because -1 is under 12. A real person cannot be -1 years old.

Add a rule at the top. Decide what the function does for a wrong age. Here it returns -1 and you say so in a comment. Later lessons show better ways.

```ts
  if (age < 0) {
    return -1; // -1 means "wrong age"
  }
```

> **Tip:** Write down each problem that you find in move 5. Some you fix now. Some you leave on purpose, with a note.

## Example 2: is it a leap year?

This one is shorter. It comes from another world: the calendar.

**Move 1: say it.** Say if a year has 366 days. Example: 2024 gives `true`.

**Move 2: solve it by hand.** You may not remember the rules. Make a table of years you know, then find what they share.

```text
2024 -> leap year
2023 -> not a leap year
2000 -> leap year
1900 -> not a leap year
```

### Back to the puzzle

The friend's rule says that every fourth year is a leap year. The year 1900 is divisible by 4, but it was not a leap year. So the simple function gives a wrong answer for 1900. It is also wrong for 2100. A rule that is true for your two first examples can be false for a third. This is why you collect more than one example in move 1 and move 2.

The full rule: a year divisible by 400 is a leap year. Otherwise, a year divisible by 100 is not. Otherwise, a year divisible by 4 is.

**Move 3: plain words.**

```text
1. If the year divides by 400, it is a leap year.
2. Otherwise, if it divides by 100, it is not.
3. Otherwise, it is a leap year if it divides by 4.
```

**Move 4: code.**

```ts
function isLeapYear(year: number): boolean {
  if (year % 400 === 0) {
    return true;
  }
  if (year % 100 === 0) {
    return false;
  }
  return year % 4 === 0;
}

console.log(isLeapYear(2000), isLeapYear(1900), isLeapYear(2024), isLeapYear(2023));
```

This prints `true false true false`. These are the four years from your hand table. **Move 5** passed with the same four values. Add edge cases: 2100, 1600, and the year 0.

## When you are stuck

- **Make the problem smaller.** Solve a version with only one rule. Add the next rule when the first one works.
- **Solve an easier problem first.** Price the ticket for one fixed age. Then make the age a parameter.
- **Explain it aloud.** Say the problem to a friend, a pet or a toy. You often find the missing step as you speak.
- **Go back to the example.** If your code gives a different result from your hand example, run it with the example. Change one thing at a time.

You may ask an AI assistant for help. Use it for a hint about one step, not for the whole solution. Then write the code yourself, run it, and be ready to explain every line. If you cannot explain a line, you did not learn it, and you cannot fix it when it breaks.

## Go deeper

### Why words first

A computer language forces you to think about details: brackets, types, names. Plain words let you think about the idea only. If the idea is wrong, you find it cheaply, before you have made code that looks right.

### Writing pseudocode as comments

A good trick is to write the steps as comments in the file, and put the code under each one. At the end, the comments are the explanation of your code.

### How it shows up in real QA automation work

Before you write an automated test, you write the manual steps in plain words. This is the same move. A test that you cannot say in words is hard to write in code. The edge cases of move 5 are the test cases that a tester chooses: the border, the wrong input, and the usual case.

### A trade-off

Writing steps takes time that feels lost. For a task of two lines, it is too much. For a task that makes you stop and think, it saves time. The skill is to see which kind of task you have.

## Practice

1. Create the file `exercises/01-programming/solve.ts`.
2. Write the cinema `ticketPrice` function in the same order as the lesson: one step, one run. Keep the steps as comments above the function.
3. Add the three edge cases from the lesson and read the results.
4. Write `isLeapYear`. Test 1900, 2000, 2024 and 2100.
5. Open `exercises/01-programming/05b-solve-a-problem-step-by-step.ts` and run it:

```bash
node exercises/01-programming/05b-solve-a-problem-step-by-step.ts
```

Each exercise is a small problem in words. Write your steps in a comment first. Make every line say `OK`.

## Challenge

A shop gives change in coins. Write a function that says how many coins are needed to give back a given amount, using as few coins as possible. Choose your own world: a shop with euro cents, a game with gold, silver and copper coins, a vending machine. Use at least five coin values.

Create the file `exercises/challenges/solve-a-problem.ts`. Name the function `coinsForChange`. Write your steps in plain words as a comment at the top.

It is done when:

- With the coins 50, 20, 10, 5, 2 and 1, `coinsForChange(38)` returns 5, and `coinsForChange(99)` returns 6.
- `coinsForChange(0)` returns 0.
- A wrong input, such as `-5` or `2.5`, returns -1.
- At the bottom of the file you print each call next to its expected value, and you run the file with `node`.

You will need something this lesson did not teach: how to find how many times one number fits into another, and what is left. Search for: `javascript Math.floor`, `javascript Number.isInteger`.

## Think it through

1. What does this print, and why? Use the final `ticketPrice`.

```ts
console.log(ticketPrice(65, "Tuesday"), ticketPrice(64, "Tuesday"));
```

<details>
<summary>Answer</summary>

It prints `5 8`. A person of 65 is a senior, so the base price is 7, and Tuesday takes 2 off, which gives 5. A person of 64 is not a senior and not a child, so the base price is 10, and Tuesday gives 8. The border at 65 is the point where the price changes, which is why it was in the edge cases.

</details>

2. This leap year function runs with no error but gives a wrong answer for one of the years you tested. Find the year and the bug.

```ts
function isLeapYear(year: number): boolean {
  if (year % 4 === 0) {
    return true;
  }
  if (year % 100 === 0) {
    return false;
  }
  if (year % 400 === 0) {
    return true;
  }
  return false;
}
```

<details>
<summary>Answer</summary>

For 1900 it returns `true`, but 1900 is not a leap year. The year 1900 divides by 4, so the first `if` returns before the 100 rule is checked. The same happens for 2100. The checks are in the wrong order: the most specific rule, 400, must come first, as in your plain-word steps. This is the same lesson as the medals in lesson 04.

</details>

3. Two versions of the ticket program. Which is better, and what would make you choose the other?

```ts
function ticketPrice(age: number, day: string): number {
  // all rules here, 15 lines
}
```

```ts
function basePrice(age: number): number { /* ... */ }
function dayDiscount(day: string): number { /* ... */ }
function ticketPrice(age: number, day: string): number {
  return basePrice(age) - dayDiscount(day);
}
```

<details>
<summary>Answer</summary>

The second version gives each rule a name and one job, so you can test and change the age rules without touching the day rules. The cost is more code and more names to read. For 15 lines with two rules, the first version is also fine. Choose the second when the rules grow, or when two programs need the same rule. Do not split before you feel the need.

</details>

4. The cinema now says: seniors start at 60, and the Tuesday discount does not apply to children. Which of your plain-word steps change, and what is the lesson?

<details>
<summary>Answer</summary>

Step 2 changes the number 65 to 60. Step 3 gets an extra condition: take 2 off only if the person is not a child. If you had only code, you would search for the places to change. With plain steps, each rule is one line that you can find. A good habit is to change the steps first, and then the code.

</details>

5. What does `ticketPrice(NaN, "Monday")` return with the final function? Is this a good result?

<details>
<summary>Answer</summary>

It returns `10`. Every comparison with `NaN` is false, so the age is not under 0, not under 12 and not 65 or more. The function falls to the base price and gives an adult price for a value that is not an age. This is a wrong input that the three-way check in move 5 would find. The fix depends on the requirement: return a code for a wrong age, as for -1, or check with `Number.isNaN`.

</details>

6. An AI assistant gives you a complete, working solution of the cinema problem. It passes your four test values. Do you use it? There is no single right answer. Explain the trade-off.

<details>
<summary>Answer</summary>

Using it saves time now, and if you can explain every line, the code may be fine. The risk is that you cannot find a bug later, because you did not build the idea. The solution may also pass your four values and still be wrong at a border you did not test. It depends on your goal. When you are learning, ask for a hint about one step and write the rest. When you only need a result, read, run and explain every line first.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **What is pseudocode, and how do programmers use it?**
   - Search for: `pseudocode examples beginners`
   - Try it: pick a daily task, such as making a cup of tea with sugar if you want it. Write it as pseudocode with one decision. Then give it to a friend and see whether they follow it exactly.
   - A good answer explains: what pseudocode is, why it has no fixed rules, and one case where it helps.

2. **What are boundary value analysis and equivalence classes in testing?**
   - Search for: `boundary value analysis equivalence partitioning`
   - Try it: for the cinema ticket, list the groups of ages that must behave the same. Then choose the values at each border. Run `ticketPrice` with them.
   - A good answer explains: both ideas with the ticket example, and how many values you need.

3. **What is rubber duck debugging, and why does it work?**
   - Search for: `rubber duck debugging`
   - Try it: next time your code gives a wrong result, explain it line by line aloud before you change anything. Write down if it helped.
   - A good answer explains: the idea, and why saying a problem aloud makes you notice what you skipped.

## Next step

In the next lesson you learn Arrays and loops, which let you handle many values at once.
