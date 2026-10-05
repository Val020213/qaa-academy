// Every spec imports `test` and `expect` from here, not from
// "@playwright/test". Today this is a plain re-export. When we need our own
// fixtures (module 4) they are added in this file and no spec changes its import.
export { expect, test } from "@playwright/test"
export type { Locator, Page } from "@playwright/test"
