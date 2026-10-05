// Lesson 03: Types
// Practise: typeof, Number(), String(), null and undefined.
// Run it with:  node exercises/01-programming/03-types.ts
//
// How to work:
// - Each exercise is a function. You learn functions in lesson 05.
// - For now, write your code only between the { } of each function.
// - Replace the placeholder "return" line with your own return line.
// - Save the file and run it again. Make every line say OK.

// This line makes the file a module. Leave it as it is.
export {};

// Exercise 1
// Return the type name of the value 42. Use typeof.
// Expected result: "number"
function exercise1(): string {
  // TODO
  return "";
}

// Exercise 2
// The text "3" is a string. Turn it into a real number with Number(),
// then add 1 to it. Return the result.
// Expected result: 4
function exercise2(): number {
  // TODO
  return 0;
}

// Exercise 3
// Turn the number 404 into text with String(), then join " error" to it.
// Expected result: "404 error"
function exercise3(): string {
  // TODO
  return "";
}

// Exercise 4
// The variable assignee has no value yet. Return its type name with typeof.
// Expected result: "undefined"
function exercise4(): string {
  let assignee: string | undefined;
  // TODO
  return "";
}

// Exercise 5
// A test has no owner, and this is on purpose.
// Return the value that means "no value, on purpose".
// Expected result: null
function exercise5(): string | null {
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

check("1 typeof 42", exercise1(), "number");
check("2 text to number", exercise2(), 4);
check("3 number to text", exercise3(), "404 error");
check("4 typeof undefined", exercise4(), "undefined");
check("5 no value on purpose", exercise5(), null);

console.log(failures === 0 ? "\nAll done. Well done." : `\n${failures} check(s) still failing.`);
