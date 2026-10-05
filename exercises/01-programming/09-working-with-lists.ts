// Lesson 09 - Working with lists
// You practise: map, filter, find, some, every, and spread.
//
// Run this file from the project folder with:
//   node exercises/01-programming/09-working-with-lists.ts
//
// Replace each "TODO" with real code. Do not edit the checker at the bottom.

type Status = "passed" | "failed" | "skipped";

type TestCase = {
  id: number;
  title: string;
  status: Status;
};

// ---------------------------------------------------------------
// Exercise 1
// Return a new array with only the titles. Use map.
// Example: titles of "Login works" and "Logout works"
//   returns ["Login works", "Logout works"]
function getTitles(testCases: TestCase[]): string[] {
  // TODO
  return ["TODO"];
}

// ---------------------------------------------------------------
// Exercise 2
// Return only the test cases whose status is "failed". Use filter.
// Example: a list with one failed test case returns an array with that test case
function getFailed(testCases: TestCase[]): TestCase[] {
  // TODO
  return [];
}

// ---------------------------------------------------------------
// Exercise 3
// Find the test case with the given id. Use find.
// Return undefined when there is no such test case.
// Example: findById(list, 2) returns the test case with id 2
function findById(testCases: TestCase[], id: number): TestCase | undefined {
  // TODO
  return { id: -1, title: "TODO", status: "skipped" };
}

// ---------------------------------------------------------------
// Exercise 4
// Return true if at least one test case failed. Use some.
// Example: statuses passed, failed returns true. Statuses passed, passed returns false.
function hasFailure(testCases: TestCase[]): boolean {
  // TODO
  return false;
}

// ---------------------------------------------------------------
// Exercise 5
// Return true if every test case passed. Use every.
// Example: statuses passed, passed returns true. Statuses passed, failed returns false.
function allPassed(testCases: TestCase[]): boolean {
  // TODO
  return false;
}

// ---------------------------------------------------------------
// Exercise 6
// Return a NEW array that has all the old test cases and the new one at the end.
// Use spread. Do not change the original array.
// Example: a list of 2 plus one new test case returns a list of 3
function addTestCase(testCases: TestCase[], newTestCase: TestCase): TestCase[] {
  // TODO
  return testCases;
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

const mixed: TestCase[] = [
  { id: 1, title: "Login works", status: "passed" },
  { id: 2, title: "Checkout applies discount", status: "failed" },
  { id: 3, title: "Logout clears session", status: "skipped" },
];

const good: TestCase[] = [
  { id: 1, title: "Login works", status: "passed" },
  { id: 2, title: "Logout works", status: "passed" },
];

const original: TestCase[] = [
  { id: 1, title: "Login works", status: "passed" },
  { id: 2, title: "Logout works", status: "passed" },
];
const extra: TestCase = { id: 3, title: "Search works", status: "skipped" };
const extended = addTestCase(original, extra);

check("1 getTitles", getTitles(mixed), ["Login works", "Checkout applies discount", "Logout clears session"]);
check("2 getFailed", getFailed(mixed), [{ id: 2, title: "Checkout applies discount", status: "failed" }]);
check("3 findById", [findById(mixed, 3), findById(mixed, 99)], [{ id: 3, title: "Logout clears session", status: "skipped" }, undefined]);
check("4 hasFailure", [hasFailure(mixed), hasFailure(good)], [true, false]);
check("5 allPassed", [allPassed(good), allPassed(mixed)], [true, false]);
check("6 addTestCase", [extended.length, original.length, extended[2]?.title], [3, 2, "Search works"]);

console.log(failures === 0 ? "\nAll done. Well done." : `\n${failures} check(s) still failing.`);
