// Lesson 02: Values and variables
// Practise: const, let, numbers, text, template literals.
// Run it with:  node exercises/01-programming/02-values-and-variables.ts
//
// How to work:
// - Each exercise is a function. You learn functions in lesson 05.
// - For now, write your code only between the { } of each function.
// - Replace the placeholder "return" line with your own return line.
// - Save the file and run it again. Make every line say OK.

// This line makes the file a module. Leave it as it is.
export {}

// Exercise 1
// Create a const called testName with the text "Login with valid user".
// Then return testName.
// Expected result: "Login with valid user"
function exercise1(): string {
  // TODO
  return ""
}

// Exercise 2
// Create two consts: passed = 8 and failed = 2.
// Return the total number of tests (passed plus failed).
// Expected result: 10
function exercise2(): number {
  // TODO
  return 0
}

// Exercise 3
// Create two consts: user = "Ana" and openBugs = 3.
// Return a text made with a template literal.
// Expected result: "Ana has 3 open bugs"
function exercise3(): string {
  // TODO
  return ""
}

// Exercise 4
// An order has price 20, quantity 3 and a discount of 10.
// Return the total: price times quantity, minus the discount.
// Expected result: 50
function exercise4(): number {
  // TODO
  return 0
}

// Exercise 5
// Create a variable called status with let and the text "open".
// Then change it to "fixed". Return status.
// Expected result: "fixed"
function exercise5(): string {
  // TODO
  return ""
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

check("1 testName", exercise1(), "Login with valid user")
check("2 total tests", exercise2(), 10)
check("3 template literal", exercise3(), "Ana has 3 open bugs")
check("4 order total", exercise4(), 50)
check("5 let and change", exercise5(), "fixed")

console.log(failures === 0 ? "\nAll done. Well done." : `\n${failures} check(s) still failing.`)
