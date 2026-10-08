// Lesson 05: Functions
// Practise: parameters, return values, default parameters, arrow functions.
// Run it with:  node exercises/01-programming/05-functions.ts
//
// How to work:
// - Write your code only between the { } of each function.
// - Replace the placeholder "return" line with your own code.
// - Save the file and run it again. Make every line say OK.

// This line makes the file a module. Leave it as it is.
export {}

// Exercise 1
// Return a plus b.
// Example: add(2, 3) returns 5
function add(a: number, b: number): number {
  // TODO
  return -1
}

// Exercise 2
// Return the text "Hello, NAME!" where NAME is the name given.
// Example: greet("Ana") returns "Hello, Ana!"
function greet(name: string): string {
  // TODO
  return ""
}

// Exercise 3
// Return "pass" if score is greater than or equal to minimum.
// Otherwise return "fail". The minimum is 50 when no value is given.
// Example: passLabel(40) returns "fail"
// Example: passLabel(40, 30) returns "pass"
function passLabel(score: number, minimum: number = 0): string {
  // TODO: change the default value of minimum above, then write the code.
  return "TODO"
}

// Exercise 4
// Write an arrow function. It must return the text "TC-" followed by the number.
// Example: formatTestId(7) returns "TC-7"
const formatTestId = (id: number): string => {
  // TODO
  return ""
}

// Exercise 5
// The function tax is ready. Use it. Return amount plus the tax of amount.
// Example: totalWithTax(100) returns 110
function tax(amount: number): number {
  return amount / 10
}

function totalWithTax(amount: number): number {
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

check("1 add", add(2, 3), 5)
check("2 greet", greet("Ana"), "Hello, Ana!")
check("3 default minimum fail", passLabel(40), "fail")
check("3 default minimum pass", passLabel(60), "pass")
check("3 given minimum", passLabel(40, 30), "pass")
check("4 arrow function", formatTestId(7), "TC-7")
check("5 total with tax", totalWithTax(100), 110)

console.log(failures === 0 ? "\nAll done. Well done." : `\n${failures} check(s) still failing.`)
