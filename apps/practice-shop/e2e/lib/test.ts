// Every spec imports from this file, never from "@playwright/test".
// Custom fixtures get added here later, so every spec can use them.
export { test, expect } from "@playwright/test"
export type { Page, Locator, APIRequestContext } from "@playwright/test"
