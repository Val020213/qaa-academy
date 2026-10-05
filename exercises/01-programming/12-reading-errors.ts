// Lesson 12 - Reading errors
// Each function below has ONE bug. The code is valid TypeScript,
// but the result is wrong or the program crashes while running.
// Your job: read the FAIL line, find the bug, fix it.
//
// Run this file from the project folder with:
//   node exercises/01-programming/12-reading-errors.ts
//
// Fix the functions in the "Buggy code" section.
// Do not edit the checker at the bottom.

type Status = "passed" | "failed" | "skipped";

type TestCase = {
  id: number;
  title: string;
  status: Status;
};

// ===============================================================
// Buggy code. Fix the bugs in this section.
// ===============================================================

// Bug 1
// Should count the test cases whose status is "failed".
// Example: statuses passed, failed, failed returns 2
function countFailed(testCases: TestCase[]): number {
  let count = 0;
  for (const testCase of testCases) {
    if (testCase.status !== "failed") {
      count += 1;
    }
  }
  return count;
}

// Bug 2
// Should return the pass rate as a percentage: passed divided by total, times 100.
// Example: 3 passed out of 4 returns 75
function passRate(passed: number, total: number): number {
  return passed / total;
}

// Bug 3
// Should read the name from a JSON text.
// Example: getUserName('{"name":"Ana","role":"tester"}') returns "Ana"
// This one crashes while running.
function getUserName(jsonText: string): string {
  const user = JSON.parse(jsonText);
  return user.profile.name;
}

// Bug 4
// Should build the summary text "3 of 4 tests passed".
function buildSummary(passed: number, total: number): string {
  return passed + total + " tests passed";
}

// Bug 5
// Should return a label such as "Status: passed" for test case 1.
// getStatusSlowly is a helper that takes time. Do not change it.
function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getStatusSlowly(id: number): Promise<Status> {
  await wait(20);
  return id === 1 ? "passed" : "failed";
}

async function getStatusLabel(id: number): Promise<string> {
  const status = getStatusSlowly(id);
  return `Status: ${status}`;
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

// Runs a function. If it crashes, the checker prints the error and
// keeps going, so you can see every problem in one run.
function attempt(fn: () => unknown): unknown {
  try {
    return fn();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.log(`      (crashed: ${message})`);
    return "CRASHED";
  }
}

const sample: TestCase[] = [
  { id: 1, title: "Login works", status: "passed" },
  { id: 2, title: "Checkout applies discount", status: "failed" },
  { id: 3, title: "Logout clears session", status: "failed" },
];

async function main(): Promise<void> {
  check("1 countFailed", attempt(() => countFailed(sample)), 2);
  check("2 passRate", attempt(() => passRate(3, 4)), 75);
  check("3 getUserName", attempt(() => getUserName('{"name":"Ana","role":"tester"}')), "Ana");
  check("4 buildSummary", attempt(() => buildSummary(3, 4)), "3 of 4 tests passed");
  check("5 getStatusLabel", await getStatusLabel(1), "Status: passed");

  console.log(failures === 0 ? "\nAll done. Well done." : `\n${failures} check(s) still failing.`);
}

void main();
