---
title: async and await
summary: Handle work that takes time, avoid the forgotten-await bug, and read how Playwright code waits.
duration: 45 min
---

## Goal

- Explain why some work takes time and why code must wait for it.
- Use `async` and `await` correctly.
- Spot the forgotten-`await` bug.
- Handle a failure with `try` and `catch`.

## Some work takes time

Until now, every line of code finished at once. Real work is slower.

- Loading data from a server takes time.
- Opening a web page in a browser takes time.
- Clicking a button and waiting for the answer takes time.

Playwright does all of these things. The computer does not stop and wait by itself. You must tell your code where to wait.

## Promise

A **Promise** is a value that is not ready yet. It is a promise that a result will arrive later. The result can be a success or a failure.

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

You can only use `await` inside a function marked with `async`. An `async` function always returns a Promise.

```ts
function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function loadStatus(): Promise<string> {
  await wait(500);
  return "passed";
}

async function main(): Promise<void> {
  console.log("Loading...");
  const status = await loadStatus();
  console.log(`Status: ${status}`);
}

main();
```

The program prints `Loading...`. After half a second it prints:

```text
Status: passed
```

Read `await loadStatus()` as "wait for loadStatus to finish". The variable `status` is a normal `string`, not a Promise.

## The forgotten-await bug

This is the number one beginner bug in Playwright. Look at this code. The `await` is missing.

```ts
function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function loadStatus(): Promise<string> {
  await wait(500);
  return "passed";
}

async function main(): Promise<void> {
  const status = loadStatus();
  console.log(`Status: ${status}`);
}

main();
```

The program prints:

```text
Status: [object Promise]
```

The variable `status` holds the Promise, not the result. The program did not wait. It printed too early.

In a real test, this bug is worse. The test moves on before the page is ready. It fails sometimes and passes sometimes. Such a test is called flaky.

> **Tip:** When a value looks like `[object Promise]`, or a test behaves differently on each run, check for a missing `await` first.

## try and catch

A Promise can fail. A server may be down. A button may not exist. When an awaited Promise fails, it throws an error.

Use `try` and `catch` to handle the error. The code in `try` runs first. If it throws, the code in `catch` runs.

```ts
function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function loadTitle(id: number): Promise<string> {
  await wait(100);
  if (id !== 1) {
    throw new Error(`Test case ${id} not found`);
  }
  return "Login works";
}

async function main(): Promise<void> {
  try {
    const title = await loadTitle(2);
    console.log(title);
  } catch (error) {
    console.log("Something went wrong:", error instanceof Error ? error.message : error);
  }
}

main();
```

The program prints:

```text
Something went wrong: Test case 2 not found
```

The check `error instanceof Error` makes sure the error has a `message`. TypeScript does not know what kind of value was thrown, so you must check.

## Awaiting in a loop

You can use `await` inside a `for...of` loop. Each step finishes before the next step starts.

```ts
function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main(): Promise<void> {
  const ids = [1, 2, 3];
  for (const id of ids) {
    await wait(100);
    console.log(`Test case ${id} done`);
  }
}

main();
```

The program prints three lines, one every 100 milliseconds.

## Preview: how Playwright reads

Here is a taste of Playwright code. You do not run it yet.

```ts
await page.goto("https://example.com/login");
await page.getByLabel("Email").fill("ana@example.com");
await page.getByRole("button", { name: "Log in" }).click();
```

Read it as steps in a manual test: open the page, type the email, click the button. Every step takes time, so every step has `await`.

## Go deeper

### Why code does not wait by itself

JavaScript does one thing at a time. When it starts slow work, such as a timer or a request, it does not stand still. It hands the work off and continues with the next line. When the slow work ends, it comes back.

`await` pauses only the function that contains it. Look at this code, where `await` is missing in `main`:

```ts
function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function slowLog(): Promise<void> {
  await wait(100);
  console.log("slow done");
}

async function main(): Promise<void> {
  slowLog();
  console.log("main done");
}

main();
```

The program prints:

```text
main done
slow done
```

A wrong idea is "no `await` means the function does not run". It does run. You just do not wait for it.

### One after another, or together

Each `await` in a row waits for the one before. When the tasks do not depend on each other, you can start them together with `Promise.all`.

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

Use the `wait` function from above. The first line is about 300 ms and the second is about 100 ms (in a real run: 300 ms and 101 ms). In a test, steps usually depend on each other, so you await them one by one.

### How it shows up in QA automation work

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
3. Remove the `await` before `loadStatus()` and run it again. Read the output.
4. Put the `await` back.
5. Open `exercises/01-programming/10-async-await.ts`. Replace each `// TODO` with code.
6. Run the exercise file with this command:

```bash
node exercises/01-programming/10-async-await.ts
```

Make every line say `OK`.

## Check what you know

1. What is a Promise?

<details><summary>Answer</summary>

A value that is not ready yet. The result will arrive later.

</details>

2. Where can you write `await`?

<details><summary>Answer</summary>

Inside a function marked `async`.

</details>

3. What is the forgotten-await bug?

<details><summary>Answer</summary>

You call an async function without `await`. The code does not wait, and you get a Promise instead of the result.

</details>

4. What happens in `catch`?

<details><summary>Answer</summary>

It runs when the code in `try` throws an error. You handle the error there.

</details>

5. What does this program print, and why?

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

It prints `finished` first. Then it prints `done 1`, `done 2` and `done 3`, about 100 ms later. `forEach` does not wait for the async callbacks. It starts all three and moves on. To wait for each one, use a `for...of` loop with `await` inside.

</details>

6. This code has a bug. Find it.

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

The `await` is missing before `isLoaded()`. The `if` gets a Promise, and a Promise is always "true" for an `if`. So the program always prints `loaded`, even though the function returns `false`. TypeScript reports an error: the condition will always return true. Write `if (await isLoaded())`.

</details>

## Research on your own

These questions have no answer here. Search the internet, read, and write your answer in your own words.

1. **What is the event loop, and why can JavaScript wait without freezing?**
   - Search for: `javascript event loop explained`
   - A good answer explains: what the call stack and the queue are, why a timer callback runs later, and why a long loop can freeze a page.

2. **What is the difference between `Promise.all` and `Promise.allSettled`?**
   - Search for: `promise.all vs promise.allsettled`
   - A good answer explains: what each one returns when one Promise fails, and one example of when you would choose each.

3. **Why is a fixed sleep a bad way to wait in a UI test, and what does Playwright do instead?**
   - Search for: `playwright auto-waiting actionability`
   - A good answer explains: what Playwright checks before it clicks, how assertions retry, and why a fixed pause makes tests flaky or slow.

## Next step

In the next lesson you learn how to split code into files and share it with `export` and `import`.
