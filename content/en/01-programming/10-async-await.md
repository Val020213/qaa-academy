---
title: async and await
duration: 60 min
---

## Goal

In this lesson you learn to write code that waits for slow work, and to recognise the bug that appears when you forget to wait.

- Predict the order in which lines of slow and fast code print.
- Use `async` and `await` so that your code waits where it must.
- Spot the forgotten-`await` bug, which may give no error message.
- Decide when tasks should run one after another and when together.

## Some work takes time

Until now we used operations that finish before moving to the next line. Some tasks finish later: asking a server for tomorrow's weather, loading a song from the internet, opening a page in the browser.

When you start an asynchronous operation, Node.js can move to the next line before it finishes. A synchronous operation blocks that execution, even if it is slow.

## Slow work finishes later

On Node.js’s main thread, the JavaScript engine executes one function at a time. Node.js manages timers and input and output operations while that code continues. Its event loop runs pending callbacks when the thread can handle them.

`setTimeout` runs a function after a time in milliseconds. A millisecond is one thousandth of a second. See what happens with a time of 0:

```ts
console.log("Put the kettle on")
setTimeout(() => console.log("Kettle is ready"), 0)
console.log("Get a cup")
```

The output is:

```text
Put the kettle on
Get a cup
Kettle is ready
```

Even with 0 milliseconds, the callback waits until the code already running has finished. Node.js adjusts that delay to 1 ms; it can then run the callback when the thread is free. The delay does not guarantee an exact time.

## Promise

A **Promise** represents the result of an operation. It can be pending, fulfilled with a value or rejected with a reason; it may already have settled when you receive it.

The type `Promise<string>` says that, if it fulfills, its value is a `string`.

Here is a helper that simulates slow work. It waits some milliseconds:

```ts
function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
```

You do not need to understand the inside of this helper now. Use it as a tool. `Promise<void>` says you do not need to use a result value. This timer fulfills without providing a value.

## async and await

Put `await` before a Promise to pause the function until it fulfills or rejects. If it fulfills, you receive its value; if it rejects, `await` throws the rejection reason.

You can use `await` inside a function marked with `async`. You can also use it at the top level of a module. An `async` function always returns a Promise.

```ts
function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function loadForecast(): Promise<string> {
  await wait(500)
  return "sunny"
}

async function main(): Promise<void> {
  console.log("Asking for the forecast...")
  const forecast = await loadForecast()
  console.log(`Forecast: ${forecast}`)
}

main()
```

The program prints `Asking for the forecast...`. About 500 ms later it prints:

```text
Forecast: sunny
```

Read `await loadForecast()` as "wait for loadForecast to finish". The variable `forecast` is a normal `string`, not a Promise.

## The forgotten await

Look at the same program without the `await` before `loadForecast()`:

```ts
function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function loadForecast(): Promise<string> {
  await wait(500)
  return "sunny"
}

async function main(): Promise<void> {
  const forecast = loadForecast()
  console.log(`Forecast: ${forecast}`)
}

main()
```

The program prints:

```text
Forecast: [object Promise]
```

The variable `forecast` holds the Promise, not the result. The program did not wait and printed too early. There is no error message, which is why this is the hard kind of bug.

> **Tip:** When a value looks like `[object Promise]`, or a program behaves differently on each run, check for a missing `await` first.

Without `await`, the function does run. You just do not wait for it. Here, `await` pauses the function that contains it and lets other code continue. `slowLog` returns a Promise that fulfills without a value; its message prints later.

![await pauses slowLog; main continues before slowLog resumes.](/images/01-await-caller.en.svg)

```ts
function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function slowLog(): Promise<void> {
  await wait(100)
  console.log("pasta is ready")
}

async function main(): Promise<void> {
  slowLog()
  console.log("table is set")
}

main()
```

The result is:

```text
table is set
pasta is ready
```

## try and catch

A Promise can fail. A server may be down. A song may not exist. When a Promise rejects, `await` throws its rejection reason in the waiting function.

Use `try` and `catch` to handle the error. The code in `try` runs first. If it throws, the code in `catch` runs.

```ts
function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function loadSong(id: number): Promise<string> {
  await wait(100)
  if (id !== 1) {
    throw new Error(`Song ${id} not found`)
  }
  return "Blue in Green"
}

async function main(): Promise<void> {
  try {
    const title = await loadSong(2)
    console.log(title)
  } catch (error) {
    console.log("Something went wrong:", error instanceof Error ? error.message : error)
  }
}

main()
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
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function main(): Promise<void> {
  const songs = ["Intro", "Chorus", "Outro"]
  for (const song of songs) {
    await wait(100)
    console.log(`${song} loaded`)
  }
}

main()
```

The program prints three lines, one after each wait of about 100 milliseconds.

## One after another, or together

In this example, each task starts after the previous `await`: three 100 ms waits take about 300 ms. If the tasks are independent, you can start them together by calling all three functions and wait for their Promises with `Promise.all`. Use the `wait` function from above.

```ts
async function main(): Promise<void> {
  const startOne = Date.now()
  await wait(100)
  await wait(100)
  await wait(100)
  console.log(`One by one: ${Date.now() - startOne} ms`)

  const startAll = Date.now()
  await Promise.all([wait(100), wait(100), wait(100)])
  console.log(`Together: ${Date.now() - startAll} ms`)
}

main()
```

The first line is about 300 ms and the second is about 100 ms (the times vary between runs). Together is faster, but only when the tasks do not depend on each other.

## Go deeper

### forEach does not wait for async code

The method `forEach` starts an async function for each item and does not wait for any of them. Use `for...of` with `await` when you need to wait for each step. The first question below shows the result.

## Practice

1. Create the file `exercises/01-programming/async-practice.ts`.
2. Copy the first `wait` example from the "async and await" section. Run it with `node exercises/01-programming/async-practice.ts`.
3. Remove the `await` before `loadForecast()` and run it again. Read the output. Then put the `await` back.
4. Open `exercises/01-programming/10-async-await.ts`. Replace each `// TODO` with code.
5. Run the exercise file with this command:

```bash
node exercises/01-programming/10-async-await.ts
```

Make every check say `OK`.

## Challenge

Three shops report their stock: a bakery, a dairy and a fruit stand. Each report is a slow async function. The bakery needs 200 ms, the dairy 300 ms and the fruit stand 100 ms. The dairy always fails with an error. Write a program that asks all three shops at the same time and prints one line for each shop. A failed shop must not stop the other two. You may choose another theme, for example three weather stations or three music services.

Create the file `exercises/challenges/10-async-await.ts`.

It is done when:

- You run `node exercises/challenges/10-async-await.ts` and it prints one labelled line per shop, for example `dairy: failed, fridge is offline`.
- The program does not crash, although one shop fails.
- The program prints the total time, and the total is close to 300 ms, not 600 ms.
- No line prints `[object Promise]`, and you do not use `forEach` with `async`.

You will need something this lesson did not teach: a way to wait for many Promises and keep both the successes and the failures. `Promise.all` rejects when it receives the first rejection, but does not cancel the other tasks. Search for: `promise.allsettled status fulfilled rejected`.

## Think it through

1. What does this program print, and in which order? Why?

```ts
async function main(): Promise<void> {
  const ids = [1, 2, 3]
  ids.forEach(async (id) => {
    await wait(100)
    console.log(`done ${id}`)
  })
  console.log("finished")
}

main()
```

Use the `wait` function from this lesson.

<details><summary>Answer</summary>

It prints `finished` first. Then it prints `done 1`, `done 2` and `done 3`, about 100 ms later. `forEach` starts all three async functions and moves on, so `finished` is printed before any of them is done. To wait for each one, use a `for...of` loop with `await` inside.

</details>

2. This code has a bug. It runs, but it does the wrong thing. Find it.

```ts
async function isLoaded(): Promise<boolean> {
  await wait(100)
  return false
}

async function main(): Promise<void> {
  if (isLoaded()) {
    console.log("loaded")
  } else {
    console.log("not loaded")
  }
}

main()
```

<details><summary>Answer</summary>

The `await` is missing before `isLoaded()`. The `if` gets a Promise, and a Promise is always "true" for an `if`. So the program always prints `loaded`, even though the function returns `false`. With strict settings, TypeScript reports an error: "This condition will always return true since this 'Promise<boolean>' is always defined." Write `if (await isLoaded())`.

</details>

3. In this program, the `await` before `loadSong(2)` is removed. The function `loadSong` throws for every id except 1. What do you expect to happen, and what breaks?

```ts
async function main(): Promise<void> {
  try {
    const title = loadSong(2)
    console.log(title)
  } catch (error) {
    console.log("Something went wrong")
  }
  console.log("end of main")
}

main()
```

Use `loadSong` from the "try and catch" section.

<details><summary>Answer</summary>

It prints `Promise { <pending> }` and `end of main`. Then Node crashes with the error "Song 2 not found", and `catch` never runs. Without `await`, the `try` block ends without waiting for that Promise’s rejection. The `catch` does not receive it and, with Node.js’s default options, the unhandled rejection stops the program. The `catch` can still handle synchronous errors in the block.

</details>

## Next step

In the next lesson you learn how to split code into files and share it with `export` and `import`.
