// Helper module for lesson 11 (modules).
// The exercise file imports from this file. You do not need to edit it.

export type Status = "passed" | "failed" | "skipped"

export type TestCase = {
  id: number
  title: string
  status: Status
}

export const testCases: TestCase[] = [
  { id: 1, title: "Login works with valid user", status: "passed" },
  { id: 2, title: "Login fails with wrong password", status: "passed" },
  { id: 3, title: "Checkout applies discount code", status: "failed" },
  { id: 4, title: "Order history shows last 10 orders", status: "skipped" },
  { id: 5, title: "Logout clears the session", status: "failed" },
]

// Counts how many test cases in the list have the given status.
export function countByStatus(list: TestCase[], status: Status): number {
  let count = 0
  for (const testCase of list) {
    if (testCase.status === status) {
      count += 1
    }
  }
  return count
}
