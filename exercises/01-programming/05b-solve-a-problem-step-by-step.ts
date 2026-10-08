// Lesson 05b: Solve a problem step by step
// Practise: say the problem, solve it by hand, write the steps, then code one step at a time.
// Run it with:  node exercises/01-programming/05b-solve-a-problem-step-by-step.ts
//
// How to work:
// - Each exercise is a small problem in words. The example shows one input and its output.
// - Before you code, write your steps in plain words in a comment above the function.
// - Write your code only between the { } of each function.
// - Replace the placeholder "return" line with your own code.
// - Run the file after each step. Make every line say OK.
// - Some problems need a tool this course has not shown yet. Search for it. The hint tells you what to look for.

// This line makes the file a module. Leave it as it is.
export {}

// Exercise 1 (a pizza party)
// Every person eats 3 slices. One pizza has 8 slices.
// Return how many pizzas you must buy so that nobody stays hungry.
// You cannot buy part of a pizza.
// Example: pizzasNeeded(10) returns 4  (10 people eat 30 slices, and 3 pizzas give only 24)
// Hint: search for "javascript Math.ceil".
function pizzasNeeded(people: number): number {
  // TODO
  return -1
}

// Exercise 2 (a dog walker)
// A walk costs 10 for the first 30 minutes.
// After that, every 15 minutes that you START costs 4 more.
// Return the price of a walk.
// Example: walkPrice(40) returns 14  (the 10 extra minutes start one new block of 15)
// Hint: search for "javascript Math.ceil".
function walkPrice(minutes: number): number {
  // TODO
  return -1
}

// Exercise 3 (what to wear)
// Return the advice for the weather:
// - below 5 degrees: "coat"
// - from 5 up to, but not including, 20 degrees: "jacket"
// - 20 degrees or more: "t-shirt"
// The degrees can have decimals, for example 19.5.
// If it is raining, add " and umbrella" to the end of the advice.
// Example: clothingAdvice(12, true) returns "jacket and umbrella"
function clothingAdvice(degrees: number, isRaining: boolean): string {
  // TODO
  return "TODO"
}

// Exercise 4 (a library fine)
// A book may stay at home for 14 days without a fine.
// After that, the fine is 0.5 for each extra day. The fine never goes above 10.
// Return the fine for a book that was kept for the given number of days.
// Example: libraryFine(20) returns 3  (6 extra days times 0.5)
// Hint: search for "javascript Math.min".
function libraryFine(daysKept: number): number {
  // TODO
  return -1
}

// Exercise 5 (shapes)
// Three sticks have the lengths a, b and c.
// Return "invalid" if you cannot make a triangle from them. This happens when:
// - one length is 0 or less, or
// - the two shorter sticks together are not longer than the longest stick.
// Otherwise return "equilateral" (3 equal sides), "isosceles" (exactly 2 equal sides)
// or "scalene" (no equal sides).
// Example: triangleKind(3, 4, 5) returns "scalene"
function triangleKind(a: number, b: number, c: number): string {
  // TODO
  return "TODO"
}

// ---------------------------------------------------------------
// Checker. Do not edit below this line.
// ---------------------------------------------------------------
let failures = 0

function check(name: string, actual: unknown, expected: unknown): void {
  if (JSON.stringify(actual) === JSON.stringify(expected)) {
    console.log(`OK    ${name}`)
  } else {
    failures += 1
    console.log(`FAIL  ${name} -> got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`)
  }
}

check("1 pizzas for 10 people", pizzasNeeded(10), 4)
check("1 pizzas, exact fit (8 people)", pizzasNeeded(8), 3)
check("1 pizzas for 1 person", pizzasNeeded(1), 1)
check("1 pizzas for nobody", pizzasNeeded(0), 0)
check("2 walk 20 minutes", walkPrice(20), 10)
check("2 walk 30 minutes", walkPrice(30), 10)
check("2 walk 31 minutes", walkPrice(31), 14)
check("2 walk 45 minutes", walkPrice(45), 14)
check("2 walk 46 minutes", walkPrice(46), 18)
check("3 cold and dry", clothingAdvice(2, false), "coat")
check("3 mild and rainy", clothingAdvice(12, true), "jacket and umbrella")
check("3 border at 5", clothingAdvice(5, false), "jacket")
check("3 decimal value", clothingAdvice(19.5, false), "jacket")
check("3 border at 20", clothingAdvice(20, true), "t-shirt and umbrella")
check("4 no fine on day 14", libraryFine(14), 0)
check("4 fine for 20 days", libraryFine(20), 3)
check("4 fine has a limit", libraryFine(100), 10)
check("5 equilateral", triangleKind(3, 3, 3), "equilateral")
check("5 isosceles", triangleKind(3, 3, 5), "isosceles")
check("5 scalene", triangleKind(3, 4, 5), "scalene")
check("5 flat triangle", triangleKind(1, 2, 3), "invalid")
check("5 zero side", triangleKind(0, 4, 4), "invalid")
check("5 too short", triangleKind(2, 2, 5), "invalid")
check("5 longest side first", triangleKind(7, 3, 3), "invalid")

console.log(failures === 0 ? "\nAll done. Well done." : `\n${failures} check(s) still failing.`)
