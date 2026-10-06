---
title: Debug like a scientist
summary: Find bugs that give no error message, with one guess and one small experiment at a time.
duration: 80 min
---

## Start with a puzzle

Ana and Ben have the same bug. Their program prints a wrong average temperature. There is no error message.

Ana changes five things at once: a loop limit, a comparison, a variable name, a rounding and a default value. Now the output is right. She is happy.

Ben changes nothing. He adds one `console.log` and runs the program. Then he reads what it prints.

A week later, new data arrives. Ana's program is wrong again. Ben's is not.

Why did Ana's fix not last? What did Ben do that Ana did not?

Write down your guess before you read on.

## Goal

- Describe a bug exactly: what you expected, and what happened.
- Make a small failing example from a big one.
- Make one guess that an experiment can prove wrong, and predict the result before you run it.
- Explain why the bug happened, and check that the fix did not break other cases.

## The hard kind of bug

The hard kind is the **logic bug** from lesson 12. The program runs, prints a result, and the result is wrong. Nothing tells you where to look.

Most beginners change something and run again, then change something else. This is guessing. After five changes you do not know which one mattered. A scientist makes one guess and tests only that guess.

## The method

1. **Observe.** Write two lines. "I expected: ..." and "I got: ...". Use exact values, not "it is broken".
2. **Reproduce.** Make the bug happen every time, with the same input. A bug you cannot repeat, you cannot test.
3. **Shrink.** Build the **minimal example**: the smallest input and the fewest lines that still fail. Delete everything that does not change the result.
4. **Make one hypothesis.** A **hypothesis** is a guess that an experiment can prove wrong. "The loop skips the second row" is a hypothesis. "Something is wrong with the loop" is not.
5. **Design one experiment.** Choose one place for a `console.log`, or change one input. Write down what you predict it will show. Do this before you run.
6. **Run it.** If the prediction was right, your guess may be true. If it was wrong, cross the guess out. You learned something.
7. **Change one thing at a time.** Never two.
8. **Explain and recheck.** When it works, say why it failed. Then run the other cases, to see that the fix broke nothing.

## One full investigation

Here is a scoreboard of about 20 lines. A game gives points to three players. The program must print the winner. It should print `Leo with 10 points`.

```ts
// Expected: "Winner: Leo with 10 points"
type Score = { player: string; points: number };

const text = '[{"player":"Mia","points":"9"},{"player":"Leo","points":"10"},{"player":"Zoe","points":"7"}]';
const scores = JSON.parse(text) as Score[];

function findWinner(table: Score[]): Score {
  let winner = table[0] as Score;
  for (const row of table) {
    if (row.points > winner.points) {
      winner = row;
    }
  }
  return winner;
}

const winner = findWinner(scores);
console.log(`Players: ${scores.length}`);
console.log(`Winner: ${winner.player} with ${winner.points} points`);
```

It prints:

```text
Players: 3
Winner: Mia with 9 points
```

**Observe.** I expected Leo with 10. I got Mia with 9. The program is the same every time, so it is already reproducible. It is already small, so there is nothing to shrink.

**First guess: the loop skips Leo.** The experiment: print each player inside the loop. If the guess is true, `Leo` is missing. I predict: no `Leo` line.

```ts
  for (const row of table) {
    console.log("row:", row.player);
```

The result:

```text
row: Mia
row: Leo
row: Zoe
```

My prediction was wrong, so I cross the guess out. The loop visits Leo.

**Second guess: the comparison says "no" for Leo's row.** The experiment: print both numbers and the comparison. I predict that for Leo it shows `true`, because 10 is more than 9.

```ts
    console.log(row.player, row.points, winner.points, row.points > winner.points);
```

The result:

```text
Mia 9 9 false
Leo 10 9 false
Zoe 7 9 false
```

The prediction failed again. `10 > 9` should be `true`, so my picture of the data is wrong. A written prediction is what makes you notice this surprise.

**Shrink and test the value.** Two small experiments:

```ts
console.log(typeof JSON.parse('{"points":"10"}').points);
console.log("10" > "9");
console.log(10 > 9);
```

They print:

```text
string
false
true
```

Found it. The JSON text has the numbers in quotes, so `points` is text. Text is compared letter by letter, and `"1"` comes before `"9"`. So `"10" > "9"` is `false`. The line `as Score[]` told TypeScript to trust me, so it did not warn.

**Fix one thing.** Convert the text to numbers when you read the data:

```ts
const raw = JSON.parse(text) as { player: string; points: string }[];
const scores: Score[] = raw.map((row) => ({ player: row.player, points: Number(row.points) }));
```

It now prints `Winner: Leo with 10 points`.

**Explain and recheck.** The numbers were text, so the comparison used alphabet order. Check other cases: points `100` and `20` must give `100`, and Mia must still win when she has the most.

## Tools for when you are stuck

**Rubber-duck explaining.** Explain the code, line by line, out loud, to a rubber duck or an empty chair. Say what each line does and what each variable holds. Often you hear yourself say something that is not true, and that is the bug.

**Bisecting.** Bisecting means halving the search area. A program has 8 steps and the final result is wrong. Print the value after step 4. If it is already wrong, the bug is in steps 1 to 4. If it is right, the bug is in steps 5 to 8. Halve again. Eight steps need only three prints, not eight.

## The trap list

- **Fixing the symptom.** You make the output look right for this input, for example with `if (name === "Leo")`. The cause is still there.
- **Changing two things at once.** If it works, you do not know which change did it. If it breaks, you do not know which one broke it.
- **"It works now, I do not know why."** This is not a fix. The bug is hiding. Undo your change and see if it fails again. If it does not, you fixed nothing.

> **Tip:** You may ask an AI assistant for guesses. It can give good ones. But a guess is not a fact. Only your experiment tells you which guess is true. Run the code, and be able to explain every line before you keep it.

### Back to the puzzle

Ana changed five things at once. The old data fit one of the changes, and the other four did nothing or did harm. She cannot tell which is which. Ben made one experiment and looked at real values. He found the cause, so his fix works for any data.

## Go deeper

### How it shows up in QA automation work

A test that fails only sometimes is a bug with a hard step 2. First, make it fail every time. Playwright can repeat a test, for example with `pnpm e2e --repeat-each=10`. Then shrink: run one test, with one input, and look at the trace. Then follow the same method, one guess at a time.

## Practice

1. Create the file `exercises/01-programming/debug-practice.ts` and copy the scoreboard program.
2. Run it. Write the two lines "I expected" and "I got" in a comment.
3. Try the first guess. Write your prediction in a comment before you run. Then run it.
4. Do the same for the second guess. Cross out guesses that were wrong.
5. Fix the bug with one change. Then test points `100` and `20`.
6. Open `exercises/01-programming/12b-debug-like-a-scientist.ts`. It has five functions with one bug each. They all run, and each gives a wrong result for some inputs.
7. Run the file with this command:

```bash
node exercises/01-programming/12b-debug-like-a-scientist.ts
```

8. For each function, write one hypothesis and one prediction before you change code. Make every line say `OK`.

## Challenge

Write a small program from a world you choose: a recipe that scales for more people, a football table, a bank account, a temperature converter. Put one bug in it. The program must run, print a wrong result and show no error. Then write the investigation as comments in the file, in the order you did it.

Create the file `exercises/challenges/12b-debug-like-a-scientist.ts`.

It is done when:

- You run `node exercises/challenges/12b-debug-like-a-scientist.ts` and it prints a wrong result without an error.
- The comments have "Expected" and "Got", at least two hypotheses with a prediction for each, and one hypothesis that you crossed out.
- A second copy of the program, `exercises/challenges/12b-fixed.ts`, prints the right result after exactly one change.
- You stopped the program at least once with a `debugger` statement, using `node inspect`, and a comment names one value you saw there.
- A comment says why the bug happened in two sentences, and which other input you used to check the fix.

You will need something this lesson did not teach: a way to ask Node to stop and let you look at values while the program runs. Search for: `node inspect debugger vs code breakpoint`.

## Think it through

1. A function should return the average of a list. It returns `NaN` for the list `[]` and the right value for every other list. A friend says: "just add `if (list.length === 0) return 0`". Is this fixing the cause or the symptom? What would you ask before you accept it?

<details><summary>Answer</summary>

It may be only a symptom fix. `NaN` comes from dividing 0 by 0, which is correct maths for "no values". The question is what the caller needs: should an empty list return 0, return nothing, or be an error? The answer depends on what the average is used for. An average of 0 can look like real data, and that can hide a problem. Ask the requirement first, then choose.

</details>

2. This code runs, and the answer is wrong. Find the bug.

```ts
function lastThree(scores: number[]): number[] {
  return scores.slice(-4);
}

console.log(lastThree([5, 8, 2, 9, 7]));
```

<details><summary>Answer</summary>

It prints `[ 8, 2, 9, 7 ]`, which is four scores, not three. The `slice(-4)` takes the last four items. It should be `slice(-3)`. This is an off-by-one bug. Shrink the input to `[1, 2, 3, 4]` and count the result. Also check the edges: a list of exactly three items, and a list of two.

</details>

3. Two ways to find a bug in a 60-line program. Version A: read all lines from the top until you see something wrong. Version B: print one value in the middle and halve the search. Both can work. Which is better here, and when would A win?

<details><summary>Answer</summary>

Version B is better when the program is long, because each print removes half of the code. Version A is better when the program is short, or when you already have a strong guess about one place. The choice depends on how much code there is and how good your first guess is.

</details>

4. You change two things at once, and the bug disappears. A teammate says that is fine, since it works. What breaks in this way of working? How do you find out which change mattered?

<details><summary>Answer</summary>

You lose the cause. One change may be the real fix, and the other may be a new hidden bug. To find out, undo one change and run again. If the bug returns, that change was the fix. Then test each change on its own.

</details>

5. Explain to a teammate what a "hypothesis" is in debugging, in three sentences, without using the word "guess".

<details><summary>Answer</summary>

A good answer has these ideas. A hypothesis is a statement about the cause that can be shown false by one experiment. "The loop skips row 2" is one, and "the loop is broken" is not. You write down what you expect to see before the experiment, so a wrong hypothesis teaches you something.

</details>

6. A bug appears only when two people use the app at the same time. You cannot make it happen on your computer. Which step of the method is hard, and what do you do?

<details><summary>Answer</summary>

The hard step is "reproduce". Without it you cannot test a hypothesis. Write down what the logs say and what each user did, in order. Then build a small program that does the same two things close together. Until you can see the bug happen, do not ship a fix.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **What is a "heisenbug", and why can adding a `console.log` make a bug disappear?**
   - Search for: `heisenbug debugging timing`
   - Try it: write two async functions that print in an order that depends on `setTimeout`. Add a `console.log` or a `wait` in one of them and see if the order changes.
   - A good answer explains: what changes when you observe the program, and one way to observe without changing the behaviour.

2. **What does `git bisect` do, and how is it the same idea as halving the search area?**
   - Search for: `git bisect tutorial`
   - Try it: in a folder with `git init`, make 8 commits that each add one line to a file. Choose a "bad" line in the middle. Run `git bisect` and count the steps.
   - A good answer explains: what "good" and "bad" mean for a commit, and why the number of steps is small even for many commits.

3. **How do you write a minimal reproducible example, and why do maintainers ask for one?**
   - Search for: `minimal reproducible example how to write`
   - Try it: take the scoreboard program and delete lines until it is as short as possible and still prints the wrong winner. Count the lines.
   - A good answer explains: what to remove, what must stay, and why a short example helps the person who reads it.

## Next step

In the next lesson you learn DRY, a way to think that keeps your code easy to change and easy to trust.
