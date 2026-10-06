// Lesson 12b - Debug like a scientist
// Each function below RUNS without an error, but gives a wrong answer for some inputs.
// Each function has ONE bug. The comment above it says what it SHOULD do.
// Your job: do not guess. Observe, shrink, make one guess, test it with a
// small experiment, then fix it.
//
// Run this file from the project folder with:
//   node exercises/01-programming/12b-debug-like-a-scientist.ts
//
// Fix the functions in the "Buggy code" section.
// Do not edit the checker at the bottom.

// ===============================================================
// Buggy code. Fix the bugs in this section.
// ===============================================================

// Bug 1
// A library puts a fixed number of books on each shelf.
// Should return how many shelves are needed for a number of books.
// Example: 11 books with 5 per shelf need 3 shelves
function shelvesNeeded(books: number, perShelf: number): number {
  return Math.floor(books / perShelf) + 1;
}

// Bug 2
// Should say if a year is a leap year (a year with 366 days).
// A year divisible by 4 is a leap year, except when it is divisible by 100,
// unless it is also divisible by 400.
// Example: isLeapYear(2024) returns true, isLeapYear(2023) returns false
function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 !== 0);
}

// Bug 3
// A rabbit family grows every month. Month 1 has 1 pair and month 2 has 1 pair.
// Every month after that has as many pairs as the two months before it added together.
// Should return the number of pairs for each of the first n months.
// Example: rabbitPairs(5) returns [1, 1, 2, 3, 5]
function rabbitPairs(months: number): number[] {
  const pairs: number[] = [];
  let previous = 0;
  let current = 1;
  for (let month = 1; month <= months; month += 1) {
    pairs.push(current);
    previous = current;
    current = previous + current;
  }
  return pairs;
}

// Bug 4
// Should return the price after a discount given in percent.
// When no percent is given, the discount is 10 percent.
// Example: finalPrice(200) returns 180, finalPrice(200, 25) returns 150
function finalPrice(price: number, percent?: number): number {
  const discount = percent || 10;
  return price - (price * discount) / 100;
}

// Bug 5
// A pet shelter packs a welcome box for every new pet. The box is a list:
// the pet's name first, then the items. Every box is new and separate.
// Example: packBox("Rex", ["bowl", "toy"]) returns ["Rex", "bowl", "toy"]
const box: string[] = [];

function packBox(petName: string, items: string[]): string[] {
  box.push(petName);
  for (const item of items) {
    box.push(item);
  }
  return box;
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

check(
  "1 shelvesNeeded (books 11, 10, 5, 0, 1 with 5 per shelf)",
  attempt(() => [11, 10, 5, 0, 1].map((books) => shelvesNeeded(books, 5))),
  [3, 2, 1, 0, 1],
);
check(
  "2 isLeapYear (2024, 2023, 1900, 2000, 2100)",
  attempt(() => [2024, 2023, 1900, 2000, 2100].map(isLeapYear)),
  [true, false, false, true, false],
);
check("3 rabbitPairs (6 months)", attempt(() => rabbitPairs(6)), [1, 1, 2, 3, 5, 8]);
check(
  "4 finalPrice (200, 200 with 25, 200 with 0)",
  attempt(() => [finalPrice(200), finalPrice(200, 25), finalPrice(200, 0)]),
  [180, 150, 200],
);
check(
  "5 packBox (Rex, then Mimi)",
  attempt(() => [packBox("Rex", ["bowl", "toy"]), packBox("Mimi", ["blanket"])]),
  [["Rex", "bowl", "toy"], ["Mimi", "blanket"]],
);

console.log(failures === 0 ? "\nAll done. Well done." : `\n${failures} check(s) still failing.`);
