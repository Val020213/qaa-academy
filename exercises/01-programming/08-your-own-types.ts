// Lesson 08 - Your own types
// You practise: type aliases, optional properties, union of literal strings,
// and narrowing with if.
//
// Run this file from the project folder with:
//   node exercises/01-programming/08-your-own-types.ts
//
// Replace each "TODO" with real code. Do not edit the checker at the bottom.

type Status = "passed" | "failed" | "skipped";

type TestCase = {
  id: number;
  title: string;
  status: Status;
  owner?: string; // optional: some test cases have no owner
};

// ---------------------------------------------------------------
// Exercise 1
// Return a short label for a status: "PASS", "FAIL" or "SKIP".
// Use if statements.
// Example: statusLabel("failed") returns "FAIL"
function statusLabel(status: Status): string {
  // TODO
  return "";
}

// ---------------------------------------------------------------
// Exercise 2
// A test is finished when it is "passed" or "failed". "skipped" is not finished.
// Example: isFinished("passed") returns true, isFinished("skipped") returns false
function isFinished(status: Status): boolean {
  // TODO
  return false;
}

// ---------------------------------------------------------------
// Exercise 3
// Describe the owner of a test case.
// If the test case has an owner, return "<title> (owner: <owner>)".
// If it has no owner, return "<title> (no owner)".
// Example: { id: 1, title: "Login", status: "passed", owner: "Ana" }
//   returns "Login (owner: Ana)"
function describeOwner(testCase: TestCase): string {
  // TODO
  return "";
}

// ---------------------------------------------------------------
// Exercise 4
// Count the test cases that have the given status.
// Example: with two failed test cases in the list, countByStatus(list, "failed") returns 2
function countByStatus(testCases: TestCase[], status: Status): number {
  // TODO
  return -1;
}

// ---------------------------------------------------------------
// Exercise 5
// Return the title of the first failed test case.
// If no test case failed, return undefined.
// Example: the first failed test case is "Checkout applies discount"
//   returns "Checkout applies discount"
function firstFailedTitle(testCases: TestCase[]): string | undefined {
  // TODO
  return "TODO";
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

const sampleList: TestCase[] = [
  { id: 1, title: "Login works", status: "passed" },
  { id: 2, title: "Checkout applies discount", status: "failed" },
  { id: 3, title: "Logout clears session", status: "failed" },
  { id: 4, title: "Order history", status: "skipped" },
];

const allPassed: TestCase[] = [{ id: 1, title: "Login works", status: "passed" }];

check("1 statusLabel", [statusLabel("passed"), statusLabel("failed"), statusLabel("skipped")], ["PASS", "FAIL", "SKIP"]);
check("2 isFinished", [isFinished("passed"), isFinished("failed"), isFinished("skipped")], [true, true, false]);
check(
  "3 describeOwner",
  [
    describeOwner({ id: 1, title: "Login", status: "passed", owner: "Ana" }),
    describeOwner({ id: 2, title: "Logout", status: "passed" }),
  ],
  ["Login (owner: Ana)", "Logout (no owner)"],
);
check("4 countByStatus", [countByStatus(sampleList, "failed"), countByStatus(sampleList, "skipped")], [2, 1]);
check("5 firstFailedTitle", [firstFailedTitle(sampleList), firstFailedTitle(allPassed)], ["Checkout applies discount", undefined]);

console.log(failures === 0 ? "\nAll done. Well done." : `\n${failures} check(s) still failing.`);
