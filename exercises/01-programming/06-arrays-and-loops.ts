// Lesson 06: Arrays and loops
// Practise: index, length, push, for...of, includes.
// Run it with:  node exercises/01-programming/06-arrays-and-loops.ts
//
// How to work:
// - Write your code only between the { } of each function.
// - Replace the placeholder "return" line with your own code.
// - Save the file and run it again. Make every line say OK.

// This line makes the file a module. Leave it as it is.
export {}

// Exercise 1
// Return the last item of the list.
// Example: lastItem(["login", "search", "checkout"]) returns "checkout"
// Tip: the last index is length minus 1. The result can be undefined.
function lastItem(items: string[]): string | undefined {
  // TODO
  return "TODO"
}

// Exercise 2
// Count how many statuses in the list are exactly "failed".
// Use a for...of loop and a counter.
// Example: countFailed(["passed", "failed", "failed"]) returns 2
function countFailed(statuses: string[]): number {
  // TODO
  return -1
}

// Exercise 3
// Return the sum of all numbers in the list. An empty list gives 0.
// Example: totalSeconds([10, 20, 5]) returns 35
function totalSeconds(durations: number[]): number {
  // TODO
  return -1
}

// Exercise 4
// Add the new test name to the end of the list with push. Return the list.
// Example: addTest(["login"], "search") returns ["login", "search"]
function addTest(tests: string[], name: string): string[] {
  // TODO
  return ["TODO"]
}

// Exercise 5
// Return "yes" if the list contains "blocked". Otherwise return "no".
// Use includes.
// Example: hasBlocked(["passed", "blocked"]) returns "yes"
function hasBlocked(statuses: string[]): string {
  // TODO
  return "TODO"
}

// Exercise 6
// Return the biggest number in the list. All numbers are 0 or more.
// Use a for...of loop and a variable declared with let.
// Example: slowest([12, 40, 7]) returns 40
function slowest(durations: number[]): number {
  // TODO
  return -1
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

check("1 last item", lastItem(["login", "search", "checkout"]), "checkout")
check("2 count failed", countFailed(["passed", "failed", "failed"]), 2)
check("2 count failed, none", countFailed(["passed"]), 0)
check("3 total seconds", totalSeconds([10, 20, 5]), 35)
check("3 total, empty list", totalSeconds([]), 0)
check("4 add test", addTest(["login"], "search"), ["login", "search"])
check("5 has blocked", hasBlocked(["passed", "blocked"]), "yes")
check("5 no blocked", hasBlocked(["passed", "failed"]), "no")
check("6 slowest", slowest([12, 40, 7]), 40)

console.log(failures === 0 ? "\nAll done. Well done." : `\n${failures} check(s) still failing.`)
