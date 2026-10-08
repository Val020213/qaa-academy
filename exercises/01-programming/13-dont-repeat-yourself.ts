// Lesson 13: Don't repeat yourself (DRY)
// Practise: one home for each rule, value and format.
// Run it with:  node exercises/01-programming/13-dont-repeat-yourself.ts
//
// How to work:
// - Each exercise shows a repeated version in a comment. It works, but it repeats itself.
// - Write the version without repetition, between the { } of each function.
// - The checks can only see the result. YOU must make sure the rule is written once.
// - Replace the placeholder "return" line with your own code.
// - Save the file and run it again. Make every line say OK.

// This line makes the file a module. Leave it as it is.
export {}

type Status = "passed" | "failed" | "skipped"

type Result = {
  name: string
  status: Status
}

// Exercise 1
// Write the format of one result line in ONE place.
// Format: "<STATUS IN CAPITAL LETTERS>: <name>"
// Example: formatResult("Login works", "passed") returns "PASSED: Login works"
function formatResult(name: string, status: Status): string {
  // TODO
  return "TODO"
}

// Exercise 2
// Return one line for each result. Call formatResult. Do not write the format again.
// The repeated version, for three fixed results, looked like this:
//   [`PASSED: ${a.name}`, `FAILED: ${b.name}`, `PASSED: ${c.name}`]
// Example: summarize([{ name: "Login works", status: "passed" }]) returns ["PASSED: Login works"]
function summarize(results: Result[]): string[] {
  // TODO
  return ["TODO"]
}

// Exercise 3
// Return the error messages of a sign-up form, in this order: name, email, password.
// A field that is empty ("") gives the message "<Label> is required".
// The repeated version had three copied if-blocks:
//   if (form.name === "") { errors.push("Name is required") }
//   if (form.email === "") { errors.push("Email is required") }
//   if (form.password === "") { errors.push("Password is required") }
// Write the rule once. Use an array of fields and one loop.
// Example: requiredFieldErrors({ name: "Ana", email: "", password: "" })
//   returns ["Email is required", "Password is required"]
type SignupForm = {
  name: string
  email: string
  password: string
}

function requiredFieldErrors(form: SignupForm): string[] {
  // TODO
  return ["TODO"]
}

// Exercise 4
// A page is "too slow" when it needs more than 2000 milliseconds.
// Put the number 2000 in the constant below, and use only the constant in the functions.
// The repeated version wrote the number 2000 in two functions. Then a rule changes
// to 1500, and someone changes only one of them.
const MAX_RESPONSE_MS = 0 // TODO

// Return true when the time is more than the limit.
// Example: isTooSlow(2500) returns true, isTooSlow(1500) returns false
function isTooSlow(ms: number): boolean {
  // TODO
  return false
}

// Exercise 5
// Return "OK" when the page is fast enough.
// Otherwise return "Too slow (limit <limit> ms)". Use MAX_RESPONSE_MS and isTooSlow.
// Example: describeSpeed(2500) returns "Too slow (limit 2000 ms)"
function describeSpeed(ms: number): string {
  // TODO
  return "TODO"
}

// Exercise 6
// Return the percentage of results that have the given status, rounded with Math.round.
// An empty list gives 0.
// The repeated version had passRate and failRate, with the same steps and one difference.
// Write ONE function and pass the difference as a parameter.
// Example: 1 passed out of 4 results: ratePercent(results, "passed") returns 25
function ratePercent(results: Result[], status: Status): number {
  // TODO
  return -1
}

// Exercise 7
// Write the email rule in ONE place.
// An email is valid when it contains "@", contains ".", and has no space.
// Example: isValidEmail("ana@example.com") returns true, isValidEmail("ana example") returns false
function isValidEmail(email: string): boolean {
  // TODO
  return false
}

// Exercise 8
// Return the emails from the list that are not valid. Call isValidEmail.
// Do not write the email rule again.
// Example: findInvalidEmails(["ana@example.com", "bad", "x y@z.com"]) returns ["bad", "x y@z.com"]
function findInvalidEmails(emails: string[]): string[] {
  // TODO
  return ["TODO"]
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

const sampleResults: Result[] = [
  { name: "Login works", status: "passed" },
  { name: "Checkout applies discount", status: "failed" },
  { name: "Order history", status: "skipped" },
  { name: "Logout clears session", status: "failed" },
]

check("1 formatResult", formatResult("Login works", "passed"), "PASSED: Login works")
check("1 formatResult, failed", formatResult("Logout works", "failed"), "FAILED: Logout works")
check("2 summarize", summarize(sampleResults), [
  "PASSED: Login works",
  "FAILED: Checkout applies discount",
  "SKIPPED: Order history",
  "FAILED: Logout clears session",
])
check("2 summarize, empty list", summarize([]), [])
check(
  "3 requiredFieldErrors",
  requiredFieldErrors({ name: "Ana", email: "", password: "" }),
  ["Email is required", "Password is required"],
)
check("3 requiredFieldErrors, all empty", requiredFieldErrors({ name: "", email: "", password: "" }), [
  "Name is required",
  "Email is required",
  "Password is required",
])
check("3 requiredFieldErrors, none", requiredFieldErrors({ name: "Ana", email: "a@b.com", password: "x" }), [])
check("4 constant", MAX_RESPONSE_MS, 2000)
check("4 isTooSlow", [isTooSlow(1500), isTooSlow(2000), isTooSlow(2500)], [false, false, true])
check("5 describeSpeed, slow", describeSpeed(2500), "Too slow (limit 2000 ms)")
check("5 describeSpeed, fast", describeSpeed(1500), "OK")
check("6 ratePercent, failed", ratePercent(sampleResults, "failed"), 50)
check("6 ratePercent, passed", ratePercent(sampleResults, "passed"), 25)
check("6 ratePercent, empty list", ratePercent([], "passed"), 0)
check("7 isValidEmail", [isValidEmail("ana@example.com"), isValidEmail("ana example"), isValidEmail("ana@example")], [true, false, false])
check("8 findInvalidEmails", findInvalidEmails(["ana@example.com", "bad", "x y@z.com"]), ["bad", "x y@z.com"])
check("8 findInvalidEmails, none", findInvalidEmails(["ana@example.com"]), [])

console.log(failures === 0 ? "\nAll done. Well done." : `\n${failures} check(s) still failing.`)
