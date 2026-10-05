// Lesson 07 - Objects
// You practise: creating objects, reading and changing properties,
// objects inside arrays, and short destructuring.
//
// Run this file from the project folder with:
//   node exercises/01-programming/07-objects.ts
//
// Replace each "TODO" with real code. Do not edit the checker at the bottom.

// ---------------------------------------------------------------
// Exercise 1
// Build a test case object from three values.
// Example: makeTestCase(1, "Login works", "passed")
//   returns { id: 1, title: "Login works", status: "passed" }
function makeTestCase(id: number, title: string, status: string): { id: number; title: string; status: string } {
  // TODO
  return { id: 0, title: "", status: "" };
}

// ---------------------------------------------------------------
// Exercise 2
// Return the title of a test case.
// Example: getTitle({ id: 1, title: "Login works", status: "passed" })
//   returns "Login works"
function getTitle(testCase: { id: number; title: string; status: string }): string {
  // TODO
  return "";
}

// ---------------------------------------------------------------
// Exercise 3
// Change the status of the test case to "passed", then return the test case.
// Example: markAsPassed({ id: 2, title: "Logout works", status: "failed" })
//   returns { id: 2, title: "Logout works", status: "passed" }
function markAsPassed(testCase: { id: number; title: string; status: string }): { id: number; title: string; status: string } {
  // TODO
  return testCase;
}

// ---------------------------------------------------------------
// Exercise 4
// Count how many test cases in the list have the status "failed".
// Use a for...of loop.
// Example: a list with statuses passed, failed, failed returns 2
function countFailed(testCases: { id: number; title: string; status: string }[]): number {
  // TODO
  return -1;
}

// ---------------------------------------------------------------
// Exercise 5
// Collect the titles of all test cases into a new array of strings.
// Example: a list with titles "A" and "B" returns ["A", "B"]
function collectTitles(testCases: { id: number; title: string; status: string }[]): string[] {
  // TODO
  return ["TODO"];
}

// ---------------------------------------------------------------
// Exercise 6
// Use destructuring in the parameter to build a one-line description.
// Example: describeTestCase({ id: 7, title: "Reset password", status: "failed" })
//   returns "#7 Reset password [failed]"
function describeTestCase({ id, title, status }: { id: number; title: string; status: string }): string {
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

const sampleList = [
  { id: 1, title: "Login works", status: "passed" },
  { id: 2, title: "Checkout applies discount", status: "failed" },
  { id: 3, title: "Logout clears session", status: "failed" },
];

check("1 makeTestCase", makeTestCase(1, "Login works", "passed"), { id: 1, title: "Login works", status: "passed" });
check("2 getTitle", getTitle({ id: 1, title: "Login works", status: "passed" }), "Login works");
check(
  "3 markAsPassed",
  markAsPassed({ id: 2, title: "Logout works", status: "failed" }),
  { id: 2, title: "Logout works", status: "passed" },
);
check("4 countFailed", countFailed(sampleList), 2);
check("5 collectTitles", collectTitles(sampleList), ["Login works", "Checkout applies discount", "Logout clears session"]);
check("6 describeTestCase", describeTestCase({ id: 7, title: "Reset password", status: "failed" }), "#7 Reset password [failed]");

console.log(failures === 0 ? "\nAll done. Well done." : `\n${failures} check(s) still failing.`);
