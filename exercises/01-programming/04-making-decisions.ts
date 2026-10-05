// Lesson 04: Making decisions
// Practise: ===, if / else if / else, && and ||.
// Run it with:  node exercises/01-programming/04-making-decisions.ts
//
// How to work:
// - Each exercise is a function. You learn functions in lesson 05.
// - The names in the round brackets ( ) are inputs. Use them like variables.
// - Write your code only between the { } of each function.
// - Replace the placeholder "return" line with your own code.
// - Save the file and run it again. Make every line say OK.

// This line makes the file a module. Leave it as it is.
export {};

// Exercise 1
// Return "pass" if status is exactly "passed". Otherwise return "fail".
// Example: verdict("passed") returns "pass"
function verdict(status: string): string {
  // TODO
  return "TODO";
}

// Exercise 2
// Return a label for the number of open bugs:
// 0 bugs -> "clean", 1 to 4 bugs -> "minor", 5 or more -> "critical".
// Example: severityLabel(3) returns "minor"
function severityLabel(openBugs: number): string {
  // TODO
  return "TODO";
}

// Exercise 3
// Return "allowed" if username is not empty AND password is not empty.
// Otherwise return "denied". An empty text is "".
// Example: canLogin("ana", "secret") returns "allowed"
function canLogin(username: string, password: string): string {
  // TODO
  return "TODO";
}

// Exercise 4
// Shipping is free (0) when the order total is 50 or more.
// Otherwise shipping costs 5.
// Example: shippingCost(60) returns 0
function shippingCost(total: number): number {
  // TODO
  return -1;
}

// Exercise 5
// Return "yes" if status is "failed" OR status is "blocked".
// Otherwise return "no".
// Example: needsReview("blocked") returns "yes"
function needsReview(status: string): string {
  // TODO
  return "TODO";
}

// ---------------------------------------------------------------
// Checker. Do not edit below this line.
// ---------------------------------------------------------------
let failures = 0;

function check(name: string, actual: unknown, expected: unknown): void {
  if (JSON.stringify(actual) === JSON.stringify(expected)) {
    console.log(`OK    ${name}`);
  } else {
    failures += 1;
    console.log(`FAIL  ${name} -> got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`);
  }
}

check("1 verdict passed", verdict("passed"), "pass");
check("1 verdict failed", verdict("failed"), "fail");
check("2 severity 0", severityLabel(0), "clean");
check("2 severity 3", severityLabel(3), "minor");
check("2 severity 5", severityLabel(5), "critical");
check("3 login ok", canLogin("ana", "secret"), "allowed");
check("3 login no password", canLogin("ana", ""), "denied");
check("4 shipping 60", shippingCost(60), 0);
check("4 shipping 20", shippingCost(20), 5);
check("5 review blocked", needsReview("blocked"), "yes");
check("5 review passed", needsReview("passed"), "no");

console.log(failures === 0 ? "\nAll done. Well done." : `\n${failures} check(s) still failing.`);
