// Lesson 11 - Modules
// You practise: import and use values, types and functions from another file.
// The other file is _test-cases.ts, in the same folder. Open it and read it first.
//
// Run this file from the project folder with:
//   node exercises/01-programming/11-modules.ts
//
// Replace each "TODO" with real code. Do not edit the checker at the bottom.

import type { Status, TestCase } from "./_test-cases.ts";
import { testCases, countByStatus } from "./_test-cases.ts";

// ---------------------------------------------------------------
// Exercise 1
// Return how many imported test cases failed.
// Use the imported function countByStatus and the imported array testCases.
// Example: totalFailed() returns 2
function totalFailed(): number {
  // TODO
  return -1;
}

// ---------------------------------------------------------------
// Exercise 2
// Return the titles of the imported test cases that have the given status.
// Example: titlesWithStatus("skipped") returns ["Order history shows last 10 orders"]
function titlesWithStatus(status: Status): string[] {
  // TODO
  return ["TODO"];
}

// ---------------------------------------------------------------
// Exercise 3
// Return true if the imported list has a test case with this id.
// Example: hasTestCase(1) returns true, hasTestCase(99) returns false
function hasTestCase(id: number): boolean {
  // TODO
  return false;
}

// ---------------------------------------------------------------
// Exercise 4
// Build a report text using countByStatus three times.
// Format: "<passed> passed, <failed> failed, <skipped> skipped"
// Example: makeReport() returns "2 passed, 2 failed, 1 skipped"
function makeReport(): string {
  // TODO
  return "";
}

// ---------------------------------------------------------------
// Exercise 5
// Create a new test case with the status "skipped".
// Use the imported type TestCase as the return type.
// Example: newTestCase(6, "Profile can be edited")
//   returns { id: 6, title: "Profile can be edited", status: "skipped" }
function newTestCase(id: number, title: string): TestCase {
  // TODO
  return { id: 0, title: "", status: "passed" };
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

check("1 totalFailed", totalFailed(), 2);
check("2 titlesWithStatus", titlesWithStatus("failed"), ["Checkout applies discount code", "Logout clears the session"]);
check("3 hasTestCase", [hasTestCase(1), hasTestCase(99)], [true, false]);
check("4 makeReport", makeReport(), "2 passed, 2 failed, 1 skipped");
check("5 newTestCase", newTestCase(6, "Profile can be edited"), { id: 6, title: "Profile can be edited", status: "skipped" });

console.log(failures === 0 ? "\nAll done. Well done." : `\n${failures} check(s) still failing.`);
