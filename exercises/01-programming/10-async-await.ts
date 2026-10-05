// Lesson 10 - async and await
// You practise: async functions, await, awaiting in a loop, and try / catch.
//
// Run this file from the project folder with:
//   node exercises/01-programming/10-async-await.ts
//
// Replace each "TODO" with real code. Do not edit the checker at the bottom.

type Status = "passed" | "failed" | "skipped";

type TestCase = {
  id: number;
  title: string;
  status: Status;
};

// Helpers you can use. Do not change them.
// wait(ms) pauses for the given number of milliseconds.
function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const database: TestCase[] = [
  { id: 1, title: "Login works", status: "passed" },
  { id: 2, title: "Checkout applies discount", status: "failed" },
  { id: 3, title: "Logout clears session", status: "skipped" },
];

// Simulates a slow request. It resolves with a test case after 30 ms.
// It rejects (throws) with an Error when the id does not exist.
async function loadTestCase(id: number): Promise<TestCase> {
  await wait(30);
  const found = database.find((testCase) => testCase.id === id);
  if (found === undefined) {
    throw new Error(`Test case ${id} not found`);
  }
  return found;
}

// ---------------------------------------------------------------
// Exercise 1
// Load the test case with the given id and return its title.
// Remember: use await.
// Example: await loadTitle(1) returns "Login works"
async function loadTitle(id: number): Promise<string> {
  // TODO
  return "";
}

// ---------------------------------------------------------------
// Exercise 2
// Load test case 1, then load test case 2 (one after the other).
// Return their statuses in an array.
// Example: await loadTwoStatuses() returns ["passed", "failed"]
async function loadTwoStatuses(): Promise<Status[]> {
  // TODO
  return [];
}

// ---------------------------------------------------------------
// Exercise 3
// Load every id in the list, one by one, and return all the titles.
// Use for...of and await inside the loop.
// Example: await loadTitles([3, 1]) returns ["Logout clears session", "Login works"]
async function loadTitles(ids: number[]): Promise<string[]> {
  // TODO
  return ["TODO"];
}

// ---------------------------------------------------------------
// Exercise 4
// Load the test case and return its title.
// If loading fails, catch the error and return "error: " plus the error message.
// Example: await safeLoadTitle(99) returns "error: Test case 99 not found"
// Tip: inside catch, read the message with (error as Error).message
async function safeLoadTitle(id: number): Promise<string> {
  // TODO
  return "";
}

// ---------------------------------------------------------------
// Exercise 5
// Wait 20 milliseconds, then return a + b.
// Example: await addAfterWait(2, 3) returns 5
async function addAfterWait(a: number, b: number): Promise<number> {
  // TODO
  return -1;
}

// ===============================================================
// Checker. Do not edit below this line.
// ===============================================================
let failures = 0;

function check(name: string, actual: unknown, expected: unknown): void {
  if (JSON.stringify(actual) === JSON.stringify(expected)) {
    console.log(`OK    ${name}`);
  } else {
    failures += 1;
    console.log(`FAIL  ${name} -> got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`);
  }
}

async function main(): Promise<void> {
  check("1 loadTitle", await loadTitle(1), "Login works");
  check("2 loadTwoStatuses", await loadTwoStatuses(), ["passed", "failed"]);
  check("3 loadTitles", await loadTitles([3, 1]), ["Logout clears session", "Login works"]);
  check("4 safeLoadTitle", [await safeLoadTitle(2), await safeLoadTitle(99)], ["Checkout applies discount", "error: Test case 99 not found"]);
  check("5 addAfterWait", await addAfterWait(2, 3), 5);

  console.log(failures === 0 ? "\nAll done. Well done." : `\n${failures} check(s) still failing.`);
}

void main();
