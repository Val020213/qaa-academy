---
title: async and await
summary: Predict the order of slow work, avoid the forgotten-await bug, and decide when tasks run one by one or together.
duration: 75 min
---

## Start with a puzzle

You make tea. This program describes the steps. The kettle timer is set to zero milliseconds. That means "ready at once".

```ts
console.log("Put the kettle on");
setTimeout(() => console.log("Kettle is ready"), 0);
console.log("Get a cup");
```

`setTimeout` runs a function after a time. The time here is 0.

In which order do the three lines print? Is zero milliseconds really "at once"?

Write down your guess before you read on.

## Goal

- Predict the order in which lines of slow and fast code print.
- Use `async` and `await` so that your code waits where it must.
- Spot the forgotten-`await` bug without an error message.
- Decide when tasks should run one after another and when together.

## Some work takes time

Until now, every line of code finished at once. Real work is slower.

- A phone asks a server for tomorrow's weather.
- A music app loads a song from the internet.
- A kitchen timer counts ten minutes.
- A browser opens a page.

The computer does not stop and wait by itself. You must tell your code where to wait.

## Promise

A **Promise** is a value that is not ready yet. It is like the ticket you get at a bakery counter. You do not have the bread, but you have a promise of bread. The result can be a success or a failure.

The type `Promise<string>` means "a string that will arrive later".

Here is a helper that simulates slow work. It waits some milliseconds. A millisecond is one thousandth of a second.

```ts
function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
```

You do not need to understand the inside of this helper now. Use it as a tool. `Promise<void>` means "nothing will arrive, but it will finish later".

## async and await

Put `await` before a Promise to say: "wait here until it is ready, then give me the result."

You can use `await` inside a function marked with `async`. You can also use it at the top level of a module. An `async` function always returns a Promise.

```ts
function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function loadForecast(): Promise<string> {
  await wait(500);
  return "sunny";
}

async function main(): Promise<void> {
  console.log("Asking for the forecast...");
  const forecast = await loadForecast();
  console.log(`Forecast: ${forecast}`);
}

main();
```

The program prints `Asking for the forecast...`. After half a second it prints:

```text
Forecast: sunny
```

Read `await loadForecast()` as "wait for loadForecast to finish". The variable `forecast` is a normal `string`, not a Promise.

## What if the await is missing?

Before you read on, look at the same program with one change. The `await` before `loadForecast()` is gone.

```ts
function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function loadForecast(): Promise<string> {
  await wait(500);
  return "sunny";
}

async function main(): Promise<void> {
  const forecast = loadForecast();
  console.log(`Forecast: ${forecast}`);
}

main();
```

What do you expect? Will it print `sunny`, nothing, or an error?

The program prints:

```text
Forecast: [object Promise]
```

The variable `forecast` holds the Promise, not the result. The program did not wait. It printed too early. There is no error message. This is the hard kind of bug.

> **Tip:** When a value looks like `[object Promise]`, or a program behaves differently on each run, check for a missing `await` first.

Now a harder case. The `await` is missing, and the function does not print the result. It prints a message later.

```ts
function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function slowLog(): Promise<void> {
  await wait(100);
  console.log("pasta is ready");
}

async function main(): Promise<void> {
  slowLog();
  console.log("table is set");
}

main();
```

Guess the order of the two lines. Then read the result:

```text
table is set
pasta is ready
```

A wrong idea is "no `await` means the function does not run". It does run. You just do not wait for it. `await` pauses only the function that contains it.

### Back to the puzzle

The output is:

```text
Put the kettle on
Get a cup
Kettle is ready
```

JavaScript does one thing at a time. When it meets `setTimeout`, it hands the timer away and goes on with the next line. Even with 0 milliseconds, the timer function waits until the current code has finished. "Zero" means "as soon as you are free", not "now". Slow work always finishes after the code that is already running.

## try and catch

A Promise can fail. A server may be down. A song may not exist. When an awaited Promise fails, it throws an error.

Use `try` and `catch` to handle the error. The code in `try` runs first. If it throws, the code in `catch` runs.

```ts
function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function loadSong(id: number): Promise<string> {
  await wait(100);
  if (id !== 1) {
    throw new Error(`Song ${id} not found`);
  }
  return "Blue in Green";
}

async function main(): Promise<void> {
  try {
    const title = await loadSong(2);
    console.log(title);
  } catch (error) {
    console.log("Something went wrong:", error instanceof Error ? error.message : error);
  }
}

main();
```

The program prints:

```text
Something went wrong: Song 2 not found
```

The check `error instanceof Error` makes sure the error has a `message`. TypeScript does not know what kind of value was thrown, so you must check.

## Awaiting in a loop

You can use `await` inside a `for...of` loop. Each step finishes before the next step starts.

```ts
function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main(): Promise<void> {
  const songs = ["Intro", "Chorus", "Outro"];
  for (const song of songs) {
    await wait(100);
    console.log(`${song} loaded`);
  }
}

main();
```

The program prints three lines, one every 100 milliseconds.

## One after another, or together

Each `await` in a row waits for the one before. Three songs of 100 ms each need 300 ms. Is that the best way? If song 2 does not need song 1, you can start all three at once with `Promise.all`.

Guess the two times before you run this. Use the `wait` function from above.

```ts
async function main(): Promise<void> {
  const startOne = Date.now();
  await wait(100);
  await wait(100);
  await wait(100);
  console.log(`One by one: ${Date.now() - startOne} ms`);

  const startAll = Date.now();
  await Promise.all([wait(100), wait(100), wait(100)]);
  console.log(`Together: ${Date.now() - startAll} ms`);
}

main();
```

The first line is about 300 ms and the second is about 100 ms (in a real run: 302 ms and 101 ms). Together is faster, but only when the tasks do not depend on each other. You cannot pour the tea before the water is hot.

## Go deeper

### Why code does not wait by itself

JavaScript does one thing at a time. When it starts slow work, such as a timer or a request, it does not stand still. It hands the work off and continues with the next line. When the slow work ends, it comes back. That is why the kettle in the puzzle printed last.

### A wrong idea: forEach waits for async code

The method `forEach` starts an async function for each item. It does not wait for any of them. Use `for...of` with `await` when you need to wait for each step. The questions below show the result.

### How it shows up in QA automation work

Here is a taste of Playwright code. You do not run it yet.

```ts
await page.goto("https://example.com/login");
await page.getByLabel("Email").fill("ana@example.com");
await page.getByRole("button", { name: "Log in" }).click();
```

Read it as steps in a manual test: open the page, type the email, click the button. Every step takes time, so every step has `await`.

A forgotten `await` on a check is dangerous. Look at this line:

```ts
expect(page.getByTestId("report-result")).toContainText("12 tests");
```

The check returns a Promise and nobody waits for it. What happens is not predictable. In the runs we watched, the test failed at once, without waiting for the text. In other situations, a test can end before the check finishes. Either way, the fix is the same: always write `await expect(...)`.

This is the correct test. It waits for the slow report, and it does not use a fixed pause such as `waitForTimeout`:

```ts
import { expect, test } from "./lib/test";

test("shows the report when loading ends", async ({ page }) => {
  await page.goto("/#/practice");
  await page.getByTestId("report-load").click();

  await expect(page.getByTestId("report-result")).toContainText("12 tests");
});
```

`expect` tries again and again until the text appears or the time is over. A fixed pause is either too short, and the test fails, or too long, and the suite is slow.

## Practice

1. Create the file `exercises/01-programming/async-practice.ts`.
2. Copy the first `wait` example from the "async and await" section. Run it with `node exercises/01-programming/async-practice.ts`.
3. Remove the `await` before `loadForecast()` and run it again. Read the output.
4. Put the `await` back.
5. Open `exercises/01-programming/10-async-await.ts`. Replace each `// TODO` with code.
6. Run the exercise file with this command:

```bash
node exercises/01-programming/10-async-await.ts
```

Make every line say `OK`.

## Challenge

Three shops report their stock: a bakery, a dairy and a fruit stand. Each report is a slow async function. The bakery needs 200 ms, the dairy 300 ms and the fruit stand 100 ms. The dairy always fails with an error. Write a program that asks all three shops at the same time and prints one line for each shop. A failed shop must not stop the other two. You may choose another world: three weather stations, three music services, three football leagues.

Create the file `exercises/challenges/10-async-await.ts`.

It is done when:

- You run `node exercises/challenges/10-async-await.ts` and it prints one labelled line per shop, for example `dairy: failed, fridge is offline`.
- The program does not crash, although one shop fails.
- The program prints the total time, and the total is close to 300 ms, not 600 ms.
- No line prints `[object Promise]`, and you do not use `forEach` with `async`.

You will need something this lesson did not teach: a way to wait for many Promises and keep both the successes and the failures. `Promise.all` stops at the first failure. Search for: `promise.allsettled status fulfilled rejected`.

## Think it through

1. What does this program print, and in which order? Why?

```ts
async function main(): Promise<void> {
  const ids = [1, 2, 3];
  ids.forEach(async (id) => {
    await wait(100);
    console.log(`done ${id}`);
  });
  console.log("finished");
}

main();
```

Use the `wait` function from this lesson.

<details><summary>Answer</summary>

It prints `finished` first. Then it prints `done 1`, `done 2` and `done 3`, about 100 ms later. `forEach` does not wait for the async callbacks. It starts all three and moves on, so `finished` is printed before any of them is done. To wait for each one, use a `for...of` loop with `await` inside.

</details>

2. This code has a bug. It runs, but it does the wrong thing. Find it.

```ts
async function isLoaded(): Promise<boolean> {
  await wait(100);
  return false;
}

async function main(): Promise<void> {
  if (isLoaded()) {
    console.log("loaded");
  } else {
    console.log("not loaded");
  }
}

main();
```

<details><summary>Answer</summary>

The `await` is missing before `isLoaded()`. The `if` gets a Promise, and a Promise is always "true" for an `if`. So the program always prints `loaded`, even though the function returns `false`. With strict settings, TypeScript reports an error: "This condition will always return true since this 'Promise<boolean>' is always defined." Write `if (await isLoaded())`.

</details>

3. You load three songs for a playlist. Version A uses a `for...of` loop with `await`. Version B uses `Promise.all`. Both give the right list. Which is better here, and what would make you choose the other one?

<details><summary>Answer</summary>

Version B is better when the three songs do not depend on each other, because the total time is the slowest song, not the sum. Version A is better when order matters, for example when song 2 needs the result of song 1. It is also better when the server allows only one request at a time, or when you want to stop at the first failure and not start more work. The choice depends on two things: do the tasks depend on each other, and does the server accept many requests at once?

</details>

4. In this program, the `await` before `loadSong(2)` is removed. The function `loadSong` throws for every id except 1. What do you expect to happen, and what breaks?

```ts
async function main(): Promise<void> {
  try {
    const title = loadSong(2);
    console.log(title);
  } catch (error) {
    console.log("Something went wrong");
  }
  console.log("end of main");
}

main();
```

Use `loadSong` from the "try and catch" section.

<details><summary>Answer</summary>

It prints `Promise { <pending> }` and `end of main`. Then Node crashes with the error "Song 2 not found", and `catch` never runs. Without `await`, the error does not happen inside the `try` block. It happens later, inside the Promise, when nobody is listening. So a missing `await` does not only give a wrong value. It also makes `try` and `catch` useless.

</details>

5. Explain to a teammate what `await` does, in three sentences, without using the word "wait".

<details><summary>Answer</summary>

There is no single right text, but a good answer has three ideas. First, `await` pauses the function it is in, until the slow work has a result. Second, it gives you the real value, not the Promise. Third, other code outside this function can still run while it is paused. If your answer does not say that the pause is only for this function, it is not complete.

</details>

6. What happens with `await Promise.all([])`, a list with no tasks? Does the program stop, hang forever, or continue? Why does this matter when the list comes from a search that finds nothing?

<details><summary>Answer</summary>

It continues at once, and the result is an empty array `[]`. There are no Promises to wait for, so "all of them are done" is already true. This is useful: a search that finds nothing needs no special case. But you must still decide what to show the user, for example a message "no results", because `[]` is not an error.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **What is the event loop, and why can JavaScript wait without freezing?**
   - Search for: `javascript event loop explained`
   - Try it: write a loop that counts to 3 billion, and put a `console.log` after a `setTimeout` of 0 ms. Run it and watch when the log appears.
   - A good answer explains: what the call stack and the queue are, why a timer callback runs later, and why a long loop can freeze a page.

2. **Why does a Promise callback run before a timer set to 0 ms?**
   - Search for: `microtask queue vs macrotask javascript`
   - Try it: add the line `Promise.resolve().then(() => console.log("promise"));` between the first two lines of the puzzle. Predict the new order, then run it.
   - A good answer explains: what a microtask is, which queue runs first, and why this is rarely a problem in daily work.

3. **Why is a fixed sleep a bad way to wait in a UI test, and what does Playwright do instead?**
   - Search for: `playwright auto-waiting actionability`
   - Try it: in the Practice app, click "Load report" and time how long the text "Loading…" stays. Then say what a test with a fixed pause of 1000 ms would do here, and what it would do if the report took 5 seconds.
   - A good answer explains: what Playwright checks before it clicks, how assertions retry, and why a fixed pause makes tests flaky or slow.

## Next step

In the next lesson you learn how to split code into files and share it with `export` and `import`.
